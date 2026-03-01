import sys

print("Checking livekit-agents modules...")

try:
    import livekit.agents.multimodal
    print("SUCCESS: livekit.agents.multimodal found")
    print(dir(livekit.agents.multimodal))
except ImportError as e:
    print(f"FAILED: livekit.agents.multimodal - {e}")

try:
    import livekit.agents.voice
    print("SUCCESS: livekit.agents.voice found")
    print(dir(livekit.agents.voice))
except ImportError as e:
    print(f"FAILED: livekit.agents.voice - {e}")

try:
    import livekit.agents.pipeline
    print("SUCCESS: livekit.agents.pipeline found")
except ImportError as e:
    print(f"FAILED: livekit.agents.pipeline - {e}")
