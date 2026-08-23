import os
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

def fetch_all_counts():
    all_rows = []
    page_size = 1000
    start = 0
    while True:
        res = (
            supabase.table("questions")
            .select("id, cbt_set_number")
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
    print("==================================================")
    print(f"📊 Live Set-by-Set Question Count: [{EXAM_TRACK}]")
    print("==================================================")

    data = fetch_all_counts()
    total = len(data)

    set_map = {}
    for row in data:
        s = row.get("cbt_set_number", 0)
        set_map[s] = set_map.get(s, 0) + 1

    all_passed = True
    for s_num in range(1, 31):
        count = set_map.get(s_num, 0)
        if count == 100:
            status = "✅ 100/100"
        elif count > 100:
            status = f"⚠️ {count}/100 (Overflow by {count - 100})"
            all_passed = False
        else:
            status = f"❌ {count}/100 (Short by {100 - count})"
            all_passed = False
        print(f"  • CBT Set #{s_num:02d}: {status}")

    print("=" * 50)
    print(f"Total Bank Count: {total} / 3000 questions")
    
    if all_passed and total == 3000:
        print("🎉 ALL 30 SETS ARE BALANCED AT EXACTLY 100/100!")
    else:
        print("⚠️ Some sets still require adjustment.")

if __name__ == "__main__":
    main()