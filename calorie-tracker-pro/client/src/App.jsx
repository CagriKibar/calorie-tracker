import React, { useState, useEffect } from 'react';
import Analyzer from './components/Analyzer';
import Catalog from './components/Catalog';
import Tracker from './components/Tracker';
import Scanner from './components/Scanner';

const App = () => {
  const [activeTab, setActiveTab] = useState('analyze'); // 'analyze', 'catalog', 'tracker', 'scanner'
  const [dailyLogs, setDailyLogs] = useState([]);
  const [goals, setGoals] = useState({ calories: 2000, protein: 150, carbs: 250, fat: 65 });
  const [todayKey] = useState(new Date().toISOString().split('T')[0]);

  // Backend'den günlük kayıtları çek
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/logs/${todayKey}`)
      .then(res => res.json())
      .then(data => setDailyLogs(data))
      .catch(err => console.error("Log fetch hatası:", err));
  }, [todayKey, activeTab]);

  const addLog = (food) => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...food,
        date: todayKey,
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
      })
    })
    .then(res => res.json())
    .then(() => setActiveTab('tracker'))
    .catch(err => console.error("Log kaydetme hatası:", err));
  };

  return (
    <div className="app-container">
      {/* HEADER */}
      <header className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '1.8rem' }}>
          <span style={{ color: 'var(--primary)' }}>Calori</span>Lens <span className="chip">PRO</span>
        </h1>
      </header>

      {/* MAIN VIEW */}
      <main style={{ paddingBottom: '100px' }}>
        {activeTab === 'analyze' && <Analyzer onAddFood={addLog} />}
        {activeTab === 'scanner' && <Scanner onAddFood={addLog} />}
        {activeTab === 'catalog' && <Catalog onAddFood={addLog} />}
        {activeTab === 'tracker' && <Tracker logs={dailyLogs} goals={goals} />}
      </main>

      {/* HUD NAVIGATION */}
      <nav className="hud-nav">
        <button 
          className={`nav-item ${activeTab === 'analyze' ? 'active' : ''}`} 
          onClick={() => setActiveTab('analyze')}
          title="Analiz"
        >
          🔍
        </button>
        <button 
          className={`nav-item ${activeTab === 'scanner' ? 'active' : ''}`} 
          onClick={() => setActiveTab('scanner')}
          title="Barkod"
        >
          📷
        </button>
        <button 
          className={`nav-item ${activeTab === 'catalog' ? 'active' : ''}`} 
          onClick={() => setActiveTab('catalog')}
          title="Katalog"
        >
          📖
        </button>
        <button 
          className={`nav-item ${activeTab === 'tracker' ? 'active' : ''}`} 
          onClick={() => setActiveTab('tracker')}
          title="Özet"
        >
          📈
        </button>
      </nav>
    </div>
  );
};

export default App;
