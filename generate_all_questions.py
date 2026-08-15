import os
import time
import json
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List, Literal
from google import genai
from google.genai import types
from supabase import create_client, Client

# Load environment credentials
load_dotenv('.env.local')

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not SUPABASE_URL or not SUPABASE_KEY or not GEMINI_API_KEY:
    raise ValueError("Missing SUPABASE_URL, SUPABASE_ANON_KEY, or GEMINI_API_KEY in .env.local")

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

# Target Exam Matrix across all 6 certifications
EXAM_SYLLABUS_MATRIX = [
    # 1. DRA (Debt Recovery Agent)
    {"exam_type": "DRA", "module": "Module A: Regulatory & Legal Framework", "topic": "SARFAESI Act 2002 Sections 13(2), 13(4), DRT Act 1993, CERSAI", "difficulty": "hard", "count": 20},
    {"exam_type": "DRA", "module": "Module B: RBI Code of Conduct", "topic": "Permissible calling hours (08:00-19:00), privacy, anti-harassment rules", "difficulty": "easy", "count": 20},
    {"exam_type": "DRA", "module": "Module C: Recovery Process & Communication", "topic": "Negotiable Instruments Act Section 138, Lok Adalats, notice serving", "difficulty": "moderate", "count": 20},

    # 2. JAIIB (Junior Associate of IIBF)
    {"exam_type": "JAIIB_PPB", "module": "Principles & Practices of Banking", "topic": "Banker-Customer relations, Garnishee/Attachment orders, KYC/AML norms", "difficulty": "moderate", "count": 20},
    {"exam_type": "JAIIB_AFM", "module": "Accounting & Financial Management", "topic": "Prudence/Materiality concepts, YTM, Annuities, Working Capital Ratios", "difficulty": "hard", "count": 20},
    {"exam_type": "JAIIB_IEFS", "module": "Indian Economy & Financial System", "topic": "Monetary policy tools, CRR, SLR, Repo rate, Priority Sector Lending", "difficulty": "easy", "count": 20},
    {"exam_type": "JAIIB_RBWM", "module": "Retail Banking & Wealth Management", "topic": "Home loans, credit scoring, CIBIL, retail liability products", "difficulty": "moderate", "count": 20},

    # 3. CAIIB (Certified Associate of IIBF)
    {"exam_type": "CAIIB_ABM", "module": "Advanced Bank Management", "topic": "Economic indicators, HR management in banks, Credit risk modeling, Basel III", "difficulty": "hard", "count": 20},
    {"exam_type": "CAIIB_BFM", "module": "Bank Financial Management", "topic": "Forex treasury, L/C rules (UCPDC 600), VaR calculations, ALM liquidity gaps", "difficulty": "hard", "count": 20},
    {"exam_type": "CAIIB_BRBL", "module": "Banking Regulations & Business Laws", "topic": "BR Act 1949, RBI Act 1934, IBC 2016 CIRP timelines, SARFAESI amendments", "difficulty": "moderate", "count": 20},

    # 4. AML / KYC
    {"exam_type": "AML_KYC", "module": "Module A: Legal & International Framework", "topic": "PMLA 2002, FATF 40 Recommendations, FIU-IND reporting thresholds", "difficulty": "moderate", "count": 20},
    {"exam_type": "AML_KYC", "module": "Module B: Reporting & Red Flags", "topic": "Suspicious Transaction Reports (STR), Cash Transaction Reports (CTR > 10 Lakhs), PEP due diligence", "difficulty": "hard", "count": 20},
    {"exam_type": "AML_KYC", "module": "Module C: Customer Identification", "topic": "Officially Valid Documents (OVD), Video KYC, Periodic updation cycles", "difficulty": "easy", "count": 20},

    # 5. BC / BF (Business Correspondent)
    {"exam_type": "BCBF", "module": "Module A: Financial Inclusion & BC Model", "topic": "PMJDY overdraft rules, PMJJBY, PMSBY, APY features, Direct Benefit Transfer", "difficulty": "easy", "count": 20},
    {"exam_type": "BCBF", "module": "Module B: Technical Operations & Microfinance", "topic": "AePS transactions, Micro-ATMs, SHG-Bank linkage, JLG lending norms", "difficulty": "moderate", "count": 20},
    {"exam_type": "BCBF", "module": "Module C: Grievance Redressal & Customer Protection", "topic": "Banking Ombudsman scheme, customer handling, transparent pricing", "difficulty": "easy", "count": 20},

    # 6. CCP (Certified Credit Professional)
    {"exam_type": "CCP", "module": "Module A: Credit Appraisal & Financial Analysis", "topic": "CMA data analysis, DSCR, TOL/TNW, Working Capital turnover method", "difficulty": "hard", "count": 20},
    {"exam_type": "CCP", "module": "Module B: Loan Policy & Structured Finance", "topic": "Consortium vs Multiple banking, Syndication, Project finance NPV/IRR", "difficulty": "hard", "count": 20},
    {"exam_type": "CCP", "module": "Module C: Non-Performing Assets & Restructuring", "topic": "IRAC provisioning norms (SMA-0, SMA-1, SMA-2), Pre-packaged insolvency", "difficulty": "hard", "count": 20},
]

def generate_and_insert_batch(exam_type: str, module: str, topic: str, difficulty: str, count: int = 20):
    print(f"\n=======================================================")
    print(f"Generating {count} [{difficulty.upper()}] questions for {exam_type} - {module}")
    print(f"=======================================================")
    
    prompt = f"""
    You are an expert IIBF examiner and regulatory compliance authority in Indian Banking.
    Generate exactly {count} distinct, high-quality multiple-choice questions for:
    Exam: {exam_type}
    Module: {module}
    Core Topics: {topic}
    Difficulty Tier: {difficulty}

    Strict Criteria:
    - easy: Direct statutory definitions, time limits, legal sections, abbreviation expansions.
    - moderate: Procedural scenarios, compliance thresholds, basic banking calculations (EMIs, ratios, margins).
    - hard: Complex multi-variable case studies, conflicting borrower disputes, statutory exceptions (SARFAESI, DRT, NI Act, IBC, RBI Master Directions).
    - audio_script: A concise, conversational spoken question prompt (under 20 words) suitable for audio viva speech playback.
    - explanation: Explicitly cite the exact legal section, RBI Master Direction circular, or accounting standard.
    """

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
            print("No records extracted from AI response.")
            return

        supabase.table("questions").insert(records).execute()
        print(f"✓ Successfully pushed {len(records)} questions into Supabase.")

    except Exception as e:
        print(f"✗ Error generating batch: {e}")

if __name__ == "__main__":
    print("Starting Automated AI Banking Question Bank Generation...")
    for index, task in enumerate(EXAM_SYLLABUS_MATRIX, 1):
        print(f"\n[Task {index}/{len(EXAM_SYLLABUS_MATRIX)}]")
        generate_and_insert_batch(
            exam_type=task["exam_type"],
            module=task["module"],
            topic=task["topic"],
            difficulty=task["difficulty"],
            count=task["count"]
        )
        time.sleep(3)

    print("\n✓ Question bank generation cycle completed successfully!")