import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import Loading from '../components/Loading';
import Comments from '../components/Comments';

export default function Watch() {
  const { id } = useParams();
  const { currentVideo, setVideo, stream, setMinimized, queue, playNext, removeFromQueue } = usePlayer();

  useEffect(() => {
    if (id && (!currentVideo || currentVideo.id !== id)) {
      setVideo({ id, title: 'Loading...', uploaderName: '' });
    }
    setMinimized(false);
  }, [id]);

  if (!stream && !currentVideo) return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', marginTop: '20vh' }}>
      <Loading />
    </div>
  );

  return (
    <div className="container" style={{ marginTop: '2rem', paddingBottom: '4rem', maxWidth: '1200px' }}>
      <div className="row">
        <div className="col s12 m12 l8">
          <div id="video-placeholder" className="video-container" style={{ borderRadius: '16px', overflow: 'hidden', backgroundColor: '#000', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.05)', aspectRatio: '16/9' }}>
            {/* The GlobalPlayer will position itself over this placeholder */}
          </div>
          
          <div style={{ marginTop: '1.5rem' }}>
            <h4 style={{ fontWeight: 700, fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-main)', lineHeight: '1.3' }}>{stream?.title || currentVideo?.title}</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              
              {stream && (
                <Link to={stream.uploaderUrl} style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'inherit' }} className="uploader-link">
                  {stream.uploaderAvatar && (
                    <img src={stream.uploaderAvatar} alt={stream.uploader} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} />
                  )}
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-main)' }}>{stream.uploader}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{stream.likes ? stream.likes.toLocaleString() : 'N/A'} likes</div>
                  </div>
                </Link>
              )}

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }} className="hoverable">
                  <i className="material-icons" style={{ fontSize: '20px' }}>thumb_up</i>
                  <span style={{ fontWeight: 600 }}>{stream?.likes ? stream.likes.toLocaleString() : 'Like'}</span>
                </div>
                <div 
                  style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }} 
                  className="hoverable"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    M.toast({ html: 'Link copied!', classes: 'rounded' });
                  }}
                >
                  <i className="material-icons" style={{ fontSize: '20px' }}>share</i>
                  <span style={{ fontWeight: 600 }}>Share</span>
                </div>
              </div>

            </div>
          </div>

          {stream && (
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
          )}
          <Comments videoId={id!} />
        </div>
        
        <div className="col s12 m12 l4">
          {queue.length > 0 && (
            <>
              <h5 style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '1.2rem', paddingLeft: '0.5rem', color: 'var(--primary-accent)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="material-icons">queue_music</i>
                Queue ({queue.length})
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '16px' }}>
                {queue.map((video, idx) => (
                  <div key={`queue-${idx}`} style={{ display: 'flex', gap: '0.8rem', position: 'relative' }}>
                    <Link to={video.url!} onClick={() => playNext()} style={{ display: 'flex', gap: '0.8rem', flex: 1, textDecoration: 'none' }}>
                      <div style={{ flex: '0 0 120px' }}>
                        <img src={video.thumbnail} alt={video.title} style={{ width: '100%', borderRadius: '8px', aspectRatio: '16/9', objectFit: 'cover' }} />
                      </div>
                      <div style={{ flex: '1', minWidth: 0 }}>
                        <h6 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {video.title}
                        </h6>
                        <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{video.uploaderName}</p>
                      </div>
                    </Link>
                    <button 
                      onClick={() => removeFromQueue(idx)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                    >
                      <i className="material-icons" style={{ fontSize: '18px' }}>close</i>
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          <h5 style={{ fontWeight: 600, marginBottom: '1.5rem', fontSize: '1.2rem', paddingLeft: '0.5rem', color: 'var(--text-main)' }}>Up Next</h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {stream?.relatedStreams?.map((video, idx) => (
              <Link key={idx} to={video.url} onClick={() => setVideo(video)} style={{ display: 'flex', gap: '0.8rem', textDecoration: 'none' }} className="related-card">
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
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
