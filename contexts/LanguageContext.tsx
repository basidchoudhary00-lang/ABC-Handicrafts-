import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Lang } from "@/constants/translations";

interface LanguageContextType {
  lang: Lang;
  toggleLang: () => void;
  isHindi: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "hi",
  toggleLang: () => {},
  isHindi: true,
});

const LANG_KEY = "@labor_tracker_lang";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("hi");

  useEffect(() => {
    AsyncStorage.getItem(LANG_KEY).then((saved) => {
      if (saved === "en" || saved === "hi") setLang(saved);
    });
  }, []);

  function toggleLang() {
    const next: Lang = lang === "hi" ? "en" : "hi";
    setLang(next);
    AsyncStorage.setItem(LANG_KEY, next);
  }

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, isHindi: lang === "hi" }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
