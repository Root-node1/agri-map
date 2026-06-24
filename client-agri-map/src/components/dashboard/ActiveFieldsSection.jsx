import { useSettings } from "../../contexts/SettingsContext";
import FieldCard from "./FieldCard";

/**
 * Props:
 *  - fields: array of { id, name, cropType, healthScore, tag, degradationRisk }
 *  - loading: boolean
 *  - onViewAll: () => void
 */
export default function ActiveFieldsSection({ fields = [], loading = false, onViewAll }) {
  const { t } = useSettings();

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-ink-900">{t("activeFields")}</h2>
          <p className="text-xs uppercase tracking-wide text-ink-400">
            {t("acrossFields", { count: fields.length })}
          </p>
        </div>
        <button type="button" onClick={onViewAll} className="text-sm font-medium text-ink-600 hover:text-brand-700">
          {t("viewAll")}
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-card bg-gray-100" />
          ))}
        </div>
      ) : fields.length === 0 ? (
        <p className="rounded-card border border-dashed border-gray-200 p-6 text-center text-sm text-ink-400">
          {t("acrossFields", { count: 0 })}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {fields.map((field) => (
            <FieldCard key={field.id} {...field} />
          ))}
        </div>
      )}
    </section>
  );
}