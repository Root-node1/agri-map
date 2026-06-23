import { useState } from "react";
import { Type, Minus, Plus, Globe } from "lucide-react";
import { useSettings } from "../context/SettingsContext";

export default function AccessibilityMenu() {
  const [open, setOpen] = useState(false);
  const { t, fontStepIndex, fontSteps, increaseFont, decreaseFont, language, setLanguage } =
    useSettings();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t("textSize")}
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-ink-600 hover:bg-gray-50"
      >
        <Type size={18} />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-60 rounded-card border border-gray-100 bg-white p-4 shadow-lg">
          <p className="mb-2 text-sm font-semibold text-ink-900">{t("textSize")}</p>
          <div className="mb-4 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={decreaseFont}
              disabled={fontStepIndex === 0}
              aria-label={t("smaller")}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 disabled:opacity-40"
            >
              <Minus size={16} />
            </button>
            <div className="flex gap-1">
              {fontSteps.map((step, i) => (
                <span
                  key={step.id}
                  className={`h-1.5 w-5 rounded-full ${
                    i === fontStepIndex ? "bg-brand-600" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={increaseFont}
              disabled={fontStepIndex === fontSteps.length - 1}
              aria-label={t("larger")}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 disabled:opacity-40"
            >
              <Plus size={16} />
            </button>
          </div>

          <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink-900">
            <Globe size={14} /> {t("language")}
          </p>
          <div className="flex rounded-full bg-gray-100 p-1">
            {["en", "sw"].map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLanguage(code)}
                className={`flex-1 rounded-full py-1.5 text-sm font-medium transition-colors ${
                  language === code
                    ? "bg-white text-brand-700 shadow-sm"
                    : "text-ink-600"
                }`}
              >
                {code === "en" ? "English" : "Kiswahili"}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}