import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

const devices = [
  { id: 'CT-0001', condition: 'Hypertension' },

];

export default function Patients({ dark = false, onSelectDevice }) {
  const [latestVitals, setLatestVitals] = useState({});

  const t = {
    surface: dark ? 'rgba(30,41,59,0.85)' : 'rgba(255,255,255,0.85)',
    surface2: dark ? 'rgba(15,23,42,0.5)' : 'rgba(248,250,252,0.9)',
    border: dark ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
    text: dark ? '#F1F5F9' : '#0F172A',
    textSec: dark ? '#94A3B8' : '#475569',
    textMuted: dark ? '#64748B' : '#94A3B8',
    accent: '#C0152A',
  };

  useEffect(() => {
    fetchAllLatest();
  }, []);

  async function fetchAllLatest() {
    const results = {};
    for (const d of devices) {
      const { data } = await supabase
        .from('vitals')
        .select('*')
        .eq('device_id', d.id)
        .order('created_at', { ascending: false })
        .limit(1);
      if (data && data.length > 0) results[d.id] = data[0];
    }
    setLatestVitals(results);
  }

function getRisk(v) {
  if (!v) return { label: 'No data', color: '#94A3B8', bg: dark ? 'rgba(100,116,139,0.15)' : '#F8FAFC' };
  
  const hr = Number(v.heart_rate);
  const spo2 = Number(v.spo2);
  const temp = Number(v.temperature);
  const rr = Number(v.respiratory_rate);

  
  if (hr > 130 || hr < 40 || spo2 < 88 || temp > 40 || rr > 30) 
    return { label: 'Critical', color: '#EF4444', bg: dark ? 'rgba(239,68,68,0.15)' : '#FEF2F2' };
  
 
  if (hr > 110 || hr < 50 || spo2 < 92 || temp > 38.5 || rr > 24) 
    return { label: 'High', color: '#C0152A', bg: dark ? 'rgba(192,21,42,0.15)' : '#FFF0F0' };
  
 
  if (hr > 100 || hr < 55 || spo2 < 95 || temp > 37.5 || rr > 20) 
    return { label: 'Medium', color: '#F59E0B', bg: dark ? 'rgba(245,158,11,0.15)' : '#FFFBEB' };
  
 
  return { label: 'Low', color: '#10B981', bg: dark ? 'rgba(16,185,129,0.15)' : '#F0FDF4' };
}

  const critical = devices.filter(d => getRisk(latestVitals[d.id]).label === 'Critical').length;
  const high = devices.filter(d => getRisk(latestVitals[d.id]).label === 'High').length;
  const medium = devices.filter(d => getRisk(latestVitals[d.id]).label === 'Medium').length;
  const low = devices.filter(d => getRisk(latestVitals[d.id]).label === 'Low').length;

  return (
    <div style={{ padding: '20px 24px', minHeight: '100%' }}>

      {/* Header */}
      <div style={{ background: t.surface, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: `1px solid ${t.border}`, borderRadius: 12, padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>Patient devices</div>
          <div style={{ fontSize: 11, color: t.textMuted, marginTop: 1 }}>JKCI — {devices.length} registered devices</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: dark ? 'rgba(16,185,129,0.15)' : '#ECFDF5', color: '#10B981', fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 20, border: '1px solid #10B981' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
          {devices.length} devices
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total devices', value: devices.length, color: t.text },
          { label: 'Critical', value: critical, color: '#EF4444' },
          { label: 'High risk', value: high, color: '#C0152A' },
            { label: 'medium risk', value: medium, color: '#F59E0B' },
          { label: 'Low risk', value: low, color: '#10B981' },
        ].map(s => (
          <div key={s.label} style={{ background: t.surface, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: `1px solid ${t.border}`, borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: t.surface, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: `1px solid ${t.border}`, borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Device ID', 'Condition', 'HR (bpm)', 'SpO₂ (%)', 'Temp (°C)', 'Risk', ''].map(h => (
                <th key={h} style={{ fontSize: 11, fontWeight: 600, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '.05em', padding: '10px 14px', textAlign: 'left', background: t.surface2, borderBottom: `1px solid ${t.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {devices.map(d => {
              const v = latestVitals[d.id];
              const risk = getRisk(v);
              return (
                <tr key={d.id}
                  onMouseEnter={e => e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.03)' : '#F8FAFC'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                  {/* Device ID */}
                  <td style={{ padding: '12px 14px', borderBottom: `1px solid ${t.border}` }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: t.accent, fontFamily: 'monospace' }}>{d.id}</span>
                  </td>

                  {/* Condition */}
                  <td style={{ padding: '12px 14px', borderBottom: `1px solid ${t.border}`, fontSize: 13, color: t.textSec }}>{d.condition}</td>

                  {/* HR */}
                  <td style={{ padding: '12px 14px', borderBottom: `1px solid ${t.border}`, fontSize: 13, fontWeight: 600, color: v && (v.heart_rate > 100 || v.heart_rate < 60) ? '#EF4444' : '#10B981' }}>
                    {v ? v.heart_rate : '--'}
                  </td>

                  {/* SpO2 */}
                  <td style={{ padding: '12px 14px', borderBottom: `1px solid ${t.border}`, fontSize: 13, fontWeight: 600, color: v && v.spo2 < 93 ? '#EF4444' : '#10B981' }}>
                    {v ? v.spo2 : '--'}
                  </td>

                  {/* Temp */}
                  <td style={{ padding: '12px 14px', borderBottom: `1px solid ${t.border}`, fontSize: 13, fontWeight: 600, color: v && v.temperature > 38 ? '#EF4444' : '#10B981' }}>
                    {v ? v.temperature : '--'}
                  </td>

                  {/* Risk */}
                  <td style={{ padding: '12px 14px', borderBottom: `1px solid ${t.border}` }}>
                    <span style={{ padding: '3px 10px', borderRadius: 10, fontSize: 11, fontWeight: 600, background: risk.bg, color: risk.color }}>{risk.label}</span>
                  </td>

                  {/* View button */}
                  <td style={{ padding: '12px 14px', borderBottom: `1px solid ${t.border}` }}>
                    <button
                      onClick={() => onSelectDevice(d)}
                      style={{ padding: '6px 16px', background: '#C0152A', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'background .15s' }}
                      onMouseEnter={e => e.target.style.background = '#9B0E1E'}
                      onMouseLeave={e => e.target.style.background = '#C0152A'}>
                      View →
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}