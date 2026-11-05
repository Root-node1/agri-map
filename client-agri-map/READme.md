# AgriMap Client: Frontend, Pages, and User Flow

This guide describes the React/Vite application in `client-agri-map`. It maps the screens and navigation a user can reach, the data flow the frontend attempts, and the important differences between the intended product experience and the current implementation.

> The client is part of a three-service repository. Django provides the agricultural and geospatial API, Node provides finance and related services, and this React app is the browser interface. Several screens are currently prototypes and display local sample data; this document calls that out where it affects what a user sees.

## Contents

- [Product overview](#product-overview)
- [Start the frontend](#start-the-frontend)
- [Application structure](#application-structure)
- [User flow](#user-flow)
- [Routed pages](#routed-pages)
- [Additional screens in the source tree](#additional-screens-in-the-source-tree)
- [API clients and data sources](#api-clients-and-data-sources)
- [Shared interface components](#shared-interface-components)
- [Current integration gaps](#current-integration-gaps)

## Product overview

AgriMap presents agricultural mapping and farm intelligence to farmers and cooperatives. The main product areas are:

- onboarding and role selection;
- field registration and field overview;
- map and field health visualizations;
- satellite and vegetation analysis;
- crop and soil AI tools;
- carbon and finance experiences;
- cooperative coordination;
- account settings and an assistant.

The frontend is built with React 19, Vite, React Router, Axios, Tailwind CSS, Leaflet/React Leaflet, Chart.js, Recharts, React Icons, and Framer Motion. Styling is shared across `src/index.css`, `src/styles/design-tokens.css`, and page-specific styles.

## Start the frontend

From this directory:

```bash
npm ci
npm run dev
```

Vite serves the app at `http://localhost:3000` by default. To create a production bundle, run `npm run build`; `npm run preview` serves that build locally. `npm run lint` runs ESLint. The package's `npm test` script runs lint and then build.

Copy `.env.example` to `.env` and configure the API roots before starting Vite. Vite embeds `VITE_*` values at build time, so a change requires restarting the dev server or rebuilding the deployed client.

| Variable | Expected value shape | Used by |
|---|---|---|
| `VITE_API_URL` | Backend host only, with no `/api` suffix | `services/api.js`, which adds `/api/...` to its requests |
| `VITE_DJANGO_API_URL` | Django root including `/api`, e.g. `http://localhost:8002/api` | `services/djangoApi.js`, which uses app-relative paths |
| `VITE_NODE_API_URL` | Node API root including `/api`, e.g. `http://localhost:3001/api` | `services/nodeApi.js` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID | Optional Google identity integration/configuration |
| `VITE_PAYSTACK_PUBLIC_KEY` | Paystack public key | Payment integration configuration |

The checked-in `.env.example` documents these URL conventions. Do not commit private keys or production secrets.

## Application structure

```text
src/
  App.jsx                    Routes and dashboard selection
  main.jsx                   React root and top-level providers
  contexts/                  User, theme, settings, and legacy auth context
  services/                  Axios clients for Django and Node
  pages/                     Screens grouped by product area
  components/layout/         Site navigation, footer, alternate dashboard shell
  components/ui/             Maps, charts, state views, accessibility, chatbot
  hooks/                     Query and dashboard hooks
  lib/demoData.js            Local sample data for prototype/fallback UI
  styles/                    Design tokens and landing page styles
```

`main.jsx` mounts `ThemeProvider` and `UserProvider`, then renders `App`. `App` wraps routed page content in the shared `Layout` (top navigation, accessibility controls, footer, and floating chatbot). The separate `DashboardLayout` implements a sidebar, but it is not used by the route tree in `App.jsx`.

### State and persistence

`UserContext` stores an onboarding profile under `agrimap_user` in browser local storage. It is a local role/name record, not proof of identity from the Django API. The context exposes `completeOnboarding`, `resetUser`, and `isOnboarded`.

`ThemeContext` stores dark-mode preference as `darkMode` in local storage and applies the `dark` class to the document. `SettingsContext` has language and font-size preferences, but `SettingsProvider` is not mounted by `main.jsx`; components that call `useSettings()` need that provider before they can work.

`AuthContext.jsx` is commented out. It describes JWT-based login flows but is not active. Login routes and an API-backed registration flow are not included in the current `App.jsx` route tree.

## User flow

### 1. Landing and onboarding

The root path `/` displays `LandingPage.jsx`, a marketing page with animated scenery, feature cards, and links to onboarding. `/onboarding` asks for a name and one role: small-scale farmer, large-scale farmer, researcher, cooperative, or other. Choosing “Other” reveals a free-text role field.

Submitting onboarding validates the fields in the browser, saves the profile in `UserContext`/local storage, and navigates back to `/`. This step does not create a Django account or farmer profile. A returning onboarded visitor who opens `/onboarding` is redirected to `/dashboard`.

### 2. Dashboard selection

`/dashboard` reads `agrimap_user.role` and selects a view:

- `admin` → `AdminDashboard`;
- `cooperative` → `CooperativeDashboard`;
- any other role or missing role → `FarmerDashboard`.

The role/name comes from local onboarding state. It is not checked against a backend user account. The farmer dashboard attempts to load fields, wallet balance, and carbon totals, while several maps, activity items, and fallback values remain demo content. The cooperative dashboard uses simulated counts and activity. The admin dashboard attempts a separate `/admin/users` request and references a `token` variable that is not defined in that component.

### 3. Farmer profile

`/farmer/register` opens `FarmerProfileSetup`. It collects phone and location and validates that both are present, but submission currently waits briefly and navigates to `/dashboard`; it does not call the Django farmer registration endpoint.

### 4. Manage fields

`/fields` loads fields using the shared Axios client and displays a searchable/filterable grid or table. Users can open the add-field modal and delete a displayed field. In the current form, the submitted object contains display fields such as name, location, size, and crop type; Django field creation expects a GeoJSON `geometry` object. The page also does not consume the paginated response's `results` array, so a successful API response may still fall through to demo records.

`/fields/new` is a separate informational placeholder; it does not create a field. The field list's add modal is the actual form currently present.

Selecting a field navigates to `/fields/:id`. This route renders `FieldDetails.jsx`, which currently displays the ID and placeholder summary rather than loading the field. `/fields/:id/report` renders a placeholder report. `/fields/:id/satellite` renders the satellite analysis screen, currently wired to a fixed field ID.

### 5. Maps and insights

`/heatmap` displays sample fields, a map, a static NDVI gradient, and generated nutrient heatmap values from `demoData.js`. It has no Django fetch in the page.

The `pages/ai` group contains crop detection, soil analysis, yield prediction, vegetation health, and comprehensive field analysis concepts. Those pages are not declared in `App.jsx`, even though the sidebar component contains links to them. Consequently, the current router sends those paths to the catch-all redirect at `/`. Some AI screens call `aiAPI`, which is not exported from `services/api.js`; those calls are not a working integration as written.

### 6. Cooperatives

`/cooperatives`, `/cooperatives/new`, and `/cooperatives/:id` render a static cooperative list, registration introduction, and detail summary. They do not call Django. The cooperative dashboard also uses simulated figures. The Django backend supports cooperative creation and membership APIs, but the client screens do not currently surface those operations.

### 7. Settings and navigation

`/settings` renders `pages/public/Settings.jsx`, a static description page. `pages/settings/Settings.jsx` contains a richer local-only profile/notification/security form, but it is not the component wired to the route. The top `Navbar` links to Fields, Dashboard, and Cooperatives, shows the local profile name, and offers “Switch User,” which clears onboarding state.

The shared `Layout` also mounts a floating chatbot and accessibility controls. The chatbot attempts a Node request and falls back to a small rule-based local response when it fails.

## Routed pages

These paths are declared in `src/App.jsx` and can be reached through the router (whether or not each screen is fully implemented):

| Path | Component | Purpose and current behavior |
|---|---|---|
| `/` | `pages/public/LandingPage.jsx` | Product landing page and onboarding calls to action. |
| `/onboarding` | `pages/public/UserOnboarding.jsx` | Stores name and role locally. Redirects to dashboard if already onboarded. |
| `/home` | `pages/public/Home.jsx` | Additional product/home content. |
| `/about` | `pages/public/About.jsx` | Product information. |
| `/privacy` | `pages/public/PrivacyPolicy.jsx` | Privacy policy content. |
| `/terms` | `pages/public/TermsConditions.jsx` | Terms content. |
| `/farmer/register` | `pages/farm/FarmerProfileSetup.jsx` | Local-only phone/location form. |
| `/cooperatives` | `pages/public/Cooperatives.jsx` | Static cooperative examples. |
| `/cooperatives/new` | `pages/public/CooperativeRegister.jsx` | Cooperative registration introduction, not a working form. |
| `/cooperatives/:id` | `pages/public/CooperativeDetails.jsx` | Static cooperative summary. |
| `/dashboard` | role-selected dashboard | Farmer, cooperative, or admin view. |
| `/fields` | `pages/farm/Fields.jsx` | Field list, add modal, delete, search, and view toggle; integration gaps apply. |
| `/fields/new` | `pages/farm/NewField.jsx` | Placeholder guidance, not a field creation form. |
| `/fields/:id` | `pages/farm/FieldDetails.jsx` | Placeholder detail screen. |
| `/fields/:id/report` | `pages/farm/FieldReport.jsx` | Placeholder report screen. |
| `/fields/:id/satellite` | `pages/farm/SatelliteAnalysis.jsx` | Attempts satellite fetch and vegetation lookup for field ID 1, then displays mostly fixed metrics. |
| `/heatmap` | `pages/farm/HeatmapView.jsx` | Demo-driven map/heatmap. |
| `/settings` | `pages/public/Settings.jsx` | Static settings description. |
| `*` | redirect | Unknown paths return to `/`. |

Routes exposed by components but not declared in `App.jsx` include `/ai/...`, `/finance/...`, `/wallet`, `/chatbot`, `/subscriptions`, and `/api-keys`. The `DashboardLayout` sidebar links to several of these paths, but the active app route tree does not render that layout or register those paths.

## Additional screens in the source tree

These files exist, but are not currently wired into `App.jsx`:

| Group | Screens | Intended user task |
|---|---|---|
| `pages/ai` | `CropDetection`, `SoilAnalysis`, `YieldPrediction`, `VegetationHealth`, `FieldAnalysis` | Crop image classification, soil input analysis, yield forecast, vegetation chart, combined field analysis. UI uses local fallback values and missing/unwired AI service methods. |
| `pages/finance` | `Loans`, `LoanDashboard`, `Tokenization`, `CarbonMarketplace` | Apply/track loans and view, tokenize, or sell carbon credits via the Node API. |
| `pages/wallet` | `WalletDashboard` | Wallet balance, transaction list, deposit UI; currently targets Node client but has method mismatches and demo fallbacks. |
| `pages/chatbot` | `ChatbotPage` | Full-screen assistant; imports chatbot API from the wrong service module. The floating chatbot in `Layout` is the active assistant UI. |
| `pages/subscriptions` | `Pricing`, `ApiKeys` | Subscription plans and API keys; methods referenced in these pages are not exported by the current API services. |
| `pages/settings` | `Settings` | Profile, notification and security controls held in local component state; richer than the routed public settings placeholder. |
| `pages/farm` | `FieldDetail` | A more data-oriented field detail implementation, distinct from the routed `FieldDetails`; it is not mounted by `App.jsx`. |
| `pages/dashboard` | `UserDashboard` | Generic sample dashboard, not selected by the role switch in `App.jsx`. |
| `pages/auth` | `Login`, `ForgotPassword` | Login and password recovery UI, but neither is routed and the Django auth routes are absent. |

## API clients and data sources

### Django client: `services/api.js`

This Axios client uses `VITE_API_URL` as a host and prepends `/api/...` in each method. It adds a local-storage bearer token when present and contains a refresh-token interceptor. It exports auth, fields, analysis, carbon, wallet, and satellite helpers.

The helper surface does not fully match Django. Django does not define `/api/auth/...`, `/api/wallet/...`, `/api/carbon/`, or `/api/carbon/stats/`; the analysis soil GET path and crop-type GET helper also do not match the backend routes/methods. `api.js` does not export the `aiAPI`, `subscriptionAPI`, or `paymentAPI` names imported by some source pages.

### Alternate Django client: `services/djangoApi.js`

This client uses `VITE_DJANGO_API_URL` as the API root (the example includes `/api`). It has helpers for farmer, cooperative, field, satellite, analysis, carbon, report, and health calls. Searches show no page imports these helpers, so this client currently does not drive a visible screen. Some paths differ from Django, including cooperative prefixes, crop-prediction method, and soil-health location.

### Node client: `services/nodeApi.js`

This client uses `VITE_NODE_API_URL` and exposes loan, carbon-credit, payment, wallet, chatbot, and health helpers. The floating chatbot uses its chatbot helper. Finance and wallet pages are not routed. Some pages import method names that this module does not export (for example, the wallet screen expects payment initiation and wallet deposit methods that are not present here).

### Demo and local state

`src/lib/demoData.js` supplies sample fields, chart series, transaction history, plans, and other fallback data. Several pages use those values directly even when the backend is reachable; other pages display them after failed requests. The field list has an explicit error banner on load failure, but other fallback paths may look like real data unless the user inspects the page behavior.

## Shared interface components

- `Navbar`: top navigation, local user label, and switch-user action.
- `Layout`: shared page wrapper with navbar, footer, accessibility widgets, and floating chatbot.
- `DashboardLayout`: alternate sidebar shell with grouped navigation; currently unused by `App`.
- `FieldMap`: Leaflet map with selectable base or satellite tile layer and markers.
- `NutrientHeatmap`: field-zone visualization driven by provided data.
- `PageHeader`, `StatCard`, `LoadingSpinner`, `Skeletons`, `StateViews`: shared headers, stats, loading, empty, and error presentation.
- `AccessibilityMenu`: font/text controls and accessibility options; settings context should be mounted for features that depend on it.
- `Chatbot`: floating assistant that calls the Node chatbot endpoint and falls back to a local rules-based answer.

## Current integration gaps

The user-visible product flow is ahead of the live backend integration. Address these items before treating the dashboard as a source of operational farm data:

1. **Use one agreed API contract per service.** Align paths and HTTP methods with Django/Node routes, remove duplicate service abstractions, and ensure each request targets the right base URL.
2. **Complete field geometry capture.** Add a map drawing or GeoJSON input to field creation, send `geometry`, and map the paginated `results` response into the list. Avoid creating local-only records after failed writes.
3. **Route and connect field detail/report screens.** Decide whether `FieldDetails` or `FieldDetail` is canonical, connect it to the field detail API, and load `/api/reports/field/{id}/` for reports.
4. **Make satellite interactions field-specific.** Use the current route field ID, expose date range and fetch/process steps, and display whether the result is simulated or sourced from Sentinel Hub.
5. **Wire cooperative/profile operations.** Connect farmer registration and cooperative/member screens to Django's actual route structure; add real member list/add/update/remove states.
6. **Register intended screens.** Either add the AI, finance, wallet, chatbot, subscription, and API-key routes to `App.jsx` and connect their services, or remove/hide navigation links that currently redirect to the landing page.
7. **Replace demo metrics with explicit data states.** Show loading, missing-data, and sample/demo labels. Populate maps and visualizations from API data and do not use static values as if they were measured results.
8. **Finish auth and role handling.** Current onboarding is a local personalization step, not authentication. The auth context is commented out, and Django API access is open in the current backend configuration. Do not treat local role selection as access control.
9. **Mount required providers.** If settings/language hooks are used, mount `SettingsProvider` in `main.jsx` and verify all relevant components are within it.

