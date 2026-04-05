/**
 * CaloriLens Pro - Master Logic
 * AI + Turkish Foods + Barcode Scanner
 */

const TURKISH_FOODS = [
  { id: 1, name: "Mercimek Çorbası", calories: 55, protein: 3.0, carbs: 8.5, fat: 1.2, aliases: ["mercimek", "çorba", "lentil soup"] },
  { id: 2, name: "Ezogelin Çorbası", calories: 65, protein: 3.2, carbs: 9.0, fat: 1.8, aliases: ["ezogelin", "çorba"] },
  { id: 3, name: "Tarhana Çorbası", calories: 85, protein: 4.5, carbs: 12.0, fat: 2.5, aliases: ["tarhana", "çorba"] },
  { id: 4, name: "Yayla Çorbası", calories: 70, protein: 3.8, carbs: 10.5, fat: 2.1, aliases: ["yayla", "çorba", "yoğurt çorbası"] },
  { id: 5, name: "Domates Çorbası", calories: 45, protein: 1.5, carbs: 6.8, fat: 1.5, aliases: ["domates", "çorba", "tomato soup"] },
  { id: 7, name: "Kuru Fasulye", calories: 115, protein: 7.8, carbs: 18.0, fat: 1.5, aliases: ["kuru fasulye", "fasulye", "bean stew"] },
  { id: 8, name: "Nohut Yemeği", calories: 130, protein: 8.5, carbs: 22.0, fat: 1.8, aliases: ["nohut", "chickpea stew"] },
  { id: 9, name: "Zeytinyağlı Taze Fasulye", calories: 65, protein: 2.1, carbs: 8.5, fat: 3.2, aliases: ["taze fasulye", "yeşil fasulye"] },
  { id: 13, name: "Zeytinyağlı Yaprak Sarma", calories: 215, protein: 3.2, carbs: 28.5, fat: 10.2, aliases: ["yaprak sarma", "sarma", "dolma"] },
  { id: 16, name: "Patlıcan Musakka", calories: 135, protein: 7.8, carbs: 10.5, fat: 7.2, aliases: ["musakka", "patlıcan"] },
  { id: 17, name: "Karnıyarık", calories: 155, protein: 9.2, carbs: 11.0, fat: 8.5, aliases: ["karnıyarık", "patlıcan"] },
  { id: 24, name: "Adana Kebap", calories: 245, protein: 18.5, carbs: 2.5, fat: 18.5, aliases: ["adana", "kebap", "kebab"] },
  { id: 26, name: "İskender Kebap", calories: 215, protein: 14.5, carbs: 12.0, fat: 12.5, aliases: ["iskender", "döner", "kebap"] },
  { id: 31, name: "Köfte (Izgara)", calories: 225, protein: 16.5, carbs: 8.5, fat: 14.5, aliases: ["köfte", "kofte", "meatballs"] },
  { id: 34, name: "Lahmacun", calories: 235, protein: 12.5, carbs: 28.5, fat: 8.5, aliases: ["lahmacun", "turkish pizza"] },
  { id: 35, name: "Kıymalı Pide", calories: 255, protein: 11.5, carbs: 32.5, fat: 9.5, aliases: ["pide", "meat pide"] },
  { id: 38, name: "Pirinç Pilavı", calories: 175, protein: 2.5, carbs: 38.5, fat: 1.5, aliases: ["pilav", "pirinç", "rice"] },
  { id: 39, name: "Bulgur Pilavı", calories: 120, protein: 4.5, carbs: 24.5, fat: 1.2, aliases: ["pilav", "bulgur", "bulgur pilaf"] },
  { id: 40, name: "Mantı", calories: 185, protein: 8.5, carbs: 28.5, fat: 5.5, aliases: ["mantı", "manti", "turkish ravioli"] },
  { id: 41, name: "Su Böreği", calories: 285, protein: 8.5, carbs: 32.5, fat: 14.5, aliases: ["su böreği", "borek", "pastry"] },
  { id: 45, name: "Menemen", calories: 115, protein: 6.5, carbs: 5.5, fat: 7.5, aliases: ["menemen", "turkish omelette"] },
  { id: 51, name: "Beyaz Peynir", calories: 285, protein: 16.5, carbs: 2.5, fat: 24.5, aliases: ["beyaz peynir", "feta cheese"] },
  { id: 61, name: "Simit", calories: 275, protein: 8.5, carbs: 52.5, fat: 4.5, aliases: ["simit", "turkish bagel"] },
  { id: 64, name: "Baklava (Fıstıklı)", calories: 425, protein: 6.5, carbs: 58.5, fat: 22.5, aliases: ["baklava", "fıstıklı baklava"] },
  { id: 67, name: "Sütlaç (Fırın)", calories: 135, protein: 3.8, carbs: 24.5, fat: 2.5, aliases: ["sütlaç", "rice pudding"] },
  { id: 75, name: "Künefe", calories: 385, protein: 6.5, carbs: 54.5, fat: 16.5, aliases: ["künefe", "kunefe"] },
  { id: 78, name: "Kısır", calories: 145, protein: 3.5, carbs: 24.5, fat: 4.5, aliases: ["kısır", "bulgur salad"] },
  { id: 81, name: "Cacık", calories: 45, protein: 3.5, carbs: 3.5, fat: 2.1, aliases: ["cacık", "yoğurtlu salatalık"] },
  { id: 96, name: "Ayran", calories: 35, protein: 2.1, carbs: 2.8, fat: 1.5, aliases: ["ayran", "yoğurt içeceği"] },
  { id: 99, name: "Türk Kahvesi", calories: 2, protein: 0.1, carbs: 0.3, fat: 0.1, aliases: ["kahve", "türk kahvesi"] },
  { id: 101, name: "Yumurta (Haşlanmış)", calories: 155, protein: 13.0, carbs: 1.1, fat: 11.0, aliases: ["yumurta", "egg"] },
  { id: 102, name: "Ekmek (Tam Buğday)", calories: 245, protein: 9.0, carbs: 45.0, fat: 4.0, aliases: ["ekmek", "bread"] }
  // ... (Liste backend veri setinden referans alınmaktadır, performans için kritik olanlar buradadır)
];

// STATE
let foodModel = null;
let foodLabels = [];
let dailyLogs = JSON.parse(localStorage.getItem('calori_logs') || '[]');
let currentImage = null;
let fuse = null;
let html5QrCode = null;

const FOOD_MODEL_URL = 'https://tfhub.dev/google/tfjs-model/food/classifier/1/default/1';
const LABEL_MAP_URL = 'https://www.gstatic.com/aihub/tfhub/labelmaps/aiy_food_V1_labelmap.csv';

// DOM ELEMENTS
const DOM = {
  navItems: document.querySelectorAll('.nav-item'),
  tabs: document.querySelectorAll('.tab-section'),
  btnUpload: document.getElementById('btnUploadTrigger'),
  fileInput: document.getElementById('fileInput'),
  previewImg: document.getElementById('previewImg'),
  uploadIndicator: document.getElementById('uploadIndicator'),
  analyzeAction: document.getElementById('analyzeAction'),
  btnRunAnalyze: document.getElementById('btnRunAnalyze'),
  loadingCard: document.getElementById('loadingCard'),
  resultsArea: document.getElementById('resultsArea'),
  predictionList: document.getElementById('predictionList'),
  btnResetAnalyze: document.getElementById('btnResetAnalyze'),
  // Barcode
  btnStartBarcode: document.getElementById('btnStartBarcode'),
  barcodeReader: document.getElementById('barcodeReader'),
  barcodeResult: document.getElementById('barcodeResult'),
  // Catalog
  catalogSearch: document.getElementById('catalogSearch'),
  catalogList: document.getElementById('catalogList'),
  // Tracker
  totalCalories: document.getElementById('totalCalories'),
  totalProtein: document.getElementById('totalProtein'),
  totalCarbs: document.getElementById('totalCarbs'),
  totalFat: document.getElementById('totalFat'),
  dailyLog: document.getElementById('dailyLog'),
  btnClearLogs: document.getElementById('btnClearLogs')
};

// INITIALIZATION
async function init() {
  // Navigation
  DOM.navItems.forEach(item => {
    item.addEventListener('click', () => switchTab(item.dataset.tab));
  });

  // Fuse.js Init
  fuse = new Fuse(TURKISH_FOODS, { keys: ['name', 'aliases'], threshold: 0.4 });

  // Load Model Assets
  try {
    foodModel = await tf.loadGraphModel(FOOD_MODEL_URL, { fromTFHub: true });
    const res = await fetch(LABEL_MAP_URL);
    const csv = await res.text();
    foodLabels = csv.split('\n').slice(1).map(l => l.split(',')[1]?.trim()).filter(Boolean);
    console.log("CaloriLens AI Ready.");
  } catch (err) {
    console.error("AI Load Error:", err);
  }

  updateTracker();
  renderCatalog(TURKISH_FOODS);
}

// TAB SWITCHING
function switchTab(tabId) {
  DOM.tabs.forEach(tab => tab.classList.remove('active'));
  DOM.navItems.forEach(nav => nav.classList.remove('active'));
  
  document.getElementById(`tab-${tabId}`).classList.add('active');
  document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');

  if (tabId === 'barcode' && html5QrCode) {
     // Stop scanner if leaving barcode tab handled by scanner stop logic
  }
}

// ============================================================
// AI ANALYZER
// ============================================================
DOM.btnUpload.addEventListener('click', () => DOM.fileInput.click());
DOM.fileInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = ev => {
      currentImage = ev.target.result;
      DOM.previewImg.src = currentImage;
      DOM.previewImg.classList.remove('hidden');
      DOM.uploadIndicator.classList.add('hidden');
      DOM.analyzeAction.classList.remove('hidden');
      DOM.resultsArea.classList.add('hidden');
    };
    reader.readAsDataURL(file);
  }
});

DOM.btnRunAnalyze.addEventListener('click', async () => {
  if (!foodModel || !currentImage) return;
  DOM.loadingCard.classList.remove('hidden');
  DOM.analyzeAction.classList.add('hidden');

  try {
    const img = new Image();
    img.src = currentImage;
    await img.decode();

    const tensor = tf.tidy(() => {
      const pixels = tf.browser.fromPixels(img).resizeNearestNeighbor([224, 224]).toFloat();
      return pixels.sub(127.5).div(127.5).expandDims(); // Normalization [-1, 1]
    });

    const predictions = await foodModel.predict(tensor);
    const probabilities = await predictions.data();
    tensor.dispose();

    const topAI = Array.from(probabilities)
      .map((p, i) => ({ prob: p, label: foodLabels[i] }))
      .sort((a, b) => b.prob - a.prob)
      .slice(0, 3);

    // SMART PIPELINE: Match AI labels with Turkish dataset
    let matches = [];
    topAI.forEach(ai => {
      const localMatches = fuse.search(ai.label);
      localMatches.forEach(m => {
        if (!matches.find(ex => ex.id === m.item.id)) matches.push(m.item);
      });
    });

    // Fallback: If no direct match, show Top AI names as candidates
    renderPredictions(matches, topAI);
  } catch (err) {
    console.error(err);
  } finally {
    DOM.loadingCard.classList.add('hidden');
    DOM.resultsArea.classList.remove('hidden');
  }
});

function renderPredictions(matches, topAI) {
  DOM.predictionList.innerHTML = '';
  
  if (matches.length > 0) {
    matches.slice(0, 5).forEach(food => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-secondary';
      btn.style.justifyContent = 'space-between';
      btn.innerHTML = `<span>${food.name}</span> <span class="chip">${food.calories} kcal</span>`;
      btn.onclick = () => addFoodLog(food);
      DOM.predictionList.appendChild(btn);
    });
  } else {
    // If no Turkish match found, show AI labels directly
    topAI.forEach(ai => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-secondary';
      btn.innerHTML = `<span>${ai.label}</span>`;
      btn.onclick = () => {
         // Add generic if user wants
         addFoodLog({ name: ai.label, calories: 150, protein: 5, carbs: 20, fat: 5 });
      };
      DOM.predictionList.appendChild(btn);
    });
  }
}

DOM.btnResetAnalyze.addEventListener('click', () => {
  DOM.previewImg.classList.add('hidden');
  DOM.uploadIndicator.classList.remove('hidden');
  DOM.resultsArea.classList.add('hidden');
  DOM.fileInput.value = '';
});

// ============================================================
// BARCODE SCANNER
// ============================================================
DOM.btnStartBarcode.addEventListener('click', () => {
  DOM.barcodeReader.innerHTML = ''; // Clear start button
  html5QrCode = new Html5Qrcode("barcodeReader");
  const config = { fps: 10, qrbox: { width: 250, height: 150 } };

  html5QrCode.start({ facingMode: "environment" }, config, (decodedText) => {
    html5QrCode.stop();
    fetchBarcode(decodedText);
  });
});

async function fetchBarcode(code) {
  DOM.barcodeReader.innerHTML = `<div class="spinner"></div><p>Ürün aranıyor: ${code}</p>`;
  try {
    const url = `https://world.openfoodfacts.org/api/v2/product/${code}.json`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    
    const res = await fetch(proxyUrl);
    const wrapper = await res.json();
    const data = JSON.parse(wrapper.contents);

    if (data.status === 1) {
      const p = data.product;
      const food = {
        name: p.product_name || 'Bilinmeyen Ürün',
        calories: p.nutriments['energy-kcal_100g'] || 0,
        protein: p.nutriments.proteins_100g || 0,
        carbs: p.nutriments.carbohydrates_100g || 0,
        fat: p.nutriments.fat_100g || 0
      };
      renderBarcodeResult(food);
    } else {
      DOM.barcodeReader.innerHTML = `<p>Ürün bulunamadı.</p><button class="btn" onclick="location.reload()">Tekrar Dene</button>`;
    }
  } catch (err) {
    console.error(err);
  }
}

function renderBarcodeResult(food) {
  DOM.barcodeReader.classList.add('hidden');
  DOM.barcodeResult.classList.remove('hidden');
  DOM.barcodeResult.innerHTML = `
    <div class="glass-card">
      <h3>${food.name}</h3>
      <div class="stats-grid">
        <div class="stat-item"><span class="stat-val">${food.calories}</span><span class="stat-lbl">kcal</span></div>
        <div class="stat-item"><span class="stat-val">${food.protein}g</span><span class="stat-lbl">P</span></div>
        <div class="stat-item"><span class="stat-val">${food.carbs}g</span><span class="stat-lbl">C</span></div>
      </div>
      <button class="btn" id="btnAddBarcode" style="margin-top: 20px;">✅ Günlüğe Ekle</button>
    </div>
  `;
  document.getElementById('btnAddBarcode').onclick = () => addFoodLog(food);
}

// ============================================================
// CATALOG & TRACKER
// ============================================================
function renderCatalog(list) {
  DOM.catalogList.innerHTML = '';
  list.forEach(food => {
    const div = document.createElement('div');
    div.className = 'glass-card';
    div.style.padding = '16px';
    div.style.display = 'flex';
    div.style.justifyContent = 'space-between';
    div.style.alignItems = 'center';
    div.innerHTML = `<div><strong>${food.name}</strong><br><small>${food.calories} kcal</small></div> <button class="btn chip" style="width: auto;">Ekle +</button>`;
    div.onclick = () => addFoodLog(food);
    DOM.catalogList.appendChild(div);
  });
}

DOM.catalogSearch.addEventListener('input', e => {
  const query = e.target.value.toLowerCase();
  const filtered = TURKISH_FOODS.filter(f => f.name.toLowerCase().includes(query) || f.aliases.join(' ').includes(query));
  renderCatalog(filtered);
});

function addFoodLog(food) {
  const entry = { ...food, time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }), id: Date.now() };
  dailyLogs.push(entry);
  localStorage.setItem('calori_logs', JSON.stringify(dailyLogs));
  updateTracker();
  switchTab('tracker');
  showToast(`${food.name} eklendi!`);
}

function updateTracker() {
  const totals = dailyLogs.reduce((acc, log) => ({
    calories: acc.calories + log.calories,
    protein: acc.protein + (parseFloat(log.protein) || 0),
    carbs: acc.carbs + (parseFloat(log.carbs) || 0),
    fat: acc.fat + (parseFloat(log.fat) || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  DOM.totalCalories.innerText = Math.round(totals.calories);
  DOM.totalProtein.innerText = totals.protein.toFixed(1) + 'g';
  DOM.totalCarbs.innerText = totals.carbs.toFixed(1) + 'g';
  DOM.totalFat.innerText = totals.fat.toFixed(1) + 'g';

  DOM.dailyLog.innerHTML = dailyLogs.length === 0 ? '<p style="text-align:center; color:var(--text-muted);">Henüz kayıt yok.</p>' : '';
  dailyLogs.slice().reverse().forEach(log => {
      const item = document.createElement('div');
      item.className = 'glass-card';
      item.style.padding = '12px 16px';
      item.style.marginBottom = '10px';
      item.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div><strong>${log.name}</strong><br><small>${log.calories} kcal | ${log.time}</small></div>
          <button style="background:none; border:none; cursor:pointer;" onclick="deleteLog(${log.id})">🗑️</button>
        </div>
      `;
      DOM.dailyLog.appendChild(item);
  });
}

window.deleteLog = (id) => {
  dailyLogs = dailyLogs.filter(l => l.id !== id);
  localStorage.setItem('calori_logs', JSON.stringify(dailyLogs));
  updateTracker();
};

DOM.btnClearLogs.addEventListener('click', () => {
  if (confirm("üm kayıtlar silinsin mi?")) {
    dailyLogs = [];
    localStorage.removeItem('calori_logs');
    updateTracker();
  }
});

function showToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'glass-card';
  toast.style.position = 'fixed';
  toast.style.top = '20px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.background = 'var(--success)';
  toast.style.zIndex = '99999';
  toast.innerText = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

// BOOTSTRAP
init();
