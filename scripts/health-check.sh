#!/usr/bin/env bash
set -euo pipefail

# Configuration
SERVER_IP="146.190.53.83"
SERVER_USER="root"
SERVER_PASS="2vcDpu-4gb-120gb-intel"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

check_service() {
    local service_name="$1"
    local url="$2"
    
    echo -n "Checking $service_name... "
    
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200\|301\|302"; then
        echo -e "${GREEN}✓ OK${NC}"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        return 1
    fi
}

check_server_health() {
    echo -e "${BLUE}=== Digital Ocean Server Health Check ===${NC}"
    echo ""
    
    # Check if server is reachable
    echo -n "Checking server connectivity... "
    if ping -c 1 "$SERVER_IP" &> /dev/null; then
        echo -e "${GREEN}✓ OK${NC}"
    else
        echo -e "${RED}✗ FAILED${NC}"
        echo "Cannot reach server at $SERVER_IP"
        exit 1
    fi
    
    echo ""
    echo "Checking application endpoints..."
    
    # Check main application
    check_service "Main Application" "http://$SERVER_IP"
    
    # Check backend API
    check_service "Backend API" "http://$SERVER_IP/api/menu-items"
    
    # Check if services are running on server
    echo ""
    echo "Checking services on server..."
    
    sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "
        echo 'PM2 Status:'
        pm2 status
        
        echo ''
        echo 'System Resources:'
        echo 'Memory:'
        free -h
        echo ''
        echo 'Disk:'
        df -h / | tail -1
        
        echo ''
        echo 'Load Average:'
        uptime
    "
    
    echo ""
    echo -e "${BLUE}=== Health Check Complete ===${NC}"
}

# Quick status check
quick_status() {
    echo -e "${BLUE}Quick Status Check${NC}"
    echo "=================="
    
    sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "
        echo 'PM2 Status:'
        pm2 status | grep -E '(online|stopped|errored)'
        
        echo ''
        echo 'Recent Logs (last 5 lines):'
        pm2 logs --lines 5 | tail -10
    "
}

# Main execution
case "${1:-full}" in
    "quick")
        quick_status
        ;;
    "full"|*)
        check_server_health
        ;;
esac
