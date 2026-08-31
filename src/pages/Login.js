import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 600));
    if (user === 'admin' && pass === 'admin123') {
      onLogin();
    } else {
      setError('Invalid credentials. Please try again.');
    }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* Background medical image */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'url(https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'brightness(0.35)',
        zIndex: 0,
      }} />

      {/* Navy blue overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, rgba(10,35,66,0.85) 0%, rgba(15,52,96,0.75) 100%)',
        zIndex: 1,
      }} />

      {/* Subtle pattern overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.03) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%)',
        zIndex: 2,
      }} />

      {/* Logo top left */}
      <div style={{
        position: 'absolute',
        top: 28,
        left: 32,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        zIndex: 10,
      }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: 'rgba(192,21,42,0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          color: '#fff',
        }}>♥</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '.02em' }}>CardioTrack</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>JKCI Monitoring System</div>
        </div>
      </div>

      {/* Footer bottom left */}
      <div style={{
        position: 'absolute',
        bottom: 24,
        left: 32,
        zIndex: 10,
      }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
          Jakaya Kikwete Cardiac Institute · Dar es Salaam, Tanzania
        </div>
      </div>

      {/* Glass card */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: 420,
        margin: '0 20px',
        background: 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 20,
        padding: '40px 36px',
        boxShadow: '0 32px 64px rgba(0,0,0,0.4)',
      }}>
        {/* Header */}
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: 'rgba(192,21,42,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 26,
            color: '#fff',
            margin: '0 auto 16px',
            border: '1px solid rgba(255,255,255,0.2)',
          }}>♥</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Admin login</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
            Access restricted to authorised JKCI clinicians only
          </div>
        </div>

        {/* Form */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 6, letterSpacing: '.04em', textTransform: 'uppercase' }}>
            Username
          </label>
          <input
            value={user}
            onChange={e => setUser(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Enter username"
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 10,
              fontSize: 14,
              color: '#fff',
              outline: 'none',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
              transition: 'border .2s, background .2s',
            }}
            onFocus={e => { e.target.style.borderColor = 'rgba(255,255,255,0.5)'; e.target.style.background = 'rgba(255,255,255,0.15)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.2)'; e.target.style.background = 'rgba(255,255,255,0.1)'; }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 6, letterSpacing: '.04em', textTransform: 'uppercase' }}>
            Password
          </label>
          <input
            type="password"
            value={pass}
            onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="••••••••"
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 10,
              fontSize: 14,
              color: '#fff',
              outline: 'none',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
              transition: 'border .2s, background .2s',
            }}
            onFocus={e => { e.target.style.borderColor = 'rgba(255,255,255,0.5)'; e.target.style.background = 'rgba(255,255,255,0.15)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.2)'; e.target.style.background = 'rgba(255,255,255,0.1)'; }}
          />
        </div>

        {error && (
          <div style={{
            padding: '10px 14px',
            background: 'rgba(192,21,42,0.3)',
            border: '1px solid rgba(192,21,42,0.5)',
            borderRadius: 8,
            fontSize: 13,
            color: '#FCA5A5',
            marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%',
            padding: '13px',
            background: loading ? 'rgba(192,21,42,0.5)' : 'rgba(192,21,42,0.9)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            letterSpacing: '.02em',
            transition: 'background .2s, transform .1s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
          onMouseEnter={e => { if (!loading) e.target.style.background = 'rgba(192,21,42,1)'; }}
          onMouseLeave={e => { if (!loading) e.target.style.background = 'rgba(192,21,42,0.9)'; }}
        >
          {loading ? (
            <>
              <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              Signing in...
            </>
          ) : 'Sign in'}
        </button>

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6 }}>
          No account creation available<br />
          Contact your system administrator
        </div>

        {/* Divider line */}
        <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>System operational · v1.0</span>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(255,255,255,0.3); }
      `}</style>
    </div>
  );
}