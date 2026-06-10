import React, { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  User,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/config/firebase";
import { Lang } from "@/constants/translations";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function friendlyError(code: string, lang: Lang = "hi"): string {
  const msgs: Record<string, { hi: string; en: string }> = {
    "auth/invalid-email": { hi: "ईमेल सही नहीं है", en: "Invalid email address" },
    "auth/user-not-found": { hi: "यह ईमेल रजिस्टर नहीं है", en: "Email not registered" },
    "auth/wrong-password": { hi: "पासवर्ड गलत है", en: "Incorrect password" },
    "auth/invalid-credential": { hi: "ईमेल या पासवर्ड गलत है", en: "Wrong email or password" },
    "auth/email-already-in-use": { hi: "यह ईमेल पहले से रजिस्टर है", en: "Email already registered" },
    "auth/weak-password": { hi: "पासवर्ड कम से कम 6 अक्षर का होना चाहिए", en: "Password must be at least 6 characters" },
    "auth/network-request-failed": { hi: "इंटरनेट कनेक्शन जाँचें", en: "Check your internet connection" },
    "auth/unauthorized-domain": {
      hi: "Domain allowed नहीं है — Firebase Console → Authentication → Settings → Authorized Domains mein apna domain add karein",
      en: "Domain not allowed — Add your domain in Firebase Console → Authentication → Settings → Authorized Domains",
    },
    "auth/operation-not-allowed": { hi: "Firebase mein Email/Password login enable karein", en: "Enable Email/Password sign-in in Firebase Console" },
    "auth/too-many-requests": { hi: "बहुत बार try किया, थोड़ी देर बाद करें", en: "Too many attempts. Please try later." },
    "auth/user-disabled": { hi: "यह अकाउंट बंद है", en: "This account has been disabled" },
    "auth/firebase-app-check-token-is-invalid": {
      hi: "App Check band karein — Firebase Console → App Check → Apni app → Unenforce dabayein",
      en: "Disable App Check — Firebase Console → App Check → Your app → Click Unenforce",
    },
    "appCheck/token-error": {
      hi: "App Check band karein — Firebase Console → App Check → Apni app → Unenforce dabayein",
      en: "Disable App Check — Firebase Console → App Check → Your app → Click Unenforce",
    },
  };
  return msgs[code]?.[lang] ?? `${lang === "hi" ? "कुछ गलत हुआ" : "Error"}: ${code}`;
}

async function saveAdminToFirestore(user: User) {
  try {
    await setDoc(
      doc(db, "admins", user.uid),
      {
        uid: user.uid,
        name: user.displayName ?? "",
        email: user.email ?? "",
        lastSeen: serverTimestamp(),
        joinedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch {
    // Non-critical — don't break login if this fails
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setIsLoading(false);
      if (u) await saveAdminToFirestore(u);
    });
    return unsub;
  }, []);

  async function login(email: string, password: string) {
    try {
      setError(null);
      const { user: u } = await signInWithEmailAndPassword(auth, email.trim(), password);
      await saveAdminToFirestore(u);
    } catch (e: any) {
      setError(friendlyError(e.code));
      throw e;
    }
  }

  async function register(name: string, email: string, password: string) {
    try {
      setError(null);
      const { user: newUser } = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(newUser, { displayName: name.trim() });
      const updated = { ...newUser, displayName: name.trim() } as User;
      setUser(updated);
      await saveAdminToFirestore(updated);
    } catch (e: any) {
      setError(friendlyError(e.code));
      throw e;
    }
  }

  async function logout() {
    await signOut(auth);
  }

  async function resetPassword(email: string) {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email.trim());
    } catch (e: any) {
      setError(friendlyError(e.code));
      throw e;
    }
  }

  function clearError() {
    setError(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, resetPassword, error, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
