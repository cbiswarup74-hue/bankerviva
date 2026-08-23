import os
import re
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv('.env.local')
supabase: Client = create_client(
    os.getenv("NEXT_PUBLIC_SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
)

tracks = ['JAIIB_IEIFS', 'JAIIB_PPB', 'JAIIB_AFM', 'JAIIB_RBWM']

print("==========================================================================")
print("⚙️ Normalizing 3-Tier Difficulty (50% Easy / 25% Moderate / 25% Hard)")
print("==========================================================================")

for t in tracks:
    res = supabase.table("questions").select("id, question_text").eq("exam_type", t).execute()
    rows = res.data or []
    print(f"[*] Updating {t} ({len(rows)} items)...")
    
    for r in rows:
        q_text = r.get("question_text", "")
        match = re.search(r"-Q(\d{3})\]", q_text)
        if match:
            q_num = int(match.group(1))
            if q_num <= 50:
                tier = "easy"
            elif q_num <= 75:
                tier = "moderate"
            else:
                tier = "hard"
            supabase.table("questions").update({"difficulty": tier}).eq("id", r["id"]).execute()

print("\n🎉 Difficulty tier calibration complete!")