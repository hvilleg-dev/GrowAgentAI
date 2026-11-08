#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo ""
    echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
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

# ═══════════════════════════════════════════════════════════════════════════
# MAIN DEPLOYMENT SCRIPT
# ═══════════════════════════════════════════════════════════════════════════

main() {
    print_header "🚀 GrowAgentAI - Oracle VM Deployment"

    # Step 1: Update system
    print_header "STEP 1: Update System"
    sudo apt update
    sudo apt upgrade -y
    print_success "System updated"

    # Step 2: Install Docker
    print_header "STEP 2: Install Docker"
    if ! command -v docker &> /dev/null; then
        sudo apt install -y docker.io docker-compose
        sudo usermod -aG docker ubuntu
        print_success "Docker installed"
    else
        print_success "Docker already installed"
    fi

    # Step 3: Clone repository
    print_header "STEP 3: Clone Repository"
    if [ ! -d "GrowAgentAI" ]; then
        git clone https://github.com/hvilleg-dev/GrowAgentAI.git
        print_success "Repository cloned"
    else
        print_warning "Repository already exists, pulling latest changes"
        cd GrowAgentAI
        git pull
        cd ..
    fi

    cd GrowAgentAI

    # Step 4: Create .env file
    print_header "STEP 4: Create .env File"

    if [ -f ".env" ]; then
        print_warning ".env already exists, skipping creation"
    else
        print_warning "Please provide the following credentials:"
        echo ""

        read -p "NEON DATABASE_URL (postgresql://...): " NEON_URL
        if [ -z "$NEON_URL" ]; then
            print_error "DATABASE_URL cannot be empty"
            exit 1
        fi

        read -p "GITHUB_CLIENT_ID: " GITHUB_CLIENT_ID
        if [ -z "$GITHUB_CLIENT_ID" ]; then
            print_error "GITHUB_CLIENT_ID cannot be empty"
            exit 1
        fi

        read -sp "GITHUB_CLIENT_SECRET: " GITHUB_CLIENT_SECRET
        echo ""
        if [ -z "$GITHUB_CLIENT_SECRET" ]; then
            print_error "GITHUB_CLIENT_SECRET cannot be empty"
            exit 1
        fi

        read -p "OPENAI_API_KEY (sk-proj-...): " OPENAI_API_KEY
        if [ -z "$OPENAI_API_KEY" ]; then
            print_warning "OPENAI_API_KEY empty, using default"
        fi

        # Create .env file
        cat > .env << EOF
# Database
DATABASE_URL=$NEON_URL

# API Keys
OPENAI_API_KEY=$OPENAI_API_KEY
ANTHROPIC_API_KEY=

# GitHub OAuth
GITHUB_CLIENT_ID=$GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET=$GITHUB_CLIENT_SECRET
GITHUB_REDIRECT_URI=http://129.158.255.62:3001/auth/github/callback

# Frontend
FRONTEND_URL=https://growagentai.vercel.app
CORS_ORIGIN=https://growagentai.vercel.app

# App
NODE_ENV=production
PORT=3001
LOG_LEVEL=info
EOF

        print_success ".env file created"
    fi

    # Step 5: Build Docker image
    print_header "STEP 5: Build Docker Image"
    docker build -t growagentai-backend backend/
    print_success "Docker image built"

    # Step 6: Stop existing container
    print_header "STEP 6: Stop Existing Container (if any)"
    docker-compose down 2>/dev/null || true
    print_success "Cleaned up old containers"

    # Step 7: Start container
    print_header "STEP 7: Start Backend Container"
    docker-compose up -d
    print_success "Backend container started"

    # Step 8: Wait for container to be healthy
    print_header "STEP 8: Waiting for Backend to be Healthy"
    sleep 5

    # Step 9: Verify backend
    print_header "STEP 9: Verify Backend Health"

    # Check if container is running
    if ! docker ps | grep -q growagentai-backend; then
        print_error "Container is not running!"
        docker logs growagentai-backend
        exit 1
    fi
    print_success "Container is running"

    # Test health endpoint
    if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
        print_success "Backend health check passed"
    else
        print_warning "Backend health check failed, waiting..."
        sleep 3
        if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
            print_success "Backend health check passed (after retry)"
        else
            print_error "Backend health check failed"
            docker logs growagentai-backend
            exit 1
        fi
    fi

    # Step 10: Summary
    print_header "✅ DEPLOYMENT COMPLETE!"

    echo ""
    echo -e "${GREEN}Backend is running at: http://129.158.255.62:3001${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Setup Neon pgvector: See NEON_SETUP.md"
    echo "  2. Deploy frontend to Vercel: See VERCEL_DEPLOYMENT.md"
    echo "  3. Test end-to-end: Login and chat"
    echo ""
    echo "Useful commands:"
    echo "  docker logs -f growagentai-backend     (view logs)"
    echo "  docker ps                              (check status)"
    echo "  curl http://localhost:3001/api/health  (test health)"
    echo ""

    print_success "Setup complete!"
}

# Run main
main "$@"
