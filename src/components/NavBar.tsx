import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import M from 'materialize-css';
import { getSearchSuggestions } from '../api/piped';
import { saveSearch } from '../utils/history';

export default function NavBar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const sidenavRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (sidenavRef.current) {
      M.Sidenav.init(sidenavRef.current);
    }
  }, []);

  useEffect(() => {
    if (query.trim().length > 1) {
      const delay = setTimeout(() => {
        getSearchSuggestions(query).then(setSuggestions);
      }, 300);
      return () => clearTimeout(delay);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const handleSearch = (e: React.FormEvent | string) => {
    if (typeof e !== 'string') e.preventDefault();
    const finalQuery = typeof e === 'string' ? e : query;
    
    if (finalQuery.trim()) {
      saveSearch(finalQuery.trim());
      navigate(`/search/${encodeURIComponent(finalQuery.trim())}`);
      setShowSuggestions(false);
      setQuery(finalQuery.trim());
      const sidenavInstance = M.Sidenav.getInstance(sidenavRef.current!);
      if (sidenavInstance && sidenavInstance.isOpen) {
        sidenavInstance.close();
      }
    }
  };

  return (
    <>
      <div className="navbar-fixed">
        <nav className="nav-wrapper">
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Link to="/" className="brand-logo left" style={{ display: 'flex', alignItems: 'center', height: '100%', minWidth: '150px' }}>
                <img src="/logo.png" alt="YT再生機器" style={{ height: '55px', width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)', transform: 'scale(1.1)' }} />
              </Link>
            </div>
            <ul className="right hide-on-med-and-down" style={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}>
              <li style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
                <form onSubmit={handleSearch}>
                  <div className="search-wrapper">
                    <i className="material-icons prefix">search</i>
                    <input 
                      id="search" 
                      type="search" 
                      placeholder="Search for videos..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      autoComplete="off"
                      required
                    />
                    {query && <i className="material-icons suffix" onClick={() => setQuery('')}>close</i>}
                  </div>
                </form>
                {showSuggestions && suggestions.length > 0 && (
                  <ul className="suggestions-dropdown card">
                    {suggestions.map((s, idx) => (
                      <li key={idx} onClick={() => handleSearch(s)}>
                        <i className="material-icons">search</i>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            </ul>
            <a href="#" data-target="mobile-demo" className="sidenav-trigger right" style={{ margin: 0 }}><i className="material-icons">menu</i></a>
          </div>
        </nav>
      </div>

      <ul className="sidenav" id="mobile-demo" ref={sidenavRef}>
        <li>
          <div className="user-view" style={{ padding: '32px 32px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
            <img src="/logo.png" alt="YT再生機器" style={{ height: '120px', width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)', transform: 'scale(1.2)' }} />
          </div>
        </li>
        <li>
          <form onSubmit={handleSearch} style={{ padding: '0 1rem', marginTop: '1rem' }}>
            <div className="search-wrapper">
              <i className="material-icons prefix">search</i>
              <input 
                id="search-mobile" 
                type="search" 
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                required
              />
            </div>
          </form>
        </li>
        <li><Link to="/"><i className="material-icons">home</i>Home</Link></li>
        <li><div className="divider"></div></li>
        <li><a className="subheader">Explore</a></li>
        <li><Link to="/"><i className="material-icons">trending_up</i>Trending</Link></li>
      </ul>
    </>
  );
}
