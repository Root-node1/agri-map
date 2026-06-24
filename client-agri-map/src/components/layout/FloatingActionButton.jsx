import { MapPinned } from "lucide-react";

export default function FloatingActionButton({
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        fixed
        bottom-20
        right-5
        z-50
        flex
        items-center
        gap-2
        rounded-full
        bg-brand-600
        px-5
        py-3
        text-sm
        font-semibold
        text-white
        shadow-lg
        hover:bg-brand-700
      "
    >
      <MapPinned size={18} />
      Map Field
    </button>
  );
}