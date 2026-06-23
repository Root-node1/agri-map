import { Activity } from "lucide-react";

export default function NDVIHealthCard({ score = 0 }) {
  const percentage = Math.round(score * 100);

  return (
    <div className="rounded-card border border-green-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-ink-900">
          NDVI Health
        </h3>

        <Activity className="text-brand-600" />
      </div>

      <p className="mt-4 text-3xl font-bold text-brand-700">
        {score.toFixed(2)}
      </p>

      <div className="mt-3 h-3 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full bg-brand-600"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="mt-2 text-sm text-ink-600">
        Vegetation Health
      </p>
    </div>
  );
}