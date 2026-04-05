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
   ANALİZ BUTONU
============================================================ */
DOM.btnAnalyze.addEventListener('click', analyzeImage);

async function analyzeImage() {
  if (!state.currentImage) return;

  hideResultCards();
  DOM.loadingCard.classList.remove('hidden');
  DOM.btnAnalyze.disabled = true;

  try {
    const result = await callVisionAPI(state.currentImage);
    state.currentResult = result;
    showResults(result);
  } catch (err) {
    showError('Analiz başarısız', err.message || 'Lütfen API anahtarınızı kontrol edip tekrar deneyin.');
  } finally {
    DOM.loadingCard.classList.add('hidden');
    DOM.btnAnalyze.disabled = false;
  }
}

/* ============================================================
   VISION API ENTEGRASYONU
   ─────────────────────────────────────────────────────────────
   Gerçek API bağlantısı için:
   1. OpenAI hesabı oluşturun: https://platform.openai.com
   2. API anahtarı alın ve uygulamaya "API Ayarları" ile girin
   3. Aşağıdaki fonksiyon GPT-4o vision modelini kullanır

   Alternatif API'ler:
   - Google Gemini Vision: model değiştirerek entegre edebilirsiniz
   - Anthropic Claude Vision: aynı base64 formatı geçerlidir
============================================================ */
async function callVisionAPI(base64Image) {
  const apiKey = getApiKey();

  // Demo mod: API anahtarı yoksa simüle edilmiş veri döndür
  if (!apiKey) {
    return simulateAnalysis();
  }

  // Base64'ten veri URL'ini ayır (data:image/jpeg;base64,... -> ...)
  const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
  const mimeType = base64Image.startsWith('data:') ? base64Image.split(';')[0].split(':')[1] : 'image/jpeg';

  const prompt = `Bu görseldeki yemeği analiz et ve YALNIZCA aşağıdaki JSON formatında yanıt ver. Başka açıklama ekleme.

{
  "foodName": "Yemeğin Türkçe adı",
  "confidence": "Yüksek/Orta/Düşük",
  "calories": <sayı>,
  "protein": <gram sayısı>,
  "carbs": <gram sayısı>,
  "fat": <gram sayısı>,
  "fiber": <gram sayısı>,
  "sugar": <gram sayısı>,
  "sodium": <mg sayısı>,
  "portionSize": "Porsiyon açıklaması (örn: 1 tabak, ~250g)",
  "icon": "Tek emoji"
}

Eğer görsel yemek içermiyorsa: {"error": "Görsel bir yemek içermiyor."}`;

  // ── OpenAI GPT-4o Vision API ──────────────────────────────
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Data}`,
                detail: 'low', // 'low' = daha hızlı & ucuz; 'high' = daha detaylı
              },
            },
            { type: 'text', text: prompt },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const msg = errData?.error?.message || `API hatası: ${response.status}`;
    throw new Error(msg);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content?.trim();

  if (!content) throw new Error('API boş yanıt döndürdü.');

  // JSON çıkar (bazen markdown code block içinde gelebilir)
  const jsonStr = content.replace(/```(?:json)?/g, '').trim();
  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (e) {
    throw new Error('API yanıtı geçerli JSON değil. Tekrar deneyin.');
  }

  if (parsed.error) throw new Error(parsed.error);

  return parsed;
}

/* ─── DEMO MOD: Gerçekçi simüle edilmiş veri ────────────────── */
function simulateAnalysis() {
  const demoFoods = [
    {
      foodName: 'Makarna (Bolonez Soslu)',
      confidence: 'Yüksek',
      calories: 520,
      protein: 24,
      carbs: 68,
      fat: 16,
      fiber: 4,
      sugar: 7,
      sodium: 640,
      portionSize: '1 tabak (~300g)',
      icon: '🍝',
    },
    {
      foodName: 'Izgara Tavuk Göğsü + Pirinç Pilavı',
      confidence: 'Yüksek',
      calories: 445,
      protein: 38,
      carbs: 52,
      fat: 8,
      fiber: 1,
      sugar: 0,
      sodium: 390,
      portionSize: '1 porsiyon (~280g)',
      icon: '🍗',
    },
    {
      foodName: 'Sebzeli Omlet',
      confidence: 'Orta',
      calories: 295,
      protein: 18,
      carbs: 8,
      fat: 20,
      fiber: 2,
      sugar: 3,
      sodium: 480,
      portionSize: '2 yumurtalı (~200g)',
      icon: '🍳',
    },
    {
      foodName: 'Mercimek Çorbası',
      confidence: 'Yüksek',
      calories: 190,
      protein: 12,
      carbs: 28,
      fat: 4,
      fiber: 8,
      sugar: 2,
      sodium: 560,
      portionSize: '1 kase (~250ml)',
      icon: '🥣',
    },
  ];

  return new Promise((resolve) => {
    setTimeout(() => {
      const random = demoFoods[Math.floor(Math.random() * demoFoods.length)];
      resolve(random);
    }, 1800); // Gerçekçi bekleme süresi
  });
}

/* ============================================================
   SONUÇ GÖSTERİMİ
============================================================ */
function showResults(data) {
  DOM.detectedFood.textContent = `${data.icon || '🍽️'}  ${data.foodName} — ${data.portionSize}`;
  DOM.totalCalories.textContent = data.calories;
  DOM.confidenceBadge.textContent = `${data.confidence} Güven`;
  DOM.confidenceBadge.className = 'confidence-badge';
  DOM.confidenceBadge.classList.add(
    data.confidence === 'Yüksek' ? 'high' : data.confidence === 'Orta' ? 'medium' : 'low',
  );

  // Macro değerleri
  DOM.macroProtein.textContent = `${data.protein}g`;
  DOM.macroCarbs.textContent = `${data.carbs}g`;
  DOM.macroFat.textContent = `${data.fat}g`;

  // Macro bar doluluk oranları (kendi içindeki oran)
  const total = data.protein * 4 + data.carbs * 4 + data.fat * 9;
  requestAnimationFrame(() => {
    DOM.barProtein.style.width = total ? `${Math.round((data.protein * 4 / total) * 100)}%` : '0%';
    DOM.barCarbs.style.width = total ? `${Math.round((data.carbs * 4 / total) * 100)}%` : '0%';
    DOM.barFat.style.width = total ? `${Math.round((data.fat * 9 / total) * 100)}%` : '0%';
  });

  // Besin tablosu
  const rows = [
    { name: 'Kalori', value: `${data.calories} kcal`, dv: pct(data.calories, state.goals.calories) },
    { name: 'Protein', value: `${data.protein} g`, dv: pct(data.protein, state.goals.protein) },
    { name: 'Karbonhidrat', value: `${data.carbs} g`, dv: pct(data.carbs, state.goals.carbs) },
    { name: 'Yağ', value: `${data.fat} g`, dv: pct(data.fat, state.goals.fat) },
    { name: 'Lif', value: `${data.fiber ?? '—'} g`, dv: pct(data.fiber, 25) },
    { name: 'Şeker', value: `${data.sugar ?? '—'} g`, dv: '—' },
    { name: 'Sodyum', value: `${data.sodium ?? '—'} mg`, dv: pct(data.sodium, 2300) },
  ];

  DOM.nutritionTableBody.innerHTML = rows
    .map(
      (r) => `<tr>
        <td>${r.name}</td>
        <td>${r.value}</td>
        <td>${r.dv}</td>
      </tr>`,
    )
    .join('');

  DOM.resultsCard.classList.remove('hidden');
}

function pct(value, total) {
  if (!value || !total) return '—';
  return `%${Math.round((value / total) * 100)}`;
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
DOM.btnRetry.addEventListener('click', () => {
  DOM.errorCard.classList.add('hidden');
  if (state.currentImage) analyzeImage();
});

/* ============================================================
   TAKİBE EKLE
============================================================ */
DOM.btnAddToTracker.addEventListener('click', () => {
  if (!state.currentResult) return;

  const entry = {
    id: Date.now(),
    name: state.currentResult.foodName,
    icon: state.currentResult.icon || '🍽️',
    calories: state.currentResult.calories,
    protein: state.currentResult.protein,
    carbs: state.currentResult.carbs,
    fat: state.currentResult.fat,
    time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
  };

  state.todayLog.push(entry);
  saveTodayLog();
  renderTrackerPanel();
  showToast(`${entry.name} takibe eklendi! (${entry.calories} kcal)`);

  // Tracker sekmesine geç
  setTimeout(() => switchTab('tracker'), 800);
});

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
   API AYARLARI
============================================================ */
DOM.apiCardToggle.addEventListener('click', () => {
  const isOpen = !DOM.apiCardBody.classList.contains('hidden');
  DOM.apiCardBody.classList.toggle('hidden', isOpen);
  DOM.toggleIcon.classList.toggle('open', !isOpen);
});

DOM.btnSaveKey.addEventListener('click', () => {
  const key = DOM.apiKeyInput.value.trim();
  if (!key) {
    showToast('API anahtarı boş olamaz.');
    return;
  }
  saveApiKey(key);
  DOM.apiKeyInput.value = '';
  showToast('API anahtarı kaydedildi!');
});

// Kayıtlı anahtar varsa, input'a yıldız göster
function loadSavedApiKeyHint() {
  const key = getApiKey();
  if (key) {
    DOM.apiKeyInput.placeholder = '••••••••••••••••••••••• (kayıtlı)';
  }
}

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
