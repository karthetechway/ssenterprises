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
        alert("⚠️ Database Write Failed: " + e.message + "\nAre your Firebase Realtime DB rules correct for $orderId?");
    }
  }
}

// Subscribe to database changes (called by admin.html and reports.html)
function subscribeToOrders(callback) {
  if (db) {
    db.ref('kc_orders').on('value', (snapshot) => {
      const data = snapshot.val();
      let updatedOrders = [];
      if (data) {
        if (Array.isArray(data)) {
          updatedOrders = data.filter(Boolean); // Clean out nulls from legacy arrays
        } else {
          // Convert the secure object structure back into the array Admin expects
          updatedOrders = Object.values(data).filter(Boolean);
        }
      }

      // AUTO-MERGE FALLBACK: Resets local orders that failed to push due to rules
      let merged = false;
      try {
        const local = JSON.parse(localStorage.getItem('kc_orders') || '[]');
        local.forEach(lo => {
          if (!updatedOrders.find(uo => uo.id === lo.id)) {
             updatedOrders.push(lo);
             merged = true;
          }
        });
      } catch(err) {}

      // Sort newest first safely
      updatedOrders.sort((a, b) => {
        const da = a.date ? new Date(a.date).getTime() : 0;
        const db = b.date ? new Date(b.date).getTime() : 0;
        const timeA = isNaN(da) ? 0 : da;
        const timeB = isNaN(db) ? 0 : db;
        return timeB - timeA;
      });

      // If missing orders were found locally, force sync them to Firebase using Admin Auth!
      if (merged && window.location.pathname.includes('admin')) {
         syncDatabase(updatedOrders);
      }

      localStorage.setItem('kc_orders', JSON.stringify(updatedOrders));
      callback(updatedOrders);
    }, (error) => {
      console.error("Firebase subscription error:", error);
      alert("⚠️ Firebase Read Error: " + error.message + "\nYour database rules might be denying access. Showing local orders only.");
      const localOrders = JSON.parse(localStorage.getItem('kc_orders') || '[]');
      callback(localOrders);
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
