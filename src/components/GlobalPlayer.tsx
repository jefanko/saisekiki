import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Hls from 'hls.js';
import { usePlayer } from '../context/PlayerContext';
import { getStreamDetails } from '../api/piped';
import Loading from './Loading';

export default function GlobalPlayer() {
  const { currentVideo, setVideo, stream, setStream, isMinimized, setMinimized, playNext, isPlaying, setPlaying, queue, isAudioOnly } = usePlayer();
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
    if (stream && videoRef.current) {
      const video = videoRef.current;
      const sourceUrl = isAudioOnly && stream.audioOnlyUrl ? stream.audioOnlyUrl : stream.hls;
      
      if (!sourceUrl) return;

      const isHls = sourceUrl.includes('.m3u8');

      const currentTime = video.currentTime;
      const wasPlaying = !video.paused;

      if (isHls) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = sourceUrl;
        } else if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(sourceUrl);
          hls.attachMedia(video);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
             video.currentTime = currentTime;
             if (wasPlaying) video.play().catch(() => {});
          });

          return () => hls.destroy();
        }
      } else {
        video.src = sourceUrl;
        video.currentTime = currentTime;
        if (wasPlaying) video.play().catch(() => {});
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
  }, [stream, isAudioOnly]);

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

  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isMinimized) return;
    setDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragStart.current = { x: clientX, y: clientY };
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!dragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      
      const dx = clientX - dragStart.current.x;
      const dy = clientY - dragStart.current.y;
      
      setPosition(prev => ({
        x: Math.max(0, prev.x - dx),
        y: Math.max(0, prev.y - dy)
      }));
      
      dragStart.current = { x: clientX, y: clientY };
    };

    const handleEnd = () => setDragging(false);

    if (dragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('touchend', handleEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [dragging]);

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

  const getMiniStyle = (): React.CSSProperties => {
    return {
      bottom: `${position.y}px`,
      right: `${position.x}px`,
      cursor: dragging ? 'grabbing' : 'grab'
    };
  };

  const handlePlaybackRateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = parseFloat(e.target.value);
    }
  };

  return (
    <div 
      className={`global-player-wrapper ${isMinimized ? 'minimized' : 'full'}`}
      style={isMinimized ? getMiniStyle() : getFullStyle()}
      onMouseDown={isMinimized ? handleDragStart : undefined}
      onTouchStart={isMinimized ? handleDragStart : undefined}
    >
      <div className="player-container" style={{ height: isMinimized ? 'auto' : '100%', position: 'relative', pointerEvents: dragging ? 'none' : 'auto' }}>
        {loading && <div className="player-loader"><Loading /></div>}
        
        <audio ref={silentAudioRef} loop src="data:audio/wav;base64,UklGRigAAABXQVZRTU9OAhAAMAAAgD0AAIA9AAACAAgAZGF0YAgAAAAAAAAA"></audio>
        
        {stream?.hls || stream?.audioOnlyUrl ? (
          <>
            <video
              ref={videoRef}
              className="main-video-element"
              controls={!isMinimized}
              autoPlay
              playsInline
              webkit-playsinline="true"
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => {
                console.log("Video ended, triggering playNext");
                playNext();
              }}
              style={!isMinimized ? {
                width: '100%',
                height: '100%',
                display: 'block',
                objectFit: 'contain',
                backgroundColor: '#000'
              } : {}}
              poster={isAudioOnly && stream?.uploaderAvatar ? stream.uploaderAvatar : undefined}
            />
            {isAudioOnly && !isMinimized && stream?.uploaderAvatar && (
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111', pointerEvents: 'none' }}>
                <img src={stream.uploaderAvatar} alt="Audio only" style={{ width: '120px', height: '120px', borderRadius: '50%', marginBottom: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} />
                <h5 style={{ color: '#fff', margin: 0, fontWeight: 600 }}>Audio Mode</h5>
              </div>
            )}
            {!isMinimized && (
              <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}>
                <select
                  onChange={handlePlaybackRateChange}
                  defaultValue="1"
                  style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="0.25">0.25x</option>
                  <option value="0.5">0.5x</option>
                  <option value="0.75">0.75x</option>
                  <option value="1">1x (Normal)</option>
                  <option value="1.25">1.25x</option>
                  <option value="1.5">1.5x</option>
                  <option value="1.75">1.75x</option>
                  <option value="2">2x</option>
                </select>
              </div>
            )}
          </>
        ) : (
          !loading && <iframe 
            className="main-video-element"
            style={!isMinimized ? { width: '100%', height: '100%' } : {}} 
            src={`https://www.youtube.com/embed/${currentVideo.id}?autoplay=1`} 
            frameBorder="0" 
            allowFullScreen
          ></iframe>
        )}

        {isMinimized && (
          <div className="mini-info" onClick={handleMiniClick}>
            <div className="mini-text">
              <span className="title" title={currentVideo.title}>{currentVideo.title}</span>
              <span className="uploader">{currentVideo.uploaderName}</span>
            </div>
            <div className="mini-controls" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => isPlaying ? videoRef.current?.pause() : videoRef.current?.play()}>
                <i className="material-icons">{isPlaying ? 'pause' : 'play_arrow'}</i>
              </button>
              {queue && queue.length > 0 && (
                <button onClick={() => playNext()} title="Next from queue">
                  <i className="material-icons">skip_next</i>
                </button>
              )}
              <button onClick={() => setVideo(null)}>
                <i className="material-icons">close</i>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
