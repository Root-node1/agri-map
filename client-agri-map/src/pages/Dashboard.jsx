import GreetingHeader from "../components/dashboard/GreetingHeader";
import CarbonImpactCard from "../components/dashboard/CarbonImpactCard";
import NDVIHealthCard from "../components/dashboard/NDVIHealthCard";
import SoilHealthCard from "../components/dashboard/SoilHealthCard";
import CarbonConfidenceCard from "../components/dashboard/CarbonConfidenceCard";
import FinanceReadinessCard from "../components/dashboard/FinanceReadinessCard";
import ActiveFieldsSection from "../components/dashboard/ActiveFieldsSection";
import BottomNav from "../components/layout/BottomNav";
import FloatingActionButton from "../components/layout/FloatingActionButton";
import { useDashboard } from "../hooks/useDashboard";

export default function Dashboard() {
  const { dashboard, loading } =
    useDashboard();
  
  const handleAddField = () => {
  console.log("Navigate to Add Field page");
};

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="p-6">
        No field data available
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      <div className="mx-auto max-w-md space-y-5 p-4">

        <GreetingHeader />

        <CarbonImpactCard
          carbonTons={
            dashboard.carbon.carbon_tons
          }
        />

        <div className="grid grid-cols-2 gap-4">
          <NDVIHealthCard
            score={
              dashboard.vegetation.ndvi || 0
            }
          />

          <SoilHealthCard
            moisture={
              dashboard.soil.moisture_index * 100
            }
            nitrogen={
              dashboard.soil.nitrogen_proxy
            }
          />

          <CarbonConfidenceCard
            confidence={
              dashboard.carbon.confidence_score
            }
          />

          <FinanceReadinessCard />
        </div>

        <ActiveFieldsSection
          fields={dashboard.fields}
        />

      </div>

      <BottomNav />
      <FloatingActionButton
  onClick={handleAddField}
/>
    </main>
  );
}