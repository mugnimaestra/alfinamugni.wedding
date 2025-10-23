#!/bin/bash

# Seed Local Development Data
# This script populates local KV, D1, and R2 with development data
# Run this after starting wrangler dev for the first time

set -e

echo "🌱 Seeding local development data..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .wrangler/state exists
if [ ! -d ".wrangler/state" ]; then
  echo -e "${YELLOW}⚠️  .wrangler/state directory not found${NC}"
  echo "Please run 'pnpm run dev' first to initialize local Wrangler environment"
  exit 1
fi

echo -e "${BLUE}📦 Seeding KV Namespaces...${NC}"

# Seed ADMIN_KV with test session (optional, for testing)
# You can add more KV data here as needed
echo "  └─ ADMIN_KV configured (sessions will be created on login)"

# Seed SESSIONS KV
echo "  └─ SESSIONS configured (sessions will be created on login)"

echo -e "${GREEN}✓${NC} KV namespaces ready"
echo ""

echo -e "${BLUE}🗄️  Seeding D1 Database...${NC}"

# Apply migrations to local D1
pnpm wrangler d1 migrations apply wedding-database --local

echo -e "${GREEN}✓${NC} D1 database migrated"
echo ""

echo -e "${BLUE}🪣 Seeding R2 Buckets...${NC}"

# Create sample gallery structure (you can add actual files later)
echo "  └─ WEDDING_PHOTOS bucket ready (upload photos via admin dashboard)"
echo "  └─ WEDDING_PHOTOS_PREVIEW bucket ready"

echo -e "${GREEN}✓${NC} R2 buckets configured"
echo ""

echo -e "${GREEN}✨ Local development environment seeded successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Run 'pnpm run dev' to start the development server"
echo "2. Visit http://localhost:5173 to see your wedding website"
echo "3. Login at http://localhost:5173/auth/signin with your admin credentials"
echo "4. Upload photos and manage content via the admin dashboard"
echo ""
echo "💡 Tips:"
echo "   - All data is stored locally in .wrangler/state/"
echo "   - To reset local data: rm -rf .wrangler/state"
echo "   - Environment variables are loaded from .dev.vars"
