import { Plus } from "lucide-react";

/**
 * Props:
 *  - onClick: () => void  -- typically opens the "map a new field" flow
 *  - label: accessible label, defaults to a sensible English/Swahili-neutral string
 */
export default function FloatingActionButton({ onClick, label = "Add field" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="fixed bottom-20 right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/30 transition-transform hover:scale-105 hover:bg-brand-700 active:scale-95"
    >
      <Plus size={24} />
    </button>
  );
}