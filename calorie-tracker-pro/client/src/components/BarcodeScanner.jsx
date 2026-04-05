import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const BarcodeScanner = ({ onAddFood }) => {
  const [scanning, setScanning] = useState(false);
  const [product, setProduct] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (scanning) {
      const scanner = new Html5QrcodeScanner("reader", { 
        fps: 10, 
        qrbox: { width: 250, height: 150 },
        rememberLastUsedCamera: true,
        supportedScanTypes: [0] // Barcode only
      }, false);

      scanner.render((decodedText) => {
        fetchProduct(decodedText);
        scanner.clear();
        setScanning(false);
      }, (error) => {
        // console.warn(error);
      });

      return () => scanner.clear();
    }
  }, [scanning]);

  const fetchProduct = async (code) => {
    try {
      const res = await fetch(`http://localhost:5000/api/barcode/${code}`);
      const data = await res.json();
      if (data.success) {
        setProduct(data.product);
      } else {
        alert("Ürün bulunamadı!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="scanner-view">
      <div className="glass-card" style={{ textAlign: 'center' }}>
        <h2 style={{ marginTop: 0 }}>Barkod Tara</h2>
        <p style={{ color: 'var(--text-muted)' }}>Paketli ürünleri anında tanı, besin değerlerini otomatik çek.</p>

        {!scanning && !product && (
          <button className="btn" style={{ width: '100%', margin: '20px 0' }} onClick={() => setScanning(true)}>
            📷 Kamerayı Başlat
          </button>
        )}

        {scanning && <div id="reader" style={{ width: '100%', borderRadius: '20px', overflow: 'hidden' }}></div>}

        {product && (
          <div className="product-result" style={{ marginTop: '20px', textAlign: 'left' }}>
            <div style={{ display: 'flex', gap: '15px' }}>
              {product.image && <img src={product.image} width="80" style={{ borderRadius: '10px' }} />}
              <div>
                <h4 style={{ margin: 0 }}>{product.name}</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{product.brand}</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <div className="chip">{product.calories} kcal</div>
              <div className="chip">P: {product.protein}g</div>
              <div className="chip">C: {product.carbs}g</div>
              <div className="chip">F: {product.fat}g</div>
            </div>

            <button 
              className="btn" 
              style={{ width: '100%', marginTop: '20px' }}
              onClick={() => {
                onAddFood(product);
                setProduct(null);
              }}
            >
              ✅ Takbe Ekle
            </button>
            <button 
              className="btn" 
              style={{ width: '100%', marginTop: '10px', background: 'rgba(255,0,0,0.2)' }}
              onClick={() => setProduct(null)}
            >
              🔄 Yeniden Tara
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BarcodeScanner;
