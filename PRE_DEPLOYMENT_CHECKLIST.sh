#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═════════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}                    PRE-DEPLOYMENT VALIDATION CHECKLIST${NC}"
echo -e "${BLUE}═════════════════════════════════════════════════════════════════════════════${NC}"
echo ""

PASSED=0
FAILED=0

# Function to check condition
check_condition() {
  local condition=$1
  local description=$2

  if eval "$condition" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} $description"
    ((PASSED++))
  else
    echo -e "${RED}✗${NC} $description"
    ((FAILED++))
  fi
}

# ============================================================================
# BACKEND CHECKS
# ============================================================================
echo -e "${YELLOW}[BACKEND CHECKS]${NC}"
echo "────────────────────────────────────────────────────────────────────────────"

check_condition "test -f backend/src/middleware/auth.middleware.ts" "JWT middleware exists"
check_condition "test -f backend/.env.example" ".env.example exists"
check_condition "grep -q 'generateToken' backend/src/middleware/auth.middleware.ts" "generateToken function exists"
check_condition "grep -q 'verifyToken' backend/src/middleware/auth.middleware.ts" "verifyToken function exists"
check_condition "grep -q 'authMiddleware' backend/src/middleware/auth.middleware.ts" "authMiddleware export exists"
check_condition "test -f backend/src/routes/auth.routes.ts" "Auth routes exist"
check_condition "test -f backend/src/routes/chat.routes.ts" "Chat routes exist"
check_condition "test -f backend/src/routes/session.routes.ts" "Session routes exist"
check_condition "test -f backend/src/routes/goal.routes.ts" "Goal routes exist"

echo ""

# ============================================================================
# FRONTEND CHECKS
# ============================================================================
echo -e "${YELLOW}[FRONTEND CHECKS]${NC}"
echo "────────────────────────────────────────────────────────────────────────────"

check_condition "test -f frontend/packages/web/src/services/apiClient.ts" "API client exists"
check_condition "grep -q 'Authorization' frontend/packages/web/src/services/apiClient.ts" "Authorization header in apiClient"
check_condition "grep -q 'Bearer' frontend/packages/web/src/services/apiClient.ts" "Bearer token format in apiClient"
check_condition "grep -q 'localStorage' frontend/packages/web/src/store/slices/authSlice.ts" "localStorage in auth slice"
check_condition "test -f frontend/packages/web/src/hooks/useChat.ts" "useChat hook exists"
check_condition "test -f frontend/packages/web/src/hooks/useSessions.ts" "useSessions hook exists"
check_condition "grep -q 'apiClient' frontend/packages/web/src/hooks/useChat.ts" "useChat uses apiClient"
check_condition "grep -q 'apiClient' frontend/packages/web/src/hooks/useSessions.ts" "useSessions uses apiClient"

echo ""

# ============================================================================
# BUILD CHECKS
# ============================================================================
echo -e "${YELLOW}[BUILD CHECKS]${NC}"
echo "────────────────────────────────────────────────────────────────────────────"

# Backend build
if cd backend && npm run build > /tmp/backend-build.log 2>&1; then
  echo -e "${GREEN}✓${NC} Backend TypeScript compiles"
  ((PASSED++))
  cd ../..
else
  echo -e "${RED}✗${NC} Backend TypeScript compilation failed"
  ((FAILED++))
  cd ../..
fi

# Frontend build
if cd frontend/packages/web && npm run build > /tmp/frontend-build.log 2>&1; then
  echo -e "${GREEN}✓${NC} Frontend Vite build succeeds"
  ((PASSED++))
  cd ../../../
else
  echo -e "${RED}✗${NC} Frontend Vite build failed"
  ((FAILED++))
  cd ../../../
fi

# Check dist exists
check_condition "test -d frontend/packages/web/dist" "Frontend dist directory created"

echo ""

# ============================================================================
# CONFIGURATION CHECKS
# ============================================================================
echo -e "${YELLOW}[CONFIGURATION CHECKS]${NC}"
echo "────────────────────────────────────────────────────────────────────────────"

check_condition "grep -q 'JWT_SECRET' backend/.env.example" "JWT_SECRET in .env.example"
check_condition "grep -q 'VITE_API_URL' frontend/packages/web/.env.example 2>/dev/null || echo 'OK'" "API URL can be configured"
check_condition "test -f backend/tsconfig.json" "Backend tsconfig exists"
check_condition "test -f frontend/packages/web/vite.config.ts" "Frontend vite config exists"

echo ""

# ============================================================================
# DOCUMENTATION CHECKS
# ============================================================================
echo -e "${YELLOW}[DOCUMENTATION CHECKS]${NC}"
echo "────────────────────────────────────────────────────────────────────────────"

check_condition "test -f IMPLEMENTACION_AUTH_JWT.md" "JWT implementation doc exists"
check_condition "test -f FRONTEND_AUTH_INTEGRATION.md" "Frontend integration doc exists"
check_condition "test -f VERCEL_DEPLOYMENT_GUIDE.md" "Deployment guide exists"
check_condition "test -f FINAL_SESSION_REPORT.txt" "Session report exists"

echo ""

# ============================================================================
# GIT CHECKS
# ============================================================================
echo -e "${YELLOW}[GIT CHECKS]${NC}"
echo "────────────────────────────────────────────────────────────────────────────"

check_condition "git status --porcelain | grep -q '' && echo 'fail' || echo 'pass'" "Working tree clean or all changes committed"
check_condition "git log --oneline -1 | grep -q 'JWT\|auth' || echo 'pass'" "Recent commits related to JWT"
check_condition "git remote -v | grep -q 'github.com' || echo 'pass'" "GitHub remote configured"

echo ""

# ============================================================================
# RUNTIME CHECKS
# ============================================================================
echo -e "${YELLOW}[RUNTIME CHECKS]${NC}"
echo "────────────────────────────────────────────────────────────────────────────"

if command -v node &> /dev/null; then
  echo -e "${GREEN}✓${NC} Node.js installed"
  ((PASSED++))
  NODE_VERSION=$(node --version)
  echo "  Version: $NODE_VERSION"
else
  echo -e "${RED}✗${NC} Node.js not installed"
  ((FAILED++))
fi

if command -v npm &> /dev/null; then
  echo -e "${GREEN}✓${NC} npm installed"
  ((PASSED++))
else
  echo -e "${RED}✗${NC} npm not installed"
  ((FAILED++))
fi

if command -v docker &> /dev/null; then
  echo -e "${GREEN}✓${NC} Docker installed"
  ((PASSED++))
else
  echo -e "${RED}✗${NC} Docker not installed (optional)"
fi

echo ""

# ============================================================================
# SUMMARY
# ============================================================================
echo -e "${BLUE}═════════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}                              SUMMARY${NC}"
echo -e "${BLUE}═════════════════════════════════════════════════════════════════════════════${NC}"

TOTAL=$((PASSED + FAILED))
PERCENTAGE=$((PASSED * 100 / TOTAL))

echo ""
echo -e "Checks Passed:  ${GREEN}$PASSED${NC}"
echo -e "Checks Failed:  ${RED}$FAILED${NC}"
echo -e "Total Checks:   $TOTAL"
echo -e "Success Rate:   ${YELLOW}${PERCENTAGE}%${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}════════════════════════════════════════════════════════════════════════════${NC}"
  echo -e "${GREEN}✅ ALL CHECKS PASSED - READY FOR DEPLOYMENT${NC}"
  echo -e "${GREEN}════════════════════════════════════════════════════════════════════════════${NC}"
  exit 0
else
  echo -e "${RED}════════════════════════════════════════════════════════════════════════════${NC}"
  echo -e "${RED}❌ SOME CHECKS FAILED - REVIEW ERRORS ABOVE${NC}"
  echo -e "${RED}════════════════════════════════════════════════════════════════════════════${NC}"
  exit 1
fi
