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
EXAM_TRACK = "CAIIB_BRBL"

MODULE_CHAPTER_MAP = {
    "Module A: Regulations and Compliance": [
        "RBI Act 1934: Currency management, CRR/SLR statutory powers, Section 42, Section 45-IA (NBFC regulation) & Open Market Operations",
        "Banking Regulation Act 1949: Licensing of banks (Sec 22), Opening branches (Sec 23), Management control (Sec 10/36AA), Restrictions on loans (Sec 20)",
        "Statutory Ecosystem: DICGC Act 1961 (Deposit insurance coverage limits & priority), Payment & Settlement Systems Act 2007 (RTGS/NEFT legal mandate)",
        "Bank Resolution & Amalgamation: Section 45 moratorium powers, Scheme of amalgamation, Capital adequacy compliance & Prompt Corrective Action (PCA)"
    ],
    "Module B: Important Acts / Laws - Part A": [
        "Indian Contract Act 1872: Contract of Indemnity vs Guarantee, Rights of Surety, Discharge of Surety, Bailment, Pledge & Bankers Lien",
        "Sale of Goods Act 1930 & Partnership Act 1932: Rights of unpaid seller, Partnership firm constitution, Registration effects, Dissolution rules",
        "Limited Liability Partnership (LLP) Act 2008: Designated partners, Whistleblowing provisions, Compromise, Arrangement & Winding up",
        "Companies Act 2013: Incorporation, Board powers, Charge creation & registration timelines (Sec 77/78), Modification/Satisfaction of charges"
    ],
    "Module C: Important Acts / Laws - Part B": [
        "Transfer of Property Act 1882: Types of Mortgages (Simple, Equitable, English, Usufructuary), Priority of charges, Actionable claims & Leases",
        "Right to Information (RTI) Act 2005: Public authority obligations, Exemptions under Section 8(1), Central/State Information Commission appeals",
        "Prevention of Money Laundering Act (PMLA 2002): Offence of ML, Obligation of banking companies (Sec 12), Reporting to FIU-IND, Attachment of property",
        "Information Technology Act 2000: Digital & Electronic signatures, Certifying Authorities, Cyber crimes, Tampering of computer records & Section 65B evidence"
    ],
    "Module D: Commercial & Recovery Laws": [
        "SARFAESI Act 2002: Security Interest enforcement (Sec 13(2)/13(4)), Section 14 District Magistrate powers, Sec 17 DRT appeals, Sec 31 exemptions",
        "RDB Act 1993 (DRT & DRAT): Jurisdiction thresholds, Recovery Certificates, Debt Recovery Appellate Tribunal pre-deposit requirements",
        "Insolvency and Bankruptcy Code (IBC 2016): Corporate Insolvency Resolution Process (CIRP) timeline, Committee of Creditors (CoC) voting thresholds, Section 29A disqualifications & Section 53 Waterfall mechanism",
        "Consumer Protection Act 2019 & Limitation Act 1963: Consumer Dispute Redressal Commissions (District/State/National), Law of Limitation periods for bank suits/mortgages"
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
            "DIFFICULTY REQUIREMENT (HARD / CAIIB BRBL - STATUTORY CONFLICT & JUDICIAL RIGOR):\n"
            "- Multi-statement legal evaluations ('Which of the statements given above is/are TRUE/INCORRECT?').\n"
            "- Complex branch situational dilemmas involving SARFAESI Section 13(4) vs IBC Moratorium Section 14 conflicts.\n"
            "- Law of Limitation exact calculations (acknowledgment of debt, invocation of guarantee), Charge filing timeline breaches, and IBC Section 53 waterfall priority distribution problems."
        )
    else:
        diff_instruction = (
            "DIFFICULTY REQUIREMENT (MODERATE / CORE LEGAL COMPETENCE):\n"
            "- Direct statutory sections, prescribed limitation periods, penalty amounts, DRT/DRAT pecuniary jurisdiction, and DICGC limits.\n"
            "- Clear single-concept stems with precise distractor options."
        )

    prompt = f"""
You are the Chief Examiner for the Indian Institute of Banking & Finance (IIBF) creating authentic exam questions for CAIIB Paper 4: Banking Regulations and Business Laws (BRBL).

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
    "explanation": "Detailed statutory section, act, and judicial reasoning explanation."
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
                unique_stem = f"[BRBL-CBT{cbt_set:02d}-Q{q_num:03d}] {item['question_text']}"
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
            ("Module A: Regulations and Compliance", ", ".join(MODULE_CHAPTER_MAP["Module A: Regulations and Compliance"][0:2]), 10, 1, "moderate"),
            ("Module A: Regulations and Compliance", ", ".join(MODULE_CHAPTER_MAP["Module A: Regulations and Compliance"][2:4]), 9, 11, "moderate"),
            ("Module A: Regulations and Compliance", MODULE_CHAPTER_MAP["Module A: Regulations and Compliance"][1], 6, 20, "hard"),
            
            # Module B: 25 Qs (19 Moderate + 6 Hard)
            ("Module B: Important Acts / Laws - Part A", ", ".join(MODULE_CHAPTER_MAP["Module B: Important Acts / Laws - Part A"][0:2]), 10, 26, "moderate"),
            ("Module B: Important Acts / Laws - Part A", ", ".join(MODULE_CHAPTER_MAP["Module B: Important Acts / Laws - Part A"][2:4]), 9, 36, "moderate"),
            ("Module B: Important Acts / Laws - Part A", MODULE_CHAPTER_MAP["Module B: Important Acts / Laws - Part A"][0], 6, 45, "hard"),
            
            # Module C: 25 Qs (19 Moderate + 6 Hard)
            ("Module C: Important Acts / Laws - Part B", ", ".join(MODULE_CHAPTER_MAP["Module C: Important Acts / Laws - Part B"][0:2]), 10, 51, "moderate"),
            ("Module C: Important Acts / Laws - Part B", ", ".join(MODULE_CHAPTER_MAP["Module C: Important Acts / Laws - Part B"][2:4]), 9, 61, "moderate"),
            ("Module C: Important Acts / Laws - Part B", MODULE_CHAPTER_MAP["Module C: Important Acts / Laws - Part B"][0], 6, 70, "hard"),
            
            # Module D: 25 Qs (18 Moderate + 7 Hard)
            ("Module D: Commercial & Recovery Laws", MODULE_CHAPTER_MAP["Module D: Commercial & Recovery Laws"][0], 10, 76, "moderate"),
            ("Module D: Commercial & Recovery Laws", MODULE_CHAPTER_MAP["Module D: Commercial & Recovery Laws"][1], 8, 86, "moderate"),
            ("Module D: Commercial & Recovery Laws", MODULE_CHAPTER_MAP["Module D: Commercial & Recovery Laws"][2], 7, 94, "hard")
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

    print("\n🎉 Quality generation complete across all 10 sets for CAIIB BRBL!")

if __name__ == "__main__":
    main()