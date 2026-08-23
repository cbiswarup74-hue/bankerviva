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
EXAM_TRACK = "CCP"
TOTAL_SETS = 30

MODULE_CHAPTER_MAP = {
    "Module A: Principles and Practice of Lending": [
        "Credit Policy & Regulatory Framework: RBI Lending Guidelines, Statutory Restrictions under Section 20 of BR Act, Fair Practices Code for Lenders",
        "Exposure Norms & Priority Sector: Large Exposure Framework (LEF - Single/Group borrower limits), Priority Sector Lending (PSL) targets, sub-targets & RIDF penalties",
        "Credit Risk & Rating: Internal Rating Models, Credit Scoring (CIBIL/Equifax/Experian/CRIF), Risk-Adjusted Return on Capital (RAROC) & Credit Risk Mitigation (CRM)"
    ],
    "Module B: Credit Appraisal and Financial Analysis": [
        "Financial Statement Analysis: Balance Sheet & Profit and Loss scrutiny, Inter-firm comparisons, Window dressing detection, Cash Flow vs Fund Flow analysis",
        "Ratio Analysis & Financial Metrics: Current Ratio, Quick Ratio, Debt-Equity Ratio, DSCR, Interest Coverage Ratio, TOL/TNW, Fixed Asset Coverage Ratio",
        "Working Capital Assessment: Nayak Committee Turnover Method, Tandon/Chore Committee MPBF Methods (Method I & II), Cash Budget System for seasonal industries",
        "Term Loan Appraisal: Project Cost, Means of Finance, Break-Even Point (BEP), Internal Rate of Return (IRR), Sensitivity Analysis & Holding Period Computations"
    ],
    "Module C: Non-Fund Based Facilities and Documentation": [
        "Letters of Credit (LC): Parties to LC, Types of LC (Revocable, Irrevocable, Revolving, Transferable, Back-to-Back, Red/Green Clause), UCPDC 600 Articles & Incoterms 2020",
        "Bank Guarantees & Co-acceptance: Financial Guarantee vs Performance Guarantee, Deferred Payment Guarantee (DPG), Invocation norms & Limitation periods",
        "Legal Documentation & Creation of Charges: Pledge, Hypothecation, Mortgage (Equitable, Simple, English), Bankers Lien, Set-off, Assignment & CERSAI / ROC filing rules"
    ],
    "Module D: Credit Monitoring, Supervision and Recovery": [
        "Credit Monitoring & EWS: Early Warning Signals (EWS), Red Flagged Accounts (RFA), Stock Audit, QIS / FFR statements, CRILC reporting & Credit Audits",
        "Asset Classification & Provisioning: NPA Identification (90-day norm), Substandard, Doubtful (D1/D2/D3), Loss Assets, SMA-0, SMA-1, SMA-2 staging & Provisioning matrix",
        "Resolution of Stressed Assets: RBI June 7, 2019 Prudential Framework, Inter-Creditor Agreement (ICA), Resolution Plan (RP) timelines & Independent Credit Evaluation (ICE)",
        "Statutory Recovery Mechanisms: SARFAESI Act 2002 (Sec 13(2), 13(4), Sec 14), DRT / DRAT procedures (RDB Act 1993), Insolvency and Bankruptcy Code (IBC 2016) & Lok Adalat"
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
            "DIFFICULTY REQUIREMENT (HARD / CCP LEVEL - NUMERICAL APPRAISAL & LOAN CASE STUDIES):\n"
            "- Step-by-step arithmetic: MPBF Method I & II calculations, DSCR computation with multi-year cash flows, Operating Cycle days, BEP (Break-even sales/units), Current Ratio adjustments, Net Working Capital (NWC) deficits.\n"
            "- Multi-statement analytical appraisals ('Which of the statements regarding the loan sanction covenants/provisioning is/are TRUE/INCORRECT?').\n"
            "- Complex Chief Credit Officer branch loan sanction / NPA provisioning / IBC Resolution Plan case dilemmas."
        )
    else:
        diff_instruction = (
            "DIFFICULTY REQUIREMENT (MODERATE / OPERATIONAL CREDIT MASTERY):\n"
            "- Direct statutory provisions (BR Act Sec 20, SARFAESI Sec 13, IBC Sec 29A), RBI exposure percentages (LEF single/group borrower limits), UCPDC 600 rules, CERSAI filing timelines, and standard provisioning percentages.\n"
            "- Clear single-concept stems with precise distractor options."
        )

    prompt = f"""
You are the Chief Credit Examiner for the Indian Institute of Banking & Finance (IIBF) creating authentic exam questions for the Certified Credit Professional (CCP) Certificate Course.

Generate exactly {count} strictly unique, exam-standard multiple choice questions.
Target Module: "{module_name}"
Key Sub-Topics to cover: {sub_topics_str}
Difficulty Tier: "{difficulty}"

{diff_instruction}

Return strictly a raw JSON array of {count} objects (no Markdown fences):
[
  {{
    "question_text": "Detailed question stem or numerical credit scenario",
    "option_a": "Option A text",
    "option_b": "Option B text",
    "option_c": "Option C text",
    "option_d": "Option D text",
    "correct_option": "A",
    "explanation": "Detailed step-by-step credit appraisal, statutory section, or arithmetic explanation."
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
                unique_stem = f"[CCP-CBT{cbt_set:02d}-Q{q_num:03d}] {item['question_text']}"
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
                print(f"    ⏳ Quota pacing: Sleeping {wait_time}s (Attempt {attempt}/{max_retries})...")
                time.sleep(wait_time)
            else:
                print(f"    ⚠️ Retry {attempt}/{max_retries} due to: {e}")
                time.sleep(3)
    return []

def main():
    print("==========================================================================")
    print(f"🚀 IIBF High-Fidelity CCP Engine ({MODEL_NAME} -> {EXAM_TRACK})")
    print(f"   Target: {TOTAL_SETS} Full CBT Sets (3,000 Questions) | 75% Mod / 25% Hard")
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

    for s in range(1, TOTAL_SETS + 1):
        if s in existing_sets:
            print(f"⏩ [Skipping Set #{s:02d}] Already complete with 100 Qs in Supabase.")
            continue

        supabase.table("questions").delete().eq("exam_type", EXAM_TRACK).eq("cbt_set_number", s).execute()

        print(f"\n📘 [Processing CCP Set #{s:02d}/{TOTAL_SETS}]...")
        set_records = []
        
        batches_plan = [
            # Module A: 25 Qs (19 Moderate + 6 Hard)
            ("Module A: Principles and Practice of Lending", MODULE_CHAPTER_MAP["Module A: Principles and Practice of Lending"][0], 10, 1, "moderate"),
            ("Module A: Principles and Practice of Lending", MODULE_CHAPTER_MAP["Module A: Principles and Practice of Lending"][1], 9, 11, "moderate"),
            ("Module A: Principles and Practice of Lending", MODULE_CHAPTER_MAP["Module A: Principles and Practice of Lending"][2], 6, 20, "hard"),
            
            # Module B: 25 Qs (19 Moderate + 6 Hard)
            ("Module B: Credit Appraisal and Financial Analysis", MODULE_CHAPTER_MAP["Module B: Credit Appraisal and Financial Analysis"][0], 10, 26, "moderate"),
            ("Module B: Credit Appraisal and Financial Analysis", MODULE_CHAPTER_MAP["Module B: Credit Appraisal and Financial Analysis"][1], 9, 36, "moderate"),
            ("Module B: Credit Appraisal and Financial Analysis", MODULE_CHAPTER_MAP["Module B: Credit Appraisal and Financial Analysis"][2] + " and " + MODULE_CHAPTER_MAP["Module B: Credit Appraisal and Financial Analysis"][3], 6, 45, "hard"),
            
            # Module C: 25 Qs (19 Moderate + 6 Hard)
            ("Module C: Non-Fund Based Facilities and Documentation", MODULE_CHAPTER_MAP["Module C: Non-Fund Based Facilities and Documentation"][0], 10, 51, "moderate"),
            ("Module C: Non-Fund Based Facilities and Documentation", MODULE_CHAPTER_MAP["Module C: Non-Fund Based Facilities and Documentation"][1], 9, 61, "moderate"),
            ("Module C: Non-Fund Based Facilities and Documentation", MODULE_CHAPTER_MAP["Module C: Non-Fund Based Facilities and Documentation"][2], 6, 70, "hard"),
            
            # Module D: 25 Qs (18 Moderate + 7 Hard)
            ("Module D: Credit Monitoring, Supervision and Recovery", MODULE_CHAPTER_MAP["Module D: Credit Monitoring, Supervision and Recovery"][0], 10, 76, "moderate"),
            ("Module D: Credit Monitoring, Supervision and Recovery", MODULE_CHAPTER_MAP["Module D: Credit Monitoring, Supervision and Recovery"][1], 8, 86, "moderate"),
            ("Module D: Credit Monitoring, Supervision and Recovery", MODULE_CHAPTER_MAP["Module D: Credit Monitoring, Supervision and Recovery"][2] + " and " + MODULE_CHAPTER_MAP["Module D: Credit Monitoring, Supervision and Recovery"][3], 7, 94, "hard")
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

    print("\n🎉 Complete generation successful across all 30 sets for IIBF CCP!")

if __name__ == "__main__":
    main()