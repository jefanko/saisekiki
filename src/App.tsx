import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Search from './pages/Search';
import Watch from './pages/Watch';
import Channel from './pages/Channel';
import NotFound from './pages/NotFound';

import { PlayerProvider } from './context/PlayerContext';
import GlobalPlayer from './components/GlobalPlayer';

function App() {
  return (
    <PlayerProvider>
      <div className="app-shell">
        <NavBar />
        <main style={{ minHeight: '80vh' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search/:query" element={<Search />} />
            <Route path="/watch/:id" element={<Watch />} />
            <Route path="/channel/:id" element={<Channel />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <GlobalPlayer />
        <footer style={{ padding: '2rem 0', marginTop: '4rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container center-align">
          <p className="grey-text">YT再生機器 &copy; 2026 • Made by 慎吾</p>
        </div>
      </footer>
      </div>
    </PlayerProvider>
  );
}

export default App;
