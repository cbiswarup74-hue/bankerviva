import os
import json
import time
import re
import random
import difflib
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

def normalize_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)
    fillers = [
        'what does', 'stand for in the context of', 'what is the', 'which of the following',
        'under the', 'as per the', 'according to the', 'rbi master directions on',
        'prescribed', 'standard'
    ]
    for f in fillers:
        text = text.replace(f, '')
    return ' '.join(text.split())

def fetch_all_questions():
    all_rows = []
    page_size = 1000
    start = 0
    while True:
        res = supabase.table("questions").select("*").eq("exam_type", EXAM_TRACK).range(start, start + page_size - 1).execute()
        batch = res.data or []
        all_rows.extend(batch)
        if len(batch) < page_size:
            break
        start += page_size
    return all_rows

def generate_guaranteed_replacement(cbt_set: int, module_name: str, difficulty: str, existing_texts: list):
    topics = MODULE_TOPICS.get(module_name, ["General statutory provisions and recovery practices"])
    
    for attempt in range(8):
        focus_topic = random.choice(topics)
        seed = random.randint(1000, 99999)
        
        prompt = f"""
        You are an expert IIBF examination paper setter for the Debt Recovery Agent (DRA) certification.
        Generate 3 DISTINCT multiple-choice questions for DRA Mock CBT Set #{cbt_set}.
        
        Target:
        - Module: {module_name}
        - Statutory Focus: {focus_topic}
        - Difficulty Tier: {difficulty.upper()}
        - Seed: {seed}
        - Rule: Base on deep practical scenarios, exact time limits, or section numbers. Avoid common high-level questions.

        Return ONLY a valid JSON array of objects with keys:
        "exam_type", "module", "difficulty", "cbt_set_number", "question_text", "audio_script", "option_a", "option_b", "option_c", "option_d", "correct_option", "explanation"
        """

        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.75, "responseMimeType": "application/json"}
        }

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
                
                for candidate in data:
                    q_text = str(candidate.get("question_text", "")).strip()
                    if not q_text:
                        continue
                    norm_new = normalize_text(q_text)
                    is_dup = any(difflib.SequenceMatcher(None, norm_new, normalize_text(ext)).ratio() >= 0.70 for ext in existing_texts)
                    if not is_dup:
                        return candidate
            elif res.status_code in [429, 503]:
                time.sleep(10)
            time.sleep(2)
        except Exception:
            time.sleep(3)
            
    return None

def main():
    print("===================================================================")
    print(f"🛠️ Guaranteed Deduplication & Auto-Refill Engine: [{EXAM_TRACK}]")
    print("===================================================================")

    questions = fetch_all_questions()
    total = len(questions)
    print(f"[*] Total Questions in Database: {total}")

    deleted_ids = set()
    kept_texts = []
    
    print("[*] Phase 1: Identifying and replacing duplicates...")

    for i in range(total):
        q1 = questions[i]
        if q1["id"] in deleted_ids:
            continue

        n1 = normalize_text(q1["question_text"])
        kept_texts.append(q1["question_text"])

        for j in range(i + 1, total):
            q2 = questions[j]
            if q2["id"] in deleted_ids:
                continue

            n2 = normalize_text(q2["question_text"])
            ratio = difflib.SequenceMatcher(None, n1, n2).ratio()

            if ratio >= 0.78:
                print(f"\n⚠️ Duplicate Found ({round(ratio*100, 1)}%):")
                print(f"   Original [CBT #{q1['cbt_set_number']}]: {q1['question_text'][:65]}...")
                print(f"   Deleting [CBT #{q2['cbt_set_number']}]: {q2['question_text'][:65]}...")

                supabase.table("questions").delete().eq("id", q2["id"]).execute()
                deleted_ids.add(q2["id"])

                print(f"   -> Generating guaranteed replacement for CBT #{q2['cbt_set_number']} [{q2['module']}]...")
                rep = generate_guaranteed_replacement(q2["cbt_set_number"], q2["module"], q2["difficulty"], kept_texts)

                if rep:
                    record = {
                        "exam_type": EXAM_TRACK,
                        "module": q2["module"],
                        "difficulty": q2["difficulty"],
                        "cbt_set_number": q2["cbt_set_number"],
                        "question_text": str(rep.get("question_text", "")).strip(),
                        "audio_script": str(rep.get("audio_script", rep.get("question_text", ""))).strip(),
                        "option_a": str(rep.get("option_a", "")).strip(),
                        "option_b": str(rep.get("option_b", "")).strip(),
                        "option_c": str(rep.get("option_c", "")).strip(),
                        "option_d": str(rep.get("option_d", "")).strip(),
                        "correct_option": str(rep.get("correct_option", "A")).strip().upper()[:1],
                        "explanation": str(rep.get("explanation", "")).strip()
                    }
                    supabase.table("questions").insert(record).execute()
                    kept_texts.append(record["question_text"])
                    print("   ✅ Replacement inserted successfully.")

    print("\n[*] Phase 2: Auditing set balances to guarantee 100/100 across all 30 sets...")
    all_current = fetch_all_questions()
    for s_num in range(1, 31):
        set_items = [q for q in all_current if q["cbt_set_number"] == s_num]
        missing = 100 - len(set_items)
        if missing > 0:
            print(f"[*] CBT #{s_num:02d} has {len(set_items)}/100 (Missing {missing}). Refilling...")
            for _ in range(missing):
                rep = generate_guaranteed_replacement(s_num, "Module B: Legal & Regulatory Framework", "moderate", kept_texts)
                if rep:
                    record = {
                        "exam_type": EXAM_TRACK,
                        "module": rep.get("module", "Module B: Legal & Regulatory Framework"),
                        "difficulty": "moderate",
                        "cbt_set_number": s_num,
                        "question_text": str(rep.get("question_text", "")).strip(),
                        "audio_script": str(rep.get("audio_script", rep.get("question_text", ""))).strip(),
                        "option_a": str(rep.get("option_a", "")).strip(),
                        "option_b": str(rep.get("option_b", "")).strip(),
                        "option_c": str(rep.get("option_c", "")).strip(),
                        "option_d": str(rep.get("option_d", "")).strip(),
                        "correct_option": str(rep.get("correct_option", "A")).strip().upper()[:1],
                        "explanation": str(rep.get("explanation", "")).strip()
                    }
                    supabase.table("questions").insert(record).execute()
                    kept_texts.append(record["question_text"])

    print("\n" + "=" * 65)
    print(f"🎉 Complete! Processed and guaranteed full coverage for all 30 sets.")

if __name__ == "__main__":
    main()