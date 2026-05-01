import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPlaylistDetails } from '../api/piped';
import VideoCard from '../components/VideoCard';
import Loading from '../components/Loading';

export default function Playlist() {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      setLoading(true);
      getPlaylistDetails(id).then(data => {
        setPlaylist(data);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div style={{ marginTop: '20vh' }}><Loading /></div>;
  if (!playlist) return <div className="container center-align" style={{ marginTop: '20vh' }}><h5>Playlist not found</h5></div>;

  return (
    <div className="playlist-page">
      <div className="container" style={{ marginTop: '2rem', position: 'relative', zIndex: 10 }}>
        <div className="playlist-header" style={{ display: 'flex', alignItems: 'flex-start', gap: '2rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
          <div style={{ flex: 1, paddingBottom: '10px' }}>
            <h3 style={{ margin: 0, fontWeight: 700, letterSpacing: '-1px' }}>{playlist.title}</h3>
            <p className="grey-text" style={{ fontSize: '1.1rem', marginTop: '4px' }}>{playlist.author} • {playlist.videos?.length || 0} videos</p>
            {playlist.description && (
                <p className="grey-text" style={{ fontSize: '1rem', marginTop: '1rem', whiteSpace: 'pre-wrap' }}>{playlist.description}</p>
            )}
          </div>
        </div>

        <div style={{ marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
          <h5 style={{ fontWeight: 600, fontSize: '1.3rem' }}>Videos</h5>
        </div>

        <div className="row">
          {playlist.videos.map((v: any, idx: number) => (
            <div key={idx} className="col s12 m6 l4 xl3">
              <VideoCard video={v} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
