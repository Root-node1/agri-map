import { Droplets } from "lucide-react";

export default function SoilHealthCard({
  moisture = 0,
  nitrogen = 0,
}) {
  return (
    <div className="rounded-card border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-ink-900">
          Soil Health
        </h3>

        <Droplets className="text-blue-500" />
      </div>

      <p className="mt-3 text-3xl font-bold text-blue-600">
        {Math.round(moisture)}%
      </p>

      <p className="text-sm text-ink-600">
        Moisture Index
      </p>

      <p className="mt-4 text-sm text-ink-600">
        Nitrogen: {(nitrogen * 100).toFixed(0)}%
      </p>
    </div>
  );
}