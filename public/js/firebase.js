import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBeG7uirpSS3N0I48fy7WqJa_SSrb8A-48",
  authDomain: "delta-pro-cuiaba.firebaseapp.com",
  projectId: "delta-pro-cuiaba",
  storageBucket: "delta-pro-cuiaba.appspot.com",
  messagingSenderId: "797115279316",
  appId: "1:797115279316:web:f229366de16d4e066e1841"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
