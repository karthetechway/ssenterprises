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
  databaseURL: "https://ss-enterprise-sivakasi-default-rtdb.firebaseio.com",
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
    db.ref('kc_orders').set(orders).catch(e => console.error("Firebase save error:", e));
  }
  // Always keep a local copy as fallback or for instant local feedback
  localStorage.setItem('kc_orders', JSON.stringify(orders));
}

// Add a single order (called by index.html)
function pushNewOrder(order) {
  const localOrders = JSON.parse(localStorage.getItem('kc_orders') || '[]');
  localOrders.unshift(order);
  localStorage.setItem('kc_orders', JSON.stringify(localOrders));

  if (db) {
    // Save to firebase as array to mirror existing logic, though pushing an object is better usually.
    // For simplicity, we overwrite the whole array here based on localStorage.
    // In a prod app, we'd do db.ref('kc_orders').push(order)
    db.ref('kc_orders').set(localOrders).catch(e => console.error("Firebase push error:", e));
  }
}

// Subscribe to database changes (called by admin.html and reports.html)
function subscribeToOrders(callback) {
  if (db) {
    db.ref('kc_orders').on('value', (snapshot) => {
      const data = snapshot.val();
      const updatedOrders = data ? data : [];
      localStorage.setItem('kc_orders', JSON.stringify(updatedOrders));
      callback(updatedOrders);
    });
  } else {
    // Fallback: Storage event listener for cross-tab sync if no Firebase
    window.addEventListener('storage', (e) => {
      if (e.key === 'kc_orders') {
        const localOrders = JSON.parse(localStorage.getItem('kc_orders') || '[]');
        callback(localOrders);
      }
    });
    // Fire initial callback
    const localOrders = JSON.parse(localStorage.getItem('kc_orders') || '[]');
    callback(localOrders);
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
