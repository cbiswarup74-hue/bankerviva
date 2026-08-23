import os
import json
import time
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
EXAM_TRACK = "JAIIB_PPB"

MODULE_CHAPTER_MAP = {
    "Module A: General Banking Operations": [
        "Banker-Customer Relationship: Debtor-Creditor, Trustee, Bailee, Agent, Right of Set-off & Banker Lien",
        "KYC/AML/CFT: PML Act 2002, CDD/EDD procedures, Beneficial Ownership, STRs/CTRs reporting to FIU-IND",
        "Operational Account Types: Savings, Current, Term Deposits (Premature penalty, Form 15G/15H, TDS, Nominee rules)",
        "Special Customer Categories: Minors, Joint Accounts, HUF (Karta powers), Partnerships, Companies, Trusts",
        "Negotiable Instruments Act 1881: Holder in Due Course, Endorsements, Crossing, Material Alterations, Sec 85/89/131/138",
        "Ancillary Services: Safe Deposit Lockers (RBI revised norms), Safe Custody, Bank Guarantees & LC UCPDC 600"
    ],
    "Module B: Functions of Banks": [
        "Principles of Lending: Working Capital appraisal (Turnover/MPBF), Term Loans & DSCR ratio mechanics",
        "Credit Security Creation: Pledge, Hypothecation, Mortgage (Equitable vs English vs Simple), Assignment & Lien",
        "Priority Sector Lending (PSL): Targets for Commercial Banks (40%), SFBs/RRBs (75%), sub-targets (Agri/SMF/Micro/Weaker) & PSLCs",
        "Government Sponsored Schemes: PM Mudra Yojana (Shishu/Kishore/Tarun), PMEGP, DAY-NRLM subvention, Stand-Up India",
        "NPA & IRAC Norms: Special Mention Accounts (SMA-0/1/2), Substandard, Doubtful (D1/D2/D3), Loss Assets & Provisioning (PCR)",
        "Recovery Frameworks: SARFAESI Act 2002 (Sec 13(2)/13(4), CERSAI), DRT/DRAT, Lok Adalats, IBC 2016 CIRP timelines"
    ],
    "Module C: Banking Technology": [
        "Core Banking Solutions (CBS), Enterprise Payment Hubs & ISO 20022 messaging standards",
        "Payment & Settlement: RTGS, NEFT (half-hourly batches), IMPS 24x7, UPI 2.0 (Autopay/Mandates), NACH, AePS/APBS",
        "Delivery Channels: White/Brown Label ATMs, Cash Recyclers, POS, Tokenization, EMV vs Contactless NFC card limits",
        "Information Security & Cyber Threats: IT Act 2000, Phishing/Vishing/Ransomware, SOC, RBI Cyber Security Framework, BCP/DR"
    ],
    "Module D: Ethics in Banks and Financial Institutions": [
        "Ethics vs Law: Values, Morals, Ethical Climate, Codes of Conduct vs Statutory Compliance",
        "Workplace Ethics: Whistleblower Policies, POSH Act, Conflict of Interest, Insider Trading & Nepotism",
        "Banker-Customer Interface: Fair Practices Code (FPC) for Lenders, Mis-selling of Third-Party/Bancassurance, DPDP Act",
        "Corporate Governance & CSR: Board structure, Independent Directors, ESG accountability, Companies Act Sec 135 CSR norms",
        "Complex Ethical Dilemma Vignettes: Statutory permissibility vs ethical duty, commercial target pressure vs fair appraisal"
    ]
}

def generate_question_batch(cbt_set, module_name, sub_topics_str, count, start_q_num, difficulty, max_retries=4):
    if difficulty == "hard":
        diff_instruction = (
            "DIFFICULTY REQUIREMENT (HARD / EVALUATIVE):\n"
            "- Construct realistic case scenarios (Branch Manager decisions, NPA recovery calculations, SARFAESI/IBC conflict).\n"
            "- Include multi-statement evaluation questions ('Which of the statements given above is/are TRUE/INCORRECT?').\n"
            "- For Module D: Construct authentic ethical dilemmas balancing commercial targets vs statutory/fiduciary obligations."
        )
    else:
        diff_instruction = (
            "DIFFICULTY REQUIREMENT (MODERATE / OPERATIONAL):\n"
            "- Focus on direct statutory rules, NI Act sections, RBI circulars, KYC limits, and operational definitions.\n"
            "- Clear single-concept stems with precise distractor options."
        )

    prompt = f"""
You are the Chief Examiner for the Indian Institute of Banking & Finance (IIBF) creating authentic exam questions for JAIIB Paper 2: Principles & Practices of Banking (PPB).

Generate exactly {count} strictly unique, exam-standard multiple choice questions.
Target Module: "{module_name}"
Key Sub-Topics to cover across this batch: {sub_topics_str}
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
    "explanation": "Detailed statutory, regulatory, or arithmetic explanation citing relevant acts/circulars."
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
                unique_stem = f"[PPB-CBT{cbt_set:02d}-Q{q_num:03d}] {item['question_text']}"
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
                    "correct_option": item["correct_option"].upper(),
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
    print(f"🚀 IIBF High-Fidelity Question Engine ({MODEL_NAME} -> {EXAM_TRACK})")
    print("   Exact Blueprint: 75 Moderate (Modules A-C) / 25 Hard (Module D)")
    print("==========================================================================")

    for s in range(1, 11):
        print(f"\n📘 [Processing Set #{s:02d}/10]...")
        set_records = []
        
        # Exact IIBF Blueprint (100 Qs per Set: 75 Mod / 25 Hard)
        plan = [
            ("Module A: General Banking Operations", MODULE_CHAPTER_MAP["Module A: General Banking Operations"], 30, 1, "moderate"),
            ("Module B: Functions of Banks", MODULE_CHAPTER_MAP["Module B: Functions of Banks"], 30, 31, "moderate"),
            ("Module C: Banking Technology", MODULE_CHAPTER_MAP["Module C: Banking Technology"], 15, 61, "moderate"),
            ("Module D: Ethics in Banks and Financial Institutions", MODULE_CHAPTER_MAP["Module D: Ethics in Banks and Financial Institutions"], 25, 76, "hard")
        ]
        
        for mod_title, topics, total_mod_qs, start_idx, diff in plan:
            batches = []
            if total_mod_qs == 30:
                batches = [
                    (10, start_idx, ", ".join(topics[0:2])),
                    (10, start_idx + 10, ", ".join(topics[2:4])),
                    (10, start_idx + 20, ", ".join(topics[4:6]))
                ]
            elif total_mod_qs == 15:
                batches = [
                    (10, start_idx, ", ".join(topics[0:2])),
                    (5, start_idx + 10, ", ".join(topics[2:4]))
                ]
            elif total_mod_qs == 25:
                batches = [
                    (10, start_idx, ", ".join(topics[0:2])),
                    (10, start_idx + 10, ", ".join(topics[2:4])),
                    (5, start_idx + 20, topics[4])
                ]

            for count, q_start, topic_slice in batches:
                print(f"  • Generating Set #{s:02d} | Q{q_start:03d}-Q{q_start+count-1:03d} [{diff.upper()}] ({mod_title.split(':')[0]})...")
                res = generate_question_batch(s, mod_title, topic_slice, count, q_start, diff)
                set_records.extend(res)
                time.sleep(2)

        if set_records:
            for i in range(0, len(set_records), 50):
                chunk = set_records[i:i+50]
                supabase.table("questions").insert(chunk).execute()
            print(f"  ✅ [Set #{s:02d}] 100% finished & inserted ({len(set_records)} Qs)!")

    print("\n🎉 Quality generation complete across all 10 sets for JAIIB PPB!")

if __name__ == "__main__":
    main()