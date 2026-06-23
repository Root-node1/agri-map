import { ShieldCheck } from "lucide-react";

export default function CarbonConfidenceCard({
  confidence = 0,
}) {
  return (
    <div className="rounded-card border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">
          Carbon Confidence
        </h3>

        <ShieldCheck className="text-brand-600" />
      </div>

      <p className="mt-4 text-4xl font-bold text-brand-700">
        {(confidence * 100).toFixed(0)}%
      </p>

      <p className="text-sm text-ink-600">
        Reliability Score
      </p>
    </div>
  );
}