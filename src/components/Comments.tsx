import { useEffect, useState } from 'react';
import { getComments } from '../api/piped';

export default function Comments({ videoId }: { videoId: string }) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getComments(videoId).then(data => {
      setComments(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [videoId]);

  if (loading) return (
    <div className="center-align" style={{ padding: '4rem 0' }}>
      <div className="preloader-wrapper small active">
        <div className="spinner-layer spinner-red-only">
          <div className="circle-clipper left"><div className="circle"></div></div>
          <div className="gap-patch"><div className="circle"></div></div>
          <div className="circle-clipper right"><div className="circle"></div></div>
        </div>
      </div>
      <p className="grey-text" style={{ marginTop: '1rem' }}>Loading comments...</p>
    </div>
  );

  return (
    <div className="comments-section" style={{ marginTop: '2rem' }}>
      <h5 style={{ marginBottom: '2rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '12px' }}>
        <i className="material-icons">comment</i>
        {comments.length} Comments
      </h5>
      
      {comments.length === 0 ? (
        <p className="grey-text center-align">No comments found for this video.</p>
      ) : (
        comments.map((c, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '1.2rem', marginBottom: '2rem' }}>
            <img 
              src={c.authorAvatar} 
              alt={c.authorName} 
              style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(255,255,255,0.05)' }} 
              onError={(e) => (e.currentTarget.src = 'https://www.gstatic.com/youtube/img/trending/avatar_v2.png')}
            />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>{c.authorName}</span>
                <span className="grey-text" style={{ fontSize: '0.85rem' }}>{c.published}</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.95rem', color: 'rgba(255,255,255,0.85)', lineHeight: '1.5' }}>{c.content}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <i className="material-icons" style={{ fontSize: '16px' }}>thumb_up</i>
                  {c.likeCount}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
