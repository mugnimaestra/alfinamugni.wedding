#!/bin/bash

# Production Deployment Script for Wedding Website
# This script handles the complete deployment process to Cloudflare Pages

set -e

echo "🚀 Starting Wedding Website Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="alfinamugni-wedding"
PRODUCTION_URL="https://alfinamugni.wedding"

echo -e "${BLUE}📋 Deployment Configuration:${NC}"
echo "  Project: $PROJECT_NAME"
echo "  Target URL: $PRODUCTION_URL"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "wrangler.toml" ]; then
    echo -e "${RED}❌ Error: Must be run from project root with package.json and wrangler.toml${NC}"
    exit 1
fi

# Check if Cloudflare CLI is installed
if ! command -v wrangler &> /dev/null; then
    echo -e "${RED}❌ Error: Cloudflare Wrangler CLI not found${NC}"
    echo "Please install it with: npm install -g wrangler"
    exit 1
fi

# Check if user is logged in to Cloudflare
echo -e "${BLUE}🔐 Checking Cloudflare authentication...${NC}"
if ! wrangler whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Cloudflare. Please run: wrangler auth login${NC}"
    exit 1
fi

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm ci

# Run tests
echo -e "${BLUE}🧪 Running tests...${NC}"
npm run test:run

# Build the project
echo -e "${BLUE}🔨 Building project for production...${NC}"
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build failed - dist directory not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully${NC}"

# Database migration check
echo -e "${BLUE}🗄️  Checking database migrations...${NC}"
if [ -d "migrations" ]; then
    echo "  Migration files found:"
    ls -la migrations/
    echo ""
    echo -e "${YELLOW}⚠️  Make sure to run migrations manually if needed:${NC}"
    echo "  wrangler d1 migrations apply wedding-database --remote"
    echo ""
fi

# Deploy to Cloudflare Pages
echo -e "${BLUE}🚀 Deploying to Cloudflare Pages...${NC}"
wrangler pages deploy dist --project-name $PROJECT_NAME --compatibility-date=2024-09-21

# Check deployment status
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo ""
    echo -e "${BLUE}🌐 Your wedding website is now live at:${NC}"
    echo -e "${GREEN}  $PRODUCTION_URL${NC}"
    echo ""
    echo -e "${BLUE}🔧 Admin dashboard:${NC}"
    echo -e "${GREEN}  $PRODUCTION_URL/admin${NC}"
    echo ""
    echo -e "${YELLOW}📝 Post-deployment checklist:${NC}"
    echo "  □ Test the main website functionality"
    echo "  □ Test RSVP submission"
    echo "  □ Test wish submission"
    echo "  □ Test admin login and dashboard"
    echo "  □ Verify email delivery"
    echo "  □ Check mobile responsiveness"
    echo "  □ Monitor performance metrics"
    echo ""
    echo -e "${GREEN}🎉 Congratulations! Your wedding website is ready!${NC}"
else
    echo -e "${RED}❌ Deployment failed${NC}"
    echo "Please check the error messages above and try again."
    exit 1
fi