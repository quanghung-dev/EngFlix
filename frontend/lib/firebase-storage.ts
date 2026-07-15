import { getStorage, type FirebaseStorage } from "firebase/storage"

import { app } from "@/lib/firebase"

let storage: FirebaseStorage | null = null

export function getFirebaseStorage() {
  if (!storage) storage = getStorage(app)
  return storage
}
