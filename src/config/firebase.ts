/**
 * config/firebase.ts
 *
 * Initialises the Firebase SDK and exports the Firestore database
 * instance used by the activity service to read and write logs.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

/** Firebase project configuration for the "ductivity" project. */
const firebaseConfig = {
  apiKey: "AIzaSyCC7nI63fakD9VMC3hYQMOxUyHxHcGLWIs",
  authDomain: "ductivity.firebaseapp.com",
  projectId: "ductivity",
  storageBucket: "ductivity.firebasestorage.app",
  messagingSenderId: "159869705786",
  appId: "1:159869705786:web:ec3d219058172f69145f03",
  measurementId: "G-G0P6VZHP42",
};

/** Root Firebase app instance. */
const app = initializeApp(firebaseConfig);

/** Firestore database handle -- import this wherever you need DB access. */
export const db = getFirestore(app);
export default app;
