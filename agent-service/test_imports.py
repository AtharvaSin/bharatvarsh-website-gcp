try:
    from livekit.agents.pipeline import VoicePipelineAgent
    print("SUCCESS: livekit.agents.pipeline.VoicePipelineAgent")
except ImportError as e:
    print(f"FAILED: livekit.agents.pipeline.VoicePipelineAgent - {e}")

try:
    from livekit.agents.multimodal import MultimodalAgent
    print("SUCCESS: livekit.agents.multimodal.MultimodalAgent")
except ImportError as e:
    print(f"FAILED: livekit.agents.multimodal.MultimodalAgent - {e}")

try:
    from livekit.agents.voice_assistant import VoiceAssistant
    print("SUCCESS: livekit.agents.voice_assistant.VoiceAssistant")
except ImportError as e:
    print(f"FAILED: livekit.agents.voice_assistant.VoiceAssistant - {e}")
