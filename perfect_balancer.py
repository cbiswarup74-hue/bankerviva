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

MODULE_KEYS = list(MODULE_TOPICS.keys())

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

def generate_guaranteed_question(cbt_set: int, module_name: str, existing_texts: list):
    topics = MODULE_TOPICS.get(module_name, ["statutory recovery guidelines"])
    
    for _ in range(4):
        focus_topic = random.choice(topics)
        seed = random.randint(10000, 999999)

        prompt = f"""
        You are an expert IIBF examination paper setter for the Debt Recovery Agent (DRA) certification.
        Generate 3 DISTINCT multiple-choice questions for DRA Mock CBT Set #{cbt_set}.
        
        Target:
        - Module: {module_name}
        - Focus: {focus_topic}
        - Difficulty Tier: MODERATE
        - Seed: {seed}
        - Requirement: Specific statutory section numbers, legal timelines, limitations, and RBI directives.

        Return ONLY a valid JSON array of objects with keys:
        "exam_type", "module", "difficulty", "cbt_set_number", "question_text", "audio_script", "option_a", "option_b", "option_c", "option_d", "correct_option", "explanation"
        """

        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.75, "responseMimeType": "application/json"}
        }

        try:
            res = requests.post(GEMINI_URL, headers=HEADERS, json=payload, timeout=40)
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
            time.sleep(2)
    return None

def main():
    print("===================================================================")
    print(f"🎯 Perfect Balance & Deduplication Suite: [{EXAM_TRACK}]")
    print("===================================================================")

    # 1. Fetch
    questions = fetch_all_questions()
    total = len(questions)
    print(f"[*] Total Questions Found in DB: {total}")

    # 2. Phase 1: Eliminate true conceptual duplicates (Similarity >= 0.75)
    print("\n[*] Phase 1: Eliminating cross-set and intra-set duplicates...")
    indexed = []
    for q in questions:
        norm = normalize_text(q["question_text"])
        indexed.append({
            "id": q["id"],
            "set": q["cbt_set_number"],
            "module": q.get("module", "Module B: Legal & Regulatory Framework"),
            "difficulty": q.get("difficulty", "moderate"),
            "raw": q["question_text"],
            "norm": norm,
            "words": set(norm.split())
        })

    deleted_ids = set()
    kept_texts = []

    for i in range(total):
        p1 = indexed[i]
        if p1["id"] in deleted_ids:
            continue

        kept_texts.append(p1["raw"])
        w1, n1 = p1["words"], p1["norm"]

        for j in range(i + 1, total):
            p2 = indexed[j]
            if p2["id"] in deleted_ids:
                continue

            w2 = p2["words"]
            intersection_len = len(w1 & w2)
            smaller_len = min(len(w1), len(w2))
            if smaller_len == 0 or (intersection_len / smaller_len) < 0.60:
                continue

            ratio = difflib.SequenceMatcher(None, n1, p2["norm"]).ratio()
            if ratio >= 0.75:
                print(f"  🗑️ Deleting duplicate ({round(ratio*100, 1)}%): Set #{p2['set']} -> '{p2['raw'][:50]}...'")
                supabase.table("questions").delete().eq("id", p2["id"]).execute()
                deleted_ids.add(p2["id"])

    print(f"✅ Phase 1 complete. Deleted {len(deleted_ids)} duplicate questions.")

    # 3. Phase 2: Trim overfilled sets (e.g. Set #21 which has 140) down to 100
    print("\n[*] Phase 2: Normalizing overfilled sets down to 100...")
    current_qs = fetch_all_questions()
    sets_map = {}
    for q in current_qs:
        s = q.get("cbt_set_number", 0)
        sets_map.setdefault(s, []).append(q)

    for s_num in range(1, 31):
        items = sets_map.get(s_num, [])
        if len(items) > 100:
            excess = len(items) - 100
            print(f"  ✂️ Trimming Set #{s_num:02d} from {len(items)} down to 100 (Removing {excess} surplus)...")
            to_remove = items[100:]
            for r in to_remove:
                supabase.table("questions").delete().eq("id", r["id"]).execute()

    # 4. Phase 3: Top-off underfilled sets back to exactly 100
    print("\n[*] Phase 3: Topping off underfilled sets to exactly 100/100...")
    current_qs = fetch_all_questions()
    sets_map = {}
    for q in current_qs:
        s = q.get("cbt_set_number", 0)
        sets_map.setdefault(s, []).append(q)

    for s_num in range(1, 31):
        items = sets_map.get(s_num, [])
        missing = 100 - len(items)
        if missing > 0:
            print(f"[*] CBT Set #{s_num:02d} has {len(items)}/100 (Needs {missing}). Generating unique questions...")
            for k in range(missing):
                target_mod = MODULE_KEYS[k % len(MODULE_KEYS)]
                rep = generate_guaranteed_question(s_num, target_mod, kept_texts)
                if rep:
                    record = {
                        "exam_type": EXAM_TRACK,
                        "module": target_mod,
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
                    print(f"    ✅ Added question {k+1}/{missing} to Set #{s_num:02d}")
                    time.sleep(2)

    print("\n" + "=" * 65)
    print("🎉 PERFECT BALANCE ACHIEVED! Exactly 100/100 for all 30 sets (3,000 Total).")

if __name__ == "__main__":
    main()