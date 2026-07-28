import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  function handleLogin() {
    if (user === 'admin' && pass === 'admin123') {
      onLogin();
    } else {
      setError('Incorrect credentials. Try again.');
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0F4F8' }}>
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 36, width: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, justifyContent: 'center' }}>
          <div style={{ width: 40, height: 40, background: '#1D6FDB', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="ti ti-heartbeat" style={{ color: '#fff', fontSize: 22 }} />
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#0F172A' }}>CardioTrack</div>
            <div style={{ fontSize: 10, color: '#94A3B8' }}>JKCI Remote Monitoring System</div>
          </div>
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, textAlign: 'center', marginBottom: 4, color: '#0F172A' }}>Admin login</div>
        <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 28 }}>Access restricted to authorised JKCI clinicians only</div>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Username</label>
        <input style={{ width: '100%', padding: '11px 14px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14, marginBottom: 14, background: '#F8FAFC', outline: 'none', fontFamily: 'inherit' }}
          value={user} onChange={e => setUser(e.target.value)} placeholder="admin"
          onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Password</label>
        <input style={{ width: '100%', padding: '11px 14px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14, marginBottom: 14, background: '#F8FAFC', outline: 'none', fontFamily: 'inherit' }}
          type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••"
          onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        {error && <div style={{ fontSize: 12, color: '#DC2626', marginBottom: 8 }}>{error}</div>}
        <button style={{ width: '100%', padding: 12, background: '#1D6FDB', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
          onClick={handleLogin}>Sign in</button>
        <div style={{ fontSize: 11, color: '#94A3B8', textAlign: 'center', marginTop: 16 }}>No account creation — contact your system administrator</div>
      </div>
    </div>
  );
}