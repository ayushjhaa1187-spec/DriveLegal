import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  Firestore
} from "firebase/firestore";
import { app, hasConfig } from "./config";

// User explicit instruction: Enable modern multi-tab offline caching
export let db: Firestore | null = null;

if (app && hasConfig) {
  try {
    // Initialize Firestore with explicit offline caching
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    });
  } catch (error) {
    console.error("Failed to initialize Firestore Offline Cache:", error);
  }
}

// Data Models
export interface DisputeLetterSync {
  id?: string;
  title: string;
  body: string;
  violationId: string;
  amount: number;
  uid: string;
  createdAt: Timestamp;
}

export async function syncDisputeLetter(uid: string, data: Omit<DisputeLetterSync, "uid" | "createdAt">) {
  if (!db) {
    console.warn("Database sync aborted: Firebase not configured or offline cache failed to mount.");
    return;
  }

  // Generate a composite ID for idempotency
  const docId = `dispute_${uid}_${Date.now()}`;
  const docRef = doc(collection(db, "dispute_letters"), docId);

  // setDoc writes locally FIRST, immediately resolving. 
  // Firestore backend synchronization occurs asynchronously.
  await setDoc(docRef, {
    ...data,
    uid,
    createdAt: Timestamp.now()
  });

  return docId;
}

export async function getUserDisputeHistory(uid: string) {
  if (!db) return [];

  const q = query(
    collection(db, "dispute_letters"),
    where("uid", "==", uid),
    orderBy("createdAt", "desc")
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DisputeLetterSync));
}
