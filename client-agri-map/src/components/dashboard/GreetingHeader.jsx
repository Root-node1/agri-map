import AccessibilityMenu from "./AccessibilityMenu";

export default function GreetingHeader() {
  const hour = new Date().getHours();

  let greeting = "Good Morning";

  if (hour >= 12) greeting = "Good Afternoon";
  if (hour >= 18) greeting = "Good Evening";

  return (
    <header className="flex items-center justify-between">
      <div>
        <p className="text-sm text-ink-600">
          AgriMap Cooperative
        </p>

        <h1 className="text-3xl font-bold text-ink-900">
          {greeting}
        </h1>
      </div>

      <AccessibilityMenu />
    </header>
  );
}