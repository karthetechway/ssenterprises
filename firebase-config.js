// =========================================================================
// FIREBASE CONFIGURATION (V8 SDK) — SS Enterprises
// Production-grade, real-time, secure
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
  db         = firebase.database();
  firestoreDb = firebase.firestore();
  console.log('✅ Firebase initialized');
} catch (err) {
  console.error('Firebase init failed:', err);
}

// ─────────────────────────────────────────────────────────────────────────
// Internal: show a visible non-blocking error banner on the page
// ─────────────────────────────────────────────────────────────────────────
function _showDbError(msg) {
  console.error('[Firebase DB]', msg);
  const id = '_fb_err_banner';
  if (document.getElementById(id)) return; // already shown
  const b = document.createElement('div');
  b.id = id;
  b.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#DC2626;color:#fff;' +
    'padding:10px 16px;font-size:.82rem;font-weight:700;display:flex;align-items:center;' +
    'justify-content:space-between;gap:12px;font-family:system-ui,sans-serif;' +
    'box-shadow:0 4px 12px rgba(0,0,0,.4)';
  b.innerHTML = '<span>⚠️ Firebase Error: ' + _escHtml(msg) +
    ' — check Realtime Database Rules in Firebase Console</span>' +
    '<button onclick="this.parentElement.remove()" style="background:rgba(255,255,255,.25);' +
    'border:none;color:#fff;padding:3px 10px;border-radius:4px;cursor:pointer;font-weight:700">✕</button>';
  if (document.body) document.body.prepend(b);
}

function _escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ─────────────────────────────────────────────────────────────────────────
// Internal: parse Firebase snapshot value into a clean, sorted orders array
// ─────────────────────────────────────────────────────────────────────────
function _parseOrders(data) {
  if (!data) return [];
  const arr = Array.isArray(data) ? data : Object.values(data);
  return arr.filter(o => o && o.id);
}

function _sortNewestFirst(arr) {
  return arr.sort((a, b) => {
    const tA = a.date ? new Date(a.date).getTime() : 0;
    const tB = b.date ? new Date(b.date).getTime() : 0;
    return (isNaN(tB) ? 0 : tB) - (isNaN(tA) ? 0 : tA);
  });
}

// ─────────────────────────────────────────────────────────────────────────
// syncDatabase — save full orders list back to Firebase + localStorage
// Called by admin when bulk-editing status or merging local orders
// ─────────────────────────────────────────────────────────────────────────
function syncDatabase(orders) {
  const safe = Array.isArray(orders) ? orders : [];
  // Save to localStorage always (instant local cache)
  try { localStorage.setItem('kc_orders', JSON.stringify(safe)); } catch(e) {}
  if (!db) return;
  const obj = {};
  safe.forEach(o => { if (o && o.id) obj[o.id] = o; });
  db.ref('kc_orders').set(obj).catch(e => console.error('syncDatabase error:', e));
}

// ─────────────────────────────────────────────────────────────────────────
// pushNewOrder — atomic single-order write from storefront (index.html)
// ─────────────────────────────────────────────────────────────────────────
async function pushNewOrder(order) {
  if (!order || !order.id) throw new Error('Invalid order object');

  // Always persist locally first — zero-risk fallback
  try {
    const local = JSON.parse(localStorage.getItem('kc_orders') || '[]');
    if (!local.find(o => o.id === order.id)) {
      local.unshift(order);
      localStorage.setItem('kc_orders', JSON.stringify(local));
    }
  } catch(e) {}

  if (!db) return; // No Firebase configured — local-only mode

  // Atomic write to a single node — never clobbers other orders
  await db.ref('kc_orders/' + order.id).set(order);
  console.log('✅ Order saved to Firebase:', order.id);
}

// ─────────────────────────────────────────────────────────────────────────
// subscribeToOrders — real-time subscription for admin & reports
//
// Each page gets its OWN independent ref tracked per-page via a closure.
// This prevents admin detaching reports' listener and vice versa when both
// tabs are open simultaneously.
// ─────────────────────────────────────────────────────────────────────────
function subscribeToOrders(callback) {
  // ── Local-only fallback when Firebase not configured ──
  if (!db) {
    console.warn('Firebase not available — using localStorage only');
    const emit = () => {
      try { callback(_sortNewestFirst(JSON.parse(localStorage.getItem('kc_orders') || '[]'))); }
      catch(e) { callback([]); }
    };
    window.addEventListener('storage', e => { if (e.key === 'kc_orders') emit(); });
    emit();
    return () => {}; // no-op unsubscribe
  }

  const ref = db.ref('kc_orders');
  let firstCall = true;

  // ── Step 1: One-time read for immediate display ──────────────────────
  ref.once('value').then(snap => {
    if (!firstCall) return; // real-time listener already fired
    const orders = _mergeWithLocal(_parseOrders(snap.val()));
    _sortNewestFirst(orders);
    _cacheLocally(orders);
    callback(orders);
    console.log('📦 orders (once):', orders.length);
  }).catch(err => {
    console.error('once() read failed:', err.code, err.message);
    _showDbError(err.code + ': ' + err.message);
    // Still call back with local data so UI isn't blank
    try { callback(_sortNewestFirst(JSON.parse(localStorage.getItem('kc_orders') || '[]'))); }
    catch(e) { callback([]); }
  });

  // ── Step 2: Persistent real-time listener ───────────────────────────
  const handler = ref.on('value', snap => {
    firstCall = false;
    const orders = _mergeWithLocal(_parseOrders(snap.val()));
    _sortNewestFirst(orders);
    _cacheLocally(orders);
    callback(orders);
    console.log('🔄 orders (realtime):', orders.length);
  }, err => {
    console.error('realtime listener error:', err.code, err.message);
    _showDbError(err.code + ': ' + err.message);
    try { callback(_sortNewestFirst(JSON.parse(localStorage.getItem('kc_orders') || '[]'))); }
    catch(e) { callback([]); }
  });

  // Return an unsubscribe function the caller can use if needed
  return () => { try { ref.off('value', handler); } catch(e) {} };
}

// Merge Firebase orders with any local-only orders (offline writes)
function _mergeWithLocal(firebaseOrders) {
  try {
    const local = JSON.parse(localStorage.getItem('kc_orders') || '[]');
    local.forEach(lo => {
      if (lo && lo.id && !firebaseOrders.find(fo => fo.id === lo.id)) {
        firebaseOrders.push(lo);
      }
    });
  } catch(e) {}
  return firebaseOrders;
}

function _cacheLocally(orders) {
  try { localStorage.setItem('kc_orders', JSON.stringify(orders)); } catch(e) {}
}

// ─────────────────────────────────────────────────────────────────────────
// sendConfirmationEmail — Firestore trigger email
// ─────────────────────────────────────────────────────────────────────────
async function sendConfirmationEmail(orderData, htmlBody) {
  if (!firestoreDb) {
    console.warn('Firestore not initialized; email skipped.');
    return false;
  }
  try {
    await firestoreDb.collection('mail').add({
      to:      [orderData.cEmail],
      bcc:     ['rmanoharan475@gmail.com'],
      message: {
        subject: 'Order Confirmation - #' + orderData.id + ' - SS Enterprises',
        html:    htmlBody
      }
    });
    console.log('✅ Confirmation email queued');
    return true;
  } catch (err) {
    console.error('Email queue error:', err);
    return false;
  }
}
