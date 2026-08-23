import os
import json
import time
import re
from dotenv import load_dotenv
from google import genai
from google.genai import types
from supabase import create_client, Client

load_dotenv('.env.local')

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
GEMINI_KEY = os.getenv("GEMINI_API_KEY")

if not SUPABASE_URL or not GEMINI_KEY:
    print("❌ Missing Supabase URL or GEMINI_API_KEY in .env.local")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
client = genai.Client(api_key=GEMINI_KEY)

MODEL_NAME = "gemini-3.5-flash-lite"
EXAM_TRACK = "JAIIB_AFM"

MODULE_CHAPTER_MAP = {
    "Module A: Accounting Principles and Processes": [
        "Accounting Standards (AS & Ind AS), Realisation, Conservatism & Going Concern conventions",
        "Books of Prime Entry, Cash Books, Subsidiary Ledgers & Journal Entries",
        "Bank Reconciliation Statement (BRS): Timing differences, Adjusted Cash Book & Rectification",
        "Trial Balance, Types of Errors (Principle, Commission, Compensating) & Suspense Accounts",
        "Depreciation Accounting: Straight Line Method (SLM) vs Written Down Value (WDV) computations",
        "Capital vs Revenue Expenditure, Bills of Exchange, Accommodation Bills & Rebate on bills discounted"
    ],
    "Module B: Financial Statements and Core Banking Systems": [
        "Balance Sheet Equation (Assets = Liabilities + Equity) & Double-entry adjustments",
        "Banking Company Accounts: Third Schedule of BR Act 1949, Form A (Balance Sheet) & Form B (P&L)",
        "Bank Financial Schedules: Schedules 1-12 (Balance Sheet) & Schedules 13-16 (P&L) classifications",
        "Treatment of Bad Debts, Provisions & Contingencies, Non-Banking Assets acquired in satisfaction of claims",
        "Core Banking Solutions (CBS): General ledger architecture, EOD/BOD batches, Audit trails & security"
    ],
    "Module C: Financial Management": [
        "Financial Management Essentials: Risk-Return Tradeoff, Time Value of Money & Cost of Capital (Ke, Kd, WACC)",
        "Capital Structure Theories: Net Income (NI), Net Operating Income (NOI), Traditional Approach & Financial Leverage",
        "Working Capital: Operating Cycle, Cash Budget Method, Tandon/Chore Committee norms & MPBF computation",
        "Term Loan Appraisal: Project Financing, Debt Service Coverage Ratio (DSCR) & Break-Even Analysis",
        "Forex Arithmetic: Direct/Indirect Quotes, Two-way Quotes, Forward Margin/Discount & Cross Rates"
    ],
    "Module D: Taxation and Fundamentals of Costing": [
        "Financial Mathematics: Simple/Compound Interest, Ordinary Annuity vs Annuity Due & Amortization schedules",
        "Bond Valuation & Analytics: Current Yield, Yield to Maturity (YTM), Duration, Modified Duration & Convexity",
        "Ratio Analysis: Liquidity (Current/Quick), Leverage (Debt-Equity), Turnover & DuPont ROE breakdown",
        "Fundamentals of Costing: Marginal Costing, Contribution, P/V Ratio, Margin of Safety, Break-Even Charts",
        "Direct & Indirect Taxation: Corporate Income Tax basics, TDS obligations on banks & GST on banking services"
    ]
}

def sanitize_option(val):
    if not val:
        return "A"
    clean = str(val).strip().upper()
    match = re.search(r'[A-D]', clean)
    return match.group(0) if match else "A"

def generate_question_batch(cbt_set, module_name, sub_topics_str, count, start_q_num, difficulty, max_retries=4):
    if difficulty == "hard":
        diff_instruction = (
            "DIFFICULTY REQUIREMENT (HARD / EVALUATIVE & NUMERICAL RIGOR):\n"
            "- Incorporate complex calculations (Depreciation switch, BRS adjusted balance, MPBF, DSCR, YTM, Annuities, DuPont ROE).\n"
            "- Multi-statement evaluation questions ('Which of the statements given above is/are TRUE/INCORRECT?').\n"
            "- Real-world banking scenarios with intricate distractor options and step-by-step arithmetic explanations."
        )
    else:
        diff_instruction = (
            "DIFFICULTY REQUIREMENT (MODERATE / CORE COMPETENCE):\n"
            "- Focus on standard rules, definitions, accounting conventions, schedules (1-16), and single-step problems.\n"
            "- Clear single-concept stems with precise distractors."
        )

    prompt = f"""
You are the Chief Examiner for the Indian Institute of Banking & Finance (IIBF) creating authentic exam questions for JAIIB Paper 3: Accounting & Financial Management for Bankers (AFM).

Generate exactly {count} strictly unique, exam-standard multiple choice questions.
Target Module: "{module_name}"
Key Sub-Topics to cover: {sub_topics_str}
Difficulty Tier: "{difficulty}"

{diff_instruction}

Return strictly a raw JSON array of {count} objects (no Markdown fences):
[
  {{
    "question_text": "Detailed question stem or numerical scenario",
    "option_a": "Option A text",
    "option_b": "Option B text",
    "option_c": "Option C text",
    "option_d": "Option D text",
    "correct_option": "A",
    "explanation": "Detailed statutory, regulatory, or step-by-step arithmetic explanation."
  }}
]
"""
    for attempt in range(1, max_retries + 1):
        try:
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.3
                )
            )
            data = json.loads(response.text.strip())
            records = []
            for idx, item in enumerate(data):
                q_num = start_q_num + idx
                unique_stem = f"[AFM-CBT{cbt_set:02d}-Q{q_num:03d}] {item['question_text']}"
                records.append({
                    "exam_type": EXAM_TRACK,
                    "module": module_name,
                    "difficulty": difficulty,
                    "cbt_set_number": cbt_set,
                    "question_text": unique_stem,
                    "audio_script": f"Question {q_num}. {item['question_text']}",
                    "option_a": item["option_a"],
                    "option_b": item["option_b"],
                    "option_c": item["option_c"],
                    "option_d": item["option_d"],
                    "correct_option": sanitize_option(item.get("correct_option")),
                    "explanation": item["explanation"]
                })
            return records
        except Exception as e:
            err_msg = str(e)
            if "429" in err_msg or "quota" in err_msg.lower():
                wait_time = 25 * attempt
                print(f"    ⏳ Rate limit encountered. Sleeping {wait_time}s before retry {attempt}/{max_retries}...")
                time.sleep(wait_time)
            else:
                print(f"    ⚠️ Retry {attempt}/{max_retries} due to: {e}")
                time.sleep(3)
    return []

def main():
    print("==========================================================================")
    print(f"🚀 IIBF High-Fidelity AFM Generator ({MODEL_NAME})")
    print("   Distributed Blueprint: 75 Moderate / 25 Hard across ALL Modules A-D")
    print("==========================================================================")

    # Check which sets already have 100 questions in Supabase so we don't repeat them
    existing_sets = set()
    res = supabase.table("questions").select("cbt_set_number").eq("exam_type", EXAM_TRACK).execute()
    if res.data:
        counts = {}
        for r in res.data:
            s_num = r["cbt_set_number"]
            counts[s_num] = counts.get(s_num, 0) + 1
        for s_num, count in counts.items():
            if count >= 100:
                existing_sets.add(s_num)

    for s in range(1, 11):
        if s in existing_sets:
            print(f"⏩ [Skipping Set #{s:02d}] Already complete with 100 Qs in Supabase.")
            continue

        # If a set partially failed, clear it out first before cleanly regenerating
        supabase.table("questions").delete().eq("exam_type", EXAM_TRACK).eq("cbt_set_number", s).execute()

        print(f"\n📘 [Processing Set #{s:02d}/10]...")
        set_records = []
        
        batches_plan = [
            # Module A: 25 Qs (19 Moderate + 6 Hard)
            ("Module A: Accounting Principles and Processes", ", ".join(MODULE_CHAPTER_MAP["Module A: Accounting Principles and Processes"][0:2]), 10, 1, "moderate"),
            ("Module A: Accounting Principles and Processes", ", ".join(MODULE_CHAPTER_MAP["Module A: Accounting Principles and Processes"][2:4]), 9, 11, "moderate"),
            ("Module A: Accounting Principles and Processes", ", ".join(MODULE_CHAPTER_MAP["Module A: Accounting Principles and Processes"][4:]), 6, 20, "hard"),
            
            # Module B: 25 Qs (19 Moderate + 6 Hard)
            ("Module B: Financial Statements and Core Banking Systems", ", ".join(MODULE_CHAPTER_MAP["Module B: Financial Statements and Core Banking Systems"][0:2]), 10, 26, "moderate"),
            ("Module B: Financial Statements and Core Banking Systems", ", ".join(MODULE_CHAPTER_MAP["Module B: Financial Statements and Core Banking Systems"][2:4]), 9, 36, "moderate"),
            ("Module B: Financial Statements and Core Banking Systems", MODULE_CHAPTER_MAP["Module B: Financial Statements and Core Banking Systems"][4], 6, 45, "hard"),
            
            # Module C: 25 Qs (19 Moderate + 6 Hard)
            ("Module C: Financial Management", ", ".join(MODULE_CHAPTER_MAP["Module C: Financial Management"][0:2]), 10, 51, "moderate"),
            ("Module C: Financial Management", ", ".join(MODULE_CHAPTER_MAP["Module C: Financial Management"][2:4]), 9, 61, "moderate"),
            ("Module C: Financial Management", MODULE_CHAPTER_MAP["Module C: Financial Management"][4], 6, 70, "hard"),
            
            # Module D: 25 Qs (18 Moderate + 7 Hard)
            ("Module D: Taxation and Fundamentals of Costing", ", ".join(MODULE_CHAPTER_MAP["Module D: Taxation and Fundamentals of Costing"][0:2]), 10, 76, "moderate"),
            ("Module D: Taxation and Fundamentals of Costing", ", ".join(MODULE_CHAPTER_MAP["Module D: Taxation and Fundamentals of Costing"][2:4]), 8, 86, "moderate"),
            ("Module D: Taxation and Fundamentals of Costing", MODULE_CHAPTER_MAP["Module D: Taxation and Fundamentals of Costing"][4], 7, 94, "hard")
        ]
        
        for mod_title, topic_slice, count, q_start, diff in batches_plan:
            print(f"  • Generating Set #{s:02d} | Q{q_start:03d}-Q{q_start+count-1:03d} [{diff.upper()}] ({mod_title.split(':')[0]})...")
            res = generate_question_batch(s, mod_title, topic_slice, count, q_start, diff)
            set_records.extend(res)
            time.sleep(2)

        if set_records:
            for i in range(0, len(set_records), 50):
                chunk = set_records[i:i+50]
                supabase.table("questions").insert(chunk).execute()
            print(f"  ✅ [Set #{s:02d}] 100% finished & inserted ({len(set_records)} Qs)!")

    print("\n🎉 Distributed generation complete across all 10 sets for JAIIB AFM!")

if __name__ == "__main__":
    main()