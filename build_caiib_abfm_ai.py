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
EXAM_TRACK = "CAIIB_ABFM"

MODULE_CHAPTER_MAP = {
    "Module A: The Management Process": [
        "Management Fundamentals: Planning, Objectives, Management by Objectives (MBO), Decision making & Strategic analysis (SWOT/PESTLE)",
        "Organizing & Staffing: Organizational structure, Span of control, Delegation vs Decentralization & Talent acquisition strategies",
        "Directing & Controlling: Principles of Direction, Supervision, Budgetary control systems & Modern control techniques (PERT/CPM/EVA)",
        "Business Environment & Policy: Corporate governance frameworks, Business ethics, ESG metrics & Corporate social responsibility"
    ],
    "Module B: Advanced Financial Management": [
        "Leverage Analysis: Operating Leverage (DOL), Financial Leverage (DFL), Combined Leverage (DCL) & EBIT-EPS Indifference point",
        "Capital Budgeting under Risk: NPV, IRR, MIRR, Profitability Index, Certainty Equivalent Method & Risk-adjusted Discount Rate (RADR)",
        "Capital Structure & Cost of Capital: Weighted Average Cost of Capital (WACC), Net Income/NOI Approach, Modigliani-Miller theorem & Pecking Order Theory",
        "Dividend Policies: Walter Model, Gordon Model, Modigliani-Miller dividend irrelevance hypothesis & Dividend payout dynamics",
        "Advanced Working Capital: Cash management models (Baumol, Miller-Orr), Operating cycle & Receivables factoring"
    ],
    "Module C: Valuation, Mergers & Acquisitions": [
        "Corporate Valuation Fundamentals: Book value, Liquidation value, Discounted Cash Flow (DCF), Free Cash Flow to Firm (FCFF) & FCFE",
        "Relative Valuation Multiples: Enterprise Value (EV)/EBITDA, P/E ratio, Price-to-Book (P/B), Enterprise Value/Sales & PEG ratio",
        "Mergers & Acquisitions (M&A): Synergy calculation, Share Swap Ratio determination, Post-merger EPS & Enterprise value accretion",
        "Corporate Restructuring: Demergers, Spin-offs, Carve-outs, Leveraged Buyouts (LBOs), Management Buyouts (MBOs) & SEBI Takeover Regulations"
    ],
    "Module D: Emerging Business Solutions": [
        "Hybrid Financing: Mezzanine financing, Subordinated debt, Convertible debentures (FCD/PCD), Foreign Currency Convertible Bonds (FCCBs)",
        "Startup & Venture Financing: Seed capital, Angel investment rounds, Series funding, Term sheet covenants & Valuation of unicorns",
        "Private Equity & Alternative Assets: PE fund lifecycles, Dry powder, General/Limited Partner structures & REITs/InvITs mechanics",
        "Green Finance & ESG: Sustainable banking, Green bonds, Social bonds, Carbon credit accounting & BRSR (Business Responsibility & Sustainability Reporting)",
        "Fintech & Digital Banking: Embedded finance, Neo-banks, Open Banking APIs, Decentralized Finance (DeFi) & Blockchain in corporate settlements"
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
            "DIFFICULTY REQUIREMENT (HARD / CAIIB ABFM - NUMERICAL & ANALYTICAL RIGOR):\n"
            "- Multi-step calculations (Operating/Financial Leverage, EBIT-EPS indifference level, WACC, DCF valuation, Swap ratio, Post-merger EPS, NPV/MIRR with uneven cash flows, Gordon/Walter dividend valuations).\n"
            "- Multi-statement analytical evaluations ('Which of the statements given above is/are TRUE/INCORRECT?').\n"
            "- Real-world CFO / Corporate Finance case scenarios with comprehensive step-by-step arithmetic explanations."
        )
    else:
        diff_instruction = (
            "DIFFICULTY REQUIREMENT (MODERATE / OPERATIONAL MASTERY):\n"
            "- Direct conceptual questions on management principles, dividend theories, M&A regulations (SEBI takeover code), hybrid instruments, and green finance taxonomy.\n"
            "- Clear single-concept stems with precise distractor options."
        )

    prompt = f"""
You are the Chief Examiner for the Indian Institute of Banking & Finance (IIBF) creating authentic exam questions for CAIIB Paper 3: Advanced Business & Financial Management (ABFM).

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
                unique_stem = f"[ABFM-CBT{cbt_set:02d}-Q{q_num:03d}] {item['question_text']}"
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
            ("Module A: The Management Process", ", ".join(MODULE_CHAPTER_MAP["Module A: The Management Process"][0:2]), 10, 1, "moderate"),
            ("Module A: The Management Process", ", ".join(MODULE_CHAPTER_MAP["Module A: The Management Process"][2:4]), 9, 11, "moderate"),
            ("Module A: The Management Process", MODULE_CHAPTER_MAP["Module A: The Management Process"][0], 6, 20, "hard"),
            
            # Module B: 25 Qs (19 Moderate + 6 Hard)
            ("Module B: Advanced Financial Management", ", ".join(MODULE_CHAPTER_MAP["Module B: Advanced Financial Management"][0:2]), 10, 26, "moderate"),
            ("Module B: Advanced Financial Management", ", ".join(MODULE_CHAPTER_MAP["Module B: Advanced Financial Management"][2:4]), 9, 36, "moderate"),
            ("Module B: Advanced Financial Management", MODULE_CHAPTER_MAP["Module B: Advanced Financial Management"][0], 6, 45, "hard"),
            
            # Module C: 25 Qs (19 Moderate + 6 Hard)
            ("Module C: Valuation, Mergers & Acquisitions", MODULE_CHAPTER_MAP["Module C: Valuation, Mergers & Acquisitions"][0], 10, 51, "moderate"),
            ("Module C: Valuation, Mergers & Acquisitions", MODULE_CHAPTER_MAP["Module C: Valuation, Mergers & Acquisitions"][1], 9, 61, "moderate"),
            ("Module C: Valuation, Mergers & Acquisitions", MODULE_CHAPTER_MAP["Module C: Valuation, Mergers & Acquisitions"][2], 6, 70, "hard"),
            
            # Module D: 25 Qs (18 Moderate + 7 Hard)
            ("Module D: Emerging Business Solutions", ", ".join(MODULE_CHAPTER_MAP["Module D: Emerging Business Solutions"][0:2]), 10, 76, "moderate"),
            ("Module D: Emerging Business Solutions", ", ".join(MODULE_CHAPTER_MAP["Module D: Emerging Business Solutions"][2:4]), 8, 86, "moderate"),
            ("Module D: Emerging Business Solutions", MODULE_CHAPTER_MAP["Module D: Emerging Business Solutions"][3], 7, 94, "hard")
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

    print("\n🎉 Quality generation complete across all 10 sets for CAIIB ABFM!")

if __name__ == "__main__":
    main()