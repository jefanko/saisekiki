import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container center-align" style={{ marginTop: '20vh', padding: '0 1rem' }}>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <i className="material-icons" style={{ fontSize: '150px', color: 'var(--primary-accent)', opacity: 0.1 }}>error_outline</i>
        <h1 style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          margin: 0,
          fontSize: '6rem',
          fontWeight: 800,
          color: 'var(--text-main)',
          textShadow: '0 0 30px rgba(255,77,77,0.3)'
        }}>404</h1>
      </div>
      <h3 style={{ marginTop: '2rem', fontWeight: 700 }}>Signal Lost</h3>
      <p className="grey-text" style={{ fontSize: '1.2rem', maxWidth: '500px', margin: '1rem auto 2rem' }}>
        This page has been removed or the signal is just too weak. Let's get you back to safety.
      </p>
      <Link to="/" className="btn-large waves-effect waves-light" style={{ 
        borderRadius: '30px', 
        backgroundColor: 'var(--primary-accent)',
        textTransform: 'none',
        fontWeight: 600,
        padding: '0 40px'
      }}>
        Return Home
      </Link>
    </div>
  );
}
