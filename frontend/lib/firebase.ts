import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCrM7LWwxt3EsVC02INI0McZmoILud5pIo",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "engflix-app.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "engflix-app",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "engflix-app.appspot.com",
}

// Khởi tạo ứng dụng Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

// Khởi tạo các dịch vụ
const auth = getAuth(app)
const storage = getStorage(app)
const googleProvider = new GoogleAuthProvider()

// Cấu hình custom parameters cho Google Sign-In nếu cần
googleProvider.setCustomParameters({
  prompt: 'select_account'
})

export { app, auth, googleProvider, storage }
