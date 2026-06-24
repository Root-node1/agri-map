import { Satellite } from "lucide-react";
import { useSettings } from "../../contexts/SettingsContext";
import AccessibilityMenu from "./AccessibilityMenu";

export default function GreetingHeader({ farmerName = "Juma" }) {
  const { t } = useSettings();

  return (
    <header className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white">
            <Satellite size={18} />
          </div>
          <span className="text-base font-bold text-ink-900">{t("appName")}</span>
        </div>
        <AccessibilityMenu />
      </div>

      <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">
        {t("welcomeBack", { name: farmerName })}
      </h1>
    </header>
  );
}