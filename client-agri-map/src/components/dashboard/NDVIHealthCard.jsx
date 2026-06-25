import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useSettings } from "../../contexts/SettingsContext";
import RadialGauge from "../common/RadialGauge";

const TREND_ICON = { up: TrendingUp, down: TrendingDown, flat: Minus };

/**
 * Props:
 *  - ndvi: number 0-1 (average NDVI across monitored fields)
 *  - evi: number 0-1
 *  - trend: 'up' | 'down' | 'flat'
 *  - fieldCount: number
 */
export default function NDVIHealthCard({ ndvi = 0, evi = 0, trend = "flat", fieldCount = 0 }) {
  const { t } = useSettings();
  const TrendIcon = TREND_ICON[trend] ?? Minus;
  const trendKey = trend === "up" ? "trendUp" : trend === "down" ? "trendDown" : "trendFlat";
  const trendColor =
    trend === "up" ? "text-brand-600" : trend === "down" ? "text-alert-600" : "text-ink-400";

  return (
    <article className="flex flex-col gap-4 rounded-card border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink-900">{t("vegetationHealth")}</h3>
        <span className="text-xs text-ink-400">{t("acrossFields", { count: fieldCount })}</span>
      </div>

      <div className="flex items-center gap-4">
        <RadialGauge value={ndvi} color="#16a34a">
          <span className="text-lg font-bold text-ink-900">{Math.round(ndvi * 100)}%</span>
        </RadialGauge>

        <div className="flex-1 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-ink-600">
            <span>{t("ndviLabel")}</span>
            <span className="font-semibold text-ink-900">{ndvi.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-ink-600">
            <span>{t("eviLabel")}</span>
            <span className="font-semibold text-ink-900">{evi.toFixed(2)}</span>
          </div>
          <p className={`flex items-center gap-1 pt-1 text-xs font-medium ${trendColor}`}>
            <TrendIcon size={14} /> {t(trendKey)}
          </p>
        </div>
      </div>
    </article>
  );
}