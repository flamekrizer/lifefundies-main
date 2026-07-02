import { useState } from 'react';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Loader2 } from 'lucide-react';
import {
  HMSRoomProvider,
  useHMSActions,
  useHMSStore,
  useVideo,
  selectIsConnectedToRoom,
  selectPeers,
  selectIsLocalAudioEnabled,
  selectIsLocalVideoEnabled,
} from '@100mslive/react-sdk';
import type { HMSPeer } from '@100mslive/hms-video-store';
import './VideoRoom.css';

interface VideoRoomProps {
  sessionId: string;
  userName: string;
  guideName: string;
  onLeave?: () => void;
}

function PeerTile({ peer }: { peer: HMSPeer }) {
  const { videoRef } = useVideo({ trackId: peer.videoTrack });
  return (
    <div className="video-tile">
      <video ref={videoRef} autoPlay muted={peer.isLocal} playsInline className="video-tile-video" />
      <span className="video-tile-name">{peer.name}{peer.isLocal ? ' (You)' : ''}</span>
    </div>
  );
}

function ActiveCall({ onLeave }: { onLeave: () => void }) {
  const hmsActions = useHMSActions();
  const peers = useHMSStore(selectPeers);
  const isAudioOn = useHMSStore(selectIsLocalAudioEnabled);
  const isVideoOn = useHMSStore(selectIsLocalVideoEnabled);

  const handleLeave = async () => {
    await hmsActions.leave();
    onLeave();
  };

  return (
    <div className="video-room-active">
      <div className="video-room-grid">
        {peers.map((peer) => (
          <PeerTile key={peer.id} peer={peer} />
        ))}
      </div>

      <div className="video-room-controls">
        <button
          type="button"
          className="btn btn-sm video-room-control-btn"
          onClick={() => hmsActions.setLocalAudioEnabled(!isAudioOn)}
        >
          {isAudioOn ? <Mic size={16} /> : <MicOff size={16} />}
        </button>
        <button
          type="button"
          className="btn btn-sm video-room-control-btn"
          onClick={() => hmsActions.setLocalVideoEnabled(!isVideoOn)}
        >
          {isVideoOn ? <Video size={16} /> : <VideoOff size={16} />}
        </button>
        <button type="button" className="btn btn-sm video-room-leave-btn" onClick={handleLeave}>
          <PhoneOff size={14} />
          Leave Call
        </button>
      </div>
    </div>
  );
}

function VideoRoomInner({ sessionId, userName, guideName, onLeave }: VideoRoomProps) {
  const hmsActions = useHMSActions();
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/hms-create-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, userName: userName || 'Guest' }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Could not start the video session.');
      }

      const authToken = await hmsActions.getAuthTokenByRoomCode({ roomCode: data.roomCode });
      await hmsActions.join({ userName: data.userName, authToken });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start the video session.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeave = () => {
    onLeave?.();
  };

  if (!isConnected) {
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
          disabled={isLoading}
          className="btn btn-primary btn-lg video-room-join-btn"
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Video size={18} />}
          {isLoading ? 'Starting session...' : 'Join Video Session'}
        </button>

        {error && <p className="video-room-note" style={{ color: 'var(--clr-danger, #ef4444)' }}>{error}</p>}

        <p className="video-room-note">
          Your session is powered by 100ms — private, secure, and runs directly in your browser.
        </p>
      </div>
    );
  }

  return <ActiveCall onLeave={handleLeave} />;
}

/**
 * 📹 VideoRoom — Embedded 100ms session (TypeScript)
 * The room is created on demand by the backend, which returns a room code
 * the client exchanges for a short-lived auth token to join with the 100ms SDK.
 */
export default function VideoRoom(props: VideoRoomProps) {
  return (
    <HMSRoomProvider>
      <VideoRoomInner {...props} />
    </HMSRoomProvider>
  );
}
