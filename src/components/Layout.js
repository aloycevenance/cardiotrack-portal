import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const nav = [
  { path: '/dashboard', icon: 'ti-layout-dashboard', label: 'Dashboard' },
  { path: '/reports', icon: 'ti-file-analytics', label: 'Reports' },
  { path: '/settings', icon: 'ti-settings', label: 'Settings' },
];

export default function Layout({ children, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const active = location.pathname;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <aside style={{ width: 230, background: '#fff', borderRight: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: '#C0152A', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="ti ti-heartbeat" style={{ color: '#fff', fontSize: 20 }} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>CardioTrack</div>
              <div style={{ fontSize: 10, color: '#94A3B8' }}>Monitoring System</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '12px 8px' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#94A3B8', letterSpacing: '.08em', textTransform: 'uppercase', padding: '10px 10px 5px' }}>Main</div>
          {nav.map(item => (
            <div key={item.path} onClick={() => navigate(item.path)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500, marginBottom: 2, background: active === item.path ? '#FFF0F0' : 'transparent', color: active === item.path ? '#C0152A' : '#475569' }}>
              <i className={`ti ${item.icon}`} style={{ fontSize: 17, width: 17 }} />
              {item.label}
              {item.badge && <span style={{ marginLeft: 'auto', background: '#C0152A', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 10 }}>{item.badge}</span>}
            </div>
          ))}
        </nav>

        <div style={{ padding: 12, borderTop: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, borderRadius: 8, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#FFF0F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#C0152A' }}>AD</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#0F172A' }}>Admin</div>
              <div style={{ fontSize: 10, color: '#94A3B8' }}>Clinician</div>
            </div>
            <i className="ti ti-logout" onClick={onLogout} style={{ fontSize: 15, color: '#94A3B8', cursor: 'pointer' }} />
          </div>
        </div>
      </aside>

      <div style={{ flex: 1, overflowY: 'auto', background: '#F0F4F8' }}>
        {children}
      </div>
    </div>
  );
}