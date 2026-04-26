import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Hls from 'hls.js';
import { getStreamDetails } from '../api/piped';
import type { PipedStreamResponse } from '../types/piped';
import Loading from '../components/Loading';
import Comments from '../components/Comments';
import { saveToHistory } from '../utils/history';

export default function Watch() {
  const { id } = useParams();
  const [stream, setStream] = useState<PipedStreamResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const silentAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getStreamDetails(id)
      .then(data => {
        setStream(data);
        setLoading(false);
        saveToHistory({
          id,
          title: data.title,
          thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
          uploaderName: data.uploader,
          views: data.views,
          url: `/watch?v=${id}`
        });
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (stream?.hls && videoRef.current) {
      const isHls = stream.hls.includes('.m3u8');
      const video = videoRef.current;
      
      if (isHls) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // Prefer native HLS for iOS background support
          video.src = stream.hls;
        } else if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(stream.hls);
          hls.attachMedia(video);
          return () => hls.destroy();
        }
      } else {
        // For raw MP4/googlevideo URLs, using native src often bypasses 
        // some CORS restrictions that Hls.js XHR requests hit.
        video.src = stream.hls;
      }

      const playSilent = () => {
        silentAudioRef.current?.play().catch(() => {});
      };
      const pauseSilent = () => {
        silentAudioRef.current?.pause();
      };

      video.addEventListener('play', playSilent);
      video.addEventListener('pause', pauseSilent);

      return () => {
        video.removeEventListener('play', playSilent);
        video.removeEventListener('pause', pauseSilent);
      };
    }
  }, [stream]);

  const handleShare = () => {
    const url = window.location.href;
    const title = stream?.title || 'Check out this video';

    if (navigator.share) {
      navigator.share({
        title,
        url,
      }).catch(() => {
        navigator.clipboard.writeText(url);
        M.toast({ html: 'Link copied to clipboard!', displayLength: 3000, classes: 'rounded' });
      });
    } else {
      navigator.clipboard.writeText(url);
      M.toast({ html: 'Link copied to clipboard!', displayLength: 3000, classes: 'rounded' });
    }
  };

  useEffect(() => {
    if ('mediaSession' in navigator && stream) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: stream.title,
        artist: stream.uploader,
        artwork: [
          { src: stream.uploaderAvatar || '', sizes: '512x512', type: 'image/png' },
        ]
      });

      navigator.mediaSession.setActionHandler('play', async () => {
        try {
          await videoRef.current?.play();
          navigator.mediaSession.playbackState = 'playing';
        } catch (e) {}
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        videoRef.current?.pause();
        navigator.mediaSession.playbackState = 'paused';
      });
      navigator.mediaSession.setActionHandler('seekbackward', () => {
        if (videoRef.current) videoRef.current.currentTime -= 10;
      });
      navigator.mediaSession.setActionHandler('seekforward', () => {
        if (videoRef.current) videoRef.current.currentTime += 10;
      });
      
      // Setting playbackState helps iOS recognize active media
      navigator.mediaSession.playbackState = 'playing';

      const updatePositionState = () => {
        if ('setPositionState' in navigator.mediaSession && videoRef.current && isFinite(videoRef.current.duration)) {
          try {
            navigator.mediaSession.setPositionState({
              duration: videoRef.current.duration,
              playbackRate: videoRef.current.playbackRate,
              position: videoRef.current.currentTime,
            });
          } catch (e) {}
        }
      };

      const video = videoRef.current;
      if (video) {
        video.addEventListener('timeupdate', updatePositionState);
        return () => {
          video.removeEventListener('timeupdate', updatePositionState);
        };
      }
    }
  }, [stream]);

  if (loading) return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', marginTop: '20vh' }}>
      <Loading />
    </div>
  );

  if (error || !stream) return (
    <div className="container" style={{ marginTop: '2rem' }}>
      <div className="card" style={{ padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,77,77,0.3)', backgroundColor: 'rgba(255,77,77,0.05)' }}>
        <h5 style={{ margin: 0, color: 'var(--primary-accent)' }}>Error: {error || 'Stream not found'}</h5>
      </div>
    </div>
  );

  return (
    <div className="container" style={{ marginTop: '2rem', paddingBottom: '4rem', maxWidth: '1200px' }}>
      <div className="row">
        <div className="col s12 m12 l8">
          <div className="video-container" style={{ borderRadius: '16px', overflow: 'hidden', backgroundColor: '#000', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
            {stream.hls ? (
              <>
                <audio ref={silentAudioRef} loop src="data:audio/wav;base64,UklGRigAAABXQVZRTU9OAhAAMAAAgD0AAIA9AAACAAgAZGF0YAgAAAAAAAAA"></audio>
                <video 
                  ref={videoRef} 
                  controls 
                  autoPlay 
                  playsInline
                  webkit-playsinline="true"
                  className="responsive-video" 
                  style={{ width: '100%', display: 'block' }}
                  onError={() => {
                    // If native playback fails (e.g. 403), force the iframe fallback
                    console.log("Native playback failed, falling back to iframe");
                    setStream({...stream, hls: ''}); 
                  }}
                ></video>
              </>
            ) : (
              <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${id}?autoplay=1`} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
            )}
          </div>
          
          <div style={{ marginTop: '1.5rem' }}>
            <h4 style={{ fontWeight: 700, fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-main)', lineHeight: '1.3' }}>{stream.title}</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              
              <Link to={stream.uploaderUrl} style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'inherit' }} className="uploader-link">
                {stream.uploaderAvatar && (
                  <img src={stream.uploaderAvatar} alt={stream.uploader} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} />
                )}
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-main)' }}>{stream.uploader}</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{stream.likes ? stream.likes.toLocaleString() : 'N/A'} likes</div>
                </div>
              </Link>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }} className="hoverable">
                  <i className="material-icons" style={{ fontSize: '20px' }}>thumb_up</i>
                  <span style={{ fontWeight: 600 }}>{stream.likes ? stream.likes.toLocaleString() : 'Like'}</span>
                </div>
                <div 
                  style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }} 
                  className="hoverable"
                  onClick={handleShare}
                >
                  <i className="material-icons" style={{ fontSize: '20px' }}>share</i>
                  <span style={{ fontWeight: 600 }}>Share</span>
                </div>
              </div>

            </div>
          </div>

          <div className="card" style={{ marginTop: '1.5rem', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.03)', boxShadow: 'none' }}>
            <div className="card-content">
              <p style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                {stream.views ? stream.views.toLocaleString() : 0} views • {stream.uploadDate}
              </p>
              <p style={{ whiteSpace: 'pre-wrap', color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                {stream.description}
              </p>
            </div>
          </div>
          <Comments videoId={id!} />
        </div>
        
        <div className="col s12 m12 l4">
          <h5 style={{ fontWeight: 600, marginBottom: '1.5rem', fontSize: '1.2rem', paddingLeft: '0.5rem', color: 'var(--text-main)' }}>Up Next</h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {stream.relatedStreams?.map((video, idx) => (
              <Link key={idx} to={video.url} style={{ display: 'flex', gap: '0.8rem', textDecoration: 'none' }} className="related-card">
                <div style={{ flex: '0 0 160px', position: 'relative' }}>
                  <img src={video.thumbnail} alt={video.title} style={{ width: '100%', borderRadius: '12px', aspectRatio: '16/9', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.05)' }} />
                  {video.duration > 0 && (
                    <span style={{ position: 'absolute', bottom: '6px', right: '6px', background: 'rgba(0,0,0,0.85)', color: '#fff', fontSize: '11px', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                      {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                    </span>
                  )}
                </div>
                <div style={{ flex: '1', minWidth: 0 }}>
                  <h6 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4' }}>
                    {video.title}
                  </h6>
                  <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{video.uploaderName}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>{video.uploadedDate}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
