import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

function getRisk(hr, spo2, temp) {
  if (hr > 120 || spo2 < 90 || temp > 39) return 'High';
  if (hr > 100 || spo2 < 93 || temp > 38) return 'Medium';
  return 'Low';
}

const riskStyle = {
  Low: { background: '#ECFDF5', color: '#0D9E6E' },
  Medium: { background: '#FFFBEB', color: '#D97706' },
  High: { background: '#FEF2F2', color: '#DC2626' },
};

export default function Reports({ dark = false, deviceId = 'CT-0001' }) {
  const [data, setData] = useState([]);
  const [timeFilter, setTimeFilter] = useState('Daily');
  const [loading, setLoading] = useState(true);

  const t = {
    surface: dark ? 'rgba(30,41,59,0.85)' : 'rgba(255,255,255,0.85)',
    surface2: dark ? 'rgba(15,23,42,0.5)' : 'rgba(248,250,252,0.9)',
    border: dark ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
    text: dark ? '#F1F5F9' : '#0F172A',
    textMuted: dark ? '#64748B' : '#94A3B8',
  };

  useEffect(() => {
    fetchData();
  }, [timeFilter, deviceId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchData() {
    setLoading(true);

    // Calculate time range based on filter
    const now = new Date();
    let since;

    if (timeFilter === 'Daily') {
      // Leo tu — kuanzia saa 00:00
      since = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    } else if (timeFilter === 'Weekly') {
      // Wiki hii — siku 7 zilizopita
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      since = weekAgo.toISOString();
    } else if (timeFilter === 'Monthly') {
      // Mwezi huu — siku 30 zilizopita
      const monthAgo = new Date(now);
      monthAgo.setDate(monthAgo.getDate() - 30);
      since = monthAgo.toISOString();
    }

    const { data: rows } = await supabase
      .from('vitals')
      .select('*')
      .eq('device_id', deviceId)
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(timeFilter === 'Daily' ? 200 : timeFilter === 'Weekly' ? 1000 : 5000);

    setData(rows || []);
    setLoading(false);
  }

  function exportCSV() {
    const rows = [
      ['Timestamp', 'HR (bpm)', 'SpO2 (%)', 'Temp (C)', 'BP (mmHg)', 'Risk'],
      ...data.map(r => [
        new Date(r.created_at).toLocaleString(),
        r.heart_rate, r.spo2, r.temperature,
        `${r.blood_pressure_sys}/${r.blood_pressure_dia}`,
        getRisk(r.heart_rate, r.spo2, r.temperature)
      ])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = `cardiotrack_${deviceId}_${timeFilter.toLowerCase()}_report.csv`;
    a.click();
  }

  const validData = data.filter(r => r.heart_rate > 0 && r.spo2 > 0);
  const avgHR = validData.length ? Math.round(validData.reduce((a, r) => a + r.heart_rate, 0) / validData.length) : '--';
  const avgSpo2 = validData.length ? (validData.reduce((a, r) => a + r.spo2, 0) / validData.length).toFixed(1) : '--';
  const alerts = validData.filter(r => r.heart_rate > 100 || r.spo2 < 93 || r.temperature > 38).length;

  const btnStyle = (active) => ({
    padding: '6px 14px', borderRadius: 20, border: '1px solid',
    fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
    background: active ? '#C0152A' : 'transparent',
    color: active ? '#fff' : t.textMuted,
    borderColor: active ? '#C0152A' : t.border,
    transition: 'all .15s',
  });

  return (
    <div style={{ padding: '20px 24px', minHeight: '100%' }}>

      {/* Filter bar */}
      <div style={{ background: t.surface, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: `1px solid ${t.border}`, borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: t.textMuted }}>Time range:</span>
        {['Daily', 'Weekly', 'Monthly'].map(f => (
          <button key={f} style={btnStyle(timeFilter === f)} onClick={() => setTimeFilter(f)}>{f}</button>
        ))}
        <div style={{ marginLeft: 4, fontSize: 11, color: t.textMuted }}>
          Device: <strong style={{ color: '#C0152A' }}>{deviceId}</strong>
          {' · '}
          {loading ? 'Loading...' : `${data.length} records`}
        </div>
        <button onClick={exportCSV} style={{ marginLeft: 'auto', padding: '8px 16px', background: '#C0152A', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
          <i className="ti ti-download" style={{ fontSize: 14 }} /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Average heart rate', value: avgHR, unit: 'bpm', sub: `${timeFilter} average` },
          { label: 'Average SpO₂', value: avgSpo2, unit: '%', sub: `${timeFilter} average` },
          { label: 'Alert events', value: alerts, unit: '', sub: `${timeFilter} total`, danger: alerts > 0 },
          { label: 'Total records', value: data.length, unit: '', sub: `${timeFilter} records` },
        ].map(s => (
          <div key={s.label} style={{ background: t.surface, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: `1px solid ${t.border}`, borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: t.textMuted, fontWeight: 500, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.danger ? '#DC2626' : t.text }}>
              {s.value} <span style={{ fontSize: 13, color: t.textMuted, fontWeight: 400 }}>{s.unit}</span>
            </div>
            <div style={{ fontSize: 11, color: t.textMuted, marginTop: 3 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: t.surface, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: `1px solid ${t.border}`, borderRadius: 12, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: t.textMuted, fontSize: 13 }}>Loading data...</div>
        ) : data.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: t.textMuted, fontSize: 13 }}>
            No data for {timeFilter.toLowerCase()} period — try Weekly or Monthly
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Timestamp', 'HR (bpm)', 'SpO₂ (%)', 'Temp (°C)', 'BP (mmHg)', 'Risk'].map(h => (
                <th key={h} style={{ fontSize: 11, fontWeight: 600, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '.05em', padding: '10px 16px', textAlign: 'left', background: t.surface2, borderBottom: `1px solid ${t.border}` }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {data.slice(0, 100).map((r, i) => {
                const risk = getRisk(r.heart_rate, r.spo2, r.temperature);
                return (
                  <tr key={i}
                    onMouseEnter={e => e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.03)' : '#F8FAFC'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ fontSize: 12, color: t.text, padding: '10px 16px', borderBottom: `1px solid ${t.border}` }}>{new Date(r.created_at).toLocaleString()}</td>
                    <td style={{ fontSize: 13, fontWeight: 600, padding: '10px 16px', borderBottom: `1px solid ${t.border}`, color: r.heart_rate > 100 || r.heart_rate < 60 ? '#EF4444' : '#10B981' }}>{r.heart_rate}</td>
                    <td style={{ fontSize: 13, fontWeight: 600, padding: '10px 16px', borderBottom: `1px solid ${t.border}`, color: r.spo2 < 93 ? '#EF4444' : '#10B981' }}>{r.spo2}</td>
                    <td style={{ fontSize: 13, fontWeight: 600, padding: '10px 16px', borderBottom: `1px solid ${t.border}`, color: r.temperature > 38 ? '#EF4444' : '#10B981' }}>{r.temperature}</td>
                    <td style={{ fontSize: 13, color: t.text, padding: '10px 16px', borderBottom: `1px solid ${t.border}` }}>{r.blood_pressure_sys}/{r.blood_pressure_dia}</td>
                    <td style={{ fontSize: 13, padding: '10px 16px', borderBottom: `1px solid ${t.border}` }}>
                      <span style={{ padding: '3px 10px', borderRadius: 10, fontSize: 11, fontWeight: 600, ...riskStyle[risk] }}>{risk}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}