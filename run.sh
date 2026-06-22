#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLIENT_DIR="$ROOT/client-agri-map"
NODE_DIR="$ROOT/node-agri-map-server"
DJANGO_DIR="$ROOT/server-agri-map-django"
GLOBAL_ENV="$ROOT/global.env"

log() {
  printf "%s %s\n" "$(date '+%Y-%m-%dT%H:%M:%S%z')" "$*"
}

if [ -f "$GLOBAL_ENV" ]; then
  log "Loading global environment from $GLOBAL_ENV"
  # shellcheck disable=SC1090
  source "$GLOBAL_ENV"
else
  log "No global.env found; continuing without it"
fi

run_npm_service() {
  local dir="$1"
  local label="$2"
  local cmd="$3"

  if [ ! -d "$dir" ]; then
    log "Skipping $label: directory not found: $dir"
    return
  fi

  (
    cd "$dir"
    if [ -f package.json ] && [ ! -d node_modules ]; then
      log "Installing dependencies for $label"
      npm install
    fi
    log "Starting $label"
    bash -lc "$cmd"
  ) &
}

run_npm_service "$CLIENT_DIR" "React client" "npm run dev"
run_npm_service "$NODE_DIR" "Node backend" "npm run start || node src/server.js"

if [ -f "$DJANGO_DIR/manage.py" ]; then
  log "Starting Django backend"
  (
    cd "$DJANGO_DIR"
    if [ -f requirements.txt ]; then
      log "Installing Django requirements"
      python -m pip install --upgrade pip
      python -m pip install -r requirements.txt
    fi

    if [ -f "venv/bin/activate" ]; then
      source "venv/bin/activate"
    elif [ -f "venv/Scripts/activate" ]; then
      source "venv/Scripts/activate"
    fi

    python manage.py runserver 8002
  ) &
else
  log "Skipping Django backend: no manage.py found in $DJANGO_DIR"
fi

trap 'log "Shutting down servers"; kill $(jobs -p) 2>/dev/null || true' EXIT
wait
