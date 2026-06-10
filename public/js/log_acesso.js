// public/js/log_acesso.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, doc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth as getFirebaseAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig={apiKey:"AIzaSyBeG7uirpSS3N0I48fy7WqJa_SSrb8A-48",authDomain:"cuiaba-01617931-f126e.firebaseapp.com",projectId:"cuiaba-01617931-f126e",storageBucket:"cuiaba-01617931-f126e.firebasestorage.app",messagingSenderId:"797115279316",appId:"1:797115279316:web:f229366de16d4e066e1841"};
const app=initializeApp(firebaseConfig);
getFirebaseAuth(app);
const db=getFirestore(app);
const STORAGE_KEY="delta_auth_firebase_v1";
const LOG_ID_KEY="delta_log_acesso_id_v1";
const LOG_INICIO_KEY="delta_log_acesso_inicio_v1";

function nomeAuth(a){return a?.Nome||a?.nome||a?.seguranca||a?.usuario||""}
function emailAuth(a){return a?.Email||a?.email||""}
function perfilAuth(a){return String(a?.Perfil||a?.perfil||"").trim().toUpperCase()}

export async function registrarLogin(auth, origem="index.html"){
  try{
    if(!auth)return null;
    const inicioMs=Date.now();
    const ref=await addDoc(collection(db,"logs_acesso"),{
      segurancaId:auth.id||auth.uid||auth.docId||"",
      nome:nomeAuth(auth),
      email:emailAuth(auth),
      perfil:perfilAuth(auth),
      loginEm:serverTimestamp(),
      loginMs:inicioMs,
      logoutEm:null,
      logoutMs:null,
      tempoConectadoMin:null,
      status:"ABERTA",
      origem,
      userAgent:navigator.userAgent||"",
      criadoEm:serverTimestamp()
    });
    localStorage.setItem(LOG_ID_KEY,ref.id);
    localStorage.setItem(LOG_INICIO_KEY,String(inicioMs));
    const sessao=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null");
    if(sessao){sessao.logAcessoId=ref.id;sessao.logAcessoInicioMs=inicioMs;localStorage.setItem(STORAGE_KEY,JSON.stringify(sessao))}
    return ref.id;
  }catch(e){console.error("Erro ao registrar login:",e);return null}
}

export async function registrarLogout(statusFinal="FINALIZADA"){
  try{
    const logId=localStorage.getItem(LOG_ID_KEY);
    const inicioMs=Number(localStorage.getItem(LOG_INICIO_KEY)||0);
    if(!logId)return;
    const fimMs=Date.now();
    const tempoMin=inicioMs?Math.max(0,Math.round((fimMs-inicioMs)/60000)):null;
    await updateDoc(doc(db,"logs_acesso",logId),{
      logoutEm:serverTimestamp(),
      logoutMs:fimMs,
      tempoConectadoMin:tempoMin,
      status:statusFinal,
      atualizadoEm:serverTimestamp()
    });
    localStorage.removeItem(LOG_ID_KEY);
    localStorage.removeItem(LOG_INICIO_KEY);
  }catch(e){console.error("Erro ao registrar logout:",e)}
}
