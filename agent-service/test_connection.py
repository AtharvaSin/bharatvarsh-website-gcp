import os
import asyncio
import logging
from livekit import rtc, api
from dotenv import load_dotenv

load_dotenv(".env.local")

LIVEKIT_URL = os.getenv("LIVEKIT_URL") or os.getenv("NEXT_PUBLIC_LIVEKIT_URL")
API_KEY = os.getenv("LIVEKIT_API_KEY")
API_SECRET = os.getenv("LIVEKIT_API_SECRET")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("test_connection")

async def test_connect():
    logger.info(f"Testing connection to: {LIVEKIT_URL}")
    
    # 1. Generate Token
    token = api.AccessToken(API_KEY, API_SECRET) \
        .with_identity("python-test-guest") \
        .with_name("Python Tester") \
        .with_grants(api.VideoGrants(
            room_join=True,
            room="test-room-debug",
        )).to_jwt()
    
    logger.info("Token generated successfully.")

    # 2. Connect
    room = rtc.Room()
    
    try:
        await room.connect(LIVEKIT_URL, token)
        logger.info("✅ SUCCESS: Connected to LiveKit Room!")
        logger.info(f"Room Name: {room.name}")
        logger.info(f"Session ID: {room.sid}")
        
        await asyncio.sleep(2)
        await room.disconnect()
        logger.info("Disconnected.")
        
    except Exception as e:
        logger.error(f"❌ FAILED to connect: {e}")

if __name__ == "__main__":
    if not LIVEKIT_URL or not API_KEY or not API_SECRET:
        logger.error("Missing Environment Variables. Make sure .env.local is loaded.")
    else:
        asyncio.run(test_connect())
