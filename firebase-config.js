// =========================================================================
// FIREBASE CONFIGURATION (V8 SDK) — SS Enterprises
// =========================================================================

const firebaseConfig = {
  apiKey: "AIzaSyBIJFp8c3RfREOxiEvI8mRWxkXDla-dWsA",
  authDomain: "ss-enterprise-sivakasi.firebaseapp.com",
  databaseURL: "https://ss-enterprise-sivakasi-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ss-enterprise-sivakasi",
  storageBucket: "ss-enterprise-sivakasi.appspot.com",
  messagingSenderId: "959902392372",
  appId: "1:959902392372:web:430c72d5b0ffac5e24aa61"
};

let db = null;
let firestoreDb = null;

try {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  db = firebase.database();
  firestoreDb = firebase.firestore();
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization failed:', error);
}

// ─────────────────────────────────────────────────────────
// Show a dismissible banner when Firebase has issues
// ─────────────────────────────────────────────────────────
function _showFirebaseError(msg) {
  // Try a toast function if available on the page
  if (typeof toast === 'function') {
    toast('⚠️ ' + msg);
  }
  // Also log clearly for debugging
  console.error('[Firebase]', msg);

  // Inject a dismissible banner if one doesn't exist yet
  if (!document.getElementById('_fb_err_banner')) {
    const b = document.createElement('div');
    b.id = '_fb_err_banner';
    b.style.cssText = [
      'position:fixed;top:0;left:0;right:0;z-index:99999',
      'background:#DC2626;color:#fff;padding:10px 16px;font-size:.82rem;font-weight:700',
      'display:flex;align-items:center;justify-content:space-between;gap:12px',
      'font-family:system-ui,sans-serif;box-shadow:0 4px 12px rgba(0,0,0,.3)'
    ].join(';');
    b.innerHTML = `<span>⚠️ Firebase Database Error: ${msg} — <strong>Check your Firebase Database Rules (see console for details)</strong></span>`
      + `<button onclick="this.parentElement.remove()" style="background:rgba(255,255,255,.2);border:none;color:#fff;padding:3px 10px;border-radius:4px;cursor:pointer;font-weight:700">✕</button>`;
    document.body.prepend(b);
  }
}

// ─────────────────────────────────────────────────────────
// Save full order list to Firebase + localStorage
// ─────────────────────────────────────────────────────────
function syncDatabase(orders) {
  if (db) {
    const ordersObj = {};
    orders.forEach(o => { if (o && o.id) ordersObj[o.id] = o; });
    db.ref('kc_orders').set(ordersObj).catch(e => console.error('Firebase syncDatabase error:', e));
  }
  localStorage.setItem('kc_orders', JSON.stringify(orders));
}

// ─────────────────────────────────────────────────────────
// Push single new order (called by index.html storefront)
// ─────────────────────────────────────────────────────────
async function pushNewOrder(order) {
  // Always save to localStorage first as the guaranteed fallback
  try {
    const localOrders = JSON.parse(localStorage.getItem('kc_orders') || '[]');
    if (!localOrders.find(o => o.id === order.id)) {
      localOrders.unshift(order);
      localStorage.setItem('kc_orders', JSON.stringify(localOrders));
    }
  } catch(e) {}

  if (db) {
    await db.ref('kc_orders/' + order.id).set(order);
    console.log('✅ Order pushed to Firebase:', order.id);
  }
}

// ─────────────────────────────────────────────────────────
// Subscribe to real-time order updates
// Called by admin.html and reports.html after login
// ─────────────────────────────────────────────────────────
let _ordersRef = null;

function subscribeToOrders(callback) {
  // Detach any previous listener to prevent duplicate callbacks
  if (_ordersRef) {
    try { _ordersRef.off(); } catch(e) {}
    _ordersRef = null;
  }

  if (!db) {
    // No Firebase — use localStorage with cross-tab sync
    console.warn('Firebase not available, using localStorage fallback');
    window.addEventListener('storage', (e) => {
      if (e.key === 'kc_orders') {
        try { callback(JSON.parse(localStorage.getItem('kc_orders') || '[]')); } catch(e2) {}
      }
    });
    try { callback(JSON.parse(localStorage.getItem('kc_orders') || '[]')); } catch(e) { callback([]); }
    return;
  }

  _ordersRef = db.ref('kc_orders');

  // ── Step 1: Do an IMMEDIATE one-time read to show data fast ──
  _ordersRef.once('value')
    .then(snapshot => {
      const data = snapshot.val();
      console.log('📦 Firebase once() read:', data ? Object.keys(data).length + ' orders' : 'empty');
      const orders = _parseOrders(data);
      localStorage.setItem('kc_orders', JSON.stringify(orders));
      callback(orders);
    })
    .catch(err => {
      console.error('Firebase once() read failed:', err.code, err.message);
      _showFirebaseError(err.code + ': ' + err.message);
      // Fall back to localStorage
      try { callback(JSON.parse(localStorage.getItem('kc_orders') || '[]')); } catch(e) { callback([]); }
    });

  // ── Step 2: Also keep a real-time listener for live updates ──
  _ordersRef.on('value', (snapshot) => {
    const data = snapshot.val();
    const orders = _parseOrders(data);

    // Merge any local-only orders (e.g. offline writes)
    try {
      const local = JSON.parse(localStorage.getItem('kc_orders') || '[]');
      let merged = false;
      local.forEach(lo => {
        if (lo && lo.id && !orders.find(o => o.id === lo.id)) {
          orders.push(lo);
          merged = true;
        }
      });
      if (merged && window.location.pathname.includes('admin')) {
        syncDatabase(orders);
      }
    } catch(e) {}

    orders.sort((a, b) => {
      const tA = a.date ? (new Date(a.date).getTime() || 0) : 0;
      const tB = b.date ? (new Date(b.date).getTime() || 0) : 0;
      return tB - tA;
    });

    localStorage.setItem('kc_orders', JSON.stringify(orders));
    callback(orders);

  }, (error) => {
    // Real-time listener error — show visible banner and fall back
    console.error('Firebase real-time listener error:', error.code, error.message);
    _showFirebaseError(error.code + ': ' + error.message);
    try { callback(JSON.parse(localStorage.getItem('kc_orders') || '[]')); } catch(e) { callback([]); }
  });
}

// ─────────────────────────────────────────────────────────
// Parse Firebase snapshot data into a clean array
// ─────────────────────────────────────────────────────────
function _parseOrders(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data.filter(Boolean);
  return Object.values(data).filter(Boolean);
}

// ─────────────────────────────────────────────────────────
// Send order confirmation email via Firestore trigger
// ─────────────────────────────────────────────────────────
async function sendConfirmationEmail(orderData, htmlBody) {
  if (!firestoreDb) {
    console.warn('Firestore not initialized; email not sent.');
    return false;
  }
  try {
    await firestoreDb.collection('mail').add({
      to: [orderData.cEmail],
      bcc: ['rmanoharan475@gmail.com'],
      message: {
        subject: `Order Confirmation - #${orderData.id} - SS Enterprises`,
        html: htmlBody
      }
    });
    console.log('✅ Email request sent to Firestore');
    return true;
  } catch (e) {
    console.error('Error writing to mail collection:', e);
    return false;
  }
}
