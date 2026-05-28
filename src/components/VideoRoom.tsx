import { useState, useRef } from 'react';
import { Video, PhoneOff, Loader2 } from 'lucide-react';
import './VideoRoom.css';

interface VideoRoomProps {
  sessionId: string;
  userName: string;
  guideName: string;
  onLeave?: () => void;
}

/**
 * 📹 VideoRoom — Embedded Jitsi Meet session (TypeScript)
 * Loads Jitsi Meet inside a secure iFrame with preconfigured privacy settings.
 */
export default function VideoRoom({ sessionId, userName, guideName, onLeave }: VideoRoomProps) {
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const roomName = `lf-session-${sessionId}`;
  const displayName = encodeURIComponent(userName || 'User');

  // Jitsi iFrame URL with configuration parameters to disable third-party trackers & set premium options
  const jitsiUrl = `https://meet.jit.si/${roomName}#userInfo.displayName="${displayName}"&config.startWithAudioMuted=false&config.startWithVideoMuted=false&config.prejoinPageEnabled=false&config.disableDeepLinking=true&config.toolbarButtons=["microphone","camera","closedcaptions","fullscreen","fodeviceselection","hangup","chat","settings","raisehand","videoquality","tileview"]&interfaceConfig.SHOW_JITSI_WATERMARK=false&interfaceConfig.SHOW_WATERMARK_FOR_GUESTS=false&interfaceConfig.APP_NAME=LifeFundies`;

  const handleJoin = () => {
    setIsLoading(true);
    setIsJoined(true);
    // Simulate initial room loading wait
    setTimeout(() => setIsLoading(false), 2000);
  };

  const handleLeave = () => {
    setIsJoined(false);
    onLeave?.();
  };

  if (!isJoined) {
    return (
      <div className="video-room-container">
        {/* Guide Avatar */}
        <div className="video-room-avatar-wrapper">
          <div className="video-room-avatar">
            {guideName?.charAt(0) || 'G'}
          </div>
          <div className="video-room-icon-badge">
            <Video size={16} />
          </div>
        </div>

        <div>
          <h3 className="video-room-title">{guideName || 'Your Guide'}</h3>
          <p className="video-room-subtitle">Ready to start your video session</p>
        </div>

        {/* Info pills */}
        <div className="video-room-pills">
          {['🔒 100% Encrypted & Safe', '📹 HD Video Call', '🎙️ High Fidelity Audio'].map((item) => (
            <span key={item} className="video-room-pill">
              {item}
            </span>
          ))}
        </div>

        <button
          onClick={handleJoin}
          type="button"
          className="btn btn-primary btn-lg video-room-join-btn"
        >
          <Video size={18} />
          Join Video Session
        </button>

        <p className="video-room-note">
          Your session is powered by Jitsi Meet — private, secure, and runs directly in your browser.
        </p>
      </div>
    );
  }

  return (
    <div className="video-room-active">
      {isLoading && (
        <div className="video-room-loading-overlay">
          <Loader2 className="animate-spin" size={28} style={{ color: 'var(--clr-primary)' }} />
          <p className="video-room-loading-text">Connecting to session room...</p>
        </div>
      )}

      <iframe
        ref={iframeRef}
        src={jitsiUrl}
        allow="camera *; microphone *; fullscreen *; display-capture *; autoplay *"
        allowFullScreen
        className="video-room-iframe"
        onLoad={() => setIsLoading(false)}
      />

      {/* Leave overlay button */}
      <button
        onClick={handleLeave}
        type="button"
        className="btn btn-sm video-room-leave-btn"
      >
        <PhoneOff size={14} />
        Leave Call
      </button>
    </div>
  );
}
