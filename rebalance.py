import os
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

def get_set_num(row):
    # Support both column namings safely
    val = row.get("cbt_set_number")
    if val is None:
        val = row.get("set_number")
    try:
        return int(val)
    except (TypeError, ValueError):
        return 0

def main():
    print("==================================================")
    print(f"⚖️ Robust Rebalancing [{EXAM_TRACK}]")
    print("==================================================")

    rows = fetch_all_questions()
    print(f"[*] Total Questions in Database: {len(rows)}")

    # Group by actual set
    set_dict = {i: [] for i in range(1, 31)}
    for r in rows:
        s = get_set_num(r)
        if 1 <= s <= 30:
            set_dict[s].append(r["id"])

    print("\n[*] Initial Set Counts:")
    for s in range(1, 31):
        print(f"    Set #{s:02d}: {len(set_dict[s])}")

    # Gather surplus from any set > 100
    surplus_pool = []
    for s in range(1, 31):
        if len(set_dict[s]) > 100:
            overflow = set_dict[s][100:]
            surplus_pool.extend(overflow)
            set_dict[s] = set_dict[s][:100]

    print(f"\n[*] Surplus Questions to Reassign: {len(surplus_pool)}")

    # Move surplus into sets < 100
    reassigned = 0
    for s in range(1, 31):
        needed = 100 - len(set_dict[s])
        if needed > 0:
            batch = surplus_pool[:needed]
            surplus_pool = surplus_pool[needed:]
            for q_id in batch:
                supabase.table("questions").update({"cbt_set_number": s}).eq("id", q_id).execute()
                reassigned += 1
            print(f"    ✅ Set #{s:02d} received {len(batch)} questions -> (100/100)")

    print("\n" + "=" * 50)
    print(f"🎉 Rebalancing complete! Total questions moved: {reassigned}")

if __name__ == "__main__":
    main()