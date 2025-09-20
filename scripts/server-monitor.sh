#!/usr/bin/env bash
set -euo pipefail

# Configuration
SERVER_IP="146.190.53.83"
SERVER_USER="root"
SERVER_PASS="2vcDpu-4gb-120gb-intel"
PROJECT_DIR="/opt/blimp1"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  Digital Ocean Server Monitor${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check server status
check_server_status() {
    print_header
    print_status "Checking server status..."
    
    sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "
        echo '=== System Status ==='
        uptime
        echo ''
        
        echo '=== Memory Usage ==='
        free -h
        echo ''
        
        echo '=== Disk Usage ==='
        df -h
        echo ''
        
        echo '=== PM2 Status ==='
        pm2 status
        echo ''
        
        echo '=== Nginx Status ==='
        systemctl status nginx --no-pager -l
        echo ''
        
        echo '=== Application Logs (Last 20 lines) ==='
        pm2 logs --lines 20
    "
}

# View application logs
view_logs() {
    print_header
    print_status "Viewing application logs..."
    
    sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "
        echo '=== Backend Logs ==='
        pm2 logs blimp-backend --lines 50
        echo ''
        echo '=== Frontend Logs ==='
        pm2 logs blimp-frontend --lines 50
    "
}

# Restart services
restart_services() {
    print_header
    print_status "Restarting services..."
    
    sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "
        echo 'Stopping all services...'
        pm2 stop all
        
        echo 'Starting all services...'
        pm2 start ecosystem.config.cjs
        
        echo 'Saving PM2 configuration...'
        pm2 save
        
        echo 'Checking status...'
        pm2 status
    "
    
    print_success "Services restarted successfully"
}

# Update application
update_app() {
    print_header
    print_status "Updating application..."
    
    # Push local changes
    git add .
    git commit -m "Update deployment: $(date)" || print_warning "No changes to commit"
    git push origin main
    
    # Update on server
    sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "
        echo 'Updating repository...'
        cd $PROJECT_DIR
        git pull origin main
        
        echo 'Rebuilding application...'
        ./scripts/prod-build.sh
        
        echo 'Restarting services...'
        pm2 restart all
        
        echo 'Checking status...'
        pm2 status
    "
    
    print_success "Application updated successfully"
}

# Database operations
db_operations() {
    print_header
    print_status "Database operations..."
    
    echo "Select operation:"
    echo "1) View database info"
    echo "2) Backup database"
    echo "3) Run migrations"
    echo "4) Seed database"
    echo "5) Reset database"
    
    read -p "Enter choice (1-5): " choice
    
    case $choice in
        1)
            sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "
                cd $PROJECT_DIR/backend
                echo '=== Database Info ==='
                ls -la tmp/db.sqlite3
                echo ''
                echo '=== Database Schema ==='
                sqlite3 tmp/db.sqlite3 '.schema' | head -20
            "
            ;;
        2)
            backup_file="db_backup_$(date +%Y%m%d_%H%M%S).sqlite3"
            sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "
                cd $PROJECT_DIR/backend
                cp tmp/db.sqlite3 tmp/$backup_file
                echo 'Database backed up as: $backup_file'
            "
            print_success "Database backed up successfully"
            ;;
        3)
            sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "
                cd $PROJECT_DIR/backend
                node ace migration:run
            "
            print_success "Migrations completed"
            ;;
        4)
            sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "
                cd $PROJECT_DIR/backend
                node ace db:seed
            "
            print_success "Database seeded"
            ;;
        5)
            print_warning "This will reset the entire database!"
            read -p "Are you sure? (yes/no): " confirm
            if [ "$confirm" = "yes" ]; then
                sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "
                    cd $PROJECT_DIR/backend
                    rm -f tmp/db.sqlite3
                    node ace migration:run
                    node ace db:seed
                "
                print_success "Database reset completed"
            else
                print_status "Database reset cancelled"
            fi
            ;;
        *)
            print_error "Invalid choice"
            ;;
    esac
}

# Security check
security_check() {
    print_header
    print_status "Running security check..."
    
    sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "
        echo '=== Firewall Status ==='
        ufw status
        echo ''
        
        echo '=== SSH Status ==='
        systemctl status ssh --no-pager -l
        echo ''
        
        echo '=== Recent Login Attempts ==='
        tail -20 /var/log/auth.log | grep sshd
        echo ''
        
        echo '=== System Updates ==='
        apt list --upgradable | head -10
    "
}

# Show help
show_help() {
    echo "Digital Ocean Server Monitor"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  status    - Check server and application status"
    echo "  logs      - View application logs"
    echo "  restart   - Restart all services"
    echo "  update    - Update application from git"
    echo "  db        - Database operations"
    echo "  security  - Security check"
    echo "  help      - Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 status"
    echo "  $0 logs"
    echo "  $0 restart"
}

# Main execution
main() {
    case "${1:-help}" in
        "status")
            check_server_status
            ;;
        "logs")
            view_logs
            ;;
        "restart")
            restart_services
            ;;
        "update")
            update_app
            ;;
        "db")
            db_operations
            ;;
        "security")
            security_check
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

main "$@"
