import { ArrowRight } from "lucide-react";
import { useSettings } from "../context/SettingsContext";

export default function CarbonImpactCard({ carbonTons }) {
  const { t } = useSettings();

  return (
    <section className="overflow-hidden rounded-card border border-gray-100 bg-white shadow-sm">
      {/* Field map preview -- swap this gradient for a real satellite/NDVI tile image */}
      <div className="relative h-36 w-full bg-linear-to-br from-brand-700 via-brand-600 to-brand-500">
        <div className="absolute inset-0 opacity-30 bg-[repeating-linear-gradient(45deg,rgba(255,255,255,.25)_0,rgba(255,255,255,.25)_2px,transparent_2px,transparent_10px)]" />
      </div>

      <div className="p-5">
        <span className="inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
          {t("carbonImpactLabel")}
        </span>

        <h2 className="mt-3 text-lg font-bold text-ink-900">
          {t("carbonSequestration")}
        </h2>
        <p className="text-sm text-ink-600">{t("carbonSubtitle")}</p>

        <p className="mt-3 text-3xl font-extrabold text-brand-700">
          {carbonTons.toLocaleString()}{" "}
          <span className="text-lg font-semibold text-brand-600">
            {t("carbonUnit")}
          </span>
        </p>

        <button
          type="button"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700"
        >
          {t("viewInsights")}
          <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}