import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export default function Dashboard() {
  const [vitals, setVitals] = useState({
    heart_rate: '--',
    spo2: '--',
    temperature: '--',
    respiratory_rate: '--',
  });
  const [bp, setBp] = useState({ systolic: '--', diastolic: '--', category: '--' });
  const [hrHistory, setHrHistory] = useState([0,0,0,0,0,0,0,0,0,0]);
  const [lastUpdate, setLastUpdate] = useState('Waiting for device...');
  const [deviceOnline, setDeviceOnline] = useState(false);

  function predictBP(hr, spo2, rr) {
    if (hr === '--' || spo2 === '--' || rr === '--') return;
    const systolic = Math.round(0.8 * Number(hr) + (-0.5 * Number(spo2)) + 0.6 * Number(rr) + 115);
    const diastolic = Math.round(systolic * 0.65);
    let category = 'Normal';
    if (systolic >= 140) category = 'Stage 2 Hypertension';
    else if (systolic >= 130) category = 'Stage 1 Hypertension';
    else if (systolic >= 120) category = 'Elevated';
    setBp({ systolic, diastolic, category });
  }

  useEffect(() => {
    fetchLatest();
    const channel = supabase // eslint-disable-line react-hooks/exhaustive-deps
      .channel('vitals-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'vitals' }, (payload) => {
        const d = payload.new;
        const v = {
          heart_rate: d.heart_rate ?? '--',
          spo2: d.spo2 ?? '--',
          temperature: d.temperature ?? '--',
          respiratory_rate: d.respiratory_rate ?? '--',
        };
        setVitals(v);
        setHrHistory(prev => [...prev.slice(1), d.heart_rate]);
        setLastUpdate(new Date().toLocaleTimeString());
        setDeviceOnline(true);
        predictBP(d.heart_rate, d.spo2, d.respiratory_rate);
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  async function fetchLatest() {
    const { data } = await supabase
      .from('vitals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    if (data && data.length > 0) {
      const v = {
        heart_rate: data[0].heart_rate ?? '--',
        spo2: data[0].spo2 ?? '--',
        temperature: data[0].temperature ?? '--',
        respiratory_rate: data[0].respiratory_rate ?? '--',
      };
      setVitals(v);
      setHrHistory(data.slice(0,10).reverse().map(d => d.heart_rate));
      setLastUpdate(new Date(data[0].created_at).toLocaleTimeString());
      setDeviceOnline(true);
      predictBP(data[0].heart_rate, data[0].spo2, data[0].respiratory_rate);
    }
  }

  const maxHR = Math.max(...hrHistory, 1);

  function getBPColor() {
    if (bp.category === 'Normal') return { bg: '#ECFDF5', color: '#0D9E6E', border: '#A7F3D0' };
    if (bp.category === 'Elevated') return { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' };
    if (bp.category === 'Stage 1 Hypertension') return { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' };
    if (bp.category === 'Stage 2 Hypertension') return { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' };
    return { bg: '#F8FAFC', color: '#94A3B8', border: '#E2E8F0' };
  }

  const bpColor = getBPColor();

  const vitalCards = [
    {
      label: 'Heart rate',
      value: vitals.heart_rate,
      unit: 'bpm',
      icon: 'ti-heartbeat',
      bg: '#FEF2F2',
      iconBg: '#FEF2F2',
      iconColor: '#DC2626',
      border: '#FECACA',
      status: vitals.heart_rate === '--' ? 'Waiting...' : vitals.heart_rate > 100 ? 'Above normal' : 'Normal',
      statusColor: vitals.heart_rate > 100 ? '#DC2626' : '#0D9E6E'
    },
    {
      label: 'SpO₂',
      value: vitals.spo2,
      unit: '%',
      icon: 'ti-lungs',
      bg: '#F0FDF9',
      iconBg: '#FFF0F0',
      iconColor: '#C0152A',
      border: '#A7F3D0',
      status: vitals.spo2 === '--' ? 'Waiting...' : vitals.spo2 < 93 ? 'Low — alert!' : 'Normal',
      statusColor: vitals.spo2 < 93 ? '#DC2626' : '#0D9E6E'
    },
    {
      label: 'Temperature',
      value: vitals.temperature,
      unit: '°C',
      icon: 'ti-thermometer',
      bg: '#F0FDF9',
      iconBg: '#ECFDF5',
      iconColor: '#0D9E6E',
      border: '#A7F3D0',
      status: vitals.temperature === '--' ? 'Waiting...' : vitals.temperature > 38 ? 'Fever!' : 'Normal',
      statusColor: vitals.temperature > 38 ? '#DC2626' : '#0D9E6E'
    },
    {
      label: 'Respiratory rate',
      value: vitals.respiratory_rate,
      unit: 'br/min',
      icon: 'ti-wind',
      bg: '#F0FDF9',
      iconBg: '#F5F3FF',
      iconColor: '#7C3AED',
      border: '#A7F3D0',
      status: vitals.respiratory_rate === '--' ? 'Waiting...' : vitals.respiratory_rate > 20 ? 'Above normal' : 'Normal',
      statusColor: vitals.respiratory_rate > 20 ? '#DC2626' : '#0D9E6E'
    },
  ];

  return (
    <div style={{ padding: '20px 24px' }}>

      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>Live vitals</div>
          <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>Last update: {lastUpdate}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: deviceOnline ? '#ECFDF5' : '#FEF2F2', color: deviceOnline ? '#0D9E6E' : '#DC2626', fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 20, border: `1px solid ${deviceOnline ? '#A7F3D0' : '#FECACA'}` }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: deviceOnline ? '#0D9E6E' : '#DC2626', display: 'inline-block' }} />
          {deviceOnline ? 'Device online' : 'Waiting for device...'}
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
        <div style={{ width: 46, height: 46, borderRadius: '50%', background: '#FFF0F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#C0152A' }}>AV</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>Device 1</div>
         
        </div>
        <div style={{ padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', gap: 5 }}>
          <i className="ti ti-alert-triangle" style={{ fontSize: 13 }} /> Medium risk
        </div>
      </div>

      <div style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 12 }}>Live vital signs</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, marginBottom: 20 }}>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
          {vitalCards.map(c => (
            <div key={c.label} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>{c.label}</span>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: c.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={`ti ${c.icon}`} style={{ color: c.iconColor, fontSize: 16 }} />
                </div>
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#0F172A', lineHeight: 1.1 }}>
                {c.value} <span style={{ fontSize: 11, fontWeight: 400, color: '#94A3B8' }}>{c.unit}</span>
              </div>
              <div style={{ fontSize: 11, marginTop: 6, color: c.statusColor, fontWeight: 500 }}>{c.status}</div>
            </div>
          ))}
        </div>

        <div style={{ background: bpColor.bg, border: `1px solid ${bpColor.border}`, borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 12 }}>
              <i className="ti ti-cpu" style={{ fontSize: 12, marginRight: 4 }} />
              AI Blood Pressure
            </div>
            <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 8, padding: 10, marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, marginBottom: 6 }}>Inputs from device</div>
              {[
                { label: 'Heart rate', value: vitals.heart_rate, unit: 'bpm' },
                { label: 'SpO₂', value: vitals.spo2, unit: '%' },
                { label: 'Resp. rate', value: vitals.respiratory_rate, unit: 'br/min' },
              ].map(i => (
                <div key={i.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '3px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  <span style={{ color: '#475569' }}>{i.label}</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>{i.value} <span style={{ color: '#94A3B8', fontWeight: 400 }}>{i.unit}</span></span>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 6 }}>Predicted BP</div>
              <div style={{ lineHeight: 1, marginBottom: 8 }}>
                <span style={{ fontSize: 40, fontWeight: 700, color: bpColor.color }}>{bp.systolic}</span>
                <span style={{ fontSize: 20, color: '#94A3B8', fontWeight: 300 }}>/</span>
                <span style={{ fontSize: 22, fontWeight: 600, color: bpColor.color }}>{bp.diastolic}</span>
              </div>
              <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 8 }}>mmHg</div>
              <div style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'rgba(255,255,255,0.8)', color: bpColor.color }}>
                {bp.category}
              </div>
            </div>
          </div>
          <div style={{ fontSize: 10, color: '#94A3B8', textAlign: 'center', marginTop: 12 }}>
            Auto-updated with each vital reading
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', marginBottom: 14 }}>Recent alerts</div>
          {vitals.heart_rate > 100 && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 8, background: '#FEF2F2', border: '1px solid #FECACA', marginBottom: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#DC2626', flexShrink: 0, marginTop: 4, display: 'block' }} />
              <div>
                <div style={{ fontSize: 12, color: '#0F172A', fontWeight: 500 }}>Heart rate high — {vitals.heart_rate} bpm</div>
                <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>Just now</div>
              </div>
            </div>
          )}
          {vitals.spo2 < 93 && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 8, background: '#FEF2F2', border: '1px solid #FECACA', marginBottom: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#DC2626', flexShrink: 0, marginTop: 4, display: 'block' }} />
              <div>
                <div style={{ fontSize: 12, color: '#0F172A', fontWeight: 500 }}>SpO₂ low — {vitals.spo2}%</div>
                <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>Just now</div>
              </div>
            </div>
          )}
          {bp.category === 'Stage 2 Hypertension' && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 8, background: '#FEF2F2', border: '1px solid #FECACA', marginBottom: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#DC2626', flexShrink: 0, marginTop: 4, display: 'block' }} />
              <div>
                <div style={{ fontSize: 12, color: '#0F172A', fontWeight: 500 }}>BP critical — {bp.systolic}/{bp.diastolic} mmHg</div>
                <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>Just now</div>
              </div>
            </div>
          )}
          {vitals.heart_rate <= 100 && vitals.spo2 >= 93 && bp.category !== 'Stage 2 Hypertension' && (
            <div style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', padding: '20px 0' }}>No alerts at this time</div>
          )}
        </div>

        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', marginBottom: 14 }}>Heart rate — last 10 readings</div>
          <div style={{ height: 100, display: 'flex', alignItems: 'flex-end', gap: 4, padding: '0 4px' }}>
            {hrHistory.map((v, i) => (
              <div key={i} style={{ flex: 1, borderRadius: '4px 4px 0 0', background: v > 100 ? '#C0152A' : '#FFF0F0', height: `${Math.round((v / maxHR) * 100)}%`, transition: 'height .3s' }} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontSize: 10, color: '#94A3B8' }}>10 ago</span>
            <span style={{ fontSize: 10, color: '#94A3B8' }}>Normal: 60–100 bpm</span>
            <span style={{ fontSize: 10, color: '#94A3B8' }}>Now</span>
          </div>
        </div>
      </div>
    </div>
  );
}