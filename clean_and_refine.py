import os
import re
import difflib
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv('.env.local')

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not SUPABASE_URL:
    print("❌ Missing SUPABASE_URL in .env.local")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

def normalize_text(text: str) -> str:
    """Normalizes text by lowercasing and stripping punctuation/filler words."""
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)
    # Remove common filler framing
    fillers = ['according to', 'under the', 'rbi master directions', 'as per', 'on fair practices code', 'what are the', 'which of the following']
    for f in fillers:
        text = text.replace(f, '')
    return ' '.join(text.split())

def are_semantically_similar(q1: str, q2: str, threshold: float = 0.72) -> bool:
    norm1 = normalize_text(q1)
    norm2 = normalize_text(q2)
    ratio = difflib.SequenceMatcher(None, norm1, norm2).ratio()
    return ratio >= threshold

def clean_duplicates():
    print("===================================================================")
    print("🧹 BankerViva Automated Semantic Deduplicator & DB Sanitizer")
    print("===================================================================")

    # Fetch all records
    res = supabase.table("questions").select("id, exam_type, cbt_set_number, question_text").execute()
    all_questions = res.data or []
    print(f"[*] Total questions loaded from Supabase: {len(all_questions)}")

    to_delete_ids = []
    seen_questions = []

    for item in all_questions:
        q_id = item["id"]
        q_text = item["question_text"]
        q_track = item.get("exam_type", "DRA")

        is_duplicate = False
        for seen in seen_questions:
            if seen["exam_type"] == q_track:
                if are_semantically_similar(q_text, seen["question_text"]):
                    to_delete_ids.append(q_id)
                    print(f"  ❌ Detected Duplicate:\n     Keep: '{seen['question_text'][:70]}...'\n     Drop: '{q_text[:70]}...'\n")
                    is_duplicate = True
                    break

        if not is_duplicate:
            seen_questions.append(item)

    print(f"\n[*] Scan complete. Found {len(to_delete_ids)} semantic/near-duplicate questions.")

    if to_delete_ids:
        print(f"[*] Purging {len(to_delete_ids)} duplicates from Supabase...")
        # Batch delete in chunks of 50
        for i in range(0, len(to_delete_ids), 50):
            batch = to_delete_ids[i:i+50]
            supabase.table("questions").delete().in_("id", batch).execute()
        print("✅ Purge completed successfully. Database is now sanitized!")
    else:
        print("✅ No duplicates detected.")

if __name__ == "__main__":
    clean_duplicates()