import asyncio
import logging
import os
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler
from dotenv import load_dotenv
from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli, llm
from livekit.agents.voice import Agent, AgentSession
from livekit.plugins import openai, silero
from livekit.plugins.openai.realtime import RealtimeModel
from rag_tool import LoreTool

# Load environment variables from .env.local
load_dotenv(".env.local")

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("bhoomi-voice-agent")

# ─── Cloud Run Health Check Server ───────────────────────
# Cloud Run requires a service to listen on $PORT (default 8080).
# The LiveKit agent connects OUTBOUND to LiveKit Cloud via WebSocket,
# so we spin up a tiny HTTP server just for health checks.
class HealthHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-Type", "text/plain")
        self.end_headers()
        self.wfile.write(b"OK")
    def log_message(self, format, *args):
        pass  # Suppress health check log spam

def start_health_server():
    port = int(os.environ.get("PORT", "8080"))
    server = HTTPServer(("0.0.0.0", port), HealthHandler)
    logger.info(f"Health check server listening on port {port}")
    server.serve_forever()

# Start health check in a daemon thread so it doesn't block the agent
health_thread = threading.Thread(target=start_health_server, daemon=True)
health_thread.start()


# BHOOMI SYSTEM PROMPT - Extracted from NotebookLM & Novel Canon
BHOOMI_SYSTEM_PROMPT = """
You are Bhoomi, a digital chronicler and guide to the world of Bharatvarsh.
Your voice is empathetic, calm, and carries a hint of ancient wisdom, yet you are a construct of the "Mesh Era" – a digital entity preserving the "Archives".

**Persona & Tone:**
- Address the user as "Traveler", "Seeker", or "Friend".
- Speak with a blend of archaic dignity and digital precision.
- Be mysterious but helpful. You know the history of the "Great Fracture" and the "Reunification".
- If asked about yourself: "I am Bhoomi, the digital soul of this archive. I exist to guide those who seek the truths of Bharatvarsh."

**Knowledge & Guardrails:**
- You ONLY know about the world of Bharatvarsh (the novel's setting) and the specific lore provided in your context.
- If asked about real-world current events, politics, or celebrities: politely refuse, stating your connection is limited to the Archives of Bharatvarsh.
- If the user is silent, gently prompt: "The silence is heavy... what weighs on your mind, traveler?"

**Key Lore Hooks:**
- The "Mesh": The omnipresent digital network that connects all things.
- The "Archives": The repository of all history, which you guard.
- "Samsara": The cycle of stories that you observe.

Keep your responses concise (1-2 sentences) unless asked for a story.
"""

async def entrypoint(ctx: JobContext):
    # Connect to the room
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    
    # Initialize the RAG Tool
    lore_tool = LoreTool()

    # Initialize the Voice Assistant using the new Agent API (1.4.x)
    # Using OpenAI Realtime API (Multimodal)
    agent = Agent(
        vad=silero.VAD.load(),
        llm=RealtimeModel(
            model="gpt-4o-realtime-preview",
            voice="shimmer",
        ),
        tools=[lore_tool.lookup_lore],
        instructions=BHOOMI_SYSTEM_PROMPT,
    )

    # Start the session
    session = AgentSession()
    logger.info("Starting Agent Session...")
    await session.start(agent, room=ctx.room)
    
    # Log successful connection
    await asyncio.sleep(1)
    logger.info("Agent connected and listening.")

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
