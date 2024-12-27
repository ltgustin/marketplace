// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore/lite';

const firebaseConfig = {
  apiKey: "AIzaSyCLvGScVm82p_VBCqMIIORAKv7VAhNAAzk",
  authDomain: "nft-marketplace-aa498.firebaseapp.com",
  projectId: "nft-marketplace-aa498",
  storageBucket: "nft-marketplace-aa498.appspot.com",
  messagingSenderId: "771697554571",
  appId: "1:771697554571:web:e2094c962c9dffa0d9908e"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);