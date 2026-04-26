import { Link } from 'react-router-dom';
import type { PipedVideo } from '../types/piped';
import { usePlayer } from '../context/PlayerContext';

export default function VideoCard({ video }: { video: PipedVideo }) {
  const { setVideo, addToQueue, setMinimized } = usePlayer();
  const videoId = new URLSearchParams(video.url.split('?')[1]).get('v');

  if (!videoId) return null;

  const handlePlay = () => {
    // We let the Link handle navigation, Watch.tsx will handle setVideo
    setMinimized(false);
  };

  const handleAddToQueue = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToQueue({ ...video, id: videoId } as any);
    M.toast({ html: 'Added to queue', classes: 'rounded' });
  };

  return (
    <div className="card video-card-glass" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <div className="card-image" style={{ position: 'relative' }}>
        <Link to={`/watch/${videoId}`} onClick={handlePlay}>
          <img src={video.thumbnail} alt={video.title} style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }} />
          <div className="card-overlay">
            <i className="material-icons">play_arrow</i>
          </div>
          {video.duration > 0 && (
            <span className="video-duration">
              {new Date(video.duration * 1000).toISOString().substr(11, 8).replace(/^[0:]+/, '')}
            </span>
          )}
        </Link>
      </div>
      <div className="card-content" style={{ padding: '12px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          {video.uploaderAvatar && (
            <img 
              src={video.uploaderAvatar} 
              alt={video.uploaderName} 
              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} 
            />
          )}
          <div style={{ flexGrow: 1, minWidth: 0 }}>
            <span className="card-title-text" title={video.title}>
              <Link to={`/watch/${videoId}`} onClick={handlePlay} style={{ color: 'var(--text-main)' }}>{video.title}</Link>
            </span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ minWidth: 0 }}>
                <p className="grey-text" style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {video.uploaderName}
                </p>
                <p className="grey-text" style={{ fontSize: '0.8rem' }}>
                  {video.views.toLocaleString()} views
                </p>
              </div>
              <button 
                onClick={handleAddToQueue}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                title="Add to queue"
              >
                <i className="material-icons" style={{ fontSize: '20px' }}>playlist_add</i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
