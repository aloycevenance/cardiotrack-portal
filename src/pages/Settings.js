import React, { useState } from 'react';

function Toggle({ on, onToggle, dark }) {
  return (
    <div onClick={onToggle} style={{ width: 40, height: 22, borderRadius: 11, background: on ? '#C0152A' : (dark ? '#334155' : '#E2E8F0'), position: 'relative', cursor: 'pointer', transition: 'background .2s', flexShrink: 0 }}>
      <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: on ? 20 : 2, transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.15)' }} />
    </div>
  );
}

export default function Settings({ dark = false, deviceId = 'CT-0001', deviceName = 'Device' }) {
  const [toggles, setToggles] = useState({ hr: true, spo2: true, temp: true, stream: true, log: true });
  const [pushSub, setPushSub] = useState('Last sync: 14:32:05 · 1,248 records sent today');

  function flip(key) { setToggles(t => ({ ...t, [key]: !t[key] })); }

  function pushNow() {
    setPushSub('Pushing data...');
    setTimeout(() => setPushSub('Last sync: ' + new Date().toTimeString().slice(0, 8) + ' · Data pushed successfully'), 1200);
  }

  const t = {
    surface: dark ? 'rgba(30,41,59,0.85)' : 'rgba(255,255,255,0.85)',
    surface2: dark ? 'rgba(15,23,42,0.5)' : 'rgba(248,250,252,0.9)',
    border: dark ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
    text: dark ? '#F1F5F9' : '#0F172A',
    textSec: dark ? '#94A3B8' : '#475569',
    textMuted: dark ? '#64748B' : '#94A3B8',
    metricBg: dark ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
  };

  return (
    <div style={{ padding: '20px 24px', minHeight: '100%' }}>

      {/* Device card */}
      <div style={{ background: t.surface, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: `1px solid ${t.border}`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>

          {/* Device icon — improved */}
          <div style={{ width: 52, height: 52, borderRadius: 14, background: dark ? 'rgba(192,21,42,0.2)' : '#FFF0F0', border: `2px solid ${dark ? 'rgba(192,21,42,0.4)' : '#FECACA'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <i className="ti ti-device-watch" style={{ fontSize: 26, color: '#C0152A' }} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: t.text }}>CardioTrack Wearable v1.0</div>
            <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>Device ID: {deviceId} · ESP32 · MAC: A4:CF:12:83:2B:11</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: dark ? 'rgba(16,185,129,0.15)' : '#ECFDF5', color: '#10B981', fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 20, border: '1px solid #10B981' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            Online
          </div>
        </div>

        {/* Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {[
            { v: '98%', l: 'Battery', c: '#10B981', icon: 'ti-battery-3' },
            { v: '-67 dBm', l: 'Signal (WiFi)', c: null, icon: 'ti-wifi' },
            { v: '5s', l: 'Send interval', c: null, icon: 'ti-clock' },
            { v: '4h 12m', l: 'Uptime', c: null, icon: 'ti-activity' },
          ].map(m => (
            <div key={m.l} style={{ background: t.metricBg, border: `1px solid ${t.border}`, borderRadius: 10, padding: '12px 8px', textAlign: 'center' }}>
              <i className={`ti ${m.icon}`} style={{ fontSize: 18, color: m.c || t.textMuted, marginBottom: 6, display: 'block' }} />
              <div style={{ fontSize: 18, fontWeight: 700, color: m.c || t.text }}>{m.v}</div>
              <div style={{ fontSize: 10, color: t.textMuted, marginTop: 3 }}>{m.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Alerts */}
        <div style={{ background: t.surface, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: `1px solid ${t.border}`, borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: t.textMuted, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 12 }}>
            <i className="ti ti-bell" style={{ fontSize: 13, marginRight: 6 }} />
            Alerts & notifications
          </div>
          {[
            { key: 'hr', name: 'Heart rate alerts', desc: 'Alert when HR > 100 or < 50 bpm' },
            { key: 'spo2', name: 'SpO₂ alerts', desc: 'Alert when SpO₂ drops below 93%' },
            { key: 'temp', name: 'Temperature alerts', desc: 'Alert when temp > 38°C or < 28°C' },
           
          ].map(s => (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: `1px solid ${t.border}` }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{s.name}</div>
                <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>{s.desc}</div>
              </div>
              <Toggle on={toggles[s.key]} onToggle={() => flip(s.key)} dark={dark} />
            </div>
          ))}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Push data */}
          <div style={{ background: t.surface, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: `1px solid ${t.border}`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: t.textMuted, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 12 }}>
              <i className="ti ti-upload" style={{ fontSize: 13, marginRight: 6 }} />
              Push data
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12, background: dark ? 'rgba(16,185,129,0.12)' : '#ECFDF5', border: `1px solid ${dark ? 'rgba(16,185,129,0.3)' : '#A7F3D0'}`, borderRadius: 8, marginBottom: 14 }}>
              <i className="ti ti-check-circle" style={{ fontSize: 18, color: '#10B981', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#10B981' }}>ML system connected</div>
                <div style={{ fontSize: 11, color: t.textSec, marginTop: 2 }}>{pushSub}</div>
              </div>
            </div>
            <button onClick={pushNow} style={{ width: '100%', padding: 11, background: '#C0152A', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background .15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#9B0E1E'}
              onMouseLeave={e => e.currentTarget.style.background = '#C0152A'}>
              <i className="ti ti-upload" style={{ fontSize: 15 }} /> Push data now
            </button>
          </div>

          {/* Data collection */}
          <div style={{ background: t.surface, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: `1px solid ${t.border}`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: t.textMuted, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 12 }}>
              <i className="ti ti-database" style={{ fontSize: 13, marginRight: 6 }} />
              Data collection
            </div>
            {[
              { key: 'stream', name: 'Real-time streaming', desc: 'Stream vitals to cloud every 5 seconds' },
              { key: 'log', name: 'Local data logging', desc: 'Store readings on device when offline' },
            ].map(s => (
              <div key={s.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: `1px solid ${t.border}` }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>{s.desc}</div>
                </div>
                <Toggle on={toggles[s.key]} onToggle={() => flip(s.key)} dark={dark} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
      `}</style>
    </div>
  );
}