import { ArrowRight, Radio } from "lucide-react";
import { useSettings } from "../../contexts/SettingsContext";

/**
 * Props:
 *  - carbonTons: number -- total verified carbon sequestration across fields
 *  - onViewInsights: () => void
 */
export default function CarbonImpactCard({ carbonTons = 0, onViewInsights }) {
  const { t } = useSettings();

  return (
    <section className="overflow-hidden rounded-card border border-gray-100 bg-white shadow-sm">
      {/* Abstract field mosaic -- stylized plot outlines, not a real satellite tile,
          so the "live monitoring" feel doesn't depend on fetching imagery here. */}
      <div className="relative h-36 w-full overflow-hidden bg-linear-to-br from-brand-700 via-brand-600 to-brand-500">
        <svg
          viewBox="0 0 400 140"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full opacity-90"
        >
          <polygon points="0,0 110,0 90,70 0,50" fill="rgba(255,255,255,0.10)" />
          <polygon points="110,0 230,0 220,60 90,70" fill="rgba(255,255,255,0.16)" />
          <polygon points="230,0 400,0 400,40 220,60" fill="rgba(255,255,255,0.08)" />
          <polygon points="0,50 90,70 70,140 0,140" fill="rgba(255,255,255,0.14)" />
          <polygon points="90,70 220,60 200,140 70,140" fill="rgba(255,255,255,0.20)" />
          <polygon points="220,60 400,40 400,140 200,140" fill="rgba(255,255,255,0.10)" />
          <g stroke="rgba(255,255,255,0.35)" strokeWidth="1">
            <line x1="0" y1="0" x2="110" y2="0" />
            <line x1="110" y1="0" x2="90" y2="70" />
            <line x1="90" y1="70" x2="220" y2="60" />
            <line x1="220" y1="60" x2="400" y2="40" />
            <line x1="0" y1="50" x2="90" y2="70" />
            <line x1="70" y1="140" x2="200" y2="140" />
          </g>
        </svg>

        <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-black/20 px-2.5 py-1 backdrop-blur-sm">
          <Radio size={12} className="text-white" />
          <span className="text-[10px] font-semibold uppercase tracking-wide text-white">
            Sentinel-2
          </span>
        </div>
      </div>

      <div className="p-5">
        <span className="inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
          {t("carbonImpactLabel")}
        </span>

        <h2 className="mt-3 text-lg font-bold text-ink-900">
          {t("carbonSequestration")}
        </h2>
        <p className="text-sm text-ink-600">{t("carbonSubtitle")}</p>

        <p className="mt-3 text-3xl font-extrabold tracking-tight text-brand-700">
          {carbonTons.toLocaleString(undefined, { maximumFractionDigits: 1 })}{" "}
          <span className="text-lg font-semibold text-brand-600">
            {t("carbonUnit")}
          </span>
        </p>

        <button
          type="button"
          onClick={onViewInsights}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          {t("viewInsights")}
          <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}