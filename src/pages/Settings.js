import React, { useState } from 'react';

function Toggle({ on, onToggle }) {
  return (
    <div onClick={onToggle} style={{ width: 40, height: 22, borderRadius: 11, background: on ? '#C0152A' : '#E2E8F0', position: 'relative', cursor: 'pointer', transition: 'background .2s', flexShrink: 0 }}>
      <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: on ? 20 : 2, transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.15)' }} />
    </div>
  );
}

export default function Settings() {
  const [toggles, setToggles] = useState({ hr: true, spo2: true, temp: true, email: false, stream: true, log: true });
  const [pushSub, setPushSub] = useState('Last sync: 14:32:05 · 1,248 records sent today');

  function flip(key) { setToggles(t => ({ ...t, [key]: !t[key] })); }

  function pushNow() {
    setPushSub('Pushing data...');
    setTimeout(() => setPushSub('Last sync: ' + new Date().toTimeString().slice(0, 8) + ' · Data pushed successfully'), 1200);
  }

  return (
    <div style={{ padding: '20px 24px' }}>
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#FFF0F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="ti ti-device-watch" style={{ fontSize: 22, color: '#C0152A' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>CardioTrack Wearable v1.0</div>
            <div style={{ fontSize: 11, color: '#94A3B8' }}>Device ID: CT-ESP32-0042 · ESP32 · MAC: A4:CF:12:83:2B:11</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#ECFDF5', color: '#0D9E6E', fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 20, border: '1px solid #A7F3D0' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#0D9E6E', display: 'inline-block' }} /> Online
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {[{ v: '98%', l: 'Battery', c: '#0D9E6E' }, { v: '-67 dBm', l: 'Signal (WiFi)' }, { v: '5s', l: 'Send interval' }, { v: '4h 12m', l: 'Uptime' }].map(m => (
            <div key={m.l} style={{ background: '#F8FAFC', borderRadius: 8, padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: m.c || '#0F172A' }}>{m.v}</div>
              <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 3 }}>{m.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 12 }}>Alerts & notifications</div>
          {[
            { key: 'hr', name: 'Heart rate alerts', desc: 'Alert when HR > 100 or < 50 bpm' },
            { key: 'spo2', name: 'SpO₂ alerts', desc: 'Alert when SpO₂ drops below 93%' },
            { key: 'temp', name: 'Temperature alerts', desc: 'Alert when temp > 38°C or < 35°C' },
            { key: 'email', name: 'Email notifications', desc: 'Send alerts to clinician email' },
          ].map(s => (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #E2E8F0' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{s.name}</div>
                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{s.desc}</div>
              </div>
              <Toggle on={toggles[s.key]} onToggle={() => flip(s.key)} />
            </div>
          ))}
        </div>

        <div>
          <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: 20, marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 12 }}>Push data</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12, background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 8, marginBottom: 14 }}>
              <i className="ti ti-check-circle" style={{ fontSize: 18, color: '#0D9E6E' }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0D9E6E' }}>ML system connected</div>
                <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{pushSub}</div>
              </div>
            </div>
            <button onClick={pushNow} style={{ width: '100%', padding: 11, background: '#C0152A', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
              <i className="ti ti-upload" style={{ fontSize: 15 }} /> Push data now
            </button>
            <button style={{ width: '100%', padding: 11, background: '#F8FAFC', color: '#0F172A', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <i className="ti ti-settings" style={{ fontSize: 15 }} /> Configure ML endpoint
            </button>
          </div>

          <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 12 }}>Data collection</div>
            {[
              { key: 'stream', name: 'Real-time streaming', desc: 'Stream vitals to cloud every 5 seconds' },
              { key: 'log', name: 'Local data logging', desc: 'Store readings on device when offline' },
            ].map(s => (
              <div key={s.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #E2E8F0' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{s.desc}</div>
                </div>
                <Toggle on={toggles[s.key]} onToggle={() => flip(s.key)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}