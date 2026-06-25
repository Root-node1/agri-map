import { useSettings } from "../contexts/SettingsContext";
import { useDashboard } from "../hooks/useDashboard";
import GreetingHeader from "../components/dashboard/GreetingHeader";
import CarbonImpactCard from "../components/dashboard/CarbonImpactCard";
import NDVIHealthCard from "../components/dashboard/NDVIHealthCard";
import SoilHealthCard from "../components/dashboard/SoilHealthCard";
import CarbonConfidenceCard from "../components/dashboard/CarbonConfidenceCard";
import FinanceReadinessCard from "../components/dashboard/FinanceReadinessCard";
import ActiveFieldsSection from "../components/dashboard/ActiveFieldsSection";
import BottomNav from "../components/layout/BottomNav";
import FloatingActionButton from "../components/layout/FloatingActionButton";

/**
 * Props:
 *  - onNavigate: (tabId) => void   -- wire to your router for BottomNav
 *  - onAddField: () => void        -- wire to the "map a new field" flow (Mapping page)
 *  - onApplyFinancing: () => void  -- wire to the Finance page's loan/credit flow
 */
export default function Dashboard({ onNavigate, onAddField, onApplyFinancing }) {
  const { t } = useSettings();
  const {
    loading,
    isDemoData,
    farmerName,
    fields,
    carbonTotal,
    ndvi,
    evi,
    ndviTrend,
    soil,
    carbonConfidence,
    financeReadiness,
  } = useDashboard();

  return (
    <div className="min-h-screen bg-white pb-28">
      <div className="mx-auto max-w-md space-y-6 px-4 pt-6">
        <GreetingHeader farmerName={farmerName} />

        {isDemoData && !loading && (
          <p className="rounded-card bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
            {t("loadError")}
          </p>
        )}

        <CarbonImpactCard carbonTons={carbonTotal} onViewInsights={() => onNavigate?.("soil")} />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <NDVIHealthCard ndvi={ndvi} evi={evi} trend={ndviTrend} fieldCount={fields.length} />
          <SoilHealthCard
            nitrogenProxy={soil.nitrogenProxy}
            moistureIndex={soil.moistureIndex}
            degradationRisk={soil.degradationRisk}
          />
          <CarbonConfidenceCard
            confidenceScore={carbonConfidence.score}
            methodology={carbonConfidence.methodology}
          />
          <FinanceReadinessCard
            score={financeReadiness.score}
            status={financeReadiness.status}
            checks={financeReadiness.checks}
            onApply={onApplyFinancing}
          />
        </div>

        <ActiveFieldsSection fields={fields} loading={loading} onViewAll={() => onNavigate?.("mapping")} />
      </div>

      <FloatingActionButton onClick={onAddField} />
      <BottomNav active="dashboard" onNavigate={onNavigate} />
    </div>
  );
}