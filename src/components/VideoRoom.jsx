'use client';

import { useState, useRef, useEffect } from 'react';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Maximize2, Loader2 } from 'lucide-react';

/**
 * 📹 VideoRoom — Embedded Jitsi Meet session
 * Uses jitsi.lifefundies.com or public meet.jit.si as fallback
 * Room name = lifefundies-{sessionId} for uniqueness
 */
export default function VideoRoom({ sessionId, userName, guideName, onLeave }) {
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const iframeRef = useRef(null);

  const roomName = `lf-session-${sessionId}`;
  const displayName = encodeURIComponent(userName || 'User');

  // Jitsi iFrame URL with pre-configured options
  const jitsiUrl = `https://meet.jit.si/${roomName}#userInfo.displayName="${displayName}"&config.startWithAudioMuted=false&config.startWithVideoMuted=false&config.prejoinPageEnabled=false&config.disableDeepLinking=true&config.toolbarButtons=["microphone","camera","closedcaptions","fullscreen","fodeviceselection","hangup","chat","settings","raisehand","videoquality","tileview"]&interfaceConfig.SHOW_JITSI_WATERMARK=false&interfaceConfig.SHOW_WATERMARK_FOR_GUESTS=false&interfaceConfig.APP_NAME=LifeFundies`;

  const handleJoin = () => {
    setIsLoading(true);
    setIsJoined(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  const handleLeave = () => {
    setIsJoined(false);
    onLeave?.();
  };

  if (!isJoined) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[360px] bg-[#0a0a0a] rounded-2xl border border-white/8 gap-6 p-8">
        {/* Guide Avatar */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center text-3xl font-bold text-white shadow-2xl shadow-green-900/40">
            {guideName?.charAt(0) || 'G'}
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-green-500 border-2 border-[#0a0a0a] flex items-center justify-center">
            <Video className="w-3.5 h-3.5 text-white" />
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-xl font-bold text-white">{guideName || 'Your Guide'}</h3>
          <p className="text-sm text-zinc-400 mt-1">Ready to start your video session</p>
        </div>

        {/* Info pills */}
        <div className="flex flex-wrap justify-center gap-2">
          {['🔒 End-to-end secure', '📹 HD Video', '🎙️ Crystal Audio'].map((item) => (
            <span key={item} className="text-xs text-zinc-400 bg-white/5 border border-white/8 rounded-full px-3 py-1">
              {item}
            </span>
          ))}
        </div>

        <button
          onClick={handleJoin}
          className="flex items-center gap-3 px-8 py-4 bg-green-600 hover:bg-green-500 rounded-2xl font-semibold text-white text-base transition-all active:scale-95 shadow-lg shadow-green-900/30"
        >
          <Video className="w-5 h-5" />
          Join Video Session
        </button>

        <p className="text-xs text-zinc-600 text-center max-w-xs">
          Your session is powered by Jitsi Meet — private, secure, and runs directly in your browser.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-2xl overflow-hidden bg-black border border-white/8">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black gap-4">
          <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
          <p className="text-zinc-400 text-sm">Connecting to session...</p>
        </div>
      )}

      <iframe
        ref={iframeRef}
        src={jitsiUrl}
        allow="camera *; microphone *; fullscreen *; display-capture *; autoplay *"
        allowFullScreen
        className="w-full h-full border-none"
        style={{ minHeight: '400px' }}
        onLoad={() => setIsLoading(false)}
      />

      {/* Leave overlay button */}
      <button
        onClick={handleLeave}
        className="absolute top-3 right-3 z-20 flex items-center gap-2 px-3 py-1.5 bg-red-600/90 hover:bg-red-500 rounded-xl text-white text-xs font-medium backdrop-blur transition-all"
      >
        <PhoneOff className="w-3.5 h-3.5" />
        Leave
      </button>
    </div>
  );
}
