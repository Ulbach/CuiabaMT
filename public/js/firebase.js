import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth as getFirebaseAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBeG7uirpSS3N0I48fy7WqJa_SSrb8A-48",
  authDomain: "cuiaba-01617931-f126e.firebaseapp.com",
  projectId: "cuiaba-01617931-f126e",
  storageBucket: "cuiaba-01617931-f126e.firebasestorage.app",
  messagingSenderId: "797115279316",
  appId: "1:797115279316:web:f229366de16d4e066e1841"
};

const app = initializeApp(firebaseConfig);
getFirebaseAuth(app);
const db = getFirestore(app);

export { db };
