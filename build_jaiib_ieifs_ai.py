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
EXAM_TRACK = "JAIIB_IEIFS"

MODULE_CHAPTER_MAP = {
    "Module A: Indian Economic Architecture": [
        "Evolution of Indian Economy, GDP structural shifts & 1991 reforms",
        "Economic Planning history, NITI Aayog Governing Council & Strategy Agenda",
        "Primary Sector: Agricultural credit, PSL targets, Kisan Credit Card & PMFBY",
        "Secondary Sector: MSME Development Act 2006, 2020 composite criteria & PLI schemes",
        "Tertiary Sector: Services contribution to GVA, IT, logistics & sunrise sectors",
        "Infrastructure Financing, NIP, National Monetisation Pipeline (NMP) & NaBFID",
        "Foreign Trade Policy, current account deficit, BoP & LERMS dual exchange rate",
        "International Economic Organisations: IMF SDR valuation basket, World Bank, WTO, ADB",
        "Climate Change, ESG metrics, Sovereign Green Bonds framework & COP targets",
        "Sustainable Development Goals (SDGs), NITI Aayog SDG India Index"
    ],
    "Module B: Economic Concepts Related to Banking": [
        "Fundamentals of Demand & Supply, Price/Income/Cross Elasticity of Demand",
        "Money Supply Aggregates (M0, M1, M2, M3, M4) & Money Multiplier mechanics",
        "Theories of Interest: Classical, Neo-Classical, Keynesian Liquidity Preference & IS-LM synthesis",
        "Business Cycles: Four phases, Leading/Lagging/Coincident economic indicators",
        "Monetary Policy Operating Framework: Repo, Reverse Repo, SDF, MSF, CRR, SLR",
        "Monetary Policy Committee (MPC) constitution, statutory voting & CPI nominal anchor",
        "Fiscal Policy, Union Budget components, FRBM Act targets & primary vs fiscal deficit",
        "National Income Accounting: GDP, GNP, NNP at Factor Cost vs Market Price, GVA deflator",
        "Inflation indices: CPI-Combined weighting breakdown vs WPI series & core inflation"
    ],
    "Module C: Indian Financial Architecture": [
        "Indian Banking Structure: Commercial, Small Finance Banks, Payments Banks & RRBs",
        "Statutory powers of RBI under RBI Act 1934 & Banking Regulation Act 1949 (Sec 10BB, 35A, 36)",
        "Scale Based Regulation (SBR) of NBFCs: Base, Middle, Upper, and Top layer criteria",
        "Development Financial Institutions (DFIs): Historical DFIs vs newly statutory NaBFID",
        "Microfinance Institutions (MFIs): RBI Harmonised Microfinance Directions (income caps & margins)",
        "Deposit Insurance & Credit Guarantee Corporation (DICGC Act): Coverage limits & claim settlement",
        "Integrated Ombudsman Scheme 2021: One Nation One Ombudsman, jurisdiction & appellate rules",
        "Insurance Regulatory & Development Authority (IRDAI) regulations & Bancassurance norms",
        "PFRDA regulations, National Pension System (NPS) architecture & Atal Pension Yojana"
    ],
    "Module D: Financial Products and Services": [
        "Money Market: Call/Notice Money, Commercial Paper guidelines, Certificate of Deposit",
        "Treasury Bills: 91D, 182D, 364D auction dynamics, cut-off yield & discount calculation",
        "Government Securities (G-Secs): SDLs, Sovereign Gold Bonds, STRIPS, NDS-OM platform",
        "Bond Theorems, Yield to Maturity (YTM), Duration, Modified Duration & Convexity",
        "Foreign Exchange Markets: FEMA 1999 Sec 10, FEDAI guidelines, Nostro/Vostro/Loro accounts",
        "Derivatives: Rupee Interest Rate Swaps (OIS), Forward Rate Agreements & Currency Futures",
        "Factoring, Forfaiting, Trade Receivables Discounting System (TReDS) mechanics",
        "Alternative Investment Funds (AIF Category I, II, III), REITs and InvITs regulatory norms"
    ]
}

def generate_question_batch(cbt_set, module_name, sub_topics_str, count, start_q_num, difficulty, max_retries=3):
    prompt = f"""
You are the Chief Examiner for the Indian Institute of Banking & Finance (IIBF) creating authentic exam questions for JAIIB Paper 1: Indian Economy & Indian Financial System.

Generate exactly {count} strictly unique, diverse multiple choice questions.
Target Module: "{module_name}"
Key Sub-Topics: {sub_topics_str}
Difficulty Tier: "{difficulty}" (If hard: include calculations, multi-statement evaluations, or analytical scenarios).

Return strictly a raw JSON array of {count} objects:
[
  {{
    "question_text": "Scenario-based question stem",
    "option_a": "Option A text",
    "option_b": "Option B text",
    "option_c": "Option C text",
    "option_d": "Option D text",
    "correct_option": "A",
    "explanation": "Statutory/conceptual explanation citing relevant acts or arithmetic steps."
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
                unique_stem = f"[IEIFS-CBT{cbt_set:02d}-Q{q_num:03d}] {item['question_text']}"
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
                wait_time = 20 * attempt
                print(f"    ⏳ Rate limit encountered. Sleeping {wait_time}s before retry {attempt}/{max_retries}...")
                time.sleep(wait_time)
            else:
                print(f"    ⚠️ Retry {attempt}/{max_retries} due to: {e}")
                time.sleep(3)
    return []

def main():
    print("==========================================================================")
    print(f"🚀 IIBF Authentic Question Generator ({MODEL_NAME})")
    print("==========================================================================")

    for s in range(1, 11):
        print(f"\n📘 [Processing Set #{s:02d}/10]...")
        set_records = []
        
        plan = [
            ("Module A: Indian Economic Architecture", MODULE_CHAPTER_MAP["Module A: Indian Economic Architecture"], 20, 1),
            ("Module B: Economic Concepts Related to Banking", MODULE_CHAPTER_MAP["Module B: Economic Concepts Related to Banking"], 30, 21),
            ("Module C: Indian Financial Architecture", MODULE_CHAPTER_MAP["Module C: Indian Financial Architecture"], 30, 51),
            ("Module D: Financial Products and Services", MODULE_CHAPTER_MAP["Module D: Financial Products and Services"], 20, 81)
        ]
        
        for mod_title, topics, total_mod_qs, start_idx in plan:
            batch_size = 10
            num_batches = total_mod_qs // batch_size
            for b in range(num_batches):
                topic_slice = ", ".join(topics[b*2 : (b*2)+2])
                curr_q_num = start_idx + (b * batch_size)
                diff = "hard" if curr_q_num >= 76 else "moderate"
                
                print(f"  • Generating Set #{s:02d} | Q{curr_q_num:03d}-Q{curr_q_num+batch_size-1:03d}...")
                res = generate_question_batch(s, mod_title, topic_slice, batch_size, curr_q_num, diff)
                set_records.extend(res)
                time.sleep(2)

        if set_records:
            for i in range(0, len(set_records), 50):
                chunk = set_records[i:i+50]
                supabase.table("questions").insert(chunk).execute()
            print(f"  ✅ [Set #{s:02d}] Finished & inserted {len(set_records)} Qs!")

    print("\n🎉 High-fidelity generation complete across all 10 sets!")

if __name__ == "__main__":
    main()