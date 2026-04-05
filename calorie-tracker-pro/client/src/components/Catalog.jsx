import React, { useState, useEffect } from 'react';

const Catalog = ({ onAddFood }) => {
  const [foods, setFoods] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch initial foods
  useEffect(() => {
    fetchFoods('');
  }, []);

  const fetchFoods = async (q) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setFoods(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.length >= 2) {
      fetchFoods(val);
    } else if (val.length === 0) {
      fetchFoods('');
    }
  };

  return (
    <div className="catalog-view">
      {/* SEARCH BOX */}
      <div className="glass-card" style={{ padding: '20px', borderRadius: '50px', marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="Bugün ne yedin? (örn: mercimek)" 
          value={query}
          onChange={handleSearch}
          style={{ 
            background: 'none', border: 'none', color: 'white', width: '100%', 
            fontSize: '1.1rem', outline: 'none', paddingLeft: '10px'
          }}
        />
      </div>

      <h3 style={{ marginLeft: '10px' }}>Geleneksel Lezzetler</h3>
      <div className="catalog-list">
        {loading && <p style={{ textAlign: 'center' }}>Aranıyor...</p>}
        {foods.length === 0 && !loading && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Sonuç bulunamadı. Başka bir şey dene!</p>
        )}
        {foods.map(food => (
          <div 
            key={food.id} 
            className="glass-card food-item" 
            style={{ 
              marginBottom: '10px', padding: '16px', display: 'flex', 
              justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onClick={() => onAddFood(food)}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div>
              <h4 style={{ margin: 0, fontWeight: 600 }}>{food.name}</h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{food.calories} kcal / 100g</p>
            </div>
            <div style={{ display: 'flex', gap: '5px' }}>
              <div className="chip">P: {food.protein}</div>
              <div className="chip">C: {food.carbs}</div>
              <div className="chip">F: {food.fat}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Catalog;
