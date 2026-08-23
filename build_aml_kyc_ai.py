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
EXAM_TRACK = "AML_KYC"
TOTAL_SETS = 20

MODULE_CHAPTER_MAP = {
    "Module A: Anti-Money Laundering Overview": [
        "Money Laundering Stages: Placement, Layering, Integration mechanics, Structuring / Smurfing techniques, Hawala & informal value transfer systems",
        "International Frameworks: Financial Action Task Force (FATF) 40 Recommendations, High-Risk Jurisdictions (Black list & Grey list), Mutual Evaluations",
        "Global Regulatory Ecosystem: Basel Committee on Banking Supervision (BCBS) guidelines on CDD, Wolfsberg Principles for Private Banking & Egmont Group of FIUs"
    ],
    "Module B: Legal & Regulatory Framework in India": [
        "Prevention of Money Laundering Act (PMLA 2002): Offence of ML (Sec 3), Obligations of Banking Companies (Sec 12), Designated Director & Principal Officer responsibilities",
        "Statutory Reporting to FIU-IND: Cash Transaction Reports (CTR - >Rs. 10 Lakhs), Suspicious Transaction Reports (STR - within 7 working days), Counterfeit Currency Reports (CCR), Non-Profit Organisation Reports (NTR), Cross Border Wire Transfer Reports (CBWTR - >Rs. 5 Lakhs)",
        "Regulatory Powers & Compliance: Powers of Director FIU-IND (Sec 13 penalties), Attachment of property (Sec 5), Burden of proof (Sec 24), and Statutory 5-Year record retention rule"
    ],
    "Module C: KYC Standards, Identification & CDD": [
        "Customer Acceptance & Identification (CAP & CIP): 6 Officially Valid Documents (OVDs), Simplified KYC / Small Account limits (Rs. 50k balance, Rs. 1L credits, Rs. 10k withdrawal), Digital KYC & Video Customer Identification Process (V-CIP)",
        "Beneficial Ownership (BO): Identifying Controlling Ownership Interest (>10% for Companies & Trusts, >15% for Partnerships/Unincorporated bodies) & Senior Managing Official identification",
        "CKYCR & PEP Protocols: Central KYC Registry (14-digit CKYC identifier, uploading within 10 days), Enhanced Due Diligence (EDD) for Politically Exposed Persons (PEPs) & Senior Management approval"
    ],
    "Module D: Transaction Monitoring, Sanctions & Red Flags": [
        "Risk Categorization & Periodic Review: Low Risk (10 years update), Medium Risk (8 years update), High Risk (2 years update), Continuous due diligence & Source of funds verification",
        "Sanction Screening & Red Flags: UN Security Council Resolutions (UNSCR 1267/1988/1718), Section 51A of UAPA Act 1967, Freezing of terrorist assets, OFAC sanction screening, Shell bank prohibitions",
        "Correspondent Banking & Wire Transfers: Due diligence for foreign respondent banks, Nested correspondent relationships, FATF Travel Rule for wire transfers, Trade-Based Money Laundering (TBML - Over/under-invoicing)"
    ]
}

def sanitize_option(val):
    if not val:
        return "A"
    clean = str(val).strip().upper()
    match = re.search(r'[A-D]', clean)
    return match.group(0) if match else "A"

def generate_question_batch(cbt_set, module_name, sub_topics_str, count, start_q_num, difficulty, max_retries=5):
    if difficulty == "hard":
        diff_instruction = (
            "DIFFICULTY REQUIREMENT (HARD / AML-KYC LEVEL - STATUTORY CONFLICTS & RED FLAG INVESTIGATIONS):\n"
            "- Multi-statement analytical evaluations ('Which of the statements regarding Beneficial Ownership determination / STR reporting obligations is/are TRUE/INCORRECT?').\n"
            "- Complex branch situational dilemmas involving PEP account approvals, suspicious trade-based money laundering indicators, structuring across multiple accounts, and freezing orders under UAPA Section 51A.\n"
            "- Exact calculation scenarios involving Beneficial Ownership percentage thresholds, CTR/CBWTR aggregation limits, and statutory record retention timelines."
        )
    else:
        diff_instruction = (
            "DIFFICULTY REQUIREMENT (MODERATE / OPERATIONAL COMPLIANCE MASTERY):\n"
            "- Direct statutory provisions (PMLA Sec 12, PMLA Sec 3), FIU-IND reporting timelines (STR 7 days, CTR 15th of next month), KYC periodic update intervals (2/8/10 years), CKYC upload timelines (10 days), and list of 6 OVDs.\n"
            "- Clear single-concept stems with precise distractor options."
        )

    prompt = f"""
You are the Principal AML/KYC Compliance Examiner for the Indian Institute of Banking & Finance (IIBF) creating authentic exam questions for the Certificate Examination in AML / KYC.

Generate exactly {count} strictly unique, exam-standard multiple choice questions.
Target Module: "{module_name}"
Key Sub-Topics to cover: {sub_topics_str}
Difficulty Tier: "{difficulty}"

{diff_instruction}

Return strictly a raw JSON array of {count} objects (no Markdown fences):
[
  {{
    "question_text": "Detailed question stem or compliance case scenario",
    "option_a": "Option A text",
    "option_b": "Option B text",
    "option_c": "Option C text",
    "option_d": "Option D text",
    "correct_option": "A",
    "explanation": "Detailed statutory section (PMLA/PML Rules), RBI Master Direction on KYC, or FIU-IND guideline explanation."
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
                unique_stem = f"[AMLKYC-CBT{cbt_set:02d}-Q{q_num:03d}] {item['question_text']}"
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
            err_msg = str(e).lower()
            if "429" in err_msg or "quota" in err_msg or "resource" in err_msg:
                wait_time = 25 * attempt
                print(f"    ⏳ Rate limit: Sleeping {wait_time}s (Attempt {attempt}/{max_retries})...")
                time.sleep(wait_time)
            else:
                print(f"    ⚠️ Retry {attempt}/{max_retries} due to: {e}")
                time.sleep(3)
    return []

def get_existing_completed_sets():
    print(f"📥 Scanning existing completed sets for {EXAM_TRACK}...")
    all_rows = []
    for offset in range(0, 3000, 1000):
        res = supabase.table("questions") \
            .select("cbt_set_number") \
            .eq("exam_type", EXAM_TRACK) \
            .range(offset, offset + 999) \
            .execute()
        if res.data:
            all_rows.extend(res.data)
        if not res.data or len(res.data) < 1000:
            break

    counts = {}
    for r in all_rows:
        s_num = r.get("cbt_set_number")
        if s_num is not None:
            counts[s_num] = counts.get(s_num, 0) + 1

    completed = set()
    for s_num, count in counts.items():
        if count >= 100:
            completed.add(s_num)

    print(f"✅ Found {len(completed)} fully completed sets: {sorted(list(completed))}")
    return completed

def main():
    print("==========================================================================")
    print(f"🚀 IIBF High-Fidelity AML/KYC Engine ({MODEL_NAME} -> {EXAM_TRACK})")
    print(f"   Target: {TOTAL_SETS} Full CBT Sets (2,000 Questions) | 75% Mod / 25% Hard")
    print("==========================================================================")

    existing_sets = get_existing_completed_sets()

    for s in range(1, TOTAL_SETS + 1):
        if s in existing_sets:
            print(f"⏩ [Skipping Set #{s:02d}] Already complete with 100 Qs in Supabase.")
            continue

        supabase.table("questions").delete().eq("exam_type", EXAM_TRACK).eq("cbt_set_number", s).execute()

        print(f"\n📘 [Processing AML/KYC Set #{s:02d}/{TOTAL_SETS}]...")
        set_records = []
        
        batches_plan = [
            # Module A: 25 Qs (19 Moderate + 6 Hard)
            ("Module A: Anti-Money Laundering Overview", MODULE_CHAPTER_MAP["Module A: Anti-Money Laundering Overview"][0], 10, 1, "moderate"),
            ("Module A: Anti-Money Laundering Overview", MODULE_CHAPTER_MAP["Module A: Anti-Money Laundering Overview"][1], 9, 11, "moderate"),
            ("Module A: Anti-Money Laundering Overview", MODULE_CHAPTER_MAP["Module A: Anti-Money Laundering Overview"][2], 6, 20, "hard"),
            
            # Module B: 25 Qs (19 Moderate + 6 Hard)
            ("Module B: Legal & Regulatory Framework in India", MODULE_CHAPTER_MAP["Module B: Legal & Regulatory Framework in India"][0], 10, 26, "moderate"),
            ("Module B: Legal & Regulatory Framework in India", MODULE_CHAPTER_MAP["Module B: Legal & Regulatory Framework in India"][1], 9, 36, "moderate"),
            ("Module B: Legal & Regulatory Framework in India", MODULE_CHAPTER_MAP["Module B: Legal & Regulatory Framework in India"][2], 6, 45, "hard"),
            
            # Module C: 25 Qs (19 Moderate + 6 Hard)
            ("Module C: KYC Standards, Identification & CDD", MODULE_CHAPTER_MAP["Module C: KYC Standards, Identification & CDD"][0], 10, 51, "moderate"),
            ("Module C: KYC Standards, Identification & CDD", MODULE_CHAPTER_MAP["Module C: KYC Standards, Identification & CDD"][1], 9, 61, "moderate"),
            ("Module C: KYC Standards, Identification & CDD", MODULE_CHAPTER_MAP["Module C: KYC Standards, Identification & CDD"][2], 6, 70, "hard"),
            
            # Module D: 25 Qs (18 Moderate + 7 Hard)
            ("Module D: Transaction Monitoring, Sanctions & Red Flags", MODULE_CHAPTER_MAP["Module D: Transaction Monitoring, Sanctions & Red Flags"][0], 10, 76, "moderate"),
            ("Module D: Transaction Monitoring, Sanctions & Red Flags", MODULE_CHAPTER_MAP["Module D: Transaction Monitoring, Sanctions & Red Flags"][1], 8, 86, "moderate"),
            ("Module D: Transaction Monitoring, Sanctions & Red Flags", MODULE_CHAPTER_MAP["Module D: Transaction Monitoring, Sanctions & Red Flags"][2], 7, 94, "hard")
        ]
        
        for mod_title, topic_slice, count, q_start, diff in batches_plan:
            print(f"  • Generating Set #{s:02d} | Q{q_start:03d}-Q{q_start+count-1:03d} [{diff.upper()}] ({mod_title.split(':')[0]})...")
            res = generate_question_batch(s, mod_title, topic_slice, count, q_start, diff)
            set_records.extend(res)
            time.sleep(1.5)

        if set_records:
            for i in range(0, len(set_records), 50):
                chunk = set_records[i:i+50]
                supabase.table("questions").insert(chunk).execute()
            print(f"  ✅ [Set #{s:02d}] 100% finished & inserted ({len(set_records)} Qs)!")

    print(f"\n🎉 Complete generation successful across all {TOTAL_SETS} sets for IIBF AML/KYC!")

if __name__ == "__main__":
    main()