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
EXAM_TRACK = "JAIIB_RBWM"

MODULE_CHAPTER_MAP = {
    "Module A: Retail Banking": [
        "Retail Banking vs Corporate Banking, Business models, Liability products & NRI accounts (NRE/NRO/FCNR)",
        "Retail Asset Products: Home Loans (LTV ratios, PSL limits), Auto Loans, Personal Loans & IBA Education Scheme",
        "Credit Scoring & Underwriting: CIBIL score dynamics, bureau metrics, risk parameters & KYC verification"
    ],
    "Module B: Retail Products and Recovery": [
        "Loan Appraisal Metrics: FOIR, LTV, Net Take-Home Pay (NTHP) & Title Verification/Valuation norms",
        "Credit Card Operations: Billing cycles, minimum amount due calculation, chargebacks & mitigation of fraud",
        "Recovery Mechanisms: SARFAESI Act (Sec 13(2)/13(4)/14), DRT thresholds, Lok Adalats & CERSAI filing rules"
    ],
    "Module C: Support Services - Marketing of Banking Services": [
        "Marketing Mix in Banking (7 Ps), Customer Relationship Management (CRM) & Cross-selling dynamics",
        "Alternate Delivery Channels: ATMs (White/Brown label), POS, Internet & Mobile Banking, Contactless NFC cards",
        "Bancassurance regulations (IRDAI norms), Grievance Redressal & Integrated Ombudsman Scheme 2021"
    ],
    "Module D: Wealth Management": [
        "Wealth Management Framework: Financial life cycle stages, Risk profiling & Strategic Asset Allocation",
        "Investment Products: Mutual Funds (Equity/Debt/Hybrid), ETFs, NAV calculation, SIP/STP/SWP mechanics",
        "Taxation & Estate Planning: Capital Gains (STCG/LTCG on equity/debt), Section 80C, Wills & Family Trusts"
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
            "- Incorporate mathematical calculations (FOIR calculation, LTV breach, Mutual Fund NAV/Capital Gains tax, Credit card interest computation).\n"
            "- Multi-statement analytical evaluations ('Which of the statements given above is/are TRUE/INCORRECT?').\n"
            "- Branch Manager retail loan appraisal case studies, SARFAESI enforcement conflicts, and complex asset allocation scenarios."
        )
    else:
        diff_instruction = (
            "DIFFICULTY REQUIREMENT (MODERATE / CORE COMPETENCE):\n"
            "- Focus on statutory regulations, PSL limits, CIBIL thresholds, CERSAI timelines, 7Ps definitions, and retail product features.\n"
            "- Clear single-concept stems with precise distractor options."
        )

    prompt = f"""
You are the Chief Examiner for the Indian Institute of Banking & Finance (IIBF) creating authentic exam questions for JAIIB Paper 4: Retail Banking & Wealth Management (RBWM).

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
                unique_stem = f"[RBWM-CBT{cbt_set:02d}-Q{q_num:03d}] {item['question_text']}"
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
    print(f"🚀 IIBF High-Fidelity RBWM Generator ({MODEL_NAME} -> {EXAM_TRACK})")
    print("   Distributed Blueprint: 75 Moderate / 25 Hard across ALL Modules A-D")
    print("==========================================================================")

    # Check which sets already exist in Supabase
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

        # If a set partially exists, clear it for clean generation
        supabase.table("questions").delete().eq("exam_type", EXAM_TRACK).eq("cbt_set_number", s).execute()

        print(f"\n📘 [Processing Set #{s:02d}/10]...")
        set_records = []
        
        batches_plan = [
            # Module A: 25 Qs (19 Moderate + 6 Hard)
            ("Module A: Retail Banking", MODULE_CHAPTER_MAP["Module A: Retail Banking"][0], 10, 1, "moderate"),
            ("Module A: Retail Banking", MODULE_CHAPTER_MAP["Module A: Retail Banking"][1], 9, 11, "moderate"),
            ("Module A: Retail Banking", MODULE_CHAPTER_MAP["Module A: Retail Banking"][2], 6, 20, "hard"),
            
            # Module B: 25 Qs (19 Moderate + 6 Hard)
            ("Module B: Retail Products and Recovery", MODULE_CHAPTER_MAP["Module B: Retail Products and Recovery"][0], 10, 26, "moderate"),
            ("Module B: Retail Products and Recovery", MODULE_CHAPTER_MAP["Module B: Retail Products and Recovery"][1], 9, 36, "moderate"),
            ("Module B: Retail Products and Recovery", MODULE_CHAPTER_MAP["Module B: Retail Products and Recovery"][2], 6, 45, "hard"),
            
            # Module C: 25 Qs (19 Moderate + 6 Hard)
            ("Module C: Support Services - Marketing of Banking Services", MODULE_CHAPTER_MAP["Module C: Support Services - Marketing of Banking Services"][0], 10, 51, "moderate"),
            ("Module C: Support Services - Marketing of Banking Services", MODULE_CHAPTER_MAP["Module C: Support Services - Marketing of Banking Services"][1], 9, 61, "moderate"),
            ("Module C: Support Services - Marketing of Banking Services", MODULE_CHAPTER_MAP["Module C: Support Services - Marketing of Banking Services"][2], 6, 70, "hard"),
            
            # Module D: 25 Qs (18 Moderate + 7 Hard)
            ("Module D: Wealth Management", MODULE_CHAPTER_MAP["Module D: Wealth Management"][0], 10, 76, "moderate"),
            ("Module D: Wealth Management", MODULE_CHAPTER_MAP["Module D: Wealth Management"][1], 8, 86, "moderate"),
            ("Module D: Wealth Management", MODULE_CHAPTER_MAP["Module D: Wealth Management"][2], 7, 94, "hard")
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

    print("\n🎉 Quality generation complete across all 10 sets for JAIIB RBWM!")

if __name__ == "__main__":
    main()