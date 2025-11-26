#!/bin/bash

# ============================================
# AWS Free Tier Deployment Script
# Smart Car Parking System
# ============================================

set -e  # Exit on error

echo "🆓 Starting AWS Free Tier Deployment..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================
# Step 1: Check Prerequisites
# ============================================
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed!${NC}"
    echo "Install with: curl -fsSL https://get.docker.com | sh"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed!${NC}"
    exit 1
fi

if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo "Please copy .env.aws.example to .env and configure it"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# ============================================
# Step 2: Check System Resources
# ============================================
echo -e "${YELLOW}💻 Checking system resources...${NC}"

TOTAL_RAM=$(free -m | awk '/^Mem:/{print $2}')
echo "Total RAM: ${TOTAL_RAM}MB"

if [ "$TOTAL_RAM" -lt 1800 ]; then
    echo -e "${RED}❌ Insufficient RAM! Need at least 2GB (t2.small)${NC}"
    echo "Current: ${TOTAL_RAM}MB"
    exit 1
fi

AVAILABLE_DISK=$(df -BG / | awk 'NR==2 {print $4}' | sed 's/G//')
echo "Available Disk: ${AVAILABLE_DISK}GB"

if [ "$AVAILABLE_DISK" -lt 5 ]; then
    echo -e "${YELLOW}⚠️  Low disk space! Consider cleaning up${NC}"
fi

echo -e "${GREEN}✅ System resources OK${NC}"

# ============================================
# Step 3: Setup Swap (for t2.small)
# ============================================
echo -e "${YELLOW}💾 Checking swap space...${NC}"

SWAP_SIZE=$(free -m | awk '/^Swap:/{print $2}')
if [ "$SWAP_SIZE" -lt 1024 ]; then
    echo -e "${YELLOW}⚠️  Low swap space. Creating 2GB swap file...${NC}"
    
    if [ ! -f /swapfile ]; then
        sudo fallocate -l 2G /swapfile
        sudo chmod 600 /swapfile
        sudo mkswap /swapfile
        sudo swapon /swapfile
        echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
        echo -e "${GREEN}✅ Swap space created${NC}"
    else
        echo -e "${GREEN}✅ Swap file already exists${NC}"
    fi
else
    echo -e "${GREEN}✅ Swap space OK (${SWAP_SIZE}MB)${NC}"
fi

# ============================================
# Step 4: Load Environment Variables
# ============================================
echo -e "${YELLOW}📦 Loading environment variables...${NC}"
source .env

# Validate critical variables
if [ -z "$DB_HOST" ] || [ "$DB_HOST" == "your-rds-endpoint.region.rds.amazonaws.com" ]; then
    echo -e "${RED}❌ DB_HOST not configured in .env${NC}"
    exit 1
fi

if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" == "your-super-secret-jwt-key-change-this-in-production" ]; then
    echo -e "${RED}❌ JWT_SECRET not configured in .env${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment variables loaded${NC}"

# ============================================
# Step 5: Test RDS Connection
# ============================================
echo -e "${YELLOW}🗄️  Testing RDS connection...${NC}"

if command -v mysql &> /dev/null; then
    if mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1" &> /dev/null; then
        echo -e "${GREEN}✅ RDS connection successful${NC}"
    else
        echo -e "${RED}❌ Cannot connect to RDS${NC}"
        echo "Check your DB credentials and security group"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  MySQL client not installed, skipping connection test${NC}"
fi

# ============================================
# Step 6: Pull Latest Images
# ============================================
echo -e "${YELLOW}📥 Pulling latest Docker images...${NC}"
docker-compose -f docker-compose-freetier.yml pull
echo -e "${GREEN}✅ Images pulled successfully${NC}"

# ============================================
# Step 7: Stop Existing Containers
# ============================================
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose -f docker-compose-freetier.yml down
echo -e "${GREEN}✅ Containers stopped${NC}"

# ============================================
# Step 8: Clean Up (Free Tier Optimization)
# ============================================
echo -e "${YELLOW}🧹 Cleaning up unused Docker resources...${NC}"
docker system prune -f
echo -e "${GREEN}✅ Cleanup complete${NC}"

# ============================================
# Step 9: Start Services
# ============================================
echo -e "${YELLOW}🚀 Starting services (Free Tier optimized)...${NC}"
docker-compose -f docker-compose-freetier.yml up -d
echo -e "${GREEN}✅ Services started${NC}"

# ============================================
# Step 10: Monitor Resource Usage
# ============================================
echo -e "${YELLOW}📊 Monitoring resource usage...${NC}"
sleep 5

echo ""
echo "Memory Usage:"
free -h
echo ""
echo "Docker Container Stats:"
docker stats --no-stream

# ============================================
# Step 11: Wait for Services to be Healthy
# ============================================
echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"
sleep 15

# Check backend health
echo "Checking backend health..."
for i in {1..30}; do
    if curl -f http://localhost:8081/actuator/health &> /dev/null; then
        echo -e "${GREEN}✅ Backend is healthy${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Backend health check failed${NC}"
        echo "Showing backend logs:"
        docker-compose -f docker-compose-freetier.yml logs backend
        exit 1
    fi
    echo "Waiting... ($i/30)"
    sleep 5
done

# Check frontend
echo "Checking frontend..."
if curl -f http://localhost:80 &> /dev/null; then
    echo -e "${GREEN}✅ Frontend is accessible${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend check inconclusive${NC}"
fi

# ============================================
# Step 12: Display Status
# ============================================
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 Free Tier Deployment Successful!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}📊 Container Status:${NC}"
docker-compose -f docker-compose-freetier.yml ps
echo ""
echo -e "${BLUE}💾 Resource Usage:${NC}"
echo "Memory:"
free -h | grep Mem
echo ""
echo "Disk:"
df -h / | grep -v Filesystem
echo ""

# Get public IP
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo 'localhost')

echo -e "${BLUE}🌐 Application URLs:${NC}"
echo "   Frontend: http://${PUBLIC_IP}"
echo "   Backend:  http://${PUBLIC_IP}:8081"
echo "   Health:   http://${PUBLIC_IP}:8081/actuator/health"
echo ""
echo -e "${BLUE}📝 Useful Commands:${NC}"
echo "   View logs:     docker-compose -f docker-compose-freetier.yml logs -f"
echo "   Stop all:      docker-compose -f docker-compose-freetier.yml down"
echo "   Restart:       docker-compose -f docker-compose-freetier.yml restart"
echo "   Check stats:   docker stats"
echo ""
echo -e "${BLUE}💰 Cost Monitoring:${NC}"
echo "   AWS Console: https://console.aws.amazon.com/billing/"
echo "   Free Tier:   https://console.aws.amazon.com/billing/home#/freetier"
echo ""
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${YELLOW}💡 Tip: Monitor your AWS Free Tier usage daily${NC}"
