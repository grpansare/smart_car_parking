# 🚀 AWS Deployment Guide - Smart Car Parking System

Complete guide to deploy your Smart Car Parking System on AWS using EC2, RDS, and Docker.

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [AWS Services Setup](#aws-services-setup)
4. [EC2 Instance Setup](#ec2-instance-setup)
5. [RDS MySQL Setup](#rds-mysql-setup)
6. [Docker Deployment](#docker-deployment)
7. [Domain & SSL Configuration](#domain--ssl-configuration)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Cost Optimization](#cost-optimization)
10. [Troubleshooting](#troubleshooting)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         AWS Cloud                            │
│                                                              │
│  ┌────────────────┐      ┌──────────────────┐              │
│  │   Route 53     │      │  Application     │              │
│  │   (Optional)   │─────▶│  Load Balancer   │              │
│  └────────────────┘      │   (Optional)     │              │
│                          └────────┬─────────┘              │
│                                   │                         │
│                          ┌────────▼─────────┐              │
│                          │   EC2 Instance   │              │
│                          │  (t2.medium/     │              │
│                          │   t3.medium)     │              │
│                          │                  │              │
│                          │  ┌────────────┐  │              │
│                          │  │  Frontend  │  │              │
│                          │  │  (Port 80) │  │              │
│                          │  └────────────┘  │              │
│                          │  ┌────────────┐  │              │
│                          │  │  Backend   │  │              │
│                          │  │ (Port 8081)│  │              │
│                          │  └────────────┘  │              │
│                          └────────┬─────────┘              │
│                                   │                         │
│                          ┌────────▼─────────┐              │
│                          │   RDS MySQL      │              │
│                          │   (db.t3.micro)  │              │
│                          └──────────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Prerequisites

### Required Accounts & Tools
- [ ] AWS Account with billing enabled
- [ ] AWS CLI installed locally
- [ ] SSH client (PuTTY for Windows, or native SSH)
- [ ] Docker Hub account (or use AWS ECR)
- [ ] Domain name (optional, for production)

### Required Credentials
- [ ] Razorpay API keys (Key ID & Secret)
- [ ] JWT Secret key
- [ ] Google OAuth credentials (if using)
- [ ] AWS Access Key & Secret Key

---

## 🔧 AWS Services Setup

### Step 1: Create AWS Account & Setup Billing Alerts

1. **Sign up for AWS Free Tier**: https://aws.amazon.com/free/
2. **Set up billing alerts**:
   - Go to **CloudWatch** → **Billing** → **Create Alarm**
   - Set threshold: $10 (or your budget)
   - Add email notification

### Step 2: Create IAM User (Security Best Practice)

```bash
# Don't use root account for daily operations
# Create IAM user with these permissions:
- AmazonEC2FullAccess
- AmazonRDSFullAccess
- AmazonVPCFullAccess
- CloudWatchLogsFullAccess
```

**Steps**:
1. Go to **IAM** → **Users** → **Add User**
2. Username: `smart-parking-admin`
3. Access type: ✅ Programmatic access, ✅ AWS Management Console access
4. Attach policies listed above
5. **Save credentials securely!**

---

## 🖥️ EC2 Instance Setup

### Step 1: Launch EC2 Instance

1. **Go to EC2 Dashboard** → **Launch Instance**

2. **Configure Instance**:
   - **Name**: `smart-parking-app-server`
   - **AMI**: Ubuntu Server 22.04 LTS (Free tier eligible)
   - **Instance Type**: 
     - Development: `t2.medium` (4GB RAM, 2 vCPU)
     - Production: `t3.medium` or `t3.large`
   - **Key Pair**: Create new key pair → Download `.pem` file (SAVE IT!)
   
3. **Network Settings**:
   - ✅ Allow SSH traffic (port 22) - Your IP only
   - ✅ Allow HTTP traffic (port 80)
   - ✅ Allow HTTPS traffic (port 443)
   - ✅ Custom TCP (port 8081) - Backend API

4. **Storage**: 
   - 30 GB gp3 (minimum)
   - 50 GB recommended for production

5. **Click "Launch Instance"**

### Step 2: Allocate Elastic IP (Important!)

```bash
# Without Elastic IP, your public IP changes on restart
```

1. **EC2** → **Elastic IPs** → **Allocate Elastic IP**
2. **Actions** → **Associate Elastic IP address**
3. Select your instance → **Associate**

### Step 3: Configure Security Group

**Edit Inbound Rules**:

| Type        | Port  | Source          | Description           |
|-------------|-------|-----------------|-----------------------|
| SSH         | 22    | Your IP         | SSH access            |
| HTTP        | 80    | 0.0.0.0/0       | Frontend              |
| HTTPS       | 443   | 0.0.0.0/0       | Frontend (SSL)        |
| Custom TCP  | 8081  | 0.0.0.0/0       | Backend API           |
| MySQL       | 3306  | EC2 Security Group | RDS access (internal) |

### Step 4: Connect to EC2 Instance

**For Linux/Mac**:
```bash
chmod 400 your-key.pem
ssh -i "your-key.pem" ubuntu@your-elastic-ip
```

**For Windows (PuTTY)**:
1. Convert `.pem` to `.ppk` using PuTTYgen
2. Use PuTTY to connect: `ubuntu@your-elastic-ip`

### Step 5: Install Docker & Docker Compose

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker ubuntu
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### Step 6: Install Additional Tools

```bash
# Install Git
sudo apt install git -y

# Install Node.js (for frontend builds if needed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Java (for backend builds if needed)
sudo apt install openjdk-17-jdk -y

# Install Maven (for backend builds if needed)
sudo apt install maven -y

# Verify installations
git --version
node --version
java --version
mvn --version
```

---

## 🗄️ RDS MySQL Setup

### Option A: Use AWS RDS (Recommended for Production)

#### Step 1: Create RDS Instance

1. **Go to RDS** → **Create database**

2. **Configuration**:
   - **Engine**: MySQL 8.0
   - **Template**: Free tier (or Production for production)
   - **DB Instance Identifier**: `smart-parking-db`
   - **Master Username**: `admin`
   - **Master Password**: Create strong password (SAVE IT!)
   
3. **Instance Configuration**:
   - Free tier: `db.t3.micro`
   - Production: `db.t3.small` or higher
   
4. **Storage**:
   - Allocated: 20 GB (Free tier)
   - ✅ Enable storage autoscaling
   - Maximum: 100 GB

5. **Connectivity**:
   - **VPC**: Same as EC2 instance
   - **Public access**: No (more secure)
   - **VPC Security Group**: Create new → `smart-parking-db-sg`
   - **Availability Zone**: Same as EC2 (optional)

6. **Additional Configuration**:
   - **Initial database name**: `smart_parking`
   - **Backup retention**: 7 days
   - ✅ Enable automated backups
   - ✅ Enable encryption

7. **Click "Create database"** (takes 5-10 minutes)

#### Step 2: Configure RDS Security Group

1. **RDS** → Select your database → **VPC security groups**
2. **Edit inbound rules**:
   - Type: MySQL/Aurora
   - Port: 3306
   - Source: EC2 instance security group
   - Description: Allow EC2 access

#### Step 3: Get RDS Endpoint

```bash
# RDS Dashboard → Your database → Connectivity & security
# Copy the "Endpoint" - looks like:
# smart-parking-db.xxxxxxxxx.us-east-1.rds.amazonaws.com
```

### Option B: Use MySQL on EC2 (Development Only)

```bash
# If you want to use Docker MySQL on EC2 instead of RDS
# Use the existing docker-compose-mysql.yml
docker-compose -f docker-compose-mysql.yml up -d
```

---

## 🐳 Docker Deployment

### Step 1: Clone Your Repository

```bash
cd /home/ubuntu
git clone https://github.com/your-username/smart_car_parking.git
cd smart_car_parking
```

### Step 2: Create Environment File

```bash
# Create .env file with your secrets
nano .env
```

**Add the following**:
```env
# Database Configuration (RDS)
DB_HOST=smart-parking-db.xxxxxxxxx.us-east-1.rds.amazonaws.com
DB_PORT=3306
DB_NAME=smart_parking
DB_USER=admin
DB_PASSWORD=your-rds-password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-256-bits

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Google OAuth (if using)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Application URLs
BACKEND_URL=http://your-elastic-ip:8081
FRONTEND_URL=http://your-elastic-ip
```

**Save**: `Ctrl+O`, `Enter`, `Ctrl+X`

### Step 3: Update Docker Compose for AWS

Create `docker-compose-aws.yml`:

```bash
nano docker-compose-aws.yml
```

**Add the following**:
```yaml
version: '3.8'

services:
  # Backend Service
  backend:
    image: your-dockerhub-username/smart-parking-backend:latest
    container_name: smart-parking-backend
    ports:
      - "8081:8081"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - SPRING_DATASOURCE_URL=jdbc:mysql://${DB_HOST}:${DB_PORT}/${DB_NAME}?useSSL=true&requireSSL=true&serverTimezone=UTC
      - SPRING_DATASOURCE_USERNAME=${DB_USER}
      - SPRING_DATASOURCE_PASSWORD=${DB_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
      - RAZORPAY_KEY_ID=${RAZORPAY_KEY_ID}
      - RAZORPAY_KEY_SECRET=${RAZORPAY_KEY_SECRET}
    networks:
      - app-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8081/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Frontend Service
  frontend:
    image: your-dockerhub-username/smart-parking-frontend:latest
    container_name: smart-parking-frontend
    ports:
      - "80:80"
    environment:
      - REACT_APP_API_URL=http://${BACKEND_URL}
    depends_on:
      - backend
    networks:
      - app-network
    restart: unless-stopped

networks:
  app-network:
    driver: bridge
```

### Step 4: Build & Push Docker Images

**Option A: Build on Local Machine & Push**

```bash
# On your local machine

# Build backend
cd smart-parking-backend
docker build -t your-dockerhub-username/smart-parking-backend:latest .
docker push your-dockerhub-username/smart-parking-backend:latest

# Build frontend
cd ../smart-parking-frontend
docker build -t your-dockerhub-username/smart-parking-frontend:latest .
docker push your-dockerhub-username/smart-parking-frontend:latest
```

**Option B: Build on EC2 (if local build fails)**

```bash
# On EC2 instance
cd /home/ubuntu/smart_car_parking

# Build backend
cd smart-parking-backend
docker build -t your-dockerhub-username/smart-parking-backend:latest .

# Build frontend
cd ../smart-parking-frontend
docker build -t your-dockerhub-username/smart-parking-frontend:latest .

# Login to Docker Hub
docker login

# Push images
docker push your-dockerhub-username/smart-parking-backend:latest
docker push your-dockerhub-username/smart-parking-frontend:latest
```

### Step 5: Deploy Application

```bash
# On EC2 instance
cd /home/ubuntu/smart_car_parking

# Pull latest images
docker-compose -f docker-compose-aws.yml pull

# Start services
docker-compose -f docker-compose-aws.yml up -d

# Check status
docker-compose -f docker-compose-aws.yml ps

# View logs
docker-compose -f docker-compose-aws.yml logs -f
```

### Step 6: Initialize Database

```bash
# If using RDS, you may need to run initial SQL scripts
# Connect to RDS from EC2
mysql -h smart-parking-db.xxxxxxxxx.us-east-1.rds.amazonaws.com \
      -u admin -p smart_parking

# Run your initialization scripts
# Or let Spring Boot auto-create tables (if configured)
```

### Step 7: Verify Deployment

```bash
# Check backend health
curl http://localhost:8081/actuator/health

# Check frontend
curl http://localhost:80

# Check from browser
# http://your-elastic-ip:8081/actuator/health
# http://your-elastic-ip
```

---

## 🌐 Domain & SSL Configuration

### Step 1: Configure Domain (Optional but Recommended)

1. **Buy domain** from Route 53, Namecheap, or GoDaddy
2. **Create A records**:
   - `@` → Your Elastic IP (for example.com)
   - `www` → Your Elastic IP (for www.example.com)
   - `api` → Your Elastic IP (for api.example.com)

### Step 2: Install Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt install nginx -y

# Create configuration
sudo nano /etc/nginx/sites-available/smart-parking
```

**Add the following**:
```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# Frontend
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Backend API
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:8081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Step 3: Install SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Enable Nginx configuration
sudo ln -s /etc/nginx/sites-available/smart-parking /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Auto-renewal (already configured by certbot)
sudo certbot renew --dry-run
```

---

## 📊 Monitoring & Maintenance

### Setup CloudWatch Monitoring

```bash
# Install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i amazon-cloudwatch-agent.deb

# Configure monitoring for:
- CPU utilization
- Memory usage
- Disk usage
- Network traffic
```

### Setup Log Monitoring

```bash
# View application logs
docker-compose -f docker-compose-aws.yml logs -f backend
docker-compose -f docker-compose-aws.yml logs -f frontend

# Setup log rotation
sudo nano /etc/docker/daemon.json
```

**Add**:
```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

### Automated Backups

**RDS Automated Backups** (already configured):
- Daily automated snapshots
- 7-day retention
- Point-in-time recovery

**Manual Backup Script**:
```bash
# Create backup script
nano ~/backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/ubuntu/backups"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database (if using RDS)
mysqldump -h smart-parking-db.xxxxxxxxx.us-east-1.rds.amazonaws.com \
          -u admin -p'your-password' smart_parking > $BACKUP_DIR/db_backup_$DATE.sql

# Backup application files
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz /home/ubuntu/smart_car_parking

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
# Make executable
chmod +x ~/backup.sh

# Schedule daily backups (cron)
crontab -e
# Add: 0 2 * * * /home/ubuntu/backup.sh >> /home/ubuntu/backup.log 2>&1
```

### Health Check Script

```bash
# Create health check script
nano ~/health-check.sh
```

```bash
#!/bin/bash

# Check backend
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8081/actuator/health)
if [ $BACKEND_STATUS -ne 200 ]; then
    echo "Backend is down! Restarting..."
    cd /home/ubuntu/smart_car_parking
    docker-compose -f docker-compose-aws.yml restart backend
fi

# Check frontend
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:80)
if [ $FRONTEND_STATUS -ne 200 ]; then
    echo "Frontend is down! Restarting..."
    cd /home/ubuntu/smart_car_parking
    docker-compose -f docker-compose-aws.yml restart frontend
fi
```

```bash
chmod +x ~/health-check.sh

# Run every 5 minutes
crontab -e
# Add: */5 * * * * /home/ubuntu/health-check.sh >> /home/ubuntu/health-check.log 2>&1
```

---

## 💰 Cost Optimization

### AWS Free Tier Limits (12 months)

- **EC2**: 750 hours/month of t2.micro (not enough for this app)
- **RDS**: 750 hours/month of db.t2.micro or db.t3.micro
- **Storage**: 30 GB EBS, 20 GB RDS
- **Data Transfer**: 15 GB/month outbound

### Estimated Monthly Costs

**Development Setup**:
- EC2 t2.medium: ~$35/month
- RDS db.t3.micro: ~$15/month (Free tier eligible)
- EBS 30GB: ~$3/month
- Elastic IP: Free (if attached)
- **Total**: ~$40-50/month

**Production Setup**:
- EC2 t3.medium: ~$35/month
- RDS db.t3.small: ~$30/month
- EBS 50GB: ~$5/month
- Load Balancer (optional): ~$20/month
- **Total**: ~$70-90/month

### Cost Saving Tips

1. **Use Reserved Instances**: Save up to 75% for 1-3 year commitment
2. **Stop instances during non-business hours**: Use AWS Instance Scheduler
3. **Use Spot Instances**: For non-critical workloads (up to 90% savings)
4. **Enable RDS Multi-AZ only for production**: Development can use single AZ
5. **Use CloudFront CDN**: Reduce data transfer costs
6. **Set up billing alerts**: Get notified before overspending

---

## 🔧 Troubleshooting

### Issue: Can't connect to EC2

**Solution**:
```bash
# Check security group allows SSH from your IP
# Verify key pair permissions
chmod 400 your-key.pem

# Check instance is running
# Check Elastic IP is associated
```

### Issue: Backend can't connect to RDS

**Solution**:
```bash
# Verify RDS security group allows EC2 security group
# Check RDS endpoint is correct
# Test connection from EC2:
mysql -h your-rds-endpoint -u admin -p

# Check environment variables
docker-compose -f docker-compose-aws.yml config
```

### Issue: Application not accessible from browser

**Solution**:
```bash
# Check security group allows HTTP (80) and custom TCP (8081)
# Verify containers are running
docker ps

# Check logs
docker-compose -f docker-compose-aws.yml logs

# Test locally on EC2
curl http://localhost:80
curl http://localhost:8081/actuator/health
```

### Issue: Out of memory errors

**Solution**:
```bash
# Check memory usage
free -h
docker stats

# Increase EC2 instance size
# Add swap space:
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Issue: SSL certificate errors

**Solution**:
```bash
# Renew certificate
sudo certbot renew

# Check certificate status
sudo certbot certificates

# Test Nginx configuration
sudo nginx -t
```

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] AWS account created and billing alerts set
- [ ] IAM user created with proper permissions
- [ ] Domain purchased (optional)
- [ ] All credentials ready (Razorpay, JWT, etc.)

### Infrastructure Setup
- [ ] EC2 instance launched and configured
- [ ] Elastic IP allocated and associated
- [ ] Security groups configured
- [ ] RDS MySQL instance created
- [ ] RDS security group configured

### Application Deployment
- [ ] Docker and Docker Compose installed on EC2
- [ ] Repository cloned
- [ ] Environment variables configured
- [ ] Docker images built and pushed
- [ ] Application deployed and running
- [ ] Database initialized

### Post-Deployment
- [ ] Domain configured (if applicable)
- [ ] SSL certificate installed
- [ ] Nginx reverse proxy configured
- [ ] Monitoring setup (CloudWatch)
- [ ] Backup script configured
- [ ] Health check script configured
- [ ] Application tested end-to-end

---

## 📚 Additional Resources

- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [AWS RDS Documentation](https://docs.aws.amazon.com/rds/)
- [Docker Documentation](https://docs.docker.com/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

## 🆘 Support

For issues specific to:
- **AWS**: AWS Support or AWS Forums
- **Application**: Create issue in GitHub repository
- **Email**: grpansare2002@gmail.com

---

**Happy Deploying! 🎉**

*Last Updated: November 2025*
