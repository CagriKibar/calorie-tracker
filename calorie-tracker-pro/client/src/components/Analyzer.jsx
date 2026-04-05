import React, { useState, useEffect, useRef } from 'react';

const FOOD_MODEL_URL = 'https://tfhub.dev/google/tfjs-model/food/classifier/1/default/1';
const LABEL_MAP_URL = 'https://www.gstatic.com/aihub/tfhub/labelmaps/aiy_food_V1_labelmap.csv';

const Analyzer = ({ onAddFood }) => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [model, setModel] = useState(null);
  const [labels, setLabels] = useState([]);
  const fileInputRef = useRef(null);

  // Model ve Etiketleri Yükle
  useEffect(() => {
    const loadAssets = async () => {
      try {
        const loadedModel = await window.tf.loadGraphModel(FOOD_MODEL_URL, { fromTFHub: true });
        setModel(loadedModel);
        
        const res = await fetch(LABEL_MAP_URL);
        const csv = await res.text();
        const labelList = csv.split('\n').slice(1).map(line => line.split(',')[1]?.trim()).filter(Boolean);
        setLabels(labelList);
        console.log("AI Assets Loaded.");
      } catch (err) {
        console.error("AI Yükleme Hatası:", err);
      }
    };
    if (!window.tf) {
      const script = document.createElement('script');
      script.src = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js";
      script.onload = loadAssets;
      document.head.appendChild(script);
    } else {
      loadAssets();
    }
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImage(ev.target.result);
      reader.readAsDataURL(file);
      setPredictions([]);
      setSuggestions([]);
    }
  };

  const analyzeImage = async () => {
    if (!model || !image) return;
    setLoading(true);

    try {
      const img = new Image();
      img.src = image;
      await img.decode();

      const tensor = window.tf.tidy(() => {
        return window.tf.browser.fromPixels(img)
          .resizeNearestNeighbor([224, 224])
          .toFloat()
          .sub(127.5)
          .div(127.5)
          .expandDims();
      });

      const result = await model.predict(tensor);
      const probabilities = await result.data();
      
      const top5 = Array.from(probabilities)
        .map((p, i) => ({ prob: p, label: labels[i] }))
        .sort((a, b) => b.prob - a.prob)
        .slice(0, 5);

      setPredictions(top5);

      // Backend üzerinden Türk Mutfağı eşleşmesi ara
      const searchTerms = top5.map(p => p.label).join(',');
      const searchRes = await fetch(`http://localhost:5000/api/search?q=${encodeURIComponent(top5[0].label)}`);
      const turkishMatches = await searchRes.json();
      setSuggestions(turkishMatches);

    } catch (err) {
      console.error("Analiz Hatası:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="analyzer-view">
      <div className="glass-card" style={{ textAlign: 'center' }}>
        <h2 style={{ marginTop: 0 }}>Görselden Tanıma</h2>
        <p style={{ color: 'var(--text-muted)' }}>Yemeğini fotoğrafla, AI en yakın yerel eşleşmeyi bulsun.</p>

        <div 
          className={`upload-zone ${image ? 'active' : ''}`} 
          onClick={() => fileInputRef.current.click()}
        >
          {image ? (
            <img src={image} alt="Önizleme" style={{ maxWidth: '100%', borderRadius: '15px' }} />
          ) : (
            <div style={{ fontSize: '3rem', margin: '20px' }}>📸</div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            hidden 
            accept="image/*"
          />
        </div>

        {image && !loading && predictions.length === 0 && (
          <button className="btn" style={{ width: '100%', marginTop: '20px' }} onClick={analyzeImage}>
            🚀 Analiz Et
          </button>
        )}

        {loading && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <div className="spinner"></div>
            <p>AI Analiz Ediyor...</p>
          </div>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="glass-card">
          <h3 style={{ marginTop: 0 }}>Eşleşen Türk Yemekleri</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Midenin bayram edeceği o lezzeti seç:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
            {suggestions.map(food => (
              <button 
                key={food.id} 
                className="btn" 
                style={{ background: 'rgba(255,255,255,0.05)', justifyContent: 'space-between', padding: '16px' }}
                onClick={() => onAddFood(food)}
              >
                <span>{food.name}</span>
                <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>{food.calories} kcal</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analyzer;
