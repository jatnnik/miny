import admin from 'firebase-admin'
import { applicationDefault, initializeApp as initializeAdminApp } from 'firebase-admin/app'
import { initializeApp } from 'firebase/app'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  getAuth,
  signOut,
} from 'firebase/auth'

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyAy5vr3L54es2Eh_fX6QZqq09wMXZ5W_Q4',
  authDomain: 'miny-de735.firebaseapp.com',
  projectId: 'miny-de735',
  storageBucket: 'miny-de735.appspot.com',
  messagingSenderId: '296987305817',
  appId: '1:296987305817:web:9f83c808b6f3b7f2820e48',
}

if (!admin.apps.length) {
  initializeAdminApp({
    credential: applicationDefault(),
  })
}

const db = admin.firestore()
const adminAuth = admin.auth()

let Firebase

if (!Firebase) {
  Firebase = initializeApp(firebaseConfig)
}

async function signIn(email: string, password: string) {
  const auth = getAuth()
  return signInWithEmailAndPassword(auth, email, password)
}

async function signUp(email: string, password: string) {
  const auth = getAuth()
  return createUserWithEmailAndPassword(auth, email, password)
}

async function getSessionToken(idToken: string) {
  const decodedToken = await adminAuth.verifyIdToken(idToken)
  if (new Date().getTime() / 1000 - decodedToken.auth_time > 5 * 60) {
    throw new Error('Recent sign in required')
  }
  const twoWeeks = 60 * 60 * 24 * 14 * 1000
  return adminAuth.createSessionCookie(idToken, { expiresIn: twoWeeks })
}

async function signOutFirebase() {
  await signOut(getAuth())
}

async function getDisplayName(id: string) {
  const { displayName } = await adminAuth.getUser(id)
  return displayName
}

export { db, signIn, signUp, getSessionToken, signOutFirebase, adminAuth, getDisplayName }
