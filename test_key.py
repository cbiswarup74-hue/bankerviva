import os
import requests
from dotenv import load_dotenv

load_dotenv('.env.local')
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("❌ GEMINI_API_KEY not found in .env.local")
    exit(1)

print(f"[*] Testing Gemini Key ({api_key[:10]}...)...")

# Target current active Gemini 3.5 Flash endpoint
url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent"
headers = {
    "Content-Type": "application/json",
    "x-goog-api-key": api_key
}
payload = {
    "contents": [{"parts": [{"text": "Reply with 'API is Online and Ready' in 5 words."}]}]
}

try:
    response = requests.post(url, headers=headers, json=payload)
    if response.status_code == 200:
        data = response.json()
        reply = data["candidates"][0]["content"]["parts"][0]["text"]
        print(f"✅ SUCCESS! Connected to Gemini 3.5 Flash.")
        print(f"   Model Response: {reply.strip()}")
    else:
        print(f"❌ Error {response.status_code}: {response.text}")
except Exception as e:
    print(f"❌ Connection Error: {e}")