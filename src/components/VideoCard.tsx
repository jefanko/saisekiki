import { Link } from 'react-router-dom';
import type { PipedVideo, PipedPlaylist } from '../types/piped';
import { usePlayer } from '../context/PlayerContext';

export default function VideoCard({ video }: { video: PipedVideo | PipedPlaylist }) {
  const { addToQueue, setMinimized } = usePlayer();

  const isPlaylist = video.type === 'playlist';

  let targetUrl = video.url;
  let videoId: string | null = null;

  if (!isPlaylist) {
    videoId = new URLSearchParams(video.url.split('?')[1]).get('v');
    targetUrl = `/watch/${videoId}`;
    if (!videoId) return null;
  }

  const handlePlay = () => {
    if (!isPlaylist) {
      setMinimized(false);
    }
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
        <Link to={targetUrl} onClick={handlePlay}>
          <img src={video.thumbnail} alt={video.title} style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }} />
          <div className="card-overlay">
            <i className="material-icons">{isPlaylist ? 'playlist_play' : 'play_arrow'}</i>
          </div>
          {!isPlaylist && (video as PipedVideo).duration > 0 && (
            <span className="video-duration">
              {new Date((video as PipedVideo).duration * 1000).toISOString().substr(11, 8).replace(/^[0:]+/, '')}
            </span>
          )}
          {isPlaylist && (
            <span className="video-duration" style={{ background: 'rgba(0,0,0,0.8)' }}>
              <i className="material-icons" style={{ fontSize: '14px', verticalAlign: 'middle', marginRight: '4px' }}>playlist_play</i>
              {(video as PipedPlaylist).videos}
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
              <Link to={targetUrl} onClick={handlePlay} style={{ color: 'var(--text-main)' }}>{video.title}</Link>
            </span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ minWidth: 0 }}>
                <p className="grey-text" style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {video.uploaderName}
                </p>
                {!isPlaylist && (
                  <p className="grey-text" style={{ fontSize: '0.8rem' }}>
                    {(video as PipedVideo).views.toLocaleString()} views
                  </p>
                )}
              </div>
              {!isPlaylist && (
                <button
                  onClick={handleAddToQueue}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                  title="Add to queue"
                >
                  <i className="material-icons" style={{ fontSize: '20px' }}>playlist_add</i>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
