#!/usr/bin/env bash
# ============================================================================
# Deployment Validation Script
# ============================================================================
# This script validates that everything is ready for deployment
# Usage: ./scripts/validate-deployment.sh
# ============================================================================

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
ERRORS=0
WARNINGS=0
CHECKS=0

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC}  $1"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
}

check_pass() {
    echo -e "${GREEN}✓${NC} $1"
    CHECKS=$((CHECKS + 1))
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
    ERRORS=$((ERRORS + 1))
    CHECKS=$((CHECKS + 1))
}

check_warn() {
    echo -e "${YELLOW}⚠${NC}  $1"
    WARNINGS=$((WARNINGS + 1))
    CHECKS=$((CHECKS + 1))
}

print_header "Pre-Deployment Validation"
echo ""

# ============================================================================
# Check Local Environment
# ============================================================================
echo -e "${BLUE}▶ Checking Local Environment${NC}"
echo ""

# Check Git
if command -v git &> /dev/null; then
    check_pass "Git is installed"
else
    check_fail "Git is not installed"
fi

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    check_pass "Node.js is installed ($NODE_VERSION)"
    
    # Check if version is 20.x
    if [[ "$NODE_VERSION" =~ ^v20\. ]]; then
        check_pass "Node.js version is 20.x (compatible)"
    else
        check_warn "Node.js version is $NODE_VERSION (recommended: 20.x)"
    fi
else
    check_fail "Node.js is not installed"
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    check_pass "npm is installed ($NPM_VERSION)"
else
    check_fail "npm is not installed"
fi

echo ""

# ============================================================================
# Check Project Structure
# ============================================================================
echo -e "${BLUE}▶ Checking Project Structure${NC}"
echo ""

# Check backend
if [ -d "$ROOT_DIR/backend" ]; then
    check_pass "Backend directory exists"
    
    if [ -f "$ROOT_DIR/backend/package.json" ]; then
        check_pass "Backend package.json exists"
    else
        check_fail "Backend package.json not found"
    fi
    
    if [ -f "$ROOT_DIR/backend/adonisrc.ts" ]; then
        check_pass "AdonisJS configuration exists"
    else
        check_fail "AdonisJS configuration not found"
    fi
else
    check_fail "Backend directory not found"
fi

# Check frontend
if [ -d "$ROOT_DIR/frontend" ]; then
    check_pass "Frontend directory exists"
    
    if [ -f "$ROOT_DIR/frontend/package.json" ]; then
        check_pass "Frontend package.json exists"
    else
        check_fail "Frontend package.json not found"
    fi
    
    if [ -f "$ROOT_DIR/frontend/next.config.ts" ]; then
        check_pass "Next.js configuration exists"
    else
        check_fail "Next.js configuration not found"
    fi
else
    check_fail "Frontend directory not found"
fi

echo ""

# ============================================================================
# Check Configuration Files
# ============================================================================
echo -e "${BLUE}▶ Checking Configuration Files${NC}"
echo ""

# Check deployment config
if [ -f "$ROOT_DIR/deploy.config.sh" ]; then
    check_pass "Deployment configuration exists"
    
    # Source and validate
    source "$ROOT_DIR/deploy.config.sh"
    
    if [ -z "${DEPLOY_SERVER_IP:-}" ] || [ "$DEPLOY_SERVER_IP" = "YOUR_SERVER_IP" ]; then
        check_fail "DEPLOY_SERVER_IP not configured in deploy.config.sh"
    else
        check_pass "Server IP configured: $DEPLOY_SERVER_IP"
    fi
    
    if [ -z "${DEPLOY_SERVER_PASS:-}" ] && [ ! -f "$HOME/.ssh/id_rsa" ]; then
        check_warn "No SSH password or key configured"
    else
        check_pass "SSH authentication configured"
    fi
else
    check_warn "deploy.config.sh not found (will use interactive mode)"
fi

# Check ecosystem config
if [ -f "$ROOT_DIR/ecosystem.config.js" ]; then
    check_pass "PM2 ecosystem configuration exists"
else
    check_warn "ecosystem.config.js not found"
fi

# Check environment templates
if [ -f "$ROOT_DIR/backend/.env.template" ]; then
    check_pass "Backend environment template exists"
else
    check_warn "Backend .env.template not found"
fi

if [ -f "$ROOT_DIR/frontend/.env.template" ]; then
    check_pass "Frontend environment template exists"
else
    check_warn "Frontend .env.template not found"
fi

echo ""

# ============================================================================
# Check Git Status
# ============================================================================
echo -e "${BLUE}▶ Checking Git Status${NC}"
echo ""

if [ -d "$ROOT_DIR/.git" ]; then
    check_pass "Git repository initialized"
    
    # Check remote
    if git remote get-url origin &> /dev/null; then
        REMOTE_URL=$(git remote get-url origin)
        check_pass "Git remote configured: $REMOTE_URL"
    else
        check_fail "Git remote 'origin' not configured"
    fi
    
    # Check branch
    CURRENT_BRANCH=$(git branch --show-current)
    check_pass "Current branch: $CURRENT_BRANCH"
    
    # Check for uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        check_warn "You have uncommitted changes"
        git status --short | head -10
    else
        check_pass "Working directory is clean"
    fi
    
    # Check if up to date with remote
    git fetch origin &> /dev/null
    LOCAL=$(git rev-parse @)
    REMOTE=$(git rev-parse @{u} 2>/dev/null || echo "")
    
    if [ -n "$REMOTE" ]; then
        if [ "$LOCAL" = "$REMOTE" ]; then
            check_pass "Branch is up to date with remote"
        else
            check_warn "Branch is not in sync with remote"
        fi
    else
        check_warn "Cannot compare with remote (branch may not be pushed)"
    fi
else
    check_fail "Not a git repository"
fi

echo ""

# ============================================================================
# Check Dependencies
# ============================================================================
echo -e "${BLUE}▶ Checking Dependencies${NC}"
echo ""

# Check backend dependencies
if [ -d "$ROOT_DIR/backend/node_modules" ]; then
    check_pass "Backend dependencies installed"
else
    check_warn "Backend dependencies not installed (run: cd backend && npm install)"
fi

# Check frontend dependencies
if [ -d "$ROOT_DIR/frontend/node_modules" ]; then
    check_pass "Frontend dependencies installed"
else
    check_warn "Frontend dependencies not installed (run: cd frontend && npm install)"
fi

echo ""

# ============================================================================
# Check Deployment Tools
# ============================================================================
echo -e "${BLUE}▶ Checking Deployment Tools${NC}"
echo ""

# Check SSH
if command -v ssh &> /dev/null; then
    check_pass "SSH client is installed"
else
    check_fail "SSH client is not installed"
fi

# Check sshpass (if using password auth)
if [ -n "${DEPLOY_SERVER_PASS:-}" ] && [ "$DEPLOY_SERVER_PASS" != "" ]; then
    if command -v sshpass &> /dev/null; then
        check_pass "sshpass is installed"
    else
        check_fail "sshpass is required for password authentication"
        echo "   Install with: brew install sshpass (macOS) or sudo apt install sshpass (Linux)"
    fi
fi

# Check PM2 (optional)
if command -v pm2 &> /dev/null; then
    check_pass "PM2 is installed locally (optional)"
else
    check_warn "PM2 not installed locally (will be installed on server)"
fi

echo ""

# ============================================================================
# Summary
# ============================================================================
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}  Validation Summary"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Total checks: $CHECKS"
echo -e "${GREEN}Passed:${NC} $((CHECKS - ERRORS - WARNINGS))"
echo -e "${YELLOW}Warnings:${NC} $WARNINGS"
echo -e "${RED}Errors:${NC} $ERRORS"
echo ""

if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}❌ Validation failed with $ERRORS error(s)${NC}"
    echo "   Please fix the errors before deploying"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Validation passed with $WARNINGS warning(s)${NC}"
    echo "   You can proceed with deployment, but review warnings"
    exit 0
else
    echo -e "${GREEN}✅ All checks passed! Ready to deploy${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Review deploy.config.sh settings"
    echo "  2. Run: ./scripts/deploy-easy.sh"
    exit 0
fi

