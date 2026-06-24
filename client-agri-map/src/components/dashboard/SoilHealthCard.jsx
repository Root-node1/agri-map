import { Sprout, Droplets, AlertTriangle } from "lucide-react";
import { useSettings } from "../../contexts/SettingsContext";

const RISK_STYLES = {
  low: { key: "riskLow", bg: "bg-brand-50", text: "text-brand-700" },
  moderate: { key: "riskModerate", bg: "bg-amber-50", text: "text-amber-700" },
  high: { key: "riskHigh", bg: "bg-alert-50", text: "text-alert-600" },
};

/**
 * Props match GET /analysis/soil/:field_id directly:
 *  - nitrogenProxy: number 0-1
 *  - moistureIndex: number 0-1
 *  - degradationRisk: 'low' | 'moderate' | 'high'
 */
export default function SoilHealthCard({
  nitrogenProxy = 0,
  moistureIndex = 0,
  degradationRisk = "low",
}) {
  const { t } = useSettings();
  const risk = RISK_STYLES[degradationRisk] ?? RISK_STYLES.low;

  return (
    <article className="flex flex-col gap-4 rounded-card border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink-900">{t("soilHealth")}</h3>
        {degradationRisk === "high" && <AlertTriangle size={16} className="text-alert-600" />}
      </div>

      <div className="space-y-3">
        <SoilMetric icon={Sprout} label={t("nitrogenProxy")} value={nitrogenProxy} color="bg-brand-600" />
        <SoilMetric icon={Droplets} label={t("moistureIndex")} value={moistureIndex} color="bg-info-500" />
      </div>

      <div className={`flex items-center justify-between rounded-full ${risk.bg} px-3 py-1.5`}>
        <span className={`text-xs font-medium ${risk.text}`}>{t("degradationRisk")}</span>
        <span className={`text-xs font-bold ${risk.text}`}>{t(risk.key)}</span>
      </div>
    </article>
  );
}

function SoilMetric({ icon: Icon, label, value, color }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-ink-600">
        <span className="flex items-center gap-1.5">
          <Icon size={14} /> {label}
        </span>
        <span className="font-semibold text-ink-900">{Math.round(value * 100)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full ${color} transition-[width] duration-700 ease-out`}
          style={{ width: `${Math.round(value * 100)}%` }}
        />
      </div>
    </div>
  );
}