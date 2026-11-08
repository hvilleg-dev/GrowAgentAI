#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

ask_yes_no() {
    local prompt="$1"
    local response
    read -p "$prompt (y/n): " response
    [[ "$response" =~ ^[Yy]$ ]]
}

# Main deployment script
main() {
    print_header "🚀 GrowAgentAI Deployment Tool"

    print_warning "This script will:"
    echo "  1. Verify your git repository is clean"
    echo "  2. Push code to GitHub main branch"
    echo "  3. Provide deployment instructions for Vercel + Railway"
    echo ""

    # Step 1: Verify git status
    print_header "STEP 1: Verify Git Status"

    if ! git diff-index --quiet HEAD --; then
        print_error "You have uncommitted changes. Commit or stash them first:"
        git status
        exit 1
    fi

    print_success "Git status is clean"

    # Step 2: Verify GitHub connection
    print_header "STEP 2: Verify GitHub Connection"

    if ! git remote -v | grep -q origin; then
        print_error "No 'origin' remote found. Set it up with:"
        echo "  git remote add origin https://github.com/YOUR_USERNAME/GrowAgentAI.git"
        exit 1
    fi

    ORIGIN=$(git remote get-url origin)
    print_success "Remote configured: $ORIGIN"

    # Step 3: Push to GitHub
    print_header "STEP 3: Push to GitHub"

    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    echo "Current branch: $CURRENT_BRANCH"

    if [[ "$CURRENT_BRANCH" != "main" ]]; then
        print_warning "You are on branch '$CURRENT_BRANCH', not 'main'"
        if ! ask_yes_no "Push anyway?"; then
            echo "Cancelled"
            exit 1
        fi
    fi

    print_warning "Pushing to GitHub..."
    git push -u origin "$CURRENT_BRANCH"
    print_success "Code pushed to GitHub"

    # Step 4: Display deployment info
    print_header "STEP 4: Deployment Instructions"

    echo ""
    echo -e "${YELLOW}📋 NEXT STEPS:${NC}"
    echo ""
    echo "1️⃣  RAILWAY - Create Database:"
    echo "   - Go to: https://railway.app/dashboard"
    echo "   - Click: New Project → Database → PostgreSQL"
    echo "   - Save the DATABASE_URL"
    echo ""

    echo "2️⃣  RAILWAY - Deploy Backend:"
    echo "   - Click: New Service → GitHub Repo → GrowAgentAI"
    echo "   - Root Directory: backend/"
    echo "   - Set Environment Variables:"
    echo "     • DATABASE_URL (from step 1)"
    echo "     • OPENAI_API_KEY"
    echo "     • ANTHROPIC_API_KEY"
    echo "     • GITHUB_CLIENT_ID"
    echo "     • GITHUB_CLIENT_SECRET"
    echo "     • GITHUB_REDIRECT_URI (railway backend URL + /auth/github/callback)"
    echo "     • FRONTEND_URL (your Vercel domain)"
    echo "     • CORS_ORIGIN (your Vercel domain)"
    echo "     • NODE_ENV=production"
    echo ""

    echo "3️⃣  VERCEL - Deploy Frontend:"
    echo "   - Go to: https://vercel.com/dashboard"
    echo "   - Click: Add New → Project → Import Git Repository"
    echo "   - Select: GrowAgentAI"
    echo "   - Set Environment Variables:"
    echo "     • VITE_API_URL (your Railway backend URL + /api)"
    echo "     • VITE_SENTRY_DSN (optional)"
    echo "     • VITE_APP_NAME=GrowAgentAI"
    echo "     • VITE_APP_VERSION=2.0.0"
    echo ""

    echo "4️⃣  Test Deployment:"
    echo "   - Frontend: https://growagentai.vercel.app"
    echo "   - Backend Health: https://railway-backend/api/health"
    echo "   - Test end-to-end: Login → Create Session → Send Message"
    echo ""

    print_success "See DEPLOYMENT_VERCEL_RAILWAY.md for detailed instructions"

    echo ""
    echo -e "${GREEN}Ready to deploy! 🎉${NC}"
}

# Run main
main "$@"
