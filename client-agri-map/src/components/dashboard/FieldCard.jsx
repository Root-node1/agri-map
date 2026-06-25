import { Wheat, Coffee, Sprout, Leaf, AlertTriangle } from "lucide-react";
import { useSettings } from "../../contexts/SettingsContext";

const CROP_ICONS = {
  maize: { Icon: Wheat, chip: "bg-amber-50 text-amber-600" },
  coffee: { Icon: Coffee, chip: "bg-orange-50 text-orange-700" },
  beans: { Icon: Sprout, chip: "bg-brand-50 text-brand-600" },
  default: { Icon: Leaf, chip: "bg-info-50 text-info-500" },
};

function healthTone(score) {
  if (score >= 0.8) return { bar: "bg-brand-600", text: "text-brand-700" };
  if (score >= 0.6) return { bar: "bg-amber-500", text: "text-amber-700" };
  return { bar: "bg-alert-500", text: "text-alert-600" };
}

/**
 * Props:
 *  - name, cropType: strings from GET /fields
 *  - healthScore: number 0-1 (derived from the field's report)
 *  - tag: short status string, e.g. "Optimal nitrogen" / "Soil action needed"
 *  - degradationRisk: 'low' | 'moderate' | 'high'
 */
export default function FieldCard({ name, cropType = "default", healthScore = 0, tag, degradationRisk }) {
  const { t } = useSettings();
  const { Icon, chip } = CROP_ICONS[cropType] ?? CROP_ICONS.default;
  const tone = healthTone(healthScore);
  const isHighRisk = degradationRisk === "high";

  return (
    <article className="rounded-card border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-sm font-semibold text-ink-900">{name}</h4>
        </div>
        <span className={`flex h-9 w-9 items-center justify-center rounded-full ${chip}`}>
          <Icon size={16} />
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-ink-600">
        <span className="flex items-center gap-1">
          {isHighRisk && <AlertTriangle size={12} className="text-alert-600" />}
          {t("healthScore")}
        </span>
        <span className={`text-sm font-bold ${tone.text}`}>{Math.round(healthScore * 100)}%</span>
      </div>

      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full ${tone.bar} transition-[width] duration-700 ease-out`}
          style={{ width: `${Math.round(healthScore * 100)}%` }}
        />
      </div>

      {tag && (
        <span
          className={`mt-3 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
            isHighRisk ? "bg-alert-50 text-alert-600" : "bg-gray-100 text-ink-600"
          }`}
        >
          {tag}
        </span>
      )}
    </article>
  );
}