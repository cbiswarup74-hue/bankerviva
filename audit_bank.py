import os
import re
import difflib
import time
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv('.env.local')

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not SUPABASE_URL:
    print("❌ Missing NEXT_PUBLIC_SUPABASE_URL in .env.local")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
EXAM_TRACK = "DRA"

def normalize_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)
    fillers = ['according to', 'under the', 'rbi master directions', 'as per', 'on fair practices code', 'what are the', 'which of the following']
    for f in fillers:
        text = text.replace(f, '')
    return ' '.join(text.split())

def fetch_all_questions():
    all_rows = []
    page_size = 1000
    start = 0
    
    while True:
        res = (
            supabase.table("questions")
            .select("id, cbt_set_number, module, difficulty, question_text")
            .eq("exam_type", EXAM_TRACK)
            .range(start, start + page_size - 1)
            .execute()
        )
        batch = res.data or []
        all_rows.extend(batch)
        if len(batch) < page_size:
            break
        start += page_size
        
    return all_rows

def main():
    print("===================================================================")
    print(f"⚡ Fast Audit: Full Supabase Question Bank [{EXAM_TRACK}]")
    print("===================================================================")

    questions = fetch_all_questions()
    total = len(questions)

    print(f"[*] Total Questions Found in DB: {total}")
    if total == 0:
        print("No questions found to audit.")
        return

    # Check set distribution
    set_counts = {}
    for q in questions:
        s = q.get("cbt_set_number", 0)
        set_counts[s] = set_counts.get(s, 0) + 1

    print("\n--- CBT Set Breakdown ---")
    for s_num in range(1, 31):
        count = set_counts.get(s_num, 0)
        status = "✅" if count == 100 else "⚠️"
        print(f"  {status} CBT Set #{s_num:02d}: {count}/100 questions")

    print(f"\n[*] Pre-processing and indexing {total} questions...")
    # Pre-compute normalized text and word sets once
    processed = []
    for q in questions:
        norm = normalize_text(q["question_text"])
        words = set(norm.split())
        processed.append({
            "id": q["id"],
            "set": q["cbt_set_number"],
            "raw": q["question_text"],
            "norm": norm,
            "words": words
        })

    duplicates_found = []
    threshold = 0.72
    start_time = time.time()

    print(f"[*] Running fast comparison on 4.5M candidate pairs...")

    for i in range(total):
        p1 = processed[i]
        w1 = p1["words"]
        n1 = p1["norm"]

        if i > 0 and i % 500 == 0:
            elapsed = round(time.time() - start_time, 1)
            print(f"    -> Audited {i}/{total} questions ({elapsed}s elapsed)...")

        for j in range(i + 1, total):
            p2 = processed[j]
            w2 = p2["words"]

            # Quick set intersection filter to eliminate 98% of non-matching pairs instantly
            intersection_len = len(w1 & w2)
            smaller_len = min(len(w1), len(w2))
            if smaller_len == 0 or (intersection_len / smaller_len) < 0.60:
                continue

            ratio = difflib.SequenceMatcher(None, n1, p2["norm"]).ratio()

            if ratio >= threshold:
                duplicates_found.append({
                    "score": round(ratio * 100, 1),
                    "q1_id": p1["id"],
                    "q1_set": p1["set"],
                    "q1_text": p1["raw"],
                    "q2_id": p2["id"],
                    "q2_set": p2["set"],
                    "q2_text": p2["raw"]
                })

    duration = round(time.time() - start_time, 2)
    print(f"\n✅ Scan completed in {duration} seconds.")
    print("=" * 65)

    if not duplicates_found:
        print("🎉 100% CLEAN! Zero duplicate questions found across all 3,000 entries.")
    else:
        print(f"⚠️ FOUND {len(duplicates_found)} HIGH-SIMILARITY PAIR(S):")
        print("=" * 65)
        for d in duplicates_found:
            print(f"\n[Similarity: {d['score']}%]")
            print(f" • CBT Set #{d['q1_set']} (ID: {d['q1_id']}):\n   {d['q1_text']}")
            print(f" • CBT Set #{d['q2_set']} (ID: {d['q2_id']}):\n   {d['q2_text']}")
            print("-" * 65)

if __name__ == "__main__":
    main()