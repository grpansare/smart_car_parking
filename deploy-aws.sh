#!/bin/bash

# ============================================
# AWS Deployment Script for Smart Car Parking
# ============================================

set -e  # Exit on error

echo "🚀 Starting AWS Deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ============================================
# Step 1: Check Prerequisites
# ============================================
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed!${NC}"
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
# Step 2: Load Environment Variables
# ============================================
echo -e "${YELLOW}📦 Loading environment variables...${NC}"
source .env
echo -e "${GREEN}✅ Environment variables loaded${NC}"

# ============================================
# Step 3: Pull Latest Images
# ============================================
echo -e "${YELLOW}📥 Pulling latest Docker images...${NC}"
docker-compose -f docker-compose-aws.yml pull
echo -e "${GREEN}✅ Images pulled successfully${NC}"

# ============================================
# Step 4: Stop Existing Containers
# ============================================
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose -f docker-compose-aws.yml down
echo -e "${GREEN}✅ Containers stopped${NC}"

# ============================================
# Step 5: Start Services
# ============================================
echo -e "${YELLOW}🚀 Starting services...${NC}"
docker-compose -f docker-compose-aws.yml up -d
echo -e "${GREEN}✅ Services started${NC}"

# ============================================
# Step 6: Wait for Services to be Healthy
# ============================================
echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"
sleep 10

# Check backend health
echo "Checking backend health..."
for i in {1..30}; do
    if curl -f http://localhost:8081/actuator/health &> /dev/null; then
        echo -e "${GREEN}✅ Backend is healthy${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Backend health check failed${NC}"
        docker-compose -f docker-compose-aws.yml logs backend
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
    echo -e "${YELLOW}⚠️  Frontend check inconclusive (might be OK)${NC}"
fi

# ============================================
# Step 7: Display Status
# ============================================
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 Deployment Successful!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📊 Container Status:"
docker-compose -f docker-compose-aws.yml ps
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo 'localhost')"
echo "   Backend:  http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo 'localhost'):8081"
echo ""
echo "📝 View logs:"
echo "   docker-compose -f docker-compose-aws.yml logs -f"
echo ""
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
