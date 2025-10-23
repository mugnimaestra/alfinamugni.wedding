#!/bin/bash

# Run Wrangler Pages Dev Mode with Real Bindings
# This provides real KV, D1, and R2 for local development

set -e

echo "🚀 Starting Wrangler Pages Dev Mode..."
echo ""
echo "This mode provides:"
echo "  ✅ Real KV, D1, R2 bindings"
echo "  ✅ Production-accurate runtime"
echo "  ✅ Data persistence in .wrangler/state/"
echo ""

# Check if .wrangler/state exists, if not, suggest seeding
if [ ! -d ".wrangler/state" ]; then
  echo "⚠️  No local data found. You might want to run:"
  echo "   pnpm run seed:local"
  echo ""
fi

# Build the project first for Pages dev
echo "📦 Building project..."
pnpm run build.client

echo ""
echo "✨ Starting dev server with real Cloudflare bindings..."
echo ""

# Check if port 5173 is in use
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
  echo "⚠️  Port 5173 is already in use (probably by 'pnpm run dev')"
  echo ""
  echo "Options:"
  echo "  1. Stop 'pnpm run dev' and run this again"
  echo "  2. Use a different port (8788 suggested)"
  echo ""
  read -p "Run on port 8788 instead? [Y/n] " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
    PORT=8788
  else
    echo "Exiting. Stop the other dev server first."
    exit 1
  fi
else
  PORT=5173
fi

echo "🌐 Starting on http://localhost:$PORT"
echo ""

# Run wrangler pages dev with the dist directory
pnpm wrangler pages dev dist \
  --compatibility-date=2024-09-21 \
  --compatibility-flags=nodejs_compat \
  --port=$PORT

# Alternative: If you need to specify bindings explicitly:
# pnpm wrangler pages dev dist \
#   --compatibility-date=2024-09-21 \
#   --compatibility-flags=nodejs_compat \
#   --port=5173 \
#   --kv=SESSIONS \
#   --kv=ADMIN_KV \
#   --d1=DB \
#   --r2=WEDDING_PHOTOS
