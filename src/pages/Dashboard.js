import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';

function HealthGauge({ score, dark }) {
  const r = 52;
  const circumference = Math.PI * r;
  const dash = (score / 100) * circumference;
  const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';
  const label = score >= 80 ? 'Good' : score >= 60 ? 'Medium Risk' : 'High Risk';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width="128" height="72" viewBox="0 0 128 80">
        <path d="M 12,68 A 52,52 0 0,1 116,68" fill="none" stroke={dark ? '#374151' : '#E5E7EB'} strokeWidth="10" strokeLinecap="round" />
        <path d="M 12,68 A 52,52 0 0,1 116,68" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`} style={{ transition: 'stroke-dasharray 0.8s ease' }} />
        <text x="64" y="62" textAnchor="middle" fontSize="22" fontWeight="700" fill={color}>{score}</text>
        <text x="64" y="76" textAnchor="middle" fontSize="9" fill={dark ? '#9CA3AF' : '#6B7280'}>/ 100</text>
      </svg>
      <div style={{ fontSize: 13, fontWeight: 600, color, marginTop: -4 }}>{label}</div>
    </div>
  );
}

function TrendChart({ history, color, dark }) {
  const valid = (history || []).filter(v => v > 0);
  if (valid.length < 2) return (
    <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', color: dark ? '#6B7280' : '#9CA3AF', fontSize: 12 }}>
      Waiting for data...
    </div>
  );
  const max = Math.max(...valid);
  const min = Math.min(...valid);
  const range = max - min || 1;
  const w = 400, h = 80;
  const points = valid.map((v, i) => {
    const x = (i / (valid.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 8) - 4;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 80 }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${points} ${w},${h}`} fill="url(#trendGrad)" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {valid.map((v, i) => {
        const x = (i / (valid.length - 1)) * w;
        const y = h - ((v - min) / range) * (h - 8) - 4;
        return <circle key={i} cx={x} cy={y} r="3" fill={color} />;
      })}
    </svg>
  );
}

export default function Dashboard({ dark: darkProp = false, deviceId = 'CT-0001' }) {
  const dark = darkProp;
  const [vitals, setVitals] = useState({ heart_rate: '--', spo2: '--', temperature: '--' });
  const [bp, setBp] = useState({ systolic: '--', diastolic: '--', category: '--' });
  const [hrHistory, setHrHistory] = useState([]);
  const [spo2History, setSpo2History] = useState([]);
  const [tempHistory, setTempHistory] = useState([]);
  const [lastUpdate, setLastUpdate] = useState('Waiting for device...');
  const [deviceOnline, setDeviceOnline] = useState(false);
  const [trendVital, setTrendVital] = useState('heart_rate');
  const [healthScore, setHealthScore] = useState(0);
  const lastDataTime = useRef(null);

  function calcBP(hr, spo2) {
    const h = Number(hr);
    const s = Number(spo2);
    if (!h || !s || h < 30 || h > 220 || s < 50) {
      setBp({ systolic: '--', diastolic: '--', category: 'No data' });
      return;
    }
    const systolic = Math.round(0.8 * h + (-0.5 * s) + 115);
    const diastolic = Math.round(systolic * 0.65);
    let category = 'Normal';
    if (systolic >= 140) category = 'Stage 2 Hypertension';
    else if (systolic >= 130) category = 'Stage 1 Hypertension';
    else if (systolic >= 120) category = 'Elevated';
    setBp({ systolic, diastolic, category });
  }

  function calcHealthScore(hr, spo2, temp) {
    const h = Number(hr), s = Number(spo2), t = Number(temp);
    if (!h || h < 30) return 0;
    let score = 100;
    if (h > 100 || h < 60) score -= 20;
    if (h > 120 || h < 50) score -= 15;
    if (s < 95) score -= 20;
    if (s < 90) score -= 20;
    if (t > 38 || t < 36) score -= 15;
    return Math.max(0, score);
  }

  function updateVitals(d) {
    const v = {
      heart_rate: d.heart_rate ?? '--',
      spo2: d.spo2 ?? '--',
      temperature: d.temperature ?? '--',
    };
    setVitals(v);
    if (d.heart_rate > 0) setHrHistory(prev => [...prev.slice(-9), d.heart_rate]);
    if (d.spo2 > 0) setSpo2History(prev => [...prev.slice(-9), d.spo2]);
    if (d.temperature > 0) setTempHistory(prev => [...prev.slice(-9), d.temperature]);
    setLastUpdate(new Date().toLocaleTimeString());
    setDeviceOnline(true);
    lastDataTime.current = Date.now();
    calcBP(d.heart_rate, d.spo2);
    setHealthScore(calcHealthScore(d.heart_rate, d.spo2, d.temperature));
  }

  // Offline detection
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastDataTime.current && Date.now() - lastDataTime.current > 15000) {
        setDeviceOnline(false);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchLatest(); // eslint-disable-line react-hooks/exhaustive-deps
    const channel = supabase
      .channel(`vitals-${deviceId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'vitals',
        filter: `device_id=eq.${deviceId}`
      }, (payload) => updateVitals(payload.new))
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchLatest() {
    const { data } = await supabase
      .from('vitals').select('*')
      .eq('device_id', deviceId)
      .order('created_at', { ascending: false })
      .limit(10);
    if (data && data.length > 0) {
      // Set history from last 10 readings
      const reversed = data.slice().reverse();
      setHrHistory(reversed.filter(d => d.heart_rate > 0).map(d => d.heart_rate));
      setSpo2History(reversed.filter(d => d.spo2 > 0).map(d => d.spo2));
      setTempHistory(reversed.filter(d => d.temperature > 0).map(d => d.temperature));

      // Set latest vitals
      const latest = data[0];
      setVitals({
        heart_rate: latest.heart_rate ?? '--',
        spo2: latest.spo2 ?? '--',
        temperature: latest.temperature ?? '--',
      });
      setLastUpdate(new Date(latest.created_at).toLocaleTimeString());
      lastDataTime.current = new Date(latest.created_at).getTime();
      const diff = Date.now() - new Date(latest.created_at).getTime();
      setDeviceOnline(diff < 15000);
      calcBP(latest.heart_rate, latest.spo2);
      setHealthScore(calcHealthScore(latest.heart_rate, latest.spo2, latest.temperature));
    }
  }

  const t = {
    surface: dark ? 'rgba(30,41,59,0.85)' : 'rgba(255,255,255,0.85)',
    surface2: dark ? 'rgba(15,23,42,0.5)' : 'rgba(248,250,252,0.9)',
    border: dark ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
    text: dark ? '#F1F5F9' : '#0F172A',
    textMuted: dark ? '#64748B' : '#94A3B8',
    accent: '#C0152A',
  };

  const isNormal = {
    heart_rate: vitals.heart_rate !== '--' && Number(vitals.heart_rate) >= 60 && Number(vitals.heart_rate) <= 100,
    spo2: vitals.spo2 !== '--' && Number(vitals.spo2) >= 93,
    temperature: vitals.temperature !== '--' && Number(vitals.temperature) >= 36 && Number(vitals.temperature) <= 38,
  };

  function cardColors(key) {
    if (vitals[key] === '--') return { color: dark ? '#64748B' : '#94A3B8', bg: dark ? 'rgba(30,41,59,0.85)' : '#F8FAFC', border: dark ? 'rgba(255,255,255,0.08)' : '#E2E8F0' };
    if (isNormal[key]) return { color: '#10B981', bg: dark ? 'rgba(16,185,129,0.12)' : '#F0FDF4', border: dark ? 'rgba(16,185,129,0.3)' : '#A7F3D0' };
    return { color: '#C0152A', bg: dark ? 'rgba(192,21,42,0.12)' : '#FFF0F2', border: dark ? 'rgba(192,21,42,0.3)' : '#FECACA' };
  }

  const vitalCards = [
    { key: 'heart_rate', label: 'Heart Rate', value: vitals.heart_rate, unit: 'bpm', icon: '♥', history: hrHistory, status: vitals.heart_rate === '--' ? 'Waiting...' : isNormal.heart_rate ? 'Normal' : Number(vitals.heart_rate) > 100 ? 'Above normal' : 'Below normal', ...cardColors('heart_rate') },
    { key: 'spo2', label: 'SpO₂', value: vitals.spo2, unit: '%', icon: '◎', history: spo2History, status: vitals.spo2 === '--' ? 'Waiting...' : isNormal.spo2 ? 'Normal' : 'Low — alert!', ...cardColors('spo2') },
    { key: 'temperature', label: 'Temperature', value: vitals.temperature, unit: '°C', icon: '⬆', history: tempHistory, status: vitals.temperature === '--' ? 'Waiting...' : isNormal.temperature ? 'Normal' : Number(vitals.temperature) > 38 ? 'Fever!' : 'Low temp!', ...cardColors('temperature') },
  ];

  const trendColors = { heart_rate: '#C0152A', spo2: '#3B82F6', temperature: '#10B981' };
  const trendLabels = { heart_rate: 'Heart Rate (bpm)', spo2: 'SpO₂ (%)', temperature: 'Temperature (°C)' };
  const trendData = { heart_rate: hrHistory, spo2: spo2History, temperature: tempHistory };
  const bpColor = bp.category === 'Normal' ? '#10B981' : bp.category === 'Elevated' ? '#F59E0B' : bp.category === 'No data' ? (dark ? '#64748B' : '#94A3B8') : '#EF4444';

  const alerts = [];
  if (Number(vitals.heart_rate) > 100) alerts.push({ color: '#EF4444', tag: 'High', text: `Heart rate high — ${vitals.heart_rate} bpm` });
  if (Number(vitals.heart_rate) < 60 && vitals.heart_rate !== '--') alerts.push({ color: '#EF4444', tag: 'High', text: `Heart rate low — ${vitals.heart_rate} bpm` });
  if (Number(vitals.spo2) < 93 && vitals.spo2 !== '--') alerts.push({ color: '#EF4444', tag: 'High', text: `SpO₂ low — ${vitals.spo2}%` });
  if (bp.category === 'Stage 2 Hypertension') alerts.push({ color: '#EF4444', tag: 'Critical', text: `BP critical — ${bp.systolic}/${bp.diastolic} mmHg` });
  if (bp.category === 'Stage 1 Hypertension') alerts.push({ color: '#F59E0B', tag: 'Warning', text: `BP elevated — ${bp.systolic}/${bp.diastolic} mmHg` });

  return (
    <div style={{ padding: '20px 24px', minHeight: '100%' }}>

      {/* Topbar */}
      <div style={{ background: t.surface, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: `1px solid ${t.border}`, borderRadius: 12, padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>Live vitals — {deviceId}</div>
          <div style={{ fontSize: 11, color: t.textMuted, marginTop: 1 }}>Last update: {lastUpdate}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: deviceOnline ? (dark ? 'rgba(16,185,129,0.15)' : '#ECFDF5') : (dark ? 'rgba(192,21,42,0.15)' : '#FEF2F2'), color: deviceOnline ? '#10B981' : '#EF4444', fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 20, border: `1px solid ${deviceOnline ? '#10B981' : '#EF4444'}` }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: deviceOnline ? '#10B981' : '#EF4444', display: 'inline-block' }} />
          {deviceOnline ? 'Device online' : 'Device offline'}
        </div>
      </div>

      {/* Top grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 180px', gap: 16, marginBottom: 16 }}>

        {/* Device card */}
        <div style={{ background: t.surface, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: `1px solid ${t.border}`, borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: t.text, display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className="ti ti-device-watch" style={{ fontSize: 16, color: t.accent }} />
            Device Monitor
          </div>
          <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 12 }}>
            {[
              { l: 'Device ID', v: deviceId },
              { l: 'Status', v: deviceOnline ? 'Connected' : 'Offline', c: deviceOnline ? '#10B981' : '#EF4444' },
              { l: 'Last sync', v: lastUpdate },
            ].map(row => (
              <div key={row.l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8, gap: 4 }}>
                <span style={{ color: t.textMuted }}>{row.l}</span>
                <span style={{ fontWeight: 600, color: row.c || t.text }}>{row.v}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 12 }}>
            <div style={{ padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: healthScore >= 80 ? (dark ? 'rgba(16,185,129,0.15)' : '#ECFDF5') : healthScore >= 60 ? (dark ? 'rgba(245,158,11,0.15)' : '#FFFBEB') : (dark ? 'rgba(192,21,42,0.15)' : '#FEF2F2'), color: healthScore >= 80 ? '#10B981' : healthScore >= 60 ? '#F59E0B' : '#EF4444', textAlign: 'center' }}>
              {healthScore >= 80 ? '✓ Low Risk' : healthScore >= 60 ? '⚠ Medium Risk' : '✗ High Risk'}
            </div>
          </div>
        </div>

        {/* Vitals 3 cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {vitalCards.map(c => (
            <div key={c.key} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 12, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6, transition: 'background .4s, border-color .4s' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: t.textMuted, fontWeight: 500 }}>{c.label}</span>
                <span style={{ fontSize: 16, color: c.color }}>{c.icon}</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: t.text, lineHeight: 1 }}>
                {c.value} <span style={{ fontSize: 11, fontWeight: 400, color: t.textMuted }}>{c.unit}</span>
              </div>
              <div style={{ fontSize: 15, color: c.color, fontWeight: 700 }}>{c.status}</div>
            </div>
          ))}
        </div>

        {/* BP + Health Score */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: t.surface, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: `1px solid ${t.border}`, borderRadius: 12, padding: 16, flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Blood Pressure</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 30, fontWeight: 700, color: bpColor, lineHeight: 1 }}>
                {bp.systolic}<span style={{ fontSize: 16, color: t.textMuted, fontWeight: 300 }}>/</span>{bp.diastolic}
              </div>
              <div style={{ fontSize: 10, color: t.textMuted, margin: '4px 0 8px' }}>mmHg</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: bpColor, background: t.surface2, padding: '4px 10px', borderRadius: 20, display: 'inline-block' }}>
                {bp.category}
              </div>
            </div>
          </div>
          <div style={{ background: t.surface, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: `1px solid ${t.border}`, borderRadius: 12, padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Health Score</div>
            <HealthGauge score={healthScore} dark={dark} />
          </div>
        </div>
      </div>

      {/* Bottom — Trend + Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
        <div style={{ background: t.surface, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: `1px solid ${t.border}`, borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>Vitals Trend — last readings</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {Object.entries(trendColors).map(([key, color]) => (
                <button key={key} onClick={() => setTrendVital(key)} style={{ padding: '4px 10px', borderRadius: 20, border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', background: trendVital === key ? color : (dark ? '#273447' : '#F1F5F9'), color: trendVital === key ? '#fff' : t.textMuted, transition: 'all .15s' }}>
                  {key === 'heart_rate' ? 'HR' : key === 'spo2' ? 'SpO₂' : 'Temp'}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: t.textMuted }}>{trendLabels[trendVital]}</span>
          </div>
          <TrendChart history={trendData[trendVital]} color={trendColors[trendVital]} dark={dark} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontSize: 10, color: t.textMuted }}>Earlier</span>
            <span style={{ fontSize: 10, color: t.textMuted }}>Now</span>
          </div>
        </div>

        <div style={{ background: t.surface, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: `1px solid ${t.border}`, borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>Recent alerts</div>
            <span style={{ fontSize: 11, color: t.accent, cursor: 'pointer', fontWeight: 500 }}>View all</span>
          </div>
          {alerts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: t.textMuted, fontSize: 12 }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>✓</div>
              All vitals normal
            </div>
          ) : alerts.map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 8, background: t.surface2, border: `1px solid ${t.border}`, marginBottom: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: a.color, flexShrink: 0, marginTop: 4, display: 'block' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: t.text, fontWeight: 500, lineHeight: 1.4 }}>{a.text}</div>
                <div style={{ fontSize: 10, color: t.textMuted, marginTop: 2 }}>Just now</div>
              </div>
              <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700, background: a.color + '22', color: a.color, flexShrink: 0 }}>{a.tag}</span>
            </div>
          ))}
          <div style={{ marginTop: 12, padding: 12, background: t.surface2, borderRadius: 8, border: `1px solid ${t.border}` }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Device status</div>
            {[
              { l: 'Connection', v: deviceOnline ? 'WiFi' : 'Offline', c: deviceOnline ? '#10B981' : '#EF4444' },
              { l: 'Last sync', v: lastUpdate },
              { l: 'Device ID', v: deviceId },
            ].map(row => (
              <div key={row.l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '3px 0', borderBottom: `1px solid ${t.border}` }}>
                <span style={{ color: t.textMuted }}>{row.l}</span>
                <span style={{ fontWeight: 600, color: row.c || t.text }}>{row.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}