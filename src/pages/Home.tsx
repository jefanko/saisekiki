import { useEffect, useState } from 'react';
import { getTrending } from '../api/piped';
import type { PipedVideo } from '../types/piped';
import VideoCard from '../components/VideoCard';
import Loading from '../components/Loading';

export default function Home() {
  const [videos, setVideos] = useState<PipedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTrending()
      .then(data => {
        setVideos(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <Loading />;
  if (error) return <div className="container red-text"><h5>Error: {error}</h5></div>;

  return (
    <div className="container" style={{ marginTop: '2rem' }}>
      <h4>Trending</h4>
      <div className="row">
        {videos.map((video, idx) => (
          <div className="col s12 m6 l4" key={`${video.url}-${idx}`}>
            <VideoCard video={video} />
          </div>
        ))}
      </div>
    </div>
  );
}
