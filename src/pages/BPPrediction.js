import React, { useState } from 'react';

export default function BPPrediction() {
  const [hr, setHr] = useState(107);
  const [spo2, setSpo2] = useState(97);
  const [rr, setRr] = useState(18);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function predict() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heart_rate: parseFloat(hr) || 107,
          spo2: parseFloat(spo2) || 97,
          respiratory_rate: parseFloat(rr) || 18
        })
      });
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('Cannot connect to ML API — make sure app.py is running');
    }
    setLoading(false);
  }

  function getCategory(cat) {
    if (!cat) return { bg: '#F8FAFC', color: '#94A3B8' };
    if (cat === 'Normal') return { bg: '#ECFDF5', color: '#0D9E6E' };
    if (cat === 'Elevated') return { bg: '#FFFBEB', color: '#D97706' };
    if (cat === 'Stage 1 Hypertension') return { bg: '#FFFBEB', color: '#D97706' };
    return { bg: '#FEF2F2', color: '#DC2626' };
  }

  const cat = getCategory(result?.category);

  return (
    <div style={{ padding: '20px 24px' }}>
      <div style={{ background: '#FFF0F0', border: '1px solid #FECACA', borderRadius: 12, padding: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#C0152A', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
          <i className="ti ti-cpu" style={{ fontSize: 15 }} /> How BP prediction works
        </div>
        <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.6 }}>
          Blood pressure is estimated using a Random Forest regression model trained on 5,000 samples. 
          The model uses Heart Rate, SpO₂, and Respiratory Rate as inputs to predict Systolic and Diastolic BP.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        
        {/* Result Card */}
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.07em' }}>
            Predicted blood pressure
          </div>

          {result ? (
            <>
              <div style={{ margin: '16px 0 8px', lineHeight: 1 }}>
                <span style={{ fontSize: 48, fontWeight: 700, color: '#0F172A' }}>{result.systolic}</span>
                <span style={{ fontSize: 28, color: '#94A3B8', fontWeight: 300 }}>/</span>
                <span style={{ fontSize: 28, color: '#475569', fontWeight: 600 }}>{result.diastolic}</span>
              </div>
              <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 14 }}>mmHg (Systolic / Diastolic)</div>
              <div style={{ display: 'inline-block', padding: '6px 18px', borderRadius: 20, fontSize: 13, fontWeight: 600, background: cat.bg, color: cat.color }}>
                {result.category}
              </div>
              <div style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>
                  <span>Model confidence</span>
                  <span>{result.confidence}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: '#E2E8F0', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 3, background: '#C0152A', width: `${result.confidence}%` }} />
                </div>
              </div>
            </>
          ) : (
            <div style={{ padding: '40px 0', color: '#94A3B8', fontSize: 13 }}>
              <i className="ti ti-activity" style={{ fontSize: 40, display: 'block', marginBottom: 12 }} />
              Enter vitals and click "Run prediction"
            </div>
          )}

          {error && (
            <div style={{ marginTop: 12, padding: 10, background: '#FEF2F2', borderRadius: 8, fontSize: 12, color: '#DC2626' }}>
              {error}
            </div>
          )}
        </div>

        {/* Input Card */}
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', marginBottom: 16 }}>Input vitals for prediction</div>

          {[
            { label: 'Heart rate (bpm)', val: hr, set: setHr, min: 30, max: 220 },
            { label: 'SpO₂ (%)', val: spo2, set: setSpo2, min: 50, max: 100 },
            { label: 'Respiratory rate (breaths/min)', val: rr, set: setRr, min: 5, max: 60 },
          ].map(f => (
            <div key={f.label} style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>{f.label}</label>
              <input
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', background: '#F8FAFC', outline: 'none' }}
                type="number" value={f.val} min={f.min} max={f.max}
                onChange={e => f.set(parseFloat(e.target.value))} />
            </div>
          ))}

          <button
            style={{ width: '100%', padding: 12, background: loading ? '#94A3B8' : '#C0152A', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            onClick={predict}
            disabled={loading}>
            <i className="ti ti-cpu" style={{ fontSize: 16 }} />
            {loading ? 'Predicting...' : 'Run prediction'}
          </button>
        </div>
      </div>

      {/* History table */}
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', marginBottom: 14 }}>Prediction history — today</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{['Time', 'HR (bpm)', 'SpO₂ (%)', 'RR (br/min)', 'Predicted BP', 'Category'].map(h => (
              <th key={h} style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.05em', padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #E2E8F0' }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {[
              ['14:32', '107', '97', '18', '154/98', 'Stage 2'],
              ['14:27', '102', '96', '17', '148/96', 'Stage 1 Hypertension'],
              ['14:22', '98', '97', '16', '140/91', 'Stage 1 Hypertension'],
              ['14:17', '95', '98', '16', '136/88', 'Elevated'],
              ['14:12', '85', '99', '14', '120/78', 'Normal'],
            ].map((r, i) => (
              <tr key={i}>{r.map((c, j) => (
                <td key={j} style={{ fontSize: 13, color: '#0F172A', padding: '10px 12px', borderBottom: '1px solid #E2E8F0' }}>{c}</td>
              ))}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}