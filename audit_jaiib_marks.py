import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv('.env.local')
supabase: Client = create_client(os.getenv("NEXT_PUBLIC_SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY"))

tracks = ['JAIIB_IEIFS', 'JAIIB_PPB', 'JAIIB_AFM', 'JAIIB_RBWM']

print("==========================================================================")
print("📊 JAIIB 4-Paper Cognitive Tier & Difficulty Audit")
print("==========================================================================")

for t in tracks:
    res = supabase.table("questions").select("difficulty").eq("exam_type", t).execute()
    data = res.data or []
    diff_counts = {}
    for r in data:
        d = r.get("difficulty", "unknown")
        diff_counts[d] = diff_counts.get(d, 0) + 1
    
    print(f"\n📘 {t:12s} (Total: {len(data)} Qs)")
    for diff, count in diff_counts.items():
        pct = (count / len(data)) * 100 if data else 0
        print(f"   • {diff.capitalize():10s}: {count:4d} items ({pct:.1f}%)")

print("\n" + "=" * 74)