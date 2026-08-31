import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Layout({ children, onLogout, dark, setDark, deviceSelected, deviceName }) {
  const navigate = useNavigate();
  const location = useLocation();
  const active = location.pathname;

  const t = {
    border: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    text: dark ? '#F1F5F9' : '#0A2342',
    textSec: dark ? '#94A3B8' : '#475569',
    textMuted: dark ? '#64748B' : '#94A3B8',
    activeText: dark ? '#93C5FD' : '#0A2342',
    activeBg: dark ? 'rgba(147,197,253,0.1)' : 'rgba(10,35,66,0.08)',
    footerBg: dark ? 'rgba(255,255,255,0.05)' : 'rgba(10,35,66,0.05)',
  };

  const mainNav = [
    { path: '/patients', icon: 'ti-users', label: 'Patients' },
  ];

  const deviceNav = [
    { path: '/dashboard', icon: 'ti-layout-dashboard', label: 'Dashboard' },
    { path: '/reports', icon: 'ti-file-analytics', label: 'Reports' },
    { path: '/settings', icon: 'ti-settings', label: 'Settings' },
  ];

  function NavItem({ item }) {
    return (
      <div onClick={() => navigate(item.path)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '9px 12px', borderRadius: 8, cursor: 'pointer',
          fontSize: 13, fontWeight: 500, marginBottom: 2,
          background: active === item.path ? t.activeBg : 'transparent',
          color: active === item.path ? t.activeText : t.textSec,
          transition: 'all .15s',
          borderLeft: active === item.path ? '3px solid #C0152A' : '3px solid transparent',
        }}>
        <i className={`ti ${item.icon}`} style={{ fontSize: 17, width: 17 }} />
        {item.label}
        {item.badge && (
          <span style={{ marginLeft: 'auto', background: '#C0152A', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 10 }}>
            {item.badge}
          </span>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', position: 'relative' }}>

      {/* Medical background */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url("https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1600&q=80")`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        zIndex: 0, pointerEvents: 'none',
      }} />

      {/* Overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: dark ? 'rgba(10,22,40,0.75)' : 'rgba(241,245,249,0.65)',
        zIndex: 1, pointerEvents: 'none', transition: 'background .3s',
      }} />

      {/* Sidebar */}
      <aside style={{
        width: 230,
        background: dark ? 'rgba(10,18,35,0.8)' : 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderRight: `1px solid ${t.border}`,
        display: 'flex', flexDirection: 'column', flexShrink: 0,
        position: 'relative', zIndex: 10,
      }}>

        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: `1px solid ${t.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: '#C0152A', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#fff', flexShrink: 0 }}>♥</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: t.text }}>CardioTrack</div>
              <div style={{ fontSize: 10, color: t.textMuted }}>JKCI Monitoring System</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>

          {/* Main nav — always visible */}
          <div style={{ fontSize: 10, fontWeight: 600, color: t.textMuted, letterSpacing: '.08em', textTransform: 'uppercase', padding: '10px 10px 5px' }}>Main</div>
          {mainNav.map(item => <NavItem key={item.path} item={item} />)}

          {/* Device nav — only after selecting a device */}
          {deviceSelected && (
            <>
              <div style={{ fontSize: 10, fontWeight: 600, color: t.textMuted, letterSpacing: '.08em', textTransform: 'uppercase', padding: '16px 10px 5px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                {deviceName || 'Device'}
              </div>
              {deviceNav.map(item => <NavItem key={item.path} item={item} />)}
            </>
          )}
        </nav>

        {/* Footer */}
        <div style={{ padding: 12, borderTop: `1px solid ${t.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 8, background: t.footerBg, marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: t.textSec, fontWeight: 500 }}>
              {dark ? '🌙 Dark mode' : '☀️ Light mode'}
            </span>
            <div onClick={() => setDark(!dark)} style={{ width: 40, height: 22, borderRadius: 11, background: dark ? '#C0152A' : '#CBD5E1', position: 'relative', cursor: 'pointer', transition: 'background .2s', flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: 3, left: dark ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, borderRadius: 8, background: t.footerBg, border: `1px solid ${t.border}` }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: dark ? 'rgba(192,21,42,0.3)' : 'rgba(10,35,66,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: dark ? '#FCA5A5' : '#0A2342' }}>AD</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: t.text }}>Admin</div>
              <div style={{ fontSize: 10, color: t.textMuted }}>JKCI Clinician</div>
            </div>
            <i className="ti ti-logout" onClick={onLogout} style={{ fontSize: 15, color: t.textMuted, cursor: 'pointer' }} />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative', zIndex: 5 }}>
        {children}
      </div>
    </div>
  );
}