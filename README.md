# AgriMap

AI-powered agricultural mapping and soil intelligence platform that transforms free Sentinel-2 satellite imagery into actionable insights — crop detection, vegetation health, soil proxies, carbon sequestration — and bridges those insights into green financing for smallholder farmers and cooperatives.

## Architecture

AgriMap follows a **dual-backend monorepo** pattern:

| Service | Tech | Responsibility |
|---|---|---|
| `client-agri-map` | React + Vite | Frontend (dashboard, maps, field management, AI insights) |
| `server-agri-map-django` | Django + DRF | AI / geospatial backend — satellite ingestion, crop classification, soil & carbon analytics, farmer/cooperative data, reporting |
| `node-agri-map-server` | Node.js + Express | Finance/monetization backend — loans, carbon-credit tokenization, wallet, payments |

**Data flow:** the Django backend is the source of truth for AI/geospatial computation. The Node backend consumes Django's carbon outputs, tokenizes them as credits, and exposes loan/wallet/payment endpoints. JWT auth is issued by Django and validated by Node.

## Deployment

- **Frontend** — deployed on **Vercel** at https://agri-map-one.vercel.app/
- **Django backend** — deployed on **Render**
- **Node backend** — deployed on **Render**

## Environment Variables

The frontend reads three Vite-prefixed environment variables at build time:

| Variable | Consumed by | Purpose |
|---|---|---|
| `VITE_API_URL` | `src/services/api.js` | Primary API base (Django endpoints: auth, fields, analysis, carbon, wallet, satellite). Production fallback is the Render Django URL. |
| `VITE_DJANGO_API_URL` | `src/services/djangoApi.js` | Django backend base for geospatial/farmer/cooperative/report endpoints. |
| `VITE_NODE_API_URL` | `src/services/nodeApi.js` | Node backend base for finance endpoints (loans, payments, carbon credits, chatbot). |

> **Note:** `VITE_API_URL` and `VITE_DJANGO_API_URL` both target the Django backend. They are technically redundant in production (same host) but are kept separate because `api.js` and `djangoApi.js` define slightly different endpoint sets. Do not merge.

Copy the example files before developing:

```bash
cp client-agri-map/.env.example client-agri-map/.env
cp server-agri-map-django/.env.example server-agri-map-django/.env
cp node-agri-map-server/.env.example node-agri-map-server/.env
```

## Local Development

### Option 1 — Docker Compose (recommended)

From the repository root:

```bash
cp global.env.example global.env   # optional
docker compose up --build
```

Services will be available at:

- React client: http://localhost:4173
- Node backend: http://localhost:3001
- Django backend: http://localhost:8002
- PostgreSQL (PostGIS): http://localhost:5432

### Option 2 — Run services individually

**React client:**

```bash
cd client-agri-map
npm ci
npm run dev          # http://localhost:3000
```

**Node backend:**

```bash
cd node-agri-map-server
npm install
npm run dev          # http://localhost:3001
```

**Django backend:**

```bash
cd server-agri-map-django
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py runserver  # http://localhost:8002
```

## CI

GitHub Actions workflow is configured in `.github/workflows/ci.yml`. On each push/PR it will:

- install and lint/build the React client
- install dependencies and check the Node backend
- install Django dependencies and run Django tests
- build Docker images for all three services

## Project Layout

```
agri-map/
├── client-agri-map/          # React + Vite frontend
├── node-agri-map-server/     # Node.js / Express finance backend
├── server-agri-map-django/   # Django / DRF AI & geospatial backend
├── docker-compose.yml        # Local multi-service orchestration
├── Dockerfile.client         # Multi-stage client build → nginx
├── Dockerfile.node           # Node backend image
├── Dockerfile.django         # Django backend image
├── render.yaml               # Render service definitions
└── global.env.example        # Copy to global.env for local dev
```

## Notes

- `global.env` is gitignored — safe for local overrides.
- `server-agri-map-django/.env` is gitignored (contains secrets).
- All `.env` files contain local defaults; production values are injected via the Render/Vercel dashboards.
