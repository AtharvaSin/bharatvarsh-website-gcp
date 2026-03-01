import requests
import os
from dotenv import load_dotenv

load_dotenv(".env.local")

secret = os.getenv("INTERNAL_API_SECRET")
url = "http://localhost:3000/api/internal/rag"

print(f"Testing RAG API at {url} with secret ending in ...{secret[-6:] if secret else 'NONE'}")

try:
    resp = requests.post(
        url,
        json={"query": "Who is the protagonist?", "spoilerMode": "S1"},
        headers={"Authorization": f"Bearer {secret}"}
    )
    print(f"Status: {resp.status_code}")
    if resp.status_code == 200:
        print("Response:", resp.json())
    else:
        print("Error:", resp.text)
except Exception as e:
    print(f"Request failed: {e}")
