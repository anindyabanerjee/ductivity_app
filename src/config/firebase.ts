import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCC7nI63fakD9VMC3hYQMOxUyHxHcGLWIs",
  authDomain: "ductivity.firebaseapp.com",
  projectId: "ductivity",
  storageBucket: "ductivity.firebasestorage.app",
  messagingSenderId: "159869705786",
  appId: "1:159869705786:web:ec3d219058172f69145f03",
  measurementId: "G-G0P6VZHP42",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
