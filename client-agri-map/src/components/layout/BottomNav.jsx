import {
  LayoutDashboard,
  Map,
  Sprout,
  Wallet,
  User,
} from "lucide-react";

export default function BottomNav() {
  const items = [
    LayoutDashboard,
    Map,
    Sprout,
    Wallet,
    User,
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-white">
      <div className="grid grid-cols-5 py-3">
        {items.map((Icon, index) => (
          <button
            key={index}
            className="flex justify-center"
          >
            <Icon
              size={22}
              className={
                index === 0
                  ? "text-brand-600"
                  : "text-ink-600"
              }
            />
          </button>
        ))}
      </div>
    </nav>
  );
}