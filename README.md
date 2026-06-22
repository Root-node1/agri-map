# agri-map

This repository contains three projects in a monorepo:

- `client-agri-map`: React + Vite frontend
- `node-agri-map-server`: Node.js / Express backend
- `server-agri-map-django`: Django backend (currently only virtualenv exists)

## Local development

### 1. Start all projects

From the repository root:

```bash
bash ./run.sh
```

This will:
- start the React client via `npm run dev`
- start the Node backend via `npm run start`
- start the Django backend if `manage.py` exists

### 2. Environment variables

Copy `global.env.example` to `global.env` and update any values needed for local development.

### 3. React client

```bash
cd client-agri-map
npm ci
npm run dev
```

### 4. Node backend

```bash
cd node-agri-map-server
npm ci
npm run start
```

### 5. Django backend

Add your Django app files to `server-agri-map-django/`, then run:

```bash
cd server-agri-map-django
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python manage.py runserver 8002
```

## Docker

Build and run all services with Docker Compose:

```bash
docker compose up --build
```

Services:
- React client: `http://localhost:4173`
- Node backend: `http://localhost:3001`
- Django backend: `http://localhost:8002`

## CI

GitHub Actions workflow is configured in `.github/workflows/ci.yml`.
It will:
- install and test the React client
- install and test the Node backend
- install Django dependencies and run Django tests if `manage.py` exists

## Notes

- `global.env` is ignored by Git via `.gitignore`
- `server-agri-map-django/venv` is ignored by Git
