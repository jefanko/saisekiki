import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Hls from 'hls.js';
import { usePlayer } from '../context/PlayerContext';
import { getStreamDetails } from '../api/piped';
import Loading from './Loading';

export default function GlobalPlayer() {
  const { currentVideo, setVideo, stream, setStream, isMinimized, setMinimized, playNext, isPlaying, setPlaying, queue } = usePlayer();
  const videoRef = useRef<HTMLVideoElement>(null);
  const silentAudioRef = useRef<HTMLAudioElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Auto-minimize when navigating away from watch page
  useEffect(() => {
    const isWatchPage = location.pathname.startsWith('/watch/');
    if (!isWatchPage && currentVideo && !isMinimized) {
      setMinimized(true);
    } else if (isWatchPage && isMinimized) {
      setMinimized(false);
    }
  }, [location.pathname, currentVideo]);

  // Fetch stream when currentVideo changes
  useEffect(() => {
    if (currentVideo?.id) {
      setLoading(true);
      getStreamDetails(currentVideo.id)
        .then(data => {
          setStream(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [currentVideo?.id]);

  // Video Setup (HLS/Native)
  useEffect(() => {
    if (stream?.hls && videoRef.current) {
      const video = videoRef.current;
      const isHls = stream.hls.includes('.m3u8');
      
      if (isHls) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream.hls;
        } else if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(stream.hls);
          hls.attachMedia(video);
          return () => hls.destroy();
        }
      } else {
        video.src = stream.hls;
      }

      const playSilent = () => silentAudioRef.current?.play().catch(() => {});
      const pauseSilent = () => silentAudioRef.current?.pause();

      video.addEventListener('play', playSilent);
      video.addEventListener('pause', pauseSilent);
      return () => {
        video.removeEventListener('play', playSilent);
        video.removeEventListener('pause', pauseSilent);
      };
    }
  }, [stream]);

  // Media Session API
  useEffect(() => {
    if ('mediaSession' in navigator && stream) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: stream.title,
        artist: stream.uploader,
        artwork: [{ src: stream.uploaderAvatar || '', sizes: '512x512', type: 'image/png' }]
      });

      navigator.mediaSession.setActionHandler('play', async () => {
        try {
          await videoRef.current?.play();
          setPlaying(true);
        } catch (e) {}
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        videoRef.current?.pause();
        setPlaying(false);
      });
      navigator.mediaSession.setActionHandler('nexttrack', playNext);
      
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }, [stream, isPlaying]);

  const [placeholderRect, setPlaceholderRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!isMinimized && location.pathname.startsWith('/watch/')) {
      const interval = setInterval(() => {
        const placeholder = document.getElementById('video-placeholder');
        if (placeholder) {
          setPlaceholderRect(placeholder.getBoundingClientRect());
        }
      }, 100);
      return () => clearInterval(interval);
    } else {
      setPlaceholderRect(null);
    }
  }, [isMinimized, location.pathname]);

  if (!currentVideo) return null;

  const handleMiniClick = () => {
    navigate(`/watch/${currentVideo.id}`);
    setMinimized(false);
  };

  const getFullStyle = (): React.CSSProperties => {
    if (placeholderRect) {
      return {
        top: placeholderRect.top,
        left: placeholderRect.left,
        width: placeholderRect.width,
        height: placeholderRect.height,
        position: 'fixed',
        borderRadius: '16px',
        overflow: 'hidden'
      };
    }
    return { display: 'none' };
  };

  return (
    <div 
      className={`global-player-wrapper ${isMinimized ? 'minimized' : 'full'}`}
      style={!isMinimized ? getFullStyle() : {}}
    >
      <div className="player-container" style={{ height: '100%' }}>
        {loading && <div className="player-loader"><Loading /></div>}
        
        <audio ref={silentAudioRef} loop src="data:audio/wav;base64,UklGRigAAABXQVZRTU9OAhAAMAAAgD0AAIA9AAACAAgAZGF0YAgAAAAAAAAA"></audio>
        
        {stream?.hls ? (
          <video 
            ref={videoRef} 
            controls={!isMinimized}
            autoPlay 
            playsInline
            webkit-playsinline="true"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={playNext}
            style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain', backgroundColor: '#000' }}
          />
        ) : (
          !loading && <iframe style={{ width: '100%', height: '100%' }} src={`https://www.youtube.com/embed/${currentVideo.id}?autoplay=1`} frameBorder="0" allowFullScreen></iframe>
        )}

        {isMinimized && (
          <div className="mini-info" onClick={handleMiniClick}>
            <div className="mini-text">
              <span className="title">{currentVideo.title}</span>
              <span className="uploader">{currentVideo.uploaderName}</span>
            </div>
            <div className="mini-controls">
              <button onClick={(e) => { e.stopPropagation(); isPlaying ? videoRef.current?.pause() : videoRef.current?.play(); }}>
                <i className="material-icons">{isPlaying ? 'pause' : 'play_arrow'}</i>
              </button>
              {queue.length > 0 && (
                <button onClick={(e) => { e.stopPropagation(); playNext(); }}>
                  <i className="material-icons">skip_next</i>
                </button>
              )}
              <button onClick={(e) => { e.stopPropagation(); setVideo(null); }}>
                <i className="material-icons">close</i>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
