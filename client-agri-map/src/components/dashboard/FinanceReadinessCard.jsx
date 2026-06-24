import { Check, X, ArrowRight } from "lucide-react";
import { useSettings } from "../../contexts/SettingsContext";

const STATUS_STYLES = {
  ready: { key: "statusReady", bg: "bg-brand-50", text: "text-brand-700", bar: "bg-brand-600" },
  needsData: { key: "statusNeedsData", bg: "bg-amber-50", text: "text-amber-700", bar: "bg-amber-500" },
  notReady: { key: "statusNotReady", bg: "bg-alert-50", text: "text-alert-600", bar: "bg-alert-500" },
};

/**
 * Pure presentational card -- the readiness score and checklist booleans
 * should be computed upstream (see hooks/useDashboard.js) from carbon
 * confidence, soil degradation risk, and report completeness across fields.
 *
 * Props:
 *  - score: number 0-1
 *  - status: 'ready' | 'needsData' | 'notReady'
 *  - checks: { carbonVerified, soilRiskOk, reportsComplete }: boolean
 *  - onApply: () => void   -- hand off to the Finance tab/owner
 */
export default function FinanceReadinessCard({
  score = 0,
  status = "notReady",
  checks = { carbonVerified: false, soilRiskOk: false, reportsComplete: false },
  onApply,
}) {
  const { t } = useSettings();
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.notReady;

  const items = [
    { key: "checkCarbonVerified", ok: checks.carbonVerified },
    { key: "checkSoilRiskOk", ok: checks.soilRiskOk },
    { key: "checkReportsComplete", ok: checks.reportsComplete },
  ];

  return (
    <article className="flex flex-col gap-4 rounded-card border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink-900">{t("financeReadiness")}</h3>
        <span className={`rounded-full ${style.bg} px-2.5 py-1 text-xs font-bold ${style.text}`}>
          {t(style.key)}
        </span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full ${style.bar} transition-[width] duration-700 ease-out`}
          style={{ width: `${Math.round(score * 100)}%` }}
        />
      </div>

      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.key} className="flex items-center gap-2 text-sm text-ink-700">
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full ${
                item.ok ? "bg-brand-50 text-brand-600" : "bg-gray-100 text-ink-400"
              }`}
            >
              {item.ok ? <Check size={12} /> : <X size={12} />}
            </span>
            {t(item.key)}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onApply}
        disabled={status === "notReady"}
        className="flex items-center justify-center gap-2 rounded-full bg-brand-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-ink-400"
      >
        {t("applyForFinancing")}
        <ArrowRight size={16} />
      </button>
    </article>
  );
}