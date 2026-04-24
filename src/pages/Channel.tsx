import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getChannelDetails } from '../api/piped';
import VideoCard from '../components/VideoCard';
import Loading from '../components/Loading';

export default function Channel() {
  const { id } = useParams();
  const [channel, setChannel] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      setLoading(true);
      getChannelDetails(id).then(data => {
        setChannel(data);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div style={{ marginTop: '20vh' }}><Loading /></div>;
  if (!channel) return <div className="container center-align" style={{ marginTop: '20vh' }}><h5>Channel not found</h5></div>;

  return (
    <div className="channel-page">
      {channel.banner && (
        <div className="channel-banner" style={{ width: '100%', height: '250px', position: 'relative', overflow: 'hidden' }}>
          <img src={channel.banner} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="banner" />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(transparent, var(--bg-color))' }}></div>
        </div>
      )}
      
      <div className="container" style={{ marginTop: channel.banner ? '-50px' : '2rem', position: 'relative', zIndex: 10 }}>
        <div className="channel-header" style={{ display: 'flex', alignItems: 'flex-end', gap: '2rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
          <div style={{ padding: '4px', background: 'var(--bg-color)', borderRadius: '50%' }}>
            <img src={channel.avatar} style={{ width: '120px', height: '120px', borderRadius: '50%', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', border: '2px solid rgba(255,255,255,0.1)' }} alt="avatar" />
          </div>
          <div style={{ flex: 1, paddingBottom: '10px' }}>
            <h3 style={{ margin: 0, fontWeight: 700, letterSpacing: '-1px' }}>{channel.name}</h3>
            <p className="grey-text" style={{ fontSize: '1.1rem', marginTop: '4px' }}>{channel.subscribers} subscribers</p>
          </div>
        </div>

        <div style={{ marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
          <h5 style={{ fontWeight: 600, fontSize: '1.3rem' }}>Videos</h5>
        </div>

        <div className="row">
          {channel.videos.map((v: any, idx: number) => (
            <div key={idx} className="col s12 m6 l4 xl3">
              <VideoCard video={v} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
