#!/bin/bash

# 🤖 Humblemorde Tech WhatsApp Bot - Startup Script
# This script handles bot initialization and startup

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ==================== LOGGING FUNCTIONS ====================

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# ==================== CHECK PREREQUISITES ====================

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    NODE_VERSION=$(node -v)
    log_success "Node.js found: $NODE_VERSION"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
    NPM_VERSION=$(npm -v)
    log_success "npm found: $NPM_VERSION"
}

# ==================== SETUP ENVIRONMENT ====================

setup_environment() {
    log_info "Setting up environment..."
    
    # Check if .env exists
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            log_warning ".env not found, creating from .env.example..."
            cp .env.example .env
            log_success ".env created from template"
        else
            log_error ".env.example not found"
            exit 1
        fi
    else
        log_success ".env file exists"
    fi
    
    # Create required directories
    if [ ! -d "logs" ]; then
        mkdir -p logs
        log_success "Created logs directory"
    fi
    
    if [ ! -d "auth_info_baileys" ]; then
        mkdir -p auth_info_baileys
        log_success "Created auth directory"
    fi
}

# ==================== INSTALL DEPENDENCIES ====================

install_dependencies() {
    log_info "Installing dependencies..."
    
    if [ ! -d "node_modules" ]; then
        log_info "node_modules not found, running npm install..."
        npm install
        log_success "Dependencies installed"
    else
        log_success "node_modules already exists"
        log_info "Checking for updates..."
        npm update --save
        log_success "Dependencies updated"
    fi
}

# ==================== VALIDATE CONFIGURATION ====================

validate_configuration() {
    log_info "Validating configuration..."
    
    # Check required environment variables
    required_vars=("PORT" "NODE_ENV" "BOT_PREFIX" "BOT_NAME")
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^$var=" .env; then
            log_warning "Missing $var in .env, using default"
        fi
    done
    
    # Load environment variables
    set -a
    source .env
    set +a
    
    log_success "Configuration validated"
    log_info "Bot configuration:"
    log_info "  PORT: ${PORT:-3000}"
    log_info "  NODE_ENV: ${NODE_ENV:-development}"
    log_info "  BOT_PREFIX: ${BOT_PREFIX:-!}"
    log_info "  BOT_NAME: ${BOT_NAME:-Humblemorde Bot}"
}

# ==================== HEALTH CHECK ====================

health_check() {
    log_info "Performing health checks..."
    
    # Check if ports are available
    PORT=${PORT:-3000}
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
        log_warning "Port $PORT is already in use"
        log_info "Attempting to use alternative port..."
    else
        log_success "Port $PORT is available"
    fi
}

# ==================== START BOT ====================

start_bot() {
    log_info "Starting Humblemorde Tech WhatsApp Bot..."
    
    set -a
    source .env
    set +a
    
    PORT=${PORT:-3000}
    
    echo ""
    log_success "=========================================="
    log_success "🤖 HUMBLEMORDE TECH WHATSAPP BOT"
    log_success "=========================================="
    echo ""
    log_info "Bot is starting..."
    log_info "Server: http://localhost:$PORT"
    log_info "QR Code: http://localhost:$PORT/qr"
    log_info "Phone Pairing (+254): http://localhost:$PORT/pairing"
    log_info "Health Check: http://localhost:$PORT/health"
    echo ""
    log_info "Press Ctrl+C to stop the bot"
    echo ""
    
    # Start the bot
    case "${NODE_ENV:-development}" in
        production)
            log_info "Starting in PRODUCTION mode..."
            NODE_ENV=production node server.js
            ;;
        development)
            log_info "Starting in DEVELOPMENT mode..."
            if command -v nodemon &> /dev/null; then
                nodemon server.js
            else
                log_warning "nodemon not found, starting with node..."
                node server.js
            fi
            ;;
        *)
            log_info "Starting in STANDARD mode..."
            node server.js
            ;;
    esac
}

# ==================== MAIN EXECUTION ====================

main() {
    echo ""
    echo "🚀 Humblemorde Tech WhatsApp Bot Startup"
    echo "========================================"
    echo ""
    
    check_prerequisites
    setup_environment
    install_dependencies
    validate_configuration
    health_check
    start_bot
}

# Run main function
main "$@"
