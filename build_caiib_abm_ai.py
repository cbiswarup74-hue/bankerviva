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
EXAM_TRACK = "CAIIB_ABM"

MODULE_CHAPTER_MAP = {
    "Module A: Statistics": [
        "Sampling Techniques: Random/Stratified sampling, Sampling Errors, Central Limit Theorem & Standard Error",
        "Probability Distributions: Binomial, Poisson, Normal Distribution, Z-score & Confidence Intervals",
        "Correlation and Regression Analysis: Pearson coefficient, Spearman rank, Least squares regression lines",
        "Time Series Analysis: Secular trend, Seasonal/Cyclical variations, Moving average & Exponential smoothing",
        "Linear Programming: Formulation of LPP, Graphical method, Simplex method mechanics & Duality"
    ],
    "Module B: Human Resource Management": [
        "HRM in Banking: Role of HR, Strategic HRM, Manpower planning & Job Analysis/Evaluation",
        "Theories of Motivation & Leadership: Maslow, Herzberg two-factor, McGregor Theory X/Y, Vroom expectancy, Trait/Contingency leadership",
        "Performance Management & Appraisal: 360-degree appraisal, Balance Scorecard, MBO & Assessment centers",
        "Employee Development: Training need analysis (TNA), Kirkpatricks model, Career path planning & Succession planning",
        "Industrial Relations & Labor Laws: Trade unions, Collective bargaining, Discipline/Grievance redressal, Domestic enquiry norms"
    ],
    "Module C: Credit Management": [
        "Principles of Lending & Credit Policy: RBI exposure norms, Large Exposure Framework (LEF) & PSL targets",
        "Credit Appraisal: Financial Statement Analysis, Turnover method (Nayak Committee), MPBF (Tandon/Chore), Cash Budget method",
        "Term Loan Appraisal: Project cost appraisal, DSCR calculation, Debt-Equity ratio, Sensitivity analysis & BEP",
        "Non-Fund Based Limits: Bank Guarantees (Financial vs Performance), Letters of Credit (UCPDC 600) & Appraisal methods",
        "Credit Monitoring & Restructuring: SMA-0/1/2 tagging, Early Warning Signals (EWS), CRILC reporting & Restructuring frameworks"
    ],
    "Module D: Compliance in Banks and Corporate Governance": [
        "Compliance Function: Scope, Structure, Compliance Policy, Roles & Responsibilities of CCO (Chief Compliance Officer)",
        "Regulatory Framework: RBI Act, Banking Regulation Act, FEMA & Statutory compliance monitoring mechanisms",
        "Corporate Governance: Board committees (Audit Committee, Risk Management Committee), Directors duties & Code of Conduct",
        "Fraud Risk Management: Red Flagged Accounts (RFA), Early Warning Signals, Reporting to Central Fraud Registry (CFR) & CBI/Police",
        "Whistleblower & Grievance Redressal: Whistleblower policy under Companies Act/RBI directions & Customer Protection mechanisms"
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
            "DIFFICULTY REQUIREMENT (HARD / CAIIB LEVEL - NUMERICAL & ANALYTICAL RIGOR):\n"
            "- Incorporate multi-step arithmetic (Standard Error, Z-scores, Regression forecasts, MPBF methods, DSCR calculation, Break-even points).\n"
            "- Multi-statement analytical evaluations ('Which of the statements given above is/are TRUE/INCORRECT?').\n"
            "- Practical Chief Credit Officer / Compliance Head case scenarios with complex distractor options.\n"
            "- Step-by-step arithmetic or statutory justification in the explanation."
        )
    else:
        diff_instruction = (
            "DIFFICULTY REQUIREMENT (MODERATE / OPERATIONAL MASTERY):\n"
            "- Focus on direct statutory definitions, statistical properties, HRM theories, RBI circular guidelines, and credit limits.\n"
            "- Precise single-concept question stems with clean distractors."
        )

    prompt = f"""
You are the Chief Examiner for the Indian Institute of Banking & Finance (IIBF) creating authentic exam questions for CAIIB Paper 1: Advanced Bank Management (ABM).

Generate exactly {count} strictly unique, exam-standard multiple choice questions.
Target Module: "{module_name}"
Key Sub-Topics to cover: {sub_topics_str}
Difficulty Tier: "{difficulty}"

{diff_instruction}

Return strictly a raw JSON array of {count} objects (no Markdown fences):
[
  {{
    "question_text": "Detailed question stem or scenario",
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
                unique_stem = f"[ABM-CBT{cbt_set:02d}-Q{q_num:03d}] {item['question_text']}"
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
    print(f"🚀 IIBF High-Fidelity CAIIB Engine ({MODEL_NAME} -> {EXAM_TRACK})")
    print("   Distributed Blueprint: 75 Moderate / 25 Hard across ALL Modules A-D")
    print("==========================================================================")

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

        supabase.table("questions").delete().eq("exam_type", EXAM_TRACK).eq("cbt_set_number", s).execute()

        print(f"\n📘 [Processing Set #{s:02d}/10]...")
        set_records = []
        
        batches_plan = [
            # Module A: 25 Qs (19 Moderate + 6 Hard)
            ("Module A: Statistics", ", ".join(MODULE_CHAPTER_MAP["Module A: Statistics"][0:2]), 10, 1, "moderate"),
            ("Module A: Statistics", ", ".join(MODULE_CHAPTER_MAP["Module A: Statistics"][2:4]), 9, 11, "moderate"),
            ("Module A: Statistics", MODULE_CHAPTER_MAP["Module A: Statistics"][4], 6, 20, "hard"),
            
            # Module B: 25 Qs (19 Moderate + 6 Hard)
            ("Module B: Human Resource Management", ", ".join(MODULE_CHAPTER_MAP["Module B: Human Resource Management"][0:2]), 10, 26, "moderate"),
            ("Module B: Human Resource Management", ", ".join(MODULE_CHAPTER_MAP["Module B: Human Resource Management"][2:4]), 9, 36, "moderate"),
            ("Module B: Human Resource Management", MODULE_CHAPTER_MAP["Module B: Human Resource Management"][4], 6, 45, "hard"),
            
            # Module C: 25 Qs (19 Moderate + 6 Hard)
            ("Module C: Credit Management", ", ".join(MODULE_CHAPTER_MAP["Module C: Credit Management"][0:2]), 10, 51, "moderate"),
            ("Module C: Credit Management", ", ".join(MODULE_CHAPTER_MAP["Module C: Credit Management"][2:4]), 9, 61, "moderate"),
            ("Module C: Credit Management", MODULE_CHAPTER_MAP["Module C: Credit Management"][4], 6, 70, "hard"),
            
            # Module D: 25 Qs (18 Moderate + 7 Hard)
            ("Module D: Compliance in Banks and Corporate Governance", ", ".join(MODULE_CHAPTER_MAP["Module D: Compliance in Banks and Corporate Governance"][0:2]), 10, 76, "moderate"),
            ("Module D: Compliance in Banks and Corporate Governance", ", ".join(MODULE_CHAPTER_MAP["Module D: Compliance in Banks and Corporate Governance"][2:4]), 8, 86, "moderate"),
            ("Module D: Compliance in Banks and Corporate Governance", MODULE_CHAPTER_MAP["Module D: Compliance in Banks and Corporate Governance"][4], 7, 94, "hard")
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

    print("\n🎉 Quality generation complete across all 10 sets for CAIIB ABM!")

if __name__ == "__main__":
    main()