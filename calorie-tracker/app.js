/**
 * KaloriLens - Görselden Kalori Takip Uygulaması
 * Vanilla JavaScript | localStorage | OpenAI Vision API
 *
 * API Entegrasyon Notu:
 * Bu uygulama OpenAI GPT-4o Vision API kullanır.
 * Kendi API anahtarınızı "API Ayarları" bölümüne girebilirsiniz.
 * Anahtar yoksa uygulama demo modda çalışır.
 */

'use strict';

/* ============================================================
   UYGULAMA DURUMU (STATE)
============================================================ */
const state = {
  currentImage: null,      // base64 encoded current image
  currentResult: null,     // last analysis result
  catalog: [],             // fetched from dummyjson
  goals: {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 65,
  },
  todayLog: [],            // array of food entries
  todayKey: '',            // localStorage key for today (YYYY-MM-DD)
};

/* ============================================================
   DOM REFERANSLARI
============================================================ */
const $ = (id) => document.getElementById(id);

const DOM = {
  // Nav
  navBtns: document.querySelectorAll('.nav-btn'),
  tabAnalyze: $('tab-analyze'),
  tabTracker: $('tab-tracker'),
  tabCatalog: $('tab-catalog'),

  // Catalog
  catalogGrid: $('catalogGrid'),
  catalogLoading: $('catalogLoading'),
  catalogError: $('catalogError'),
  searchInput: $('searchInput'),
  btnRetryCatalog: $('btnRetryCatalog'),

  // Upload
  uploadArea: $('uploadArea'),
  uploadPlaceholder: $('uploadPlaceholder'),
  previewImg: $('previewImg'),
  fileInputGallery: $('fileInputGallery'),
  fileInputCamera: $('fileInputCamera'),
  btnCamera: $('btnCamera'),
  btnGallery: $('btnGallery'),
  btnAnalyze: $('btnAnalyze'),

  // States
  loadingCard: $('loadingCard'),
  resultsCard: $('resultsCard'),
  errorCard: $('errorCard'),

  // Results
  detectedFood: $('detectedFood'),
  confidenceBadge: $('confidenceBadge'),
  predictionButtons: $('predictionButtons'),
  btnReset: $('btnReset'),

  // Error
  errorTitle: $('errorTitle'),
  errorMessage: $('errorMessage'),
  btnRetry: $('btnRetry'),

  // Tracker
  goalCalories: $('goalCalories'),
  goalProtein: $('goalProtein'),
  goalCarbs: $('goalCarbs'),
  goalFat: $('goalFat'),
  btnSaveGoals: $('btnSaveGoals'),

  // Summary
  todayDate: $('todayDate'),
  calorieRing: $('calorieRing'),
  ringConsumed: $('ringConsumed'),
  ringRemaining: $('ringRemaining'),
  consumedProtein: $('consumedProtein'),
  consumedCarbs: $('consumedCarbs'),
  consumedFat: $('consumedFat'),
  goalProteinDisplay: $('goalProteinDisplay'),
  goalCarbsDisplay: $('goalCarbsDisplay'),
  goalFatDisplay: $('goalFatDisplay'),
  progressProtein: $('progressProtein'),
  progressCarbs: $('progressCarbs'),
  progressFat: $('progressFat'),

  // Log
  foodLogList: $('foodLogList'),
  emptyLogMsg: $('emptyLogMsg'),
  btnClearLog: $('btnClearLog'),

  // Toast
  toast: $('toast'),
  toastMessage: $('toastMessage'),

  // Camera Modal
  cameraModal: $('cameraModal'),
  modalOverlay: $('modalOverlay'),
  btnCloseCamera: $('btnCloseCamera'),
  cameraFeed: $('cameraFeed'),
  cameraCanvas: $('cameraCanvas'),
  btnCapture: $('btnCapture'),
};

/* ============================================================
   LOCALSTORAGE YARDIMCI FONKSİYONLARI
============================================================ */
const LS_GOALS_KEY = 'kalorilens_goals';
const LS_LOG_PREFIX = 'kalorilens_log_';
const LS_API_KEY = 'kalorilens_api_key';

function saveGoals() {
  localStorage.setItem(LS_GOALS_KEY, JSON.stringify(state.goals));
}

function loadGoals() {
  const saved = localStorage.getItem(LS_GOALS_KEY);
  if (saved) {
    try { state.goals = { ...state.goals, ...JSON.parse(saved) }; } catch (e) { /* ignore */ }
  }
}

function saveTodayLog() {
  localStorage.setItem(LS_LOG_PREFIX + state.todayKey, JSON.stringify(state.todayLog));
}

function loadTodayLog() {
  const saved = localStorage.getItem(LS_LOG_PREFIX + state.todayKey);
  if (saved) {
    try { state.todayLog = JSON.parse(saved); } catch (e) { state.todayLog = []; }
  } else {
    state.todayLog = [];
  }
}



/* ============================================================
   TAB NAVİGASYON
============================================================ */
function switchTab(tabName) {
  DOM.navBtns.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
  DOM.tabAnalyze.classList.toggle('active', tabName === 'analyze');
  DOM.tabTracker.classList.toggle('active', tabName === 'tracker');
  if (DOM.tabCatalog) DOM.tabCatalog.classList.toggle('active', tabName === 'catalog');

  DOM.tabAnalyze.classList.toggle('hidden', tabName !== 'analyze');
  DOM.tabTracker.classList.toggle('hidden', tabName !== 'tracker');
  if (DOM.tabCatalog) DOM.tabCatalog.classList.toggle('hidden', tabName !== 'catalog');

  if (tabName === 'tracker') renderTrackerPanel();
  if (tabName === 'catalog' && state.catalog.length === 0) fetchCatalogFromAPI();
}

DOM.navBtns.forEach((btn) => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

/* ============================================================
   GÖRSEL YÜKLEME
============================================================ */
// Galeri
DOM.btnGallery.addEventListener('click', () => DOM.fileInputGallery.click());
DOM.fileInputGallery.addEventListener('change', (e) => handleFileSelect(e.target.files[0]));

// Kamera (mobil — native capture)
DOM.btnCamera.addEventListener('click', () => {
  // Masaüstü: getUserMedia modal aç; Mobil: native capture kullan
  if (/Mobi|Android/i.test(navigator.userAgent)) {
    DOM.fileInputCamera.click();
  } else {
    openCameraModal();
  }
});
DOM.fileInputCamera.addEventListener('change', (e) => handleFileSelect(e.target.files[0]));

// Drag & Drop
DOM.uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  DOM.uploadArea.classList.add('drag-over');
});
DOM.uploadArea.addEventListener('dragleave', () => DOM.uploadArea.classList.remove('drag-over'));
DOM.uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  DOM.uploadArea.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) handleFileSelect(file);
});

// Tıklayarak yükleme
DOM.uploadArea.addEventListener('click', (e) => {
  if (e.target === DOM.uploadArea || e.target === DOM.uploadPlaceholder || DOM.uploadPlaceholder.contains(e.target)) {
    DOM.fileInputGallery.click();
  }
});

function handleFileSelect(file) {
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    showToast('Lütfen geçerli bir görsel dosyası seçin.');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const base64 = e.target.result;
    state.currentImage = base64;
    showPreview(base64);
    hideResultCards();
    DOM.btnAnalyze.disabled = false;
  };
  reader.readAsDataURL(file);

  // Reset file inputs so same file can be re-selected
  DOM.fileInputGallery.value = '';
  DOM.fileInputCamera.value = '';
}

function showPreview(base64) {
  DOM.previewImg.src = base64;
  DOM.previewImg.classList.remove('hidden');
  DOM.uploadPlaceholder.classList.add('hidden');
}

/* ============================================================
   KAMERA MODAL (MASAÜSTÜ)
============================================================ */
let cameraStream = null;

async function openCameraModal() {
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
    });
    DOM.cameraFeed.srcObject = cameraStream;
    DOM.cameraModal.classList.remove('hidden');
  } catch (err) {
    // Fallback: native file input
    DOM.fileInputCamera.click();
  }
}

function closeCameraModal() {
  if (cameraStream) {
    cameraStream.getTracks().forEach((t) => t.stop());
    cameraStream = null;
  }
  DOM.cameraFeed.srcObject = null;
  DOM.cameraModal.classList.add('hidden');
}

DOM.btnCloseCamera.addEventListener('click', closeCameraModal);
DOM.modalOverlay.addEventListener('click', closeCameraModal);

DOM.btnCapture.addEventListener('click', () => {
  const video = DOM.cameraFeed;
  const canvas = DOM.cameraCanvas;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  const base64 = canvas.toDataURL('image/jpeg', 0.9);
  state.currentImage = base64;
  showPreview(base64);
  hideResultCards();
  DOM.btnAnalyze.disabled = false;
  closeCameraModal();
});


/* ============================================================
   ANALİZ BUTONU (MobileNet)
============================================================ */
let mobilenetModel = null;
async function loadMobileNet() {
  if (mobilenetModel) return;
  try {
    mobilenetModel = await mobilenet.load({ version: 2, alpha: 1.0 });
    console.log("MobileNet yüklendi!");
  } catch (err) {
    console.error("MobileNet hata: ", err);
  }
}

async function analyzeImage() {
  if (!state.currentImage) return;

  hideResultCards();
  DOM.loadingCard.classList.remove('hidden');
  DOM.btnAnalyze.disabled = true;

  try {
    if (!mobilenetModel) {
      await loadMobileNet();
    }
    if (!mobilenetModel) throw new Error("Yapay zeka modeli yüklenemedi.");

    const imgEl = new Image();
    imgEl.src = state.currentImage;
    await new Promise((resolve, reject) => {
      imgEl.onload = resolve;
      imgEl.onerror = reject;
    });

    const predictions = await mobilenetModel.classify(imgEl);
    showResults(predictions);
  } catch (err) {
    showError('Analiz başarısız', err.message || 'Lütfen tekrar deneyin.');
  } finally {
    DOM.loadingCard.classList.add('hidden');
    DOM.btnAnalyze.disabled = false;
  }
}

function showResults(predictions) {
  if (!predictions || predictions.length === 0) {
    showError('Tahmin Hatası', 'Görselde herhangi bir nesne algılanamadı.');
    return;
  }

  const topPrediction = predictions[0];
  const isHighConfidence = topPrediction.probability > 0.85;

  if (isHighConfidence) {
    const searchTerm = topPrediction.className.split(',')[0];
    showToast(`%${Math.round(topPrediction.probability * 100)} güvenle algılandı: ${searchTerm}`);
    if (DOM.searchInput) DOM.searchInput.value = searchTerm;
    fetchCatalogFromAPI(searchTerm);
    switchTab('catalog');
  } else {
    DOM.confidenceBadge.textContent = 'Tahmin (%' + Math.round(topPrediction.probability * 100) + ' güven)';
    DOM.confidenceBadge.className = 'confidence-badge medium';
    
    // Stabil predictionButtons
    DOM.predictionButtons.innerHTML = '';
    predictions.slice(0, 5).forEach(pred => {
      const term = pred.className.split(',')[0];
      const prob = Math.round(pred.probability * 100);
      
      const btn = document.createElement('button');
      btn.className = 'prediction-btn';
      btn.innerHTML = `<span>${term}</span> <span class="prob">%${prob}</span>`;
      
      btn.addEventListener('click', () => {
        if (DOM.searchInput) DOM.searchInput.value = term;
        fetchCatalogFromAPI(term);
        switchTab('catalog');
      });
      
      DOM.predictionButtons.appendChild(btn);
    });

    DOM.resultsCard.classList.remove('hidden');
  }
}

function showError(title, message) {
  DOM.errorTitle.textContent = title;
  DOM.errorMessage.textContent = message;
  DOM.errorCard.classList.remove('hidden');
}

function hideResultCards() {
  DOM.resultsCard.classList.add('hidden');
  DOM.errorCard.classList.add('hidden');
  DOM.loadingCard.classList.add('hidden');
}

// Sıfırla
DOM.btnReset.addEventListener('click', () => {
  state.currentImage = null;
  state.currentResult = null;
  DOM.previewImg.classList.add('hidden');
  DOM.uploadPlaceholder.classList.remove('hidden');
  DOM.previewImg.src = '';
  DOM.btnAnalyze.disabled = true;
  hideResultCards();
});

// Hata: tekrar dene
if (DOM.btnRetry) {
  DOM.btnRetry.addEventListener('click', () => {
    DOM.errorCard.classList.add('hidden');
    if (state.currentImage) analyzeImage();
  });
}

/* ============================================================
   TAKİP PANELİ
============================================================ */
function renderTrackerPanel() {
  // Tarih
  const now = new Date();
  DOM.todayDate.textContent = now.toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  // Hedefleri formlara doldur
  DOM.goalCalories.value = state.goals.calories || '';
  DOM.goalProtein.value = state.goals.protein || '';
  DOM.goalCarbs.value = state.goals.carbs || '';
  DOM.goalFat.value = state.goals.fat || '';

  // Hedef görüntü etiketleri
  DOM.goalProteinDisplay.textContent = state.goals.protein || '--';
  DOM.goalCarbsDisplay.textContent = state.goals.carbs || '--';
  DOM.goalFatDisplay.textContent = state.goals.fat || '--';

  // Tüketilen toplamlar
  const consumed = state.todayLog.reduce(
    (acc, item) => ({
      calories: acc.calories + (item.calories || 0),
      protein: acc.protein + (item.protein || 0),
      carbs: acc.carbs + (item.carbs || 0),
      fat: acc.fat + (item.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  // Kalori halkası
  DOM.ringConsumed.textContent = consumed.calories;
  const calGoal = state.goals.calories || 0;
  if (calGoal > 0) {
    const remaining = calGoal - consumed.calories;
    DOM.ringRemaining.textContent = remaining >= 0
      ? `${remaining} kcal kaldı`
      : `${Math.abs(remaining)} kcal fazla`;
    const pctFill = Math.min(consumed.calories / calGoal, 1);
    const circumference = 326.7;
    DOM.calorieRing.style.strokeDashoffset = `${circumference * (1 - pctFill)}`;
    DOM.calorieRing.style.stroke = remaining < 0 ? '#ef4444' : '#4f46e5';
  } else {
    DOM.ringRemaining.textContent = 'Hedef belirlenmedi';
    DOM.calorieRing.style.strokeDashoffset = '326.7';
  }

  // Makro ilerleme
  DOM.consumedProtein.textContent = consumed.protein;
  DOM.consumedCarbs.textContent = consumed.carbs;
  DOM.consumedFat.textContent = consumed.fat;

  setProgress(DOM.progressProtein, consumed.protein, state.goals.protein);
  setProgress(DOM.progressCarbs, consumed.carbs, state.goals.carbs);
  setProgress(DOM.progressFat, consumed.fat, state.goals.fat);

  // Öğün listesi
  renderFoodLog();
}

function setProgress(el, consumed, goal) {
  const pctVal = goal > 0 ? Math.min((consumed / goal) * 100, 110) : 0;
  el.style.width = `${pctVal}%`;
  if (pctVal > 100) el.style.filter = 'brightness(0.85) saturate(1.5)';
  else el.style.filter = '';
}

function renderFoodLog() {
  if (state.todayLog.length === 0) {
    DOM.emptyLogMsg.classList.remove('hidden');
    // Clear existing items but keep empty message
    Array.from(DOM.foodLogList.children).forEach((child) => {
      if (!child.classList.contains('empty-log')) child.remove();
    });
    return;
  }

  DOM.emptyLogMsg.classList.add('hidden');
  DOM.foodLogList.innerHTML = '';

  [...state.todayLog].reverse().forEach((item) => {
    const el = document.createElement('div');
    el.className = 'log-item';
    el.dataset.id = item.id;
    el.innerHTML = `
      <div class="log-item-icon">${item.icon}</div>
      <div class="log-item-info">
        <div class="log-item-name">${escapeHtml(item.name)}</div>
        <div class="log-item-macros">P: ${item.protein}g · K: ${item.carbs}g · Y: ${item.fat}g</div>
      </div>
      <div class="log-item-cal">${item.calories} kcal</div>
      <div class="log-item-time">${item.time}</div>
      <button class="log-item-delete" data-id="${item.id}" aria-label="Sil">🗑️</button>
    `;
    DOM.foodLogList.appendChild(el);
  });
}

// Öğün silme (event delegation)
DOM.foodLogList.addEventListener('click', (e) => {
  const deleteBtn = e.target.closest('.log-item-delete');
  if (!deleteBtn) return;
  const id = Number(deleteBtn.dataset.id);
  state.todayLog = state.todayLog.filter((item) => item.id !== id);
  saveTodayLog();
  renderTrackerPanel();
  showToast('Öğün silindi.');
});

// Log temizle
DOM.btnClearLog.addEventListener('click', () => {
  if (state.todayLog.length === 0) return;
  if (confirm('Bugünkü tüm öğünleri silmek istediğine emin misin?')) {
    state.todayLog = [];
    saveTodayLog();
    renderTrackerPanel();
    showToast('Günlük öğünler temizlendi.');
  }
});

// Hedef kaydet
DOM.btnSaveGoals.addEventListener('click', () => {
  state.goals.calories = parseInt(DOM.goalCalories.value, 10) || 2000;
  state.goals.protein = parseInt(DOM.goalProtein.value, 10) || 150;
  state.goals.carbs = parseInt(DOM.goalCarbs.value, 10) || 250;
  state.goals.fat = parseInt(DOM.goalFat.value, 10) || 65;
  saveGoals();
  renderTrackerPanel();
  showToast('Hedefler kaydedildi!');
});


/* ============================================================
   TOAST BİLDİRİMİ
============================================================ */
let toastTimeout = null;

function showToast(message, duration = 3000) {
  DOM.toastMessage.textContent = message;
  DOM.toast.classList.remove('hidden');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      DOM.toast.classList.add('show');
    });
  });
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    DOM.toast.classList.remove('show');
    setTimeout(() => DOM.toast.classList.add('hidden'), 350);
  }, duration);
}

/* ============================================================
   GÜVENLİK: HTML ESCAPE
============================================================ */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(String(str)));
  return div.innerHTML;
}

/* ============================================================
   YEMEK KATALOĞU (OPEN FOOD FACTS) LİSTELEME
============================================================ */
let catalogSearchTimeout = null;

async function fetchCatalogFromAPI(query = 'pizza') {
  if (!DOM.tabCatalog) return;
  DOM.catalogLoading.classList.remove('hidden');
  DOM.catalogGrid.classList.add('hidden');
  DOM.catalogError.classList.add('hidden');

  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=40`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();
    
    const products = data.products || [];
    state.catalog = products.map(p => {
      const name = p.product_name || p.product_name_fr || p.generic_name || 'İsimsiz Ürün';
      // Fallback image using a simple SVG data URI
      const image = p.image_url || p.image_front_small_url || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" fill="%23f3f4f6"><rect width="200" height="200"/><text x="50%" y="50%" fill="%239ca3af" font-family="sans-serif" font-size="20" text-anchor="middle" dominant-baseline="middle">Görsel Yok</text></svg>';
      const n = p.nutriments || {};
      
      const calories = Math.round(n['energy-kcal_100g'] || n['energy-kcal_serving'] || n['energy-kcal'] || 0);
      const protein = Math.round(n.proteins_100g || 0);
      const carbs = Math.round(n.carbohydrates_100g || 0);
      const fat = Math.round(n.fat_100g || 0);

      return {
        id: `off_${p._id}`,
        name: name,
        image: image,
        calories: calories,
        protein: protein,
        carbs: carbs,
        fat: fat
      };
    }).filter(item => item.calories > 0); // Hide totally empty/unknown items

    renderCatalog(state.catalog);
  } catch (err) {
    DOM.catalogLoading.classList.add('hidden');
    DOM.catalogError.classList.remove('hidden');
  }
}

function renderCatalog(items) {
  DOM.catalogLoading.classList.add('hidden');
  DOM.catalogError.classList.add('hidden');
  DOM.catalogGrid.classList.remove('hidden');
  DOM.catalogGrid.innerHTML = '';

  if (items.length === 0) {
    DOM.catalogGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color: var(--text-muted);">Sonuç bulunamadı.</p>';
    return;
  }

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'food-card';
    card.innerHTML = `
      <div class="food-card-img-wrapper">
        <img src="${item.image}" alt="${escapeHtml(item.name)}" class="food-card-img" loading="lazy" />
      </div>
      <div class="food-card-info">
        <div class="food-card-title">${escapeHtml(item.name)}</div>
        <div class="food-card-cal">${item.calories} kcal / 100g</div>
      </div>
      <button class="food-card-btn" aria-label="Takibe Ekle">Takibe Ekle ➕</button>
    `;
    
    card.addEventListener('click', () => addCatalogItemToTracker(item));
    DOM.catalogGrid.appendChild(card);
  });
}

function addCatalogItemToTracker(item) {
  const entry = {
    id: Date.now(),
    name: item.name,
    icon: '🍽️',
    calories: item.calories,
    protein: item.protein,
    carbs: item.carbs,
    fat: item.fat,
    time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
  };

  state.todayLog.push(entry);
  saveTodayLog();
  renderTrackerPanel();
  showToast(`${entry.name} takibe eklendi!`);
  
  setTimeout(() => switchTab('tracker'), 600);
}

if (DOM.searchInput) {
  DOM.searchInput.addEventListener('input', (e) => {
    const term = e.target.value.trim();
    if (catalogSearchTimeout) clearTimeout(catalogSearchTimeout);
    
    // Debounce for 500ms before making an API call
    catalogSearchTimeout = setTimeout(() => {
      fetchCatalogFromAPI(term || 'snack');
    }, 500);
  });
}

if (DOM.btnRetryCatalog) {
  DOM.btnRetryCatalog.addEventListener('click', () => {
    const term = DOM.searchInput ? DOM.searchInput.value.trim() : '';
    fetchCatalogFromAPI(term || 'pizza');
  });
}

/* ============================================================
   UYGULAMA BAŞLANGICI
============================================================ */
function init() {
  // Bugünün tarih anahtarını oluştur
  const now = new Date();
  state.todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // localStorage'dan yükle
  loadGoals();
  loadTodayLog();

  // İlk render
  renderTrackerPanel();
}

init();
