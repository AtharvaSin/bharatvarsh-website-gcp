import livekit.agents
print("MultimodalAgent in livekit.agents:", "MultimodalAgent" in dir(livekit.agents))

try:
    import livekit.agents.voice
    print("VoicePipelineAgent in livekit.agents.voice:", "VoicePipelineAgent" in dir(livekit.agents.voice))
    print("VoiceAssistant in livekit.agents.voice:", "VoiceAssistant" in dir(livekit.agents.voice))
    print("Agent in livekit.agents.voice:", "Agent" in dir(livekit.agents.voice))
except ImportError:
    print("livekit.agents.voice import failed")

print("Full dir(livekit.agents):", dir(livekit.agents))
