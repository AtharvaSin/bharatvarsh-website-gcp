'use client';

import {
    LiveKitRoom,
    RoomAudioRenderer,
    useLocalParticipant,
    useVoiceAssistant,
    BarVisualizer,
    AgentState,
} from '@livekit/components-react';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Mic, MicOff, X, Loader2, Phone } from 'lucide-react';
import '@livekit/components-styles';

interface VoiceWidgetProps {
    onClose?: () => void;
}

export function VoiceWidget({ onClose }: VoiceWidgetProps) {
    const [token, setToken] = useState<string>('');
    const [url, setUrl] = useState<string>('');
    const [error, setError] = useState<string>('');

    useEffect(() => {
        (async () => {
            try {
                const resp = await fetch(`/api/livekit?room=bhoomi-${Math.floor(Math.random() * 10000)}&username=guest`);
                if (!resp.ok) throw new Error('Failed to get token');
                const data = await resp.json();
                setToken(data.token);
                setUrl(process.env.NEXT_PUBLIC_LIVEKIT_URL || '');
            } catch (e) {
                console.error(e);
                setError('Connection failed');
            }
        })();
    }, []);

    if (error) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-zinc-950 p-6 rounded-xl">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                    <Phone className="w-7 h-7 text-red-400" />
                </div>
                <p className="text-red-400 text-sm font-medium">Connection Failed</p>
                <p className="text-zinc-500 text-xs mt-1">Unable to reach the voice server</p>
                <button onClick={onClose} className="mt-4 text-xs text-zinc-400 hover:text-zinc-200 transition-colors underline underline-offset-2">
                    Close
                </button>
            </div>
        );
    }

    if (token === '' || url === '') {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-zinc-950 p-6 rounded-xl">
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-20 h-20 rounded-full bg-mustard-500/10 border border-mustard-500/20 flex items-center justify-center mb-4"
                >
                    <Loader2 className="w-8 h-8 text-mustard-500 animate-spin" />
                </motion.div>
                <p className="text-mustard-100/60 text-xs font-mono tracking-wider">Establishing Neural Link...</p>
            </div>
        );
    }

    return (
        <LiveKitRoom
            video={false}
            audio={true}
            token={token}
            serverUrl={url}
            connect={true}
            data-lk-theme="default"
            className="h-full flex flex-col bg-zinc-950 rounded-xl relative overflow-hidden"
        >
            <VoiceSession onClose={onClose} />
        </LiveKitRoom>
    );
}

/* ─── State-to-UI Config ─── */
const stateConfig: Record<string, {
    label: string;
    sublabel: string;
    color: string;
    glowColor: string;
    pulseSpeed: number;
    orbScale: number;
}> = {
    connecting: {
        label: 'Connecting',
        sublabel: 'Reaching the Neural Mesh...',
        color: 'text-amber-400',
        glowColor: 'rgba(245, 158, 11, 0.3)',
        pulseSpeed: 1.5,
        orbScale: 0.9,
    },
    initializing: {
        label: 'Initializing',
        sublabel: 'Bhoomi is waking up...',
        color: 'text-amber-400',
        glowColor: 'rgba(245, 158, 11, 0.3)',
        pulseSpeed: 1.2,
        orbScale: 0.95,
    },
    listening: {
        label: 'Listening',
        sublabel: 'Speak freely...',
        color: 'text-emerald-400',
        glowColor: 'rgba(16, 185, 129, 0.4)',
        pulseSpeed: 2.5,
        orbScale: 1.0,
    },
    thinking: {
        label: 'Thinking',
        sublabel: 'Processing your words...',
        color: 'text-blue-400',
        glowColor: 'rgba(59, 130, 246, 0.4)',
        pulseSpeed: 0.8,
        orbScale: 1.05,
    },
    speaking: {
        label: 'Speaking',
        sublabel: 'Bhoomi is responding...',
        color: 'text-mustard-400',
        glowColor: 'rgba(234, 179, 8, 0.5)',
        pulseSpeed: 0.6,
        orbScale: 1.1,
    },
    idle: {
        label: 'Ready',
        sublabel: 'Awaiting your voice...',
        color: 'text-zinc-400',
        glowColor: 'rgba(161, 161, 170, 0.2)',
        pulseSpeed: 3,
        orbScale: 0.95,
    },
    disconnected: {
        label: 'Disconnected',
        sublabel: 'Session ended',
        color: 'text-zinc-500',
        glowColor: 'rgba(161, 161, 170, 0.1)',
        pulseSpeed: 0,
        orbScale: 0.85,
    },
};

const getStateConfig = (state: string) => stateConfig[state] || stateConfig.connecting;


function VoiceSession({ onClose }: { onClose?: () => void }) {
    const { localParticipant } = useLocalParticipant();
    const { state, audioTrack, agentTranscriptions } = useVoiceAssistant();
    const [isMicEnabled, setIsMicEnabled] = useState(false);

    const config = useMemo(() => getStateConfig(state), [state]);

    // Track mic state
    useEffect(() => {
        if (!localParticipant) return;
        const update = () => setIsMicEnabled(localParticipant.isMicrophoneEnabled);
        update();
        localParticipant.on('muted', update);
        localParticipant.on('unmuted', update);
        localParticipant.on('localTrackPublished', update);
        localParticipant.on('localTrackUnpublished', update);

        // Auto-enable 
        if (!localParticipant.isMicrophoneEnabled) {
            localParticipant.setMicrophoneEnabled(true).catch(() => { });
        }

        return () => {
            localParticipant.off('muted', update);
            localParticipant.off('unmuted', update);
            localParticipant.off('localTrackPublished', update);
            localParticipant.off('localTrackUnpublished', update);
        };
    }, [localParticipant]);

    const toggleMic = useCallback(async () => {
        if (localParticipant) {
            try {
                await localParticipant.setMicrophoneEnabled(!localParticipant.isMicrophoneEnabled);
            } catch (e) {
                console.error('Failed to toggle mic:', e);
            }
        }
    }, [localParticipant]);

    // Last transcription from agent
    const lastTranscription = useMemo(() => {
        if (!agentTranscriptions || agentTranscriptions.length === 0) return null;
        const last = agentTranscriptions[agentTranscriptions.length - 1];
        return last?.text || null;
    }, [agentTranscriptions]);

    const isActive = state === 'listening' || state === 'thinking' || state === 'speaking';

    return (
        <div className="h-full flex flex-col relative">
            {/* Background gradient that shifts with state */}
            <div
                className="absolute inset-0 transition-all duration-1000"
                style={{
                    background: `radial-gradient(ellipse at center, ${config.glowColor} 0%, transparent 70%)`,
                }}
            />

            {/* Close button */}
            <div className="relative z-20 flex justify-end p-3">
                <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-zinc-200 transition-all"
                    title="Close Voice Mode"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col items-center justify-center gap-5 relative z-10 px-6 -mt-4">
                {/* Audio Visualizer Orb */}
                <motion.div
                    animate={{ scale: config.orbScale }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                    className="relative"
                >
                    {/* Outer glow ring */}
                    <motion.div
                        animate={{
                            opacity: [0.2, 0.5, 0.2],
                            scale: [1, 1.15, 1],
                        }}
                        transition={{
                            duration: config.pulseSpeed || 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                        className="absolute -inset-4 rounded-full"
                        style={{ boxShadow: `0 0 40px 10px ${config.glowColor}` }}
                    />

                    {/* Middle ring */}
                    <motion.div
                        animate={{
                            opacity: [0.3, 0.6, 0.3],
                            rotate: [0, 360],
                        }}
                        transition={{
                            opacity: { duration: config.pulseSpeed || 2, repeat: Infinity, ease: 'easeInOut' },
                            rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                        }}
                        className="absolute -inset-2 rounded-full border border-white/10"
                        style={{ borderColor: config.glowColor }}
                    />

                    {/* Inner orb with visualizer */}
                    <div className="w-36 h-36 rounded-full bg-zinc-900/80 border border-white/10 flex items-center justify-center overflow-hidden backdrop-blur-sm relative">
                        {audioTrack && (state === 'speaking') ? (
                            <div className="w-full h-full flex items-center justify-center p-4">
                                <BarVisualizer
                                    state={state as AgentState}
                                    trackRef={audioTrack}
                                    barCount={5}
                                    className="w-full h-16"
                                    options={{ minHeight: 10 }}
                                />
                            </div>
                        ) : (
                            <motion.div
                                animate={
                                    state === 'listening'
                                        ? { scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }
                                        : state === 'thinking'
                                            ? { rotate: [0, 360] }
                                            : {}
                                }
                                transition={
                                    state === 'listening'
                                        ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
                                        : state === 'thinking'
                                            ? { duration: 3, repeat: Infinity, ease: 'linear' }
                                            : {}
                                }
                            >
                                <Mic className={`w-10 h-10 transition-colors duration-500 ${config.color}`} />
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* State Label */}
                <div className="text-center space-y-1.5">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={state}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-1"
                        >
                            <div className="flex items-center justify-center gap-2">
                                <div
                                    className={`w-2 h-2 rounded-full ${isActive ? 'animate-pulse' : ''
                                        }`}
                                    style={{ backgroundColor: config.glowColor.replace(/[\d.]+\)$/, '1)') }}
                                />
                                <h3 className={`text-sm font-semibold tracking-wide uppercase ${config.color}`}>
                                    {config.label}
                                </h3>
                            </div>
                            <p className="text-zinc-500 text-xs font-mono">
                                {config.sublabel}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Live Transcription */}
                {lastTranscription && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-[280px]"
                    >
                        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/5">
                            <p className="text-zinc-300 text-xs leading-relaxed line-clamp-3">
                                "{lastTranscription}"
                            </p>
                        </div>
                    </motion.div>
                )}
            </div>

            <RoomAudioRenderer />

            {/* Bottom Controls */}
            <div className="relative z-20 flex items-center justify-center gap-4 p-5">
                {/* Mic Toggle */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleMic}
                    className={`p-4 rounded-full transition-all duration-300 ${isMicEnabled
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                        }`}
                    title={isMicEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
                >
                    {isMicEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </motion.button>

                {/* End Call */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="p-4 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 transition-all duration-300"
                    title="End Voice Session"
                >
                    <Phone className="w-5 h-5 rotate-[135deg]" />
                </motion.button>
            </div>
        </div>
    );
}
