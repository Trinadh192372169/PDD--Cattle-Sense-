import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  User,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  limit,
  Timestamp,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── Firebase Configuration ────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyAsoUzMrT5r0mbNWuxTcXhZ3TfBN3iZPLg",
  authDomain: "ai-based-breed-identification.firebaseapp.com",
  projectId: "ai-based-breed-identification",
  storageBucket: "ai-based-breed-identification.firebasestorage.app",
  messagingSenderId: "655004999375",
  appId: "1:655004999375:web:c6ee2eb773694e4450a1ba",
  measurementId: "G-0N05TG6WV3",
};

// ─── App Init (Singleton — safe for HMR / Fast Refresh) ─────────────────
const firebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// ─── Auth (use standard getAuth — works on both web and native with Expo) ─
const auth = getAuth(firebaseApp);

// ─── Firestore & Storage ───────────────────────────────────────────────
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

// ─── Analytics (web only, async check) ────────────────────────────────
let analytics: any = null;
if (Platform.OS === "web") {
  isSupported()
    .then((supported: boolean) => {
      if (supported) analytics = getAnalytics(firebaseApp);
    })
    .catch((_err: unknown) => {});
}

// ══════════════════════════════════════════════════════════════════════
//  AUTH HELPERS
// ══════════════════════════════════════════════════════════════════════

/** Register a new user and create their Firestore profile */
export const firebaseRegister = async (
  email: string,
  password: string,
  fullName: string = "Cattle Officer"
): Promise<{ success: boolean; message: string; user?: User }> => {
  try {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email.trim().toLowerCase(),
      password
    );
    await updateProfile(credential.user, { displayName: fullName });

    // Create Firestore user profile doc
    await setDoc(doc(db, "users", credential.user.uid), {
      uid: credential.user.uid,
      email: credential.user.email,
      full_name: fullName,
      role: "Veterinarian",
      location: "",
      profile_picture: "",
      created_at: serverTimestamp(),
    });

    return { success: true, message: "Registration successful!", user: credential.user };
  } catch (error: any) {
    const msg = mapAuthError(error.code);
    return { success: false, message: msg };
  }
};

/** Sign in existing user */
export const firebaseLogin = async (
  email: string,
  password: string
): Promise<{ success: boolean; message: string; user?: User }> => {
  try {
    const credential = await signInWithEmailAndPassword(
      auth,
      email.trim().toLowerCase(),
      password
    );
    return { success: true, message: "Login successful!", user: credential.user };
  } catch (error: any) {
    const msg = mapAuthError(error.code);
    return { success: false, message: msg };
  }
};

/** Sign out current user */
export const firebaseLogout = async (): Promise<void> => {
  await signOut(auth);
};

/** Send password reset email */
export const firebaseResetPassword = async (
  email: string
): Promise<{ success: boolean; message: string }> => {
  try {
    await sendPasswordResetEmail(auth, email.trim().toLowerCase());
    return { success: true, message: "Password reset link sent to your email!" };
  } catch (error: any) {
    const msg = mapAuthError(error.code);
    return { success: false, message: msg };
  }
};

export const sendFirebasePasswordReset = firebaseResetPassword;

/** Google Sign-In with Web popup and mobile fallback */
export const firebaseGoogleLogin = async (): Promise<{
  success: boolean;
  message: string;
  user?: User;
}> => {
  try {
    if (Platform.OS === "web") {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        try {
          const userDoc = await getDoc(doc(db, "users", result.user.uid));
          if (!userDoc.exists()) {
            await setDoc(doc(db, "users", result.user.uid), {
              uid: result.user.uid,
              email: result.user.email,
              full_name: result.user.displayName || "Field Officer",
              role: "Veterinarian",
              location: "Regional Field Centre",
              profile_picture: result.user.photoURL || "",
              created_at: serverTimestamp(),
            });
          }
        } catch (dbErr) {
          console.warn("Firestore user sync warning:", dbErr);
        }
      }
      return { success: true, message: "Google Sign-In successful!", user: result.user };
    } else {
      return {
        success: false,
        message:
          "Google Sign-In popup is active on Web. On Mobile Expo, please use your email & password or the One-Click Demo Officer login.",
      };
    }
  } catch (error: any) {
    const msg =
      mapAuthError(error?.code || "") ||
      error?.message ||
      "Google sign-in could not be completed.";
    return { success: false, message: msg };
  }
};

/** Subscribe to auth state changes */
export const onAuthChange = (callback: (user: User | null) => void) =>
  onAuthStateChanged(auth, callback);

/** Map Firebase auth error codes to human-readable messages */
const mapAuthError = (code: string): string => {
  switch (code) {
    case "auth/email-already-in-use":
      return "Email is already registered. Please sign in instead.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password. Please try again.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later.";
    case "auth/network-request-failed":
      return "Network error. Check your internet connection.";
    default:
      return "Authentication failed. Please try again.";
  }
};

// ══════════════════════════════════════════════════════════════════════
//  USER PROFILE HELPERS (Firestore)
// ══════════════════════════════════════════════════════════════════════

export interface UserProfile {
  uid: string;
  email: string;
  full_name: string;
  role: string;
  location: string;
  profile_picture: string;
}

/** Get user profile from Firestore */
export const getFirebaseProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) return snap.data() as UserProfile;
    return null;
  } catch {
    return null;
  }
};

/** Update user profile in Firestore */
export const updateFirebaseProfile = async (
  uid: string,
  data: Partial<UserProfile>
): Promise<boolean> => {
  try {
    await updateDoc(doc(db, "users", uid), data as any);
    return true;
  } catch {
    return false;
  }
};

/** Upload profile picture to Firebase Storage */
export const uploadProfilePictureFirebase = async (
  uid: string,
  uri: string
): Promise<string | null> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, `profile_pictures/${uid}.jpg`);
    await uploadBytes(storageRef, blob);
    const downloadUrl = await getDownloadURL(storageRef);

    // Update Firestore with new URL
    await updateDoc(doc(db, "users", uid), { profile_picture: downloadUrl });
    return downloadUrl;
  } catch {
    return null;
  }
};

// ══════════════════════════════════════════════════════════════════════
//  SCAN HISTORY HELPERS (Firestore)
// ══════════════════════════════════════════════════════════════════════

export interface ScanRecord {
  id?: string;
  uid: string;
  breed: string;
  confidence: number;
  image_url: string;
  timestamp?: any;
  created_at?: any;
  location?: string;
}

/** Save a new scan record to Firestore */
export const saveFirebaseScan = async (
  scan: Omit<ScanRecord, "id" | "timestamp">
): Promise<string | null> => {
  try {
    const docRef = await addDoc(collection(db, "scans"), {
      ...scan,
      timestamp: serverTimestamp(),
    });
    return docRef.id;
  } catch {
    return null;
  }
};

/** Get all scans for a user */
export const getFirebaseScans = async (uid: string): Promise<ScanRecord[]> => {
  try {
    const q = query(
      collection(db, "scans"),
      where("uid", "==", uid),
      orderBy("timestamp", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<ScanRecord, "id">),
    }));
  } catch {
    return [];
  }
};

/** Get recent scans (last N) */
export const getRecentFirebaseScans = async (
  uid: string,
  count: number = 3
): Promise<ScanRecord[]> => {
  try {
    const q = query(
      collection(db, "scans"),
      where("uid", "==", uid),
      orderBy("timestamp", "desc"),
      limit(count)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<ScanRecord, "id">),
    }));
  } catch {
    return [];
  }
};

/** Get stats: total scans + this month scans */
export const getFirebaseStats = async (
  uid: string
): Promise<{ total_scans: number; this_month: number }> => {
  try {
    const allScans = await getFirebaseScans(uid);
    const now = new Date();
    const thisMonth = allScans.filter((s) => {
      if (!s.timestamp) return false;
      const d =
        s.timestamp instanceof Timestamp
          ? s.timestamp.toDate()
          : new Date(s.timestamp);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    return { total_scans: allScans.length, this_month: thisMonth.length };
  } catch {
    return { total_scans: 0, this_month: 0 };
  }
};

/** Upload scan image to Firebase Storage */
export const uploadScanImageFirebase = async (
  uid: string,
  uri: string,
  scanId: string
): Promise<string | null> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, `scans/${uid}/${scanId}_${Date.now()}.jpg`);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  } catch {
    return null;
  }
};

// ─── Exports ───────────────────────────────────────────────────────────
export { firebaseApp, auth, db, storage, analytics };
