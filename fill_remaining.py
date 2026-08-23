import os
import json
import time
import random
import requests
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv('.env.local')

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not GEMINI_API_KEY or not SUPABASE_URL:
    print("❌ Missing environment keys in .env.local")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key={GEMINI_API_KEY}"
HEADERS = {"Content-Type": "application/json"}
EXAM_TRACK = "DRA"

MODULE_TOPICS = {
    "Module A: General Banking & Securities": [
        "Principles of good lending, safety, liquidity, margin requirements, working capital vs term loans",
        "Borrower legal status: Sole Proprietorship, HUF Karta liabilities, Partnership rights/dissolution, Companies, Trusts",
        "Creation of charges: Pledge, Bailment, Hypothecation deed, Equitable Mortgage vs Registered Mortgage, Banker Lien",
        "Banker-Customer Relationship, Right of Set-off, Banker's General Lien Sec 171 Contract Act, Clayton's Rule",
        "KYC Norms, Customer Due Diligence (CDD), Officially Valid Documents (OVD), AML red flags, PEP profiles",
        "Retail loan products: Home loans (LTV ratios), Vehicle loans, Personal loans, Credit cards default patterns"
    ],
    "Module B: Legal & Regulatory Framework": [
        "Contract of Guarantee (Sec 126), Surety liability co-extensive with principal debtor (Sec 128), Indemnity",
        "Limitation Act 1963: 3-year money claims, 12-year mortgage period, Sec 18 debt acknowledgement, Sec 19 payment",
        "RDB Act 1993: DRT pecuniary limit Rs 20 Lakhs, Sec 20 DRAT appeal 30-day window, mandatory 50% deposit, Recovery Officer",
        "SARFAESI Act 2002: Sec 13(2) 60-day notice, Sec 13(3A) 15-day representation, Sec 13(4) measures, Sec 14 DM/CMM order",
        "SARFAESI Sec 31 Exemptions: Agricultural land, debt under Rs 1 Lakh, balance < 20% principal; CERSAI 30-day registry",
        "Lok Adalats under LSA Act 1987 (Rs 20L ceiling), Permanent Lok Adalats, IBC 2016 Moratorium (Sec 14), CIRP process",
        "Sec 138 NI Act: Dishonour of cheques, 30-day notice period, 15-day payment window, 1-month filing deadline",
        "Sec 25 Payment and Settlement Systems Act: Electronic fund transfer / NACH / ECS mandate dishonour penalties"
    ],
    "Module C: Code of Conduct & Ethics": [
        "RBI Fair Practices Code: Calling hours strictly 08:00 to 19:00, Do-Not-Call registry, ban on harassment/intimidation",
        "IBA Model Code of Conduct: Notice before home visits, recording visits in daily register, displaying ID and auth letter",
        "Operational duties of DRA: Location verification, non-delegation of duties, mandatory official bank receipts",
        "Communication skills: Active listening, overcoming debt denial, de-escalation tactics, win-win settlement negotiation",
        "Borrower counseling: Distinguishing willful default from genuine hardship (illness, job loss), debt restructuring",
        "Ethics & Data Privacy: Non-disclosure to third parties/colleagues, preserving call recordings for minimum 6 months"
    ],
    "Module D: NBFCs, Digital Lending & Co-operatives": [
        "Scale Based Regulation (SBR) structure: Base, Middle, Upper, and Top Layers, NBFC-ND vs NBFC-D regulations",
        "SARFAESI powers for NBFCs: Minimum asset size Rs 100 Crore and minimum default claim of Rs 20 Lakhs",
        "RBI Digital Lending Guidelines (DLGs): Regulated Entities (RE), Lending Service Providers (LSP), direct account disbursal",
        "Digital Lending Controls: First Loss Default Guarantee (FLDG) 5% cap, cool-off/look-up period, prohibiting access to mobile data",
        "Recovery in Co-operative Banks: State Co-op Societies Act Sec 101 recovery certificates, Registrar awards, MSCS Act"
    ]
}

MODULE_KEYS = list(MODULE_TOPICS.keys())

def fetch_all_questions():
    all_rows = []
    page_size = 1000
    start = 0
    while True:
        res = supabase.table("questions").select("id, cbt_set_number, module, difficulty, question_text").eq("exam_type", EXAM_TRACK).range(start, start + page_size - 1).execute()
        batch = res.data or []
        all_rows.extend(batch)
        if len(batch) < page_size:
            break
        start += page_size
    return all_rows

def generate_batch(cbt_set: int, module_name: str, count: int):
    topics = MODULE_TOPICS.get(module_name, [])
    focus_topic = random.choice(topics) if topics else "statutory debt recovery regulations"
    seed = random.randint(10000, 999999)

    prompt = f"""
    You are an expert IIBF examination paper setter for the Debt Recovery Agent (DRA) certification.
    Generate exactly {count} DISTINCT multiple-choice questions for DRA Mock CBT Set #{cbt_set}.
    
    Target:
    - Module: {module_name}
    - Statutory Focus: {focus_topic}
    - Difficulty Tier: MODERATE
    - Seed: {seed}
    - Rule: Base questions on concrete statutory provisions, timelines, limitations, and RBI directives.

    Return ONLY a valid JSON array containing {count} question objects with keys:
    "exam_type", "module", "difficulty", "cbt_set_number", "question_text", "audio_script", "option_a", "option_b", "option_c", "option_d", "correct_option", "explanation"
    """

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.75, "responseMimeType": "application/json"}
    }

    for _ in range(3):
        try:
            res = requests.post(GEMINI_URL, headers=HEADERS, json=payload, timeout=45)
            if res.status_code == 200:
                raw = res.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
                if raw.startswith("```"):
                    lines = raw.splitlines()
                    if lines[0].startswith("```"): lines = lines[1:]
                    if lines and lines[-1].startswith("```"): lines = lines[:-1]
                    raw = "\n".join(lines).strip()
                data = json.loads(raw)
                if isinstance(data, dict):
                    data = [data]
                return data
            elif res.status_code in [429, 503]:
                time.sleep(12)
            time.sleep(2)
        except Exception:
            time.sleep(2)
    return []

def main():
    print("===================================================================")
    print(f"🎯 Target Top-Off: Filling Missing Questions to 3,000 [{EXAM_TRACK}]")
    print("===================================================================")

    questions = fetch_all_questions()
    total = len(questions)
    print(f"[*] Current Total in Database: {total}/3000")

    set_counts = {}
    for q in questions:
        s = q.get("cbt_set_number", 0)
        set_counts[s] = set_counts.get(s, 0) + 1

    for s_num in range(1, 31):
        count = set_counts.get(s_num, 0)
        missing = 100 - count
        
        if missing > 0:
            print(f"\n[*] CBT Set #{s_num:02d} has {count}/100 questions. Generating {missing} missing item(s)...")
            
            # Rotate modules across missing slots
            mod_idx = s_num % len(MODULE_KEYS)
            target_mod = MODULE_KEYS[mod_idx]
            
            new_qs = generate_batch(s_num, target_mod, missing)
            
            inserted = 0
            for item in new_qs:
                record = {
                    "exam_type": EXAM_TRACK,
                    "module": target_mod,
                    "difficulty": "moderate",
                    "cbt_set_number": s_num,
                    "question_text": str(item.get("question_text", "")).strip(),
                    "audio_script": str(item.get("audio_script", item.get("question_text", ""))).strip(),
                    "option_a": str(item.get("option_a", "")).strip(),
                    "option_b": str(item.get("option_b", "")).strip(),
                    "option_c": str(item.get("option_c", "")).strip(),
                    "option_d": str(item.get("option_d", "")).strip(),
                    "correct_option": str(item.get("correct_option", "A")).strip().upper()[:1],
                    "explanation": str(item.get("explanation", "")).strip()
                }
                
                if record["question_text"]:
                    try:
                        supabase.table("questions").insert(record).execute()
                        inserted += 1
                    except Exception as e:
                        print(f"    ❌ Insert failed: {e}")
            
            print(f"  ✅ Added {inserted}/{missing} questions to Set #{s_num:02d}")
            time.sleep(3)

    print("\n" + "=" * 65)
    print("🎉 All Sets Have Been Topped Off!")

if __name__ == "__main__":
    main()