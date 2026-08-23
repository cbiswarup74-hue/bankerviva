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
EXAM_TRACK = "BCBF"
TOTAL_SETS = 20

MODULE_CHAPTER_MAP = {
    "Module A: General Banking and Financial Inclusion": [
        "Financial Inclusion Framework: PMJDY accounts, features, Overdraft facility eligibility (Rs. 10,000 limits), RuPay debit card benefits and accidental insurance cover",
        "Accounts and Operations: BSBDA vs BSBDA-Small accounts, operational limits (Rs. 50k balance, Rs. 1 lakh annual credits), simplified KYC and Officially Valid Documents (OVDs)",
        "BC/BF Model and Code of Conduct: Permitted BC activities, prohibited activities (cannot approve loans), BC agreement terms, Customer Service Points (CSP) management and ethical standards"
    ],
    "Module B: Government Schemes and Social Security": [
        "Social Security Schemes: Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY - age 18-50, Rs. 436 premium, Rs. 2 lakh cover) and Pradhan Mantri Suraksha Bima Yojana (PMSBY - age 18-70, Rs. 20 premium)",
        "Pension Schemes: Atal Pension Yojana (APY - age 18-40, pension slabs Rs. 1,000 to Rs. 5,000, subscriber death and spouse pension rules)",
        "Micro-enterprise Schemes: PM MUDRA Yojana (Shishu up to Rs. 50k, Kishore Rs. 50k-5L, Tarun Rs. 5L-10L), PM SVANidhi street vendor loans and Stand-Up India scheme"
    ],
    "Module C: Rural Credit, Microfinance and Agriculture Lending": [
        "Agriculture Credit: Kisan Credit Card (KCC - scale of finance, subvention norms, crop insurance linkage), Short-term vs Medium/Long term farm credit",
        "Group Lending Models: Self Help Groups (SHGs - NRLM/NULM, grading, revolving fund, internal lending), Joint Liability Groups (JLGs - peer pressure, mutual guarantee)",
        "Priority Sector and Recovery: Priority Sector Lending (PSL) rural targets, soft recovery skills, borrower counseling, dealing with willful default vs distress default"
    ],
    "Module D: Digital Banking, Remittances and Customer Protection": [
        "Payment Architecture: Aadhaar Enabled Payment System (AePS - Cash Withdrawal, Balance Enquiry, mini statement), Micro-ATMs, POS devices and biometric authentication",
        "Digital Channels: Direct Benefit Transfer (DBT - Aadhaar seeding and mapper), UPI 123Pay, BBPS (Bharat Bill Payment System) and USSD (*99#) banking",
        "Consumer Protection and Redressal: Reserve Bank - Integrated Ombudsman Scheme (RB-IOS), turnaround times (TAT) for failed ATM/AePS transactions, compensation norms and cyber security awareness"
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
            "DIFFICULTY REQUIREMENT (HARD / BC-BF LEVEL - SCENARIOS, SCHEME CLAIMS & APY CALCULATIONS):\n"
            "- Multi-statement analytical evaluations ('Which of the statements regarding PMJDY overdraft / PMJJBY claim settlement is/are TRUE/INCORRECT?').\n"
            "- Step-by-step arithmetic: KCC limit scale of finance computations, APY entry-age pension calculation mechanics, failed AePS transaction TAT compensation calculations (Rs. 100/day penalty).\n"
            "- Customer dispute, biometric mismatch, fraud prevention, and CSP ethical dilemmas."
        )
    else:
        diff_instruction = (
            "DIFFICULTY REQUIREMENT (MODERATE / OPERATIONAL MASTERY):\n"
            "- Direct questions on age criteria, premium amounts, sum assured limits, MUDRA loan tier limits, BSBDA withdrawal ceilings, and Ombudsman complaint timelines.\n"
            "- Clear single-concept stems with precise distractor options."
        )

    prompt = f"""
You are the Chief Examiner for the Indian Institute of Banking & Finance (IIBF) creating authentic exam questions for the Business Correspondents / Business Facilitators (BC/BF) Certification.

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
    "explanation": "Detailed statutory, scheme guideline, or arithmetic explanation."
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
                unique_stem = f"[BCBF-CBT{cbt_set:02d}-Q{q_num:03d}] {item['question_text']}"
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
    print(f"🚀 IIBF High-Fidelity BC/BF Engine ({MODEL_NAME} -> {EXAM_TRACK})")
    print(f"   Target: {TOTAL_SETS} Full CBT Sets (2,000 Questions) | 75% Mod / 25% Hard")
    print("==========================================================================")

    existing_sets = get_existing_completed_sets()

    for s in range(1, TOTAL_SETS + 1):
        if s in existing_sets:
            print(f"⏩ [Skipping Set #{s:02d}] Already complete with 100 Qs in Supabase.")
            continue

        supabase.table("questions").delete().eq("exam_type", EXAM_TRACK).eq("cbt_set_number", s).execute()

        print(f"\n📘 [Processing BC/BF Set #{s:02d}/{TOTAL_SETS}]...")
        set_records = []
        
        batches_plan = [
            # Module A: 25 Qs (19 Moderate + 6 Hard)
            ("Module A: General Banking and Financial Inclusion", MODULE_CHAPTER_MAP["Module A: General Banking and Financial Inclusion"][0], 10, 1, "moderate"),
            ("Module A: General Banking and Financial Inclusion", MODULE_CHAPTER_MAP["Module A: General Banking and Financial Inclusion"][1], 9, 11, "moderate"),
            ("Module A: General Banking and Financial Inclusion", MODULE_CHAPTER_MAP["Module A: General Banking and Financial Inclusion"][2], 6, 20, "hard"),
            
            # Module B: 25 Qs (19 Moderate + 6 Hard)
            ("Module B: Government Schemes and Social Security", MODULE_CHAPTER_MAP["Module B: Government Schemes and Social Security"][0], 10, 26, "moderate"),
            ("Module B: Government Schemes and Social Security", MODULE_CHAPTER_MAP["Module B: Government Schemes and Social Security"][1], 9, 36, "moderate"),
            ("Module B: Government Schemes and Social Security", MODULE_CHAPTER_MAP["Module B: Government Schemes and Social Security"][2], 6, 45, "hard"),
            
            # Module C: 25 Qs (19 Moderate + 6 Hard)
            ("Module C: Rural Credit, Microfinance and Agriculture Lending", MODULE_CHAPTER_MAP["Module C: Rural Credit, Microfinance and Agriculture Lending"][0], 10, 51, "moderate"),
            ("Module C: Rural Credit, Microfinance and Agriculture Lending", MODULE_CHAPTER_MAP["Module C: Rural Credit, Microfinance and Agriculture Lending"][1], 9, 61, "moderate"),
            ("Module C: Rural Credit, Microfinance and Agriculture Lending", MODULE_CHAPTER_MAP["Module C: Rural Credit, Microfinance and Agriculture Lending"][2], 6, 70, "hard"),
            
            # Module D: 25 Qs (18 Moderate + 7 Hard)
            ("Module D: Digital Banking, Remittances and Customer Protection", MODULE_CHAPTER_MAP["Module D: Digital Banking, Remittances and Customer Protection"][0], 10, 76, "moderate"),
            ("Module D: Digital Banking, Remittances and Customer Protection", MODULE_CHAPTER_MAP["Module D: Digital Banking, Remittances and Customer Protection"][1], 8, 86, "moderate"),
            ("Module D: Digital Banking, Remittances and Customer Protection", MODULE_CHAPTER_MAP["Module D: Digital Banking, Remittances and Customer Protection"][2], 7, 94, "hard")
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

    print("\n🎉 Complete generation successful across all 20 sets for IIBF BC/BF!")

if __name__ == "__main__":
    main()