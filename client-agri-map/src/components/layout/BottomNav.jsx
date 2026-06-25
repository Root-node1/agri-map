import { LayoutDashboard, Map, FlaskConical, Wallet, User } from "lucide-react";
import { useSettings } from "../../contexts/SettingsContext";

const TABS = [
  { id: "dashboard", icon: LayoutDashboard, labelKey: "navDashboard" },
  { id: "mapping", icon: Map, labelKey: "navMapping" },
  { id: "soil", icon: FlaskConical, labelKey: "navSoil" },
  { id: "finance", icon: Wallet, labelKey: "navFinance" },
  { id: "profile", icon: User, labelKey: "navProfile" },
];

/**
 * Props:
 *  - active: one of TABS[].id
 *  - onNavigate: (id) => void  -- wire this to your router (react-router, etc.)
 */
export default function BottomNav({ active = "dashboard", onNavigate }) {
  const { t } = useSettings();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-gray-100 bg-white pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto flex max-w-md items-center justify-between px-2">
        {TABS.map(({ id, icon: Icon, labelKey }) => {
          const isActive = id === active;
          return (
            <li key={id} className="flex-1">
              <button
                type="button"
                onClick={() => onNavigate?.(id)}
                aria-current={isActive ? "page" : undefined}
                className="flex w-full flex-col items-center gap-1 py-2.5"
              >
                <span
                  className={`flex h-8 w-12 items-center justify-center rounded-full ${
                    isActive ? "bg-brand-50 text-brand-700" : "text-ink-400"
                  }`}
                >
                  <Icon size={18} />
                </span>
                <span className={`text-[11px] font-medium ${isActive ? "text-brand-700" : "text-ink-400"}`}>
                  {t(labelKey)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}