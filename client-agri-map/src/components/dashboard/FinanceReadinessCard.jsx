import { Landmark } from "lucide-react";

export default function FinanceReadinessCard({
  score = 92,
}) {
  return (
    <div className="rounded-card border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">
          Finance Readiness
        </h3>

        <Landmark className="text-brand-600" />
      </div>

      <p className="mt-4 text-4xl font-bold text-brand-700">
        {score}
      </p>

      <p className="text-sm text-ink-600">
        Financing Eligibility
      </p>
    </div>
  );
}