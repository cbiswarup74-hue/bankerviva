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
    print("❌ Missing GEMINI_API_KEY or SUPABASE_URL in .env.local")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Active Gemini 3.5 Flash-Lite Endpoint
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key={GEMINI_API_KEY}"
HEADERS = {"Content-Type": "application/json"}

EXAM_TRACK = "DRA"
TOTAL_SETS = 30

MODULE_BLUEPRINT = [
    {
        "module": "Module A: General Banking & Securities",
        "quota": {"easy": 9, "moderate": 11, "hard": 5},
        "topics": [
            "Principles of good lending, safety, liquidity, margin requirements, working capital vs term loans",
            "Borrower legal status: Sole Proprietorship, HUF Karta liabilities, Partnership rights/dissolution, Companies, Trusts",
            "Creation of charges: Pledge, Bailment, Hypothecation deed, Equitable Mortgage vs Registered Mortgage, Banker Lien",
            "Banker-Customer Relationship, Right of Set-off, Banker's General Lien Sec 171 Contract Act, Clayton's Rule",
            "KYC Norms, Customer Due Diligence (CDD), Officially Valid Documents (OVD), AML red flags, PEP profiles",
            "Retail loan products: Home loans (LTV ratios), Vehicle loans, Personal loans, Credit cards default patterns"
        ]
    },
    {
        "module": "Module B: Legal & Regulatory Framework",
        "quota": {"easy": 12, "moderate": 16, "hard": 7},
        "topics": [
            "Contract of Guarantee (Sec 126), Surety liability co-extensive with principal debtor (Sec 128), Indemnity",
            "Limitation Act 1963: 3-year money claims, 12-year mortgage period, Sec 18 debt acknowledgement, Sec 19 payment",
            "RDB Act 1993: DRT pecuniary limit Rs 20 Lakhs, Sec 20 DRAT appeal 30-day window, mandatory 50% deposit, Recovery Officer",
            "SARFAESI Act 2002: Sec 13(2) 60-day notice, Sec 13(3A) 15-day representation, Sec 13(4) measures, Sec 14 DM/CMM order",
            "SARFAESI Sec 31 Exemptions: Agricultural land, debt under Rs 1 Lakh, balance < 20% principal; CERSAI 30-day registry",
            "Lok Adalats under LSA Act 1987 (Rs 20L ceiling), Permanent Lok Adalats, IBC 2016 Moratorium (Sec 14), CIRP process",
            "Sec 138 NI Act: Dishonour of cheques, 30-day notice period, 15-day payment window, 1-month filing deadline",
            "Sec 25 Payment and Settlement Systems Act: Electronic fund transfer / NACH / ECS mandate dishonour penalties"
        ]
    },
    {
        "module": "Module C: Code of Conduct & Ethics",
        "quota": {"easy": 7, "moderate": 9, "hard": 4},
        "topics": [
            "RBI Fair Practices Code: Calling hours strictly 08:00 to 19:00, Do-Not-Call registry, ban on harassment/intimidation",
            "IBA Model Code of Conduct: Notice before home visits, recording visits in daily register, displaying ID and auth letter",
            "Operational duties of DRA: Location verification, non-delegation of duties, mandatory official bank receipts",
            "Communication skills: Active listening, overcoming debt denial, de-escalation tactics, win-win settlement negotiation",
            "Borrower counseling: Distinguishing willful default from genuine hardship (illness, job loss), debt restructuring",
            "Ethics & Data Privacy: Non-disclosure to third parties/colleagues, preserving call recordings for minimum 6 months"
        ]
    },
    {
        "module": "Module D: NBFCs, Digital Lending & Co-operatives",
        "quota": {"easy": 7, "moderate": 9, "hard": 4},
        "topics": [
            "Scale Based Regulation (SBR) structure: Base, Middle, Upper, and Top Layers, NBFC-ND vs NBFC-D regulations",
            "SARFAESI powers for NBFCs: Minimum asset size Rs 100 Crore and minimum default claim of Rs 20 Lakhs",
            "RBI Digital Lending Guidelines (DLGs): Regulated Entities (RE), Lending Service Providers (LSP), direct account disbursal",
            "Digital Lending Controls: First Loss Default Guarantee (FLDG) 5% cap, cool-off/look-up period, prohibiting access to mobile data",
            "Recovery in Co-operative Banks: State Co-op Societies Act Sec 101 recovery certificates, Registrar awards, MSCS Act"
        ]
    }
]

def normalize_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)
    fillers = ['according to', 'under the', 'rbi master directions', 'as per', 'on fair practices code', 'what are the', 'which of the following']
    for f in fillers:
        text = text.replace(f, '')
    return ' '.join(text.split())

def is_duplicate_prompt(new_q: str, existing_list: list, threshold: float = 0.72) -> bool:
    norm_new = normalize_text(new_q)
    for ext in existing_list:
        norm_ext = normalize_text(ext)
        if difflib.SequenceMatcher(None, norm_new, norm_ext).ratio() >= threshold:
            return True
    return False

def get_existing_questions(cbt_set: int, module_name: str, difficulty: str):
    try:
        res = supabase.table("questions").select("id, question_text").eq("exam_type", EXAM_TRACK).eq("cbt_set_number", cbt_set).eq("module", module_name).eq("difficulty", difficulty).execute()
        return res.data or []
    except Exception:
        return []

def get_all_track_questions():
    try:
        res = supabase.table("questions").select("question_text").eq("exam_type", EXAM_TRACK).execute()
        return [r["question_text"] for r in (res.data or [])]
    except Exception:
        return []

def generate_questions(cbt_set: int, module_name: str, topics_list: list, difficulty: str, count: int, attempt_seed: int):
    # Pick a random sub-topic to ensure diverse prompts
    focus_topic = random.choice(topics_list)

    system_instruction = (
        "You are an expert IIBF examination paper setter for the Debt Recovery Agent (DRA) certification. "
        "Output ONLY a raw, valid JSON array containing question objects with exact keys: "
        "exam_type, module, difficulty, cbt_set_number, question_text, audio_script, option_a, option_b, option_c, option_d, correct_option, explanation."
    )

    user_prompt = f"""
    Generate {count} DISTINCT multiple-choice questions for DRA Mock CBT Set #{cbt_set}:
    - Module: {module_name}
    - Specific Sub-Topic Focus: {focus_topic}
    - Difficulty Tier: {difficulty.upper()}
    - Random Variation Seed: {attempt_seed}

    Rules:
    1. Base questions strictly on specific statutory section numbers, legal timelines, limitations, and RBI regulatory directives. Avoid generic default phrasing.
    2. Provide 4 distinct answer choices (option_a, option_b, option_c, option_d).
    3. Output uppercase single-letter correct_option ('A', 'B', 'C', or 'D').
    4. Set "cbt_set_number" to {cbt_set}, "exam_type" to "{EXAM_TRACK}", "module" to "{module_name}", and "difficulty" to "{difficulty}".
    """

    payload = {
        "contents": [{"parts": [{"text": system_instruction + "\n\n" + user_prompt}]}],
        "generationConfig": {
            "temperature": 0.70,
            "responseMimeType": "application/json"
        }
    }

    for retry in range(4):
        try:
            response = requests.post(GEMINI_URL, headers=HEADERS, json=payload, timeout=60)
            if response.status_code == 200:
                raw_text = response.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
                if raw_text.startswith("```"):
                    lines = raw_text.splitlines()
                    if lines[0].startswith("```"): lines = lines[1:]
                    if lines and lines[-1].startswith("```"): lines = lines[:-1]
                    raw_text = "\n".join(lines).strip()
                return json.loads(raw_text)
            elif response.status_code in [429, 503]:
                wait = 15 * (retry + 1)
                print(f"  [!] Endpoint busy ({response.status_code}). Pausing {wait}s...")
                time.sleep(wait)
            else:
                time.sleep(4)
        except Exception:
            time.sleep(4)
    return []

def main():
    print("===================================================================")
    print(f"⚡ Production Anti-Stall Seeder: {EXAM_TRACK}")
    print("===================================================================")

    global_history = get_all_track_questions()
    print(f"[*] Loaded {len(global_history)} existing questions in memory.")

    for cbt_num in range(1, TOTAL_SETS + 1):
        print(f"\n==================== [ DRA Full CBT #{cbt_num} of {TOTAL_SETS} ] ====================")

        for mod in MODULE_BLUEPRINT:
            mod_name = mod["module"]
            topics_list = mod["topics"]

            for diff, target in mod["quota"].items():
                existing = get_existing_questions(cbt_num, mod_name, diff)
                current_count = len(existing)
                attempt_counter = 0

                while current_count < target:
                    remaining = target - current_count
                    # Request at least 3 to provide variety and avoid single-prompt duplicate traps
                    request_count = min(7, max(3, remaining))
                    attempt_counter += 1

                    print(f"[*] Set #{cbt_num} | {mod_name} [{diff.upper()}]: {current_count}/{target} present, generating {request_count} (need {remaining})...")
                    questions = generate_questions(cbt_num, mod_name, topics_list, diff, request_count, attempt_counter)

                    if questions and isinstance(questions, list):
                        added = 0
                        for q in questions:
                            if current_count >= target:
                                break
                            q_text = str(q.get("question_text", "")).strip()

                            if not q_text or is_duplicate_prompt(q_text, global_history):
                                continue

                            record = {
                                "exam_type": EXAM_TRACK,
                                "module": mod_name,
                                "difficulty": diff,
                                "cbt_set_number": cbt_num,
                                "question_text": q_text,
                                "audio_script": str(q.get("audio_script", q_text)).strip(),
                                "option_a": str(q.get("option_a", "")).strip(),
                                "option_b": str(q.get("option_b", "")).strip(),
                                "option_c": str(q.get("option_c", "")).strip(),
                                "option_d": str(q.get("option_d", "")).strip(),
                                "correct_option": str(q.get("correct_option", "A")).strip().upper()[:1],
                                "explanation": str(q.get("explanation", "")).strip()
                            }
                            try:
                                supabase.table("questions").insert(record).execute()
                                global_history.append(q_text)
                                added += 1
                                current_count += 1
                            except Exception:
                                pass

                        print(f"  ✅ Added {added} questions (Current: {current_count}/{target})")

                    time.sleep(4)

    print("\n🎉 All 30 Balanced CBTs Generated Successfully!")

if __name__ == "__main__":
    main()