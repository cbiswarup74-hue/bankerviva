import os
import re
from collections import Counter
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv('.env.local')

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not SUPABASE_URL:
    print("❌ Missing Supabase keys in .env.local")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
EXAM_TRACK = "DRA"

KEY_TOPICS = [
    ("SARFAESI Act Sec 13(2) / 13(4) / 14", r"13\(2\)|13\(4\)|section 14|sarfaesi"),
    ("DRT / DRAT / RDB Act (20L limit, appeals)", r"drt|drat|rdb act|20 lakh|recovery officer"),
    ("NI Act Sec 138 (Cheque bounce)", r"138|cheque|negotiable instruments"),
    ("Limitation Act (Art 62 mortgage, etc.)", r"limitation act|article 62|12 years|3 years"),
    ("RBI Fair Practices / Calling Hours", r"fair practices|08:00|19:00|calling hours|recording"),
    ("KYC / OVD Guidelines", r"kyc|officially valid document|ovd|cdd"),
    ("Digital Lending & FLDG (5% cap)", r"digital lending|fldg|default loss guarantee|lending service provider"),
    ("Banker Lien / Set-off (Sec 171)", r"banker'?s lien|section 171|set-off|general lien"),
    ("Lok Adalat / IBC / Insolvency", r"lok adalat|20 lakh|insolvency|ibc|drp"),
    ("Ethics & Agent Code of Conduct", r"code of conduct|privacy|harassment|intimidation|visiting")
]

def fetch_all_questions():
    all_rows = []
    page_size = 1000
    start = 0
    while True:
        res = supabase.table("questions").select("id, cbt_set_number, module, question_text, explanation").eq("exam_type", EXAM_TRACK).range(start, start + page_size - 1).execute()
        batch = res.data or []
        all_rows.extend(batch)
        if len(batch) < page_size:
            break
        start += page_size
    return all_rows

def main():
    print("==================================================")
    print(f"📊 Topic Diversity & Syllabus Health Audit [{EXAM_TRACK}]")
    print("==================================================")

    rows = fetch_all_questions()
    total = len(rows)
    print(f"[*] Total Questions Analyzed: {total}\n")

    module_counter = Counter()
    set_diversity = {i: {"modules": Counter(), "topics": Counter(), "total": 0} for i in range(1, 31)}

    for r in rows:
        val = r.get("cbt_set_number")
        try:
            s = int(val)
        except (TypeError, ValueError):
            s = 0
            
        mod = r.get("module") or "Unclassified"
        q_text = (r.get("question_text") or "") + " " + (r.get("explanation") or "")
        
        module_counter[mod] += 1
        if 1 <= s <= 30:
            set_diversity[s]["total"] += 1
            set_diversity[s]["modules"][mod] += 1
            
            for label, pattern in KEY_TOPICS:
                if re.search(pattern, q_text, re.IGNORECASE):
                    set_diversity[s]["topics"][label] += 1

    print("--- 📚 Overall Module Breakdown ---")
    for mod, count in module_counter.most_common():
        pct = (count / total) * 100 if total > 0 else 0
        print(f"  • {mod:<42}: {count:>4} questions ({pct:5.1f}%)")

    print("\n--- ⚖️ Statutory Topic Distribution Across 3,000 Questions ---")
    topic_counter = Counter()
    for r in rows:
        combined_text = (r.get("question_text") or "") + " " + (r.get("explanation") or "")
        for label, pattern in KEY_TOPICS:
            if re.search(pattern, combined_text, re.IGNORECASE):
                topic_counter[label] += 1

    for label, count in topic_counter.most_common():
        pct = (count / total) * 100 if total > 0 else 0
        print(f"  • {label:<45}: {count:>4} hits ({pct:5.1f}%)")

    print("\n--- 🔍 Set-by-Set Module Variety Snapshot ---")
    print(f"{'Set':<8}{'Total':<8}{'Distinct Modules':<18}{'Dominant Topic (Top Concentration)'}")
    print("-" * 75)
    for s in range(1, 31):
        info = set_diversity[s]
        mods_count = len(info["modules"])
        top_topic = info["topics"].most_common(1)
        top_str = f"{top_topic[0][0]} ({top_topic[0][1]}q)" if top_topic else "Balanced"
        print(f"Set #{s:02d}  {info['total']:<8}{mods_count:<18}{top_str}")

    print("\n" + "=" * 50)
    print("✅ Audit complete. No database changes made.")

if __name__ == "__main__":
    main()