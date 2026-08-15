import os
import time
import json
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List, Literal
from google import genai
from google.genai import types
from supabase import create_client, Client

load_dotenv('.env.local')

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not SUPABASE_URL or not SUPABASE_KEY or not GEMINI_API_KEY:
    raise ValueError("Missing credentials in .env.local")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
ai_client = genai.Client(api_key=GEMINI_API_KEY)

# Strict Question Schema
class SingleQuestion(BaseModel):
    exam_type: str
    module: str
    difficulty: Literal['easy', 'moderate', 'hard']
    question_text: str
    audio_script: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: Literal['A', 'B', 'C', 'D']
    explanation: str

class QuestionBatch(BaseModel):
    questions: List[SingleQuestion]

# Granular Syllabus Matrix across all 6 exams
EXAM_SYLLABUS_MATRIX = [
    # --- DRA ---
    {"exam_type": "DRA", "module": "Module A: Regulatory & Legal Framework", "topic": "SARFAESI Sections 13(2), 13(4), 14 Chief Met. Magistrate", "difficulty": "easy", "count": 10},
    {"exam_type": "DRA", "module": "Module A: Regulatory & Legal Framework", "topic": "DRT Act 1993, pecuniary jurisdiction of DRT/DRAT", "difficulty": "moderate", "count": 10},
    {"exam_type": "DRA", "module": "Module A: Regulatory & Legal Framework", "topic": "IBC vs SARFAESI moratorium conflict and NCLT overrides", "difficulty": "hard", "count": 10},
    {"exam_type": "DRA", "module": "Module B: Code of Conduct & Ethics", "topic": "Calling hours 08:00 to 19:00, harassment definitions, borrower privacy", "difficulty": "easy", "count": 10},
    {"exam_type": "DRA", "module": "Module B: Code of Conduct & Ethics", "topic": "Handling guarantor disputes, third-party disclosure violations", "difficulty": "moderate", "count": 10},
    {"exam_type": "DRA", "module": "Module C: Recovery Process", "topic": "Negotiable Instruments Act Sec 138 notice limits, Lok Adalat awards", "difficulty": "moderate", "count": 10},

    # --- JAIIB ---
    {"exam_type": "JAIIB_PPB", "module": "Module A: General Banking Operations", "topic": "KYC periodic updation, officially valid documents, Small Accounts", "difficulty": "easy", "count": 10},
    {"exam_type": "JAIIB_PPB", "module": "Module A: General Banking Operations", "topic": "Garnishee orders vs Attachment orders, Right of Set-off & Lien", "difficulty": "moderate", "count": 10},
    {"exam_type": "JAIIB_PPB", "module": "Module B: Lending & Securities", "topic": "Pledge, Hypothecation, Mortgage creation and Priority Sector targets", "difficulty": "hard", "count": 10},
    {"exam_type": "JAIIB_AFM", "module": "Module A: Accounting Fundamentals", "topic": "Accounting concepts: Prudence, Materiality, Realisation, Going Concern", "difficulty": "easy", "count": 10},
    {"exam_type": "JAIIB_AFM", "module": "Module B: Financial Mathematics", "topic": "Yield to Maturity (YTM), Net Present Value, Annuity calculations", "difficulty": "hard", "count": 10},
    {"exam_type": "JAIIB_IEFS", "module": "Indian Economy & Financial System", "topic": "CRR, SLR, Repo, Reverse Repo, MSF, Open Market Operations", "difficulty": "easy", "count": 10},
    {"exam_type": "JAIIB_RBWM", "module": "Retail Banking & Wealth Management", "topic": "CIBIL scoring bands, housing loan LTV ratios, reverse mortgage", "difficulty": "moderate", "count": 10},

    # --- CAIIB ---
    {"exam_type": "CAIIB_ABM", "module": "Module A: Economic Analysis & Statistics", "topic": "GDP deflator, Time Series Forecasting, Probability distributions", "difficulty": "moderate", "count": 10},
    {"exam_type": "CAIIB_ABM", "module": "Module B: Credit Risk Management", "topic": "Credit rating migration, Altman Z-score, Basel III Capital Adequacy (CRAR)", "difficulty": "hard", "count": 10},
    {"exam_type": "CAIIB_BFM", "module": "Module A: Forex Treasury & International Banking", "topic": "FEDAI rules, Nostro/Vostro/Loro accounts, UCPDC 600 Letter of Credit rules", "difficulty": "hard", "count": 10},
    {"exam_type": "CAIIB_BRBL", "module": "Banking Regulations & Business Laws", "topic": "Banking Regulation Act 1949 Sec 21, 35A, 45, and RBI Act 1934 powers", "difficulty": "moderate", "count": 10},

    # --- AML / KYC ---
    {"exam_type": "AML_KYC", "module": "Module A: Legal & Compliance Framework", "topic": "PMLA 2002 provisions, FATF 40 Recommendations, FIU-IND reporting", "difficulty": "easy", "count": 10},
    {"exam_type": "AML_KYC", "module": "Module B: Cash & Suspicious Reporting", "topic": "Cash Transaction Reports (CTR), Suspicious Transaction Reports (STR), PEP screening", "difficulty": "hard", "count": 10},

    # --- BC / BF ---
    {"exam_type": "BCBF", "module": "Module A: Financial Inclusion & BC Model", "topic": "PMJDY overdraft eligibility, PMJJBY, PMSBY, APY rules", "difficulty": "easy", "count": 10},
    {"exam_type": "BCBF", "module": "Module B: BC Technology & Operations", "topic": "AePS biometric authentication, Micro-ATM rules, SHG-Bank linkage", "difficulty": "moderate", "count": 10},

    # --- CCP ---
    {"exam_type": "CCP", "module": "Module A: Credit Appraisal & Analysis", "topic": "CMA Data analysis, DSCR calculation, Current Ratio, TOL/TNW", "difficulty": "hard", "count": 10},
    {"exam_type": "CCP", "module": "Module B: NPA Management & Insolvency", "topic": "IRAC provisioning norms (Substandard, Doubtful, Loss), SMA-0, SMA-1, SMA-2", "difficulty": "hard", "count": 10},
]

def generate_and_insert_batch(exam_type: str, module: str, topic: str, difficulty: str, count: int = 10, max_retries: int = 3):
    print(f"\n=======================================================")
    print(f"[{exam_type}] {module} | Tier: {difficulty.upper()} ({count} Qs)")
    print(f"=======================================================")

    prompt = f"""
    You are an expert IIBF examiner and regulatory authority in Indian Banking.
    Generate {count} distinct, completely non-repetitive multiple-choice questions for:
    Exam: {exam_type}
    Module: {module}
    Topic: {topic}
    Difficulty Tier: {difficulty}

    Rules:
    - easy: Direct statutory definitions, time limits, legal sections, abbreviation expansions.
    - moderate: Procedural steps, compliance percentages, basic financial ratios/EMIs.
    - hard: Scenario-based dispute cases, conflicting borrower claims, legal exceptions.
    - audio_script: Conversational spoken viva prompt under 18 words.
    - explanation: Explicitly cite the statutory Act, section number, or RBI circular.
    """

    for attempt in range(1, max_retries + 1):
        try:
            response = ai_client.models.generate_content(
                model='gemini-3.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=QuestionBatch,
                    temperature=0.2,
                ),
            )

            batch_data = json.loads(response.text)
            records = batch_data.get("questions", [])

            if not records:
                print("  ! Empty batch returned. Retrying...")
                time.sleep(3)
                continue

            # Upsert into Supabase (skips duplicates on unique question_text)
            supabase.table("questions").upsert(records, on_conflict="question_text").execute()
            print(f"  ✓ Successfully pushed {len(records)} questions into Supabase.")
            return

        except Exception as e:
            print(f"  ! Attempt {attempt}/{max_retries} error: {e}")
            if attempt < max_retries:
                time.sleep(10)
            else:
                print("  ✗ Batch failed after max retries.")

if __name__ == "__main__":
    print("Starting clean question bank ingestion using gemini-3.5-flash...")
    for idx, task in enumerate(EXAM_SYLLABUS_MATRIX, 1):
        print(f"\nProgress: [{idx}/{len(EXAM_SYLLABUS_MATRIX)}]")
        generate_and_insert_batch(
            exam_type=task["exam_type"],
            module=task["module"],
            topic=task["topic"],
            difficulty=task["difficulty"],
            count=task["count"]
        )
        time.sleep(12)

    print("\n✓ Question bank ingestion completed successfully!")