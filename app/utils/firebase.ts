import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: 'miny-de735.firebaseapp.com',
  projectId: 'miny-de735',
  storageBucket: 'miny-de735.appspot.com',
  messagingSenderId: '296987305817',
  appId: '1:296987305817:web:9f83c808b6f3b7f2820e48',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

const auth = getAuth(app)

export { auth }
