// =========================================================================
// FIREBASE CONFIGURATION (V8 SDK)
//
// 1. Go to https://console.firebase.google.com/ and create a free project.
// 2. Go to Project Settings -> General -> add a Web App to get your config.
// 3. Go to "Realtime Database" and click "Create Database".
// 4. In the rules tab, set read/write to true (or define secure rules later).
// 5. Replace the placeholder values below with your actual Firebase config.
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

// Only initialize if placeholders have been changed, to avoid console errors
let db = null;
let firestoreDb = null;
if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    db = firebase.database();
    firestoreDb = firebase.firestore();
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
} else {
  console.warn("⚠️ Firebase is NOT configured. Orders are still using local storage fallback.");
}

/**
 * Fallback-enabled functions: uses Firebase if configured, otherwise localStorage
 */

// Save order list (called by admin.html and reports.html)
function syncDatabase(orders) {
  if (db) {
    // Save as an object mapping order id to order data to prevent array overwrites
    const ordersObj = {};
    orders.forEach(o => {
      if(o && o.id) ordersObj[o.id] = o;
    });
    db.ref('kc_orders').set(ordersObj).catch(e => console.error("Firebase save error:", e));
  }
  // Always keep a local copy as fallback or for instant local feedback
  localStorage.setItem('kc_orders', JSON.stringify(orders));
}

// Add a single order (called by index.html)
async function pushNewOrder(order) {
  const localOrders = JSON.parse(localStorage.getItem('kc_orders') || '[]');
  if (!localOrders.find(o => o.id === order.id)) {
    localOrders.unshift(order);
    localStorage.setItem('kc_orders', JSON.stringify(localOrders));
  }

  if (db) {
    // Push exactly one object directly instead of replacing the entire node
    // This perfectly fixes the race condition and array overwrites!
    try {
      await db.ref('kc_orders/' + order.id).set(order);
    } catch(e) {
        console.error("Firebase push error:", e);
        // Non-fatal: order is already saved to localStorage, throw so caller can catch
        throw e;
    }
  }
}

// Track active listener so we can detach before resubscribing (prevents duplicate callbacks)
let _ordersRef = null;

// Subscribe to database changes (called by admin.html and reports.html)
function subscribeToOrders(callback) {
  // Detach any previous listener to prevent duplicates on re-login / loadAll() calls
  if (_ordersRef) {
    try { _ordersRef.off(); } catch(e) {}
    _ordersRef = null;
  }

  if (db) {
    _ordersRef = db.ref('kc_orders');
    _ordersRef.on('value', (snapshot) => {
      const data = snapshot.val();
      let updatedOrders = [];
      if (data) {
        if (Array.isArray(data)) {
          updatedOrders = data.filter(Boolean);
        } else {
          // Firebase stores as object map (id -> order); convert back to array
          updatedOrders = Object.values(data).filter(Boolean);
        }
      }

      // Merge any local-only orders that haven't synced to Firebase yet
      try {
        const local = JSON.parse(localStorage.getItem('kc_orders') || '[]');
        let merged = false;
        local.forEach(lo => {
          if (lo && lo.id && !updatedOrders.find(uo => uo.id === lo.id)) {
            updatedOrders.push(lo);
            merged = true;
          }
        });
        // Push locally-created orders up to Firebase so all devices see them
        if (merged && window.location.pathname.includes('admin')) {
          syncDatabase(updatedOrders);
        }
      } catch(err) {}

      // Sort newest first
      updatedOrders.sort((a, b) => {
        const tA = a.date ? (new Date(a.date).getTime() || 0) : 0;
        const tB = b.date ? (new Date(b.date).getTime() || 0) : 0;
        return tB - tA;
      });

      localStorage.setItem('kc_orders', JSON.stringify(updatedOrders));
      callback(updatedOrders);
    }, (error) => {
      // Non-blocking: log error, fall back to localStorage silently
      console.error('Firebase subscription error:', error.code, error.message);
      try {
        const localOrders = JSON.parse(localStorage.getItem('kc_orders') || '[]');
        callback(localOrders);
      } catch(e) { callback([]); }
    });
  } else {
    // No Firebase: listen for cross-tab storage changes
    window.addEventListener('storage', (e) => {
      if (e.key === 'kc_orders') {
        try { callback(JSON.parse(localStorage.getItem('kc_orders') || '[]')); }
        catch(e2) { callback([]); }
      }
    });
    // Fire immediately with whatever is in localStorage
    try { callback(JSON.parse(localStorage.getItem('kc_orders') || '[]')); }
    catch(e) { callback([]); }
  }
}

// Push an email document to the Firestore 'mail' collection to trigger the Email extension
async function sendConfirmationEmail(orderData, htmlBody) {
  if (!firestoreDb) {
    console.warn("Firestore not initialized; email not sent.");
    return false;
  }

  try {
    // This pushes a document to the 'mail' collection. 
    // The "Trigger Email" extension listens to this collection automatically.
    await firestoreDb.collection('mail').add({
      to: [orderData.cEmail], // Send to customer
      bcc: ["rmanoharan475@gmail.com"], // Copy to shop owner
      message: {
        subject: `Order Confirmation - #${orderData.id} - SS Enterprises`,
        html: htmlBody // The beautiful HTML template from index.html
      }
    });
    console.log("Email request sent to Firestore successfully.");
    return true;
  } catch (e) {
    console.error("Error writing to mail collection:", e);
    return false;
  }
}
