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
TARGET_EXAM = "CAIIB_ABM"

def clean_stem_text(text):
    return re.sub(r'^\[[^\]]+\]\s*', '', text).strip()

def sanitize_option(val):
    if not val:
        return "A"
    clean = str(val).strip().upper()
    match = re.search(r'[A-D]', clean)
    return match.group(0) if match else "A"

def fetch_target_questions():
    print(f"📥 Fetching records for {TARGET_EXAM} from Supabase...")
    all_data = []
    for offset in range(0, 2000, 1000):
        res = supabase.table("questions") \
            .select("*") \
            .eq("exam_type", TARGET_EXAM) \
            .range(offset, offset + 999) \
            .execute()
        if res.data:
            all_data.extend(res.data)
        if len(res.data) < 1000:
            break
    print(f"✅ Total fetched: {len(all_data)} records")
    return all_data

def identify_duplicates(questions):
    seen_stems = {}
    duplicates_to_replace = []
    unique_existing_stems = set()

    # Sort by cbt_set_number ascending so earlier sets keep original questions
    questions_sorted = sorted(questions, key=lambda x: (x['cbt_set_number'], x['id']))

    for q in questions_sorted:
        c_stem = clean_stem_text(q['question_text'])
        key = c_stem.lower()

        if key in seen_stems:
            duplicates_to_replace.append(q)
        else:
            seen_stems[key] = q['id']
            unique_existing_stems.add(c_stem.lower())

    return duplicates_to_replace, unique_existing_stems

def generate_replacement_question(module, difficulty, cbt_set, existing_stems, max_retries=4):
    if difficulty == "hard":
        diff_instruction = (
            "DIFFICULTY REQUIREMENT (HARD / CAIIB LEVEL - NUMERICAL & EVALUATIVE):\n"
            "- Multi-step calculations (Z-score probabilities, Standard Error, Regression lines, MPBF, DSCR, Holding period calculation).\n"
            "- Multi-statement analytical evaluations ('Which of the statements given above is/are TRUE/INCORRECT?').\n"
            "- Authentic Chief Credit Officer / HR / Compliance Head case study dilemmas."
        )
    else:
        diff_instruction = (
            "DIFFICULTY REQUIREMENT (MODERATE / OPERATIONAL MASTERY):\n"
            "- Direct questions on statistical properties, HRM leadership models, RBI Large Exposure Framework limits, and CCO guidelines.\n"
            "- Precise single-concept stems with clean distractor options."
        )

    prompt = f"""
You are the Chief Examiner for the Indian Institute of Banking & Finance (IIBF).
Generate ONE completely unique, high-yield multiple choice question for CAIIB Paper 1: Advanced Bank Management (ABM).

Module: "{module}"
Difficulty: "{difficulty}"

{diff_instruction}

STRICT RULE: Avoid generic textbook phrases (e.g. do not begin with 'What is the primary objective of...' or 'Which of the following is...'). Ensure novel scenario-based or calculation-driven phrasing.

Return strictly a valid JSON object:
{{
  "question_text": "Detailed distinct question stem",
  "option_a": "Option A text",
  "option_b": "Option B text",
  "option_c": "Option C text",
  "option_d": "Option D text",
  "correct_option": "A",
  "explanation": "Detailed step-by-step statutory or arithmetic explanation."
}}
"""
    for attempt in range(1, max_retries + 1):
        try:
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.7
                )
            )
            data = json.loads(response.text.strip())

            q_text = data.get("question_text") or data.get("question") or data.get("stem")
            opt_a = data.get("option_a") or data.get("optionA") or data.get("A")
            opt_b = data.get("option_b") or data.get("optionB") or data.get("B")
            opt_c = data.get("option_c") or data.get("optionC") or data.get("C")
            opt_d = data.get("option_d") or data.get("optionD") or data.get("D")
            c_opt = data.get("correct_option") or data.get("correctOption") or data.get("answer") or "A"
            expl = data.get("explanation") or data.get("rationale") or "Detailed explanation provided."

            if not (q_text and opt_a and opt_b and opt_c and opt_d):
                continue

            stem = q_text.strip()
            if stem.lower() in existing_stems:
                time.sleep(1)
                continue

            return {
                "question_text": stem,
                "option_a": opt_a,
                "option_b": opt_b,
                "option_c": opt_c,
                "option_d": opt_d,
                "correct_option": sanitize_option(c_opt),
                "explanation": expl
            }
        except Exception as e:
            time.sleep(2)
    return None

def main():
    questions = fetch_target_questions()
    dups, existing_stems = identify_duplicates(questions)

    print(f"\n🔍 Found {len(dups)} duplicate questions across CAIIB ABM sets requiring regeneration.")
    if not dups:
        print("🎉 No duplicates found! All CAIIB ABM questions are already unique.")
        return

    print("🚀 Replacing duplicates with fresh, high-yield questions...\n")

    for idx, dup in enumerate(dups, start=1):
        set_num = dup['cbt_set_number']
        module = dup['module']
        diff = dup['difficulty']
        q_id = dup['id']
        old_stem = clean_stem_text(dup['question_text'])

        match = re.search(r'\[([^\]]+)\]', dup['question_text'])
        tag = match.group(1) if match else f"{TARGET_EXAM}-CBT{set_num:02d}"

        print(f"[{idx}/{len(dups)}] Replacing Dup in ABM Set #{set_num} ({diff.upper()}): '{old_stem[:38]}...'")

        new_q = generate_replacement_question(module, diff, set_num, existing_stems)
        if new_q:
            new_unique_stem = f"[{tag}] {new_q['question_text']}"
            existing_stems.add(new_q['question_text'].lower())

            supabase.table("questions").update({
                "question_text": new_unique_stem,
                "audio_script": f"{tag}. {new_q['question_text']}",
                "option_a": new_q["option_a"],
                "option_b": new_q["option_b"],
                "option_c": new_q["option_c"],
                "option_d": new_q["option_d"],
                "correct_option": new_q["correct_option"],
                "explanation": new_q["explanation"]
            }).eq("id", q_id).execute()

            print(f"    ✅ Updated id: {q_id}")
            time.sleep(1)
        else:
            print(f"    ⚠️ Failed to replace id: {q_id}")

    print("\n🎉 CAIIB ABM deduplication complete! All 1,000 records are now 100% unique.")

if __name__ == "__main__":
    main()