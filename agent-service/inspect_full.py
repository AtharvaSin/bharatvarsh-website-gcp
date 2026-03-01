import livekit.agents
try:
    print(f"Version: {livekit.agents.__version__}")
except:
    print("Version not found in __version__")

print("Top Level Agents:", dir(livekit.agents))

try:
    import livekit.agents.pipeline
    print("pipeline module:", dir(livekit.agents.pipeline))
except ImportError:
    print("pipeline module missing")

try:
    import livekit.agents.voice
    print("voice module:", dir(livekit.agents.voice))
except ImportError:
    print("voice module missing")

try:
    import livekit.agents.multimodal
    print("multimodal module:", dir(livekit.agents.multimodal))
except ImportError:
    print("multimodal module missing")
