import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

const riskStyle = {
  Low: { background: '#ECFDF5', color: '#0D9E6E' },
  Medium: { background: '#FFFBEB', color: '#D97706' },
  High: { background: '#FEF2F2', color: '#DC2626' },
};

function getRisk(hr, spo2, temp) {
  if (hr > 120 || spo2 < 90 || temp > 39) return 'High';
  if (hr > 100 || spo2 < 93 || temp > 38) return 'Medium';
  return 'Low';
}

export default function Reports() {
  const [data, setData] = useState([]);
  const [timeFilter, setTimeFilter] = useState('Daily');
  const [loading, setLoading] = useState(true);

 useEffect(() => {
    fetchData();
    // eslint-disable-line react-hooks/exhaustive-deps
  }, [timeFilter]);

  async function fetchData() {
    setLoading(true);
    let hoursBack = 24;
    if (timeFilter === 'Weekly') hoursBack = 168;
    if (timeFilter === 'Monthly') hoursBack = 720;

    const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();

    const { data: rows } = await supabase
      .from('vitals')
      .select('*')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(100);

    setData(rows || []);
    setLoading(false);
  }

  function exportCSV() {
    const rows = [['Timestamp','HR','SpO2','Temp','RR','BP Sys','BP Dia','Risk'],
      ...data.map(r => [
        new Date(r.created_at).toLocaleString(),
        r.heart_rate, r.spo2, r.temperature,
        r.respiratory_rate, r.blood_pressure_sys,
        r.blood_pressure_dia,
        getRisk(r.heart_rate, r.spo2, r.temperature)
      ])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'cardiotrack_report.csv';
    a.click();
  }

  const avgHR = data.length ? Math.round(data.reduce((a, r) => a + r.heart_rate, 0) / data.length) : '--';
  const avgSpo2 = data.length ? (data.reduce((a, r) => a + r.spo2, 0) / data.length).toFixed(1) : '--';
  const alerts = data.filter(r => r.heart_rate > 100 || r.spo2 < 93 || r.temperature > 38).length;

  const btnStyle = (active) => ({
    padding: '6px 14px', borderRadius: 20, border: '1px solid #E2E8F0', fontSize: 12,
    fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
    background: active ? '#C0152A' : '#F8FAFC',
    color: active ? '#fff' : '#475569',
    borderColor: active ? '#C0152A' : '#E2E8F0',
  });

  return (
    <div style={{ padding: '20px 24px' }}>
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Time range:</span>
        {['Daily', 'Weekly', 'Monthly'].map(f => <button key={f} style={btnStyle(timeFilter === f)} onClick={() => setTimeFilter(f)}>{f}</button>)}
        <button onClick={exportCSV} style={{ marginLeft: 'auto', padding: '8px 16px', background: '#C0152A', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
          <i className="ti ti-download" style={{ fontSize: 14 }} /> Export CSV
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Average heart rate', value: avgHR, unit: 'bpm', sub: `${timeFilter} average` },
          { label: 'Average SpO₂', value: avgSpo2, unit: '%', sub: `${timeFilter} average` },
          { label: 'Alert events', value: alerts, unit: '', sub: `${timeFilter} total`, danger: true },
          { label: 'Data points', value: data.length, unit: '', sub: `${timeFilter} records` },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.danger && alerts > 0 ? '#DC2626' : '#0F172A' }}>{s.value} <span style={{ fontSize: 13, color: '#94A3B8', fontWeight: 400 }}>{s.unit}</span></div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 3 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>Loading data...</div>
        ) : data.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>No data yet — waiting for device to send readings</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Timestamp','HR (bpm)','SpO₂ (%)','Temp (°C)','RR (br/min)','BP (mmHg)','Risk'].map(h => (
                <th key={h} style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.05em', padding: '10px 16px', textAlign: 'left', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {data.map((r, i) => {
                const risk = getRisk(r.heart_rate, r.spo2, r.temperature);
                return (
                  <tr key={i}>
                    <td style={{ fontSize: 13, color: '#0F172A', padding: '11px 16px', borderBottom: '1px solid #E2E8F0' }}>{new Date(r.created_at).toLocaleString()}</td>
                    <td style={{ fontSize: 13, color: '#0F172A', padding: '11px 16px', borderBottom: '1px solid #E2E8F0' }}>{r.heart_rate}</td>
                    <td style={{ fontSize: 13, color: '#0F172A', padding: '11px 16px', borderBottom: '1px solid #E2E8F0' }}>{r.spo2}</td>
                    <td style={{ fontSize: 13, color: '#0F172A', padding: '11px 16px', borderBottom: '1px solid #E2E8F0' }}>{r.temperature}</td>
                    <td style={{ fontSize: 13, color: '#0F172A', padding: '11px 16px', borderBottom: '1px solid #E2E8F0' }}>{r.respiratory_rate}</td>
                    <td style={{ fontSize: 13, color: '#0F172A', padding: '11px 16px', borderBottom: '1px solid #E2E8F0' }}>{r.blood_pressure_sys}/{r.blood_pressure_dia}</td>
                    <td style={{ fontSize: 13, padding: '11px 16px', borderBottom: '1px solid #E2E8F0' }}>
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