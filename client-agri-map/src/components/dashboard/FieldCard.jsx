import { MapPinned } from "lucide-react";

export default function FieldCard({ field }) {
  return (
    <div className="rounded-card border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex justify-between">
        <div>
          <h4 className="font-semibold">
            {field.name}
          </h4>

          <p className="mt-1 flex items-center gap-1 text-sm text-ink-600">
            <MapPinned size={14} />
            {field.area_hectares || 0} ha
          </p>
        </div>

        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700">
          Active
        </span>
      </div>
    </div>
  );
}