import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { translate } from "../lib/i18n";

const SettingsContext = createContext(null);

// Steps map to a root font-size in px. Because Tailwind's default type scale
// is built on rem units, scaling html { font-size } scales every text-* class
// in the app proportionally -- no per-component work required.
const FONT_STEPS = [
  { id: "sm", px: 14, label: "A" },
  { id: "md", px: 16, label: "A" },
  { id: "lg", px: 18, label: "A" },
  { id: "xl", px: 21, label: "A" },
];

const STORAGE_KEY = "agrimap.settings.v1";

function loadInitial() {
  if (typeof window === "undefined") {
    return { fontStepIndex: 1, language: "en" };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore malformed storage */
  }
  return { fontStepIndex: 1, language: "en" };
}

export function SettingsProvider({ children }) {
  const [fontStepIndex, setFontStepIndex] = useState(() => loadInitial().fontStepIndex);
  const [language, setLanguage] = useState(() => loadInitial().language);

  useEffect(() => {
    document.documentElement.style.fontSize = `${FONT_STEPS[fontStepIndex].px}px`;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ fontStepIndex, language })
    );
  }, [fontStepIndex, language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      fontStepIndex,
      fontSteps: FONT_STEPS,
      increaseFont: () =>
        setFontStepIndex((i) => Math.min(i + 1, FONT_STEPS.length - 1)),
      decreaseFont: () => setFontStepIndex((i) => Math.max(i - 1, 0)),
      t: (key, vars) => translate(language, key, vars),
    }),
    [language, fontStepIndex]
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used inside <SettingsProvider>");
  }
  return ctx;
}