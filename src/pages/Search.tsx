import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { searchVideos } from '../api/piped';
import type { PipedVideo } from '../types/piped';
import VideoCard from '../components/VideoCard';
import Loading from '../components/Loading';

export default function Search() {
  const { query } = useParams();
  const [videos, setVideos] = useState<PipedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    searchVideos(query)
      .then(data => {
        setVideos(data.items);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [query]);

  if (loading) return <Loading />;
  if (error) return <div className="container red-text"><h5>Error: {error}</h5></div>;

  return (
    <div className="container" style={{ marginTop: '2rem' }}>
      <h4>Search Results: {query}</h4>
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
