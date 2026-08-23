import os
import json
import time
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv('.env.local')

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("❌ Missing Supabase credentials in .env.local")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

ALL_TRACKS = [
    "JAIIB_IEIFS", "JAIIB_PPB", "JAIIB_AFM", "JAIIB_RBWM",
    "CAIIB_ABM", "CAIIB_BFM", "CAIIB_ABFM", "CAIIB_BRBL",
    "DRA", "CCP", "BCBF", "AML_KYC"
]

def backup_all_data():
    os.makedirs("backups", exist_ok=True)
    timestamp = time.strftime("%Y%m%d_%H%M%S")
    backup_file = f"backups/bankerviva_all_questions_{timestamp}.json"

    print("==========================================================================")
    print("💾 BankerViva Master Question Bank Backup Tool")
    print(f"   Target: 18,001 Questions across 12 Exam Tracks")
    print("==========================================================================")

    master_archive = []
    track_summary = {}

    for track in ALL_TRACKS:
        print(f"\n📥 Extracting all records for '{track}'...")
        track_rows = []
        offset = 0
        batch_size = 1000

        while True:
            try:
                res = supabase.table("questions") \
                    .select("*") \
                    .eq("exam_type", track) \
                    .range(offset, offset + batch_size - 1) \
                    .order("cbt_set_number", desc=False) \
                    .order("id", desc=False) \
                    .execute()

                if res.data:
                    track_rows.extend(res.data)
                    print(f"   • Fetched {len(track_rows)} rows so far...")
                    if len(res.data) < batch_size:
                        break
                    offset += batch_size
                else:
                    break
            except Exception as e:
                print(f"   ⚠️ Error fetching batch for {track}: {e}. Retrying in 2s...")
                time.sleep(2)

        track_summary[track] = len(track_rows)
        master_archive.extend(track_rows)
        print(f"   ✅ '{track}' extracted: {len(track_rows)} questions.")

    print("\n--------------------------------------------------------------------------")
    print(f"📦 Writing {len(master_archive)} questions to local file: {backup_file}...")
    
    with open(backup_file, "w", encoding="utf-8") as f:
        json.dump(master_archive, f, ensure_ascii=False, indent=2)

    print("--------------------------------------------------------------------------")
    print(f"🎉 BACKUP COMPLETED SUCCESSFULLY!")
    print(f"   File Saved At: {os.path.abspath(backup_file)}")
    print(f"   Total Archived Records: {len(master_archive)}")
    print("--------------------------------------------------------------------------")
    print("Summary Breakdown:")
    for t, cnt in track_summary.items():
        print(f"   - {t:<15}: {cnt} Qs")
    print("==========================================================================")

if __name__ == "__main__":
    backup_all_data()