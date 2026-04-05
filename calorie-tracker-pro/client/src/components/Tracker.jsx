import React, { useState, useEffect } from 'react';

const Tracker = ({ logs, goals }) => {
  const [total, setTotal] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });

  useEffect(() => {
    const sum = logs.reduce((acc, log) => ({
      calories: acc.calories + log.calories,
      protein: acc.protein + log.protein,
      carbs: acc.carbs + log.carbs,
      fat: acc.fat + log.fat,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    setTotal(sum);
  }, [logs]);

  const deleteLog = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/logs/${id}`, { method: 'DELETE' });
      // Refresh logic handled by App.js (assuming logs is a prop that re-fetches)
    } catch (err) {
      console.error(err);
    }
  };

  const pct = Math.min((total.calories / goals.calories) * 100, 100);

  return (
    <div className="tracker-view">
      {/* SUMMARY CARD */}
      <div className="glass-card" style={{ padding: '30px', textAlign: 'center' }}>
        <h2 style={{ marginTop: 0 }}>Bugün Özet</h2>
        <div className="stats-ring-container">
          <div style={{ position: 'relative', width: '150px', height: '150px' }}>
            <svg width="150" height="150" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <circle 
                cx="50" cy="50" r="45" fill="none" 
                stroke="var(--primary)" strokeWidth="8" 
                strokeDasharray="282.7" 
                strokeDashoffset={282.7 * (1 - pct / 100)} 
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{Math.round(total.calories)}</span>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>kcal</div>
            </div>
          </div>
        </div>
        <p style={{ margin: '10px 0', color: 'var(--text-muted)' }}>Hedefin: {goals.calories} kcal</p>
        
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px' }}>
          <div className="macro-stat">
            <div style={{ fontSize: '1rem', fontWeight: '600' }}>{total.protein}g</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Protein</div>
          </div>
          <div className="macro-stat">
            <div style={{ fontSize: '1rem', fontWeight: '600' }}>{total.carbs}g</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Karb</div>
          </div>
          <div className="macro-stat">
            <div style={{ fontSize: '1rem', fontWeight: '600' }}>{total.fat}g</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Yağ</div>
          </div>
        </div>
      </div>

      {/* DETAILED LOG */}
      <h3 style={{ marginLeft: '10px' }}>Yemek Günlüğü</h3>
      <div className="logs-list">
        {logs.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: 'var(--text-muted)' }}>Henüz bir şey eklemedin. Haydi başla! 🍎</p>
          </div>
        ) : (
          logs.map(log => (
            <div key={log.id} className="glass-card" style={{ marginBottom: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: 0 }}>{log.name}</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{log.calories} kcal | {log.time}</p>
              </div>
              <button 
                onClick={() => deleteLog(log.id)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', opacity: 0.5 }}
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Tracker;
