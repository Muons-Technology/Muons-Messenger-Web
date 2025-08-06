// backend/firebase.config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD3TbQkcZHqPRMclK94HkdQLT0u4W2a7gs",
  authDomain: "muons-messenger.firebaseapp.com",
  projectId: "muons-messenger",
  storageBucket: "muons-messenger.appspot.com",
  messagingSenderId: "577448916734",
  appId: "1:577448916734:web:9271139d8c1a146281d7af",
  measurementId: "G-406HJJWRSG"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
