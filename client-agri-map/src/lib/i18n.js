// Bilingual strings for the AgriMap dashboard.
// Add new keys to BOTH "en" and "sw" so the language toggle never falls back silently.

export const dictionaries = {
  en: {
    appName: "AgriMap",
    welcomeBack: "Welcome back, {name}",
    carbonImpactLabel: "Carbon Impact",
    carbonSequestration: "Carbon Sequestration",
    carbonSubtitle: "Total cooperative environmental footprint.",
    carbonUnit: "MT CO\u2082e",
    viewInsights: "View Insights",
    activeFields: "Active Fields",
    fieldsMonitoring: "{count} fields monitoring",
    viewAll: "View all",
    healthScore: "Health Score",
    rainForecast: "Rain Forecast",
    soilMoisture: "Soil Moisture",
    marketPrice: "Market Price",
    windSpeed: "Wind Speed",
    fieldOperations: "Field Operations",
    empoweringCaption: "Empowering local farmers with real-time data.",
    precisionCaption: "Precision soil analysis for better yields.",
    optimalNitrogen: "Optimal nitrogen",
    monitoringPest: "Monitoring pest",
    soilActionNeeded: "Soil action needed",
    textSize: "Text size",
    language: "Language",
    smaller: "Smaller text",
    larger: "Larger text",
    loadError: "Couldn't reach AgriMap servers. Showing the last saved data.",
    navDashboard: "Dashboard",
    navMapping: "Mapping",
    navSoil: "Soil",
    navFinance: "Finance",
    navProfile: "Profile",
  },
  sw: {
    appName: "AgriMap",
    welcomeBack: "Karibu tena, {name}",
    carbonImpactLabel: "Athari ya Kaboni",
    carbonSequestration: "Uvunaji wa Kaboni",
    carbonSubtitle: "Jumla ya athari ya mazingira ya chama.",
    carbonUnit: "MT CO\u2082e",
    viewInsights: "Angalia Maelezo",
    activeFields: "Mashamba Yanayofuatiliwa",
    fieldsMonitoring: "Mashamba {count} yanafuatiliwa",
    viewAll: "Yote",
    healthScore: "Alama ya Afya",
    rainForecast: "Utabiri wa Mvua",
    soilMoisture: "Unyevu wa Udongo",
    marketPrice: "Bei ya Soko",
    windSpeed: "Upepo",
    fieldOperations: "Operesheni za Shambani",
    empoweringCaption: "Kuwawezesha wakulima wa eneo kwa data za wakati halisi.",
    precisionCaption: "Uchambuzi sahihi wa udongo kwa mavuno bora.",
    optimalNitrogen: "Nitrojeni Bora",
    monitoringPest: "Ufuatiliaji wa Wadudu",
    soilActionNeeded: "Hatua Inahitajika",
    textSize: "Ukubwa wa Maandishi",
    language: "Lugha",
    smaller: "Punguza maandishi",
    larger: "Ongeza maandishi",
    loadError: "Imeshindwa kufikia seva za AgriMap. Inaonyesha data ya mwisho iliyohifadhiwa.",
    navDashboard: "Dashibodi",
    navMapping: "Ramani",
    navSoil: "Udongo",
    navFinance: "Fedha",
    navProfile: "Wasifu",
  },
};

/**
 * translate(lang, key, vars)
 * Looks up `key` in the chosen language, falling back to English, then the key itself.
 * Supports simple {placeholder} substitution, e.g. translate('en', 'welcomeBack', { name: 'Juma' }).
 */
export function translate(lang, key, vars = {}) {
  const dict = dictionaries[lang] || dictionaries.en;
  let str = dict[key] ?? dictionaries.en[key] ?? key;
  for (const [k, v] of Object.entries(vars)) {
    str = str.replace(`{${k}}`, v);
  }
  return str;
}