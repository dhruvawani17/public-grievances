import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCGYdRpuJ7sRjl3zDemdsc0tP1H2MPne-I",
  authDomain: "local-grievances-fa36a.firebaseapp.com",
  projectId: "local-grievances-fa36a",
  storageBucket: "local-grievances-fa36a.firebasestorage.app",
  messagingSenderId: "715104194406",
  appId: "1:715104194406:web:ce5673e15d43171e3082a7"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

export { auth, db, provider };
