import { Link } from 'react-router-dom';
import type { PipedVideo } from '../types/piped';

export default function VideoCard({ video }: { video: PipedVideo }) {
  const videoId = new URLSearchParams(video.url.split('?')[1]).get('v');

  if (!videoId) return null; // Fallback if url is malformed

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="card-image" style={{ position: 'relative' }}>
        <Link to={`/watch/${videoId}`}>
          <img src={video.thumbnail} alt={video.title} style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }} />
          {video.duration > 0 && (
            <span style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontWeight: 500
            }}>
              {new Date(video.duration * 1000).toISOString().substr(11, 8).replace(/^[0:]+/, '')}
            </span>
          )}
        </Link>
      </div>
      <div className="card-content" style={{ padding: '16px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          {video.uploaderAvatar && (
            <img 
              src={video.uploaderAvatar} 
              alt={video.uploaderName} 
              style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} 
            />
          )}
          <div>
            <span className="card-title" style={{ fontSize: '1.05rem', fontWeight: 600, lineHeight: '1.4', marginBottom: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} title={video.title}>
              <Link to={`/watch/${videoId}`}>{video.title}</Link>
            </span>
            <p className="grey-text" style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {video.uploaderName} {video.uploaderVerified && <i className="material-icons" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>check_circle</i>}
            </p>
            <p className="grey-text" style={{ fontSize: '0.85rem' }}>
              {video.views.toLocaleString()} views • {video.uploadedDate || 'Unknown date'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
