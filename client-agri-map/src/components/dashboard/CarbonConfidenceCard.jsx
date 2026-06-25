import { ShieldCheck } from "lucide-react";
import { useSettings } from "../../contexts/SettingsContext";
import RadialGauge from "../common/RadialGauge";

/**
 * Props match GET /carbon/:field_id:
 *  - confidenceScore: number 0-1
 *  - methodology: string (e.g. "NDVI-based estimation")
 */
export default function CarbonConfidenceCard({ confidenceScore = 0, methodology = "" }) {
  const { t } = useSettings();
  const tone = confidenceScore >= 0.75 ? "#16a34a" : confidenceScore >= 0.5 ? "#f59e0b" : "#dc2626";

  return (
    <article className="flex flex-col gap-4 rounded-card border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink-900">{t("carbonConfidence")}</h3>
        <ShieldCheck size={16} className="text-brand-600" />
      </div>

      <div className="flex items-center gap-4">
        <RadialGauge value={confidenceScore} color={tone}>
          <span className="text-lg font-bold text-ink-900">
            {Math.round(confidenceScore * 100)}%
          </span>
        </RadialGauge>

        <div className="flex-1 space-y-1">
          <p className="text-xs text-ink-600">{t("confidenceScore")}</p>
          <p className="text-xs text-ink-400">{t("methodology")}</p>
          <p className="text-sm font-medium text-ink-900">{methodology || "\u2014"}</p>
        </div>
      </div>
    </article>
  );
}