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

DEEP_TOPIC_REGISTRY = {
    "Module A: General Banking & Securities": [
        "Banker lien exceptions: safe custody deposits, specific purpose remittances, documents left inadvertently",
        "Right of set-off prerequisites: mutuality of debts, debt due and payable, notice requirements",
        "Partnership firm liability: implied authority of partners, retirement/insolvency, registration under Partnership Act 1932 Sec 69",
        "HUF partition impact on coparceners vs Karta personal liability and burden of legal necessity proof",
        "Pledge vs Hypothecation vs Mortgage: legal remedies on default under Indian Contract Act Sec 176 vs SARFAESI",
        "LTV limits by RBI: residential loans up to 30L (90%), 30L-75L (80%), above 75L (75%) and risk-weight assignments",
        "Officially Valid Documents (OVD) exceptions: deemed OVD 3-month submission rule for updated address proof"
    ],
    "Module B: Legal & Regulatory Framework": [
        "Contract Act Sec 133 to 139: Discharge of surety by variance in terms, release of principal debtor, impairment of remedy",
        "Limitation Act Sec 18 & 19: Validity of acknowledgement before limitation expiration, part-payment by authorized agent",
        "RDB Act Sec 19: Filing of original application, summons response 30 days, interim orders, recovery certificate execution",
        "SARFAESI Sec 13(8): Redemption of secured asset before publication of auction notice under amended 2016 rules",
        "SARFAESI Sec 14: DM/CMM affidavit compliance 9-point declaration and 30+30 days possession assistance deadline",
        "Lok Adalat awards under Legal Services Authorities Act Sec 21: Finality, non-appealability, refund of court fees",
        "NI Act Sec 138/141: Vicarious liability of company directors, statutory compounding of cheque bounce offenses",
        "IBC Sec 14 Moratorium: Scope of suspension of recovery actions against corporate debtor vs personal guarantor"
    ],
    "Module C: Code of Conduct & Ethics": [
        "RBI Fair Practices Code: Prohibition of anonymous calls, misleading representations, or visiting unnotified workplaces",
        "IBA Model Code: Specific requirements for DRA identity badge, bank authorization letter, and visit log confirmation",
        "Data privacy guidelines: Handling borrower financial profile, non-disclosure to relatives/employers under Digital Personal Data Protection principles",
        "Borrower dispute escalation: DRA obligation to report customer grievances within 24 hours to bank nodal officer",
        "Settlement protocols: Strict prohibition of cash collection without official instant receipt, bank approval for OTS compromises"
    ],
    "Module D: NBFCs, Digital Lending & Co-operatives": [
        "RBI Scale Based Regulation (SBR): Base Layer vs Middle Layer capital adequacy (CRAR 15%) and regulatory ceilings",
        "Digital Lending: Key Fact Statement (KFS) format, APR calculation transparency, and explicit cooling-off window",
        "First Loss Default Guarantee (FLDG): 5% cap compliance, escrow arrangements, and continuous credit underwriting by RE",
        "Recovery in Multi-State Co-operatives: MSCS Act 2002 Sec 84 arbitration, execution of decrees by Civil Court/Collector"
    ]
}

MODULE_KEYS = list(DEEP_TOPIC_REGISTRY.keys())

def normalize_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)
    fillers = [
        'what does', 'stand for in the context of', 'what is the', 'which of the following',
        'under the', 'as per the', 'according to the', 'rbi master directions on',
        'prescribed', 'standard', 'who among the following', 'in the context of'
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
    topics = DEEP_TOPIC_REGISTRY.get(module_name, ["Specialized statutory debt recovery procedures"])
    for _ in range(5):
        focus_topic = random.choice(topics)
        seed = random.randint(100000, 9999999)
        prompt = f"""
        You are an expert IIBF examination paper setter for the Debt Recovery Agent (DRA) certification.
        Generate 2 HIGHLY DISTINCT multiple-choice questions for DRA Mock CBT Set #{cbt_set}.
        
        Focus: {focus_topic}
        Module: {module_name}
        Seed: {seed}
        Rule: Use granular statutory timelines, section numbers, or scenario cases. Never output generic or definition-only questions.

        Return ONLY a JSON array with keys:
        "exam_type", "module", "difficulty", "cbt_set_number", "question_text", "audio_script", "option_a", "option_b", "option_c", "option_d", "correct_option", "explanation"
        """
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.85, "responseMimeType": "application/json"}
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
                if isinstance(data, dict): data = [data]
                for candidate in data:
                    q_text = str(candidate.get("question_text", "")).strip()
                    if not q_text: continue
                    norm_new = normalize_text(q_text)
                    is_dup = any(difflib.SequenceMatcher(None, norm_new, normalize_text(ext)).ratio() >= 0.68 for ext in existing_texts)
                    if not is_dup:
                        return candidate
            elif res.status_code in [429, 503]:
                time.sleep(12)
            time.sleep(2)
        except Exception:
            time.sleep(2)
    return None

def main():
    print("===================================================================")
    print(f"🔒 Hard-Deduplication & Lock Engine: [{EXAM_TRACK}]")
    print("===================================================================")

    pass_number = 1
    while True:
        questions = fetch_all_questions()
        total = len(questions)
        print(f"\n[*] --- Pass #{pass_number} | Questions in Database: {total} ---")

        indexed = []
        for q in questions:
            norm = normalize_text(q["question_text"])
            indexed.append({
                "id": q["id"],
                "set": q["cbt_set_number"],
                "module": q.get("module", "Module B: Legal & Regulatory Framework"),
                "raw": q["question_text"],
                "norm": norm,
                "words": set(norm.split())
            })

        deleted_ids = set()
        kept_texts = []

        for i in range(total):
            p1 = indexed[i]
            if p1["id"] in deleted_ids: continue
            kept_texts.append(p1["raw"])
            w1, n1 = p1["words"], p1["norm"]

            for j in range(i + 1, total):
                p2 = indexed[j]
                if p2["id"] in deleted_ids: continue

                w2 = p2["words"]
                intersection_len = len(w1 & w2)
                smaller_len = min(len(w1), len(w2))
                if smaller_len == 0 or (intersection_len / smaller_len) < 0.50:
                    continue

                # Stricter 68% threshold catches all twisted statutory concepts
                ratio = difflib.SequenceMatcher(None, n1, p2["norm"]).ratio()
                if ratio >= 0.68:
                    print(f"  🗑️ Deleted duplicate ({round(ratio*100, 1)}%): Set #{p2['set']} -> '{p2['raw'][:60]}...'")
                    supabase.table("questions").delete().eq("id", p2["id"]).execute()
                    deleted_ids.add(p2["id"])

        print(f"[*] Pass #{pass_number} deleted {len(deleted_ids)} duplicates.")

        # Phase 2: Trim overfilled sets
        current_qs = fetch_all_questions()
        sets_map = {}
        for q in current_qs:
            s = q.get("cbt_set_number", 0)
            sets_map.setdefault(s, []).append(q)

        for s_num in range(1, 31):
            items = sets_map.get(s_num, [])
            if len(items) > 100:
                excess = len(items) - 100
                print(f"  ✂️ Trimming Set #{s_num:02d} by {excess} excess items...")
                for r in items[100:]:
                    supabase.table("questions").delete().eq("id", r["id"]).execute()

        # Phase 3: Fill underfilled sets
        current_qs = fetch_all_questions()
        sets_map = {}
        for q in current_qs:
            s = q.get("cbt_set_number", 0)
            sets_map.setdefault(s, []).append(q)

        total_missing = 0
        for s_num in range(1, 31):
            items = sets_map.get(s_num, [])
            missing = 100 - len(items)
            if missing > 0:
                total_missing += missing
                print(f"[*] Set #{s_num:02d} has {len(items)}/100. Adding {missing} distinct question(s)...")
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
                        time.sleep(2)

        # Stop when no duplicates were found and no sets needed refilling
        if len(deleted_ids) == 0 and total_missing == 0:
            break
        pass_number += 1

    print("\n" + "=" * 65)
    print("🎉 ALL 30 CBT SETS CONFIRMED UNIQUE & LOCKED AT EXACTLY 100/100 (3,000 TOTAL)!")

if __name__ == "__main__":
    main()