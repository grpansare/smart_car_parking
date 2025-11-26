# 🆓 AWS Free Tier Deployment Guide - Smart Car Parking

**Optimized deployment guide to run your Smart Car Parking System on AWS Free Tier with minimal to zero cost.**

---

## 💰 AWS Free Tier Benefits (12 Months)

### What You Get FREE for 12 Months:

| Service | Free Tier Limit | Enough for this project? |
|---------|----------------|--------------------------|
| **EC2** | 750 hours/month of t2.micro or t3.micro | ⚠️ **Not enough** (need t2.small minimum) |
| **RDS** | 750 hours/month of db.t2.micro or db.t3.micro | ✅ **Yes!** |
| **EBS** | 30 GB of storage | ✅ **Yes!** |
| **Data Transfer** | 15 GB/month outbound | ✅ **Yes** (for development) |
| **Elastic IP** | 1 IP address (when attached) | ✅ **Yes!** |

### ⚠️ Important Limitation

The **t2.micro** (1GB RAM) is too small for running both frontend and backend containers. You'll need at least **t2.small** (2GB RAM), which costs approximately **$17-18/month**.

---

## 🎯 Free Tier Optimized Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    AWS Free Tier                         │
│                                                          │
│  ┌──────────────────────────────────────────┐           │
│  │   EC2 t2.small (NOT free)                │           │
│  │   Cost: ~$17/month                       │           │
│  │                                          │           │
│  │   ┌──────────────┐  ┌──────────────┐    │           │
│  │   │  Frontend    │  │   Backend    │    │           │
│  │   │  (Port 80)   │  │  (Port 8081) │    │           │
│  │   └──────────────┘  └──────────────┘    │           │
│  └────────────────┬─────────────────────────┘           │
│                   │                                      │
│  ┌────────────────▼─────────────────────────┐           │
│  │   RDS MySQL db.t3.micro (FREE!)          │           │
│  │   750 hours/month = Always on            │           │
│  └──────────────────────────────────────────┘           │
│                                                          │
│  Total Cost: ~$17-20/month (instead of $40-50)          │
└─────────────────────────────────────────────────────────┘
```

---

## 💡 Cost Optimization Strategies

### Strategy 1: Minimize EC2 Costs (~$17/month)

**Use t2.small instead of t2.medium**:
- t2.small: 2GB RAM, 1 vCPU - **$17/month**
- t2.medium: 4GB RAM, 2 vCPU - **$35/month**
- **Savings: $18/month**

**Stop instance when not needed**:
```bash
# Stop instance at night (if not 24/7 requirement)
# Example: Run only 12 hours/day = ~$8.50/month instead of $17
```

### Strategy 2: Use Free Tier RDS ($0/month)

**db.t3.micro is FREE for 12 months**:
- 750 hours/month = 24/7 operation
- 20 GB storage included
- Automated backups included

### Strategy 3: Alternative - Use MySQL on EC2 ($0 extra)

If you want to save RDS costs after free tier expires:
```bash
# Run MySQL in Docker on same EC2 instance
# Uses existing resources, no additional cost
docker-compose -f docker-compose.yml up -d
```

---

## 🚀 Step-by-Step Free Tier Deployment

### Step 1: Launch EC2 Instance (Optimized for Free Tier)

1. **Go to EC2** → **Launch Instance**

2. **Configuration**:
   - **Name**: `smart-parking-server`
   - **AMI**: Ubuntu Server 22.04 LTS (Free tier eligible) ✅
   - **Instance Type**: `t2.small` (2GB RAM) - **$17/month**
     - ⚠️ t2.micro (1GB) is too small for this app
     - ✅ t2.small is the minimum for running both services
   - **Key Pair**: Create and download `.pem` file
   
3. **Storage**: 
   - **20 GB gp3** (Free tier: 30 GB available) ✅
   
4. **Network Settings**:
   - ✅ Allow SSH (port 22) - Your IP only
   - ✅ Allow HTTP (port 80)
   - ✅ Allow HTTPS (port 443)
   - ✅ Custom TCP (port 8081) - Backend

5. **Launch Instance**

### Step 2: Allocate Elastic IP (FREE when attached)

```bash
# Elastic IP is FREE as long as it's attached to a running instance
# You only pay if it's not attached ($0.005/hour = $3.60/month)
```

1. **EC2** → **Elastic IPs** → **Allocate**
2. **Associate** with your instance

### Step 3: Launch RDS MySQL (FREE for 12 months!)

1. **Go to RDS** → **Create database**

2. **Configuration**:
   - **Engine**: MySQL 8.0
   - **Template**: ✅ **Free tier** (IMPORTANT!)
   - **DB Instance**: `smart-parking-db`
   - **Master username**: `admin`
   - **Master password**: Create strong password
   
3. **Instance**:
   - **Class**: `db.t3.micro` ✅ (FREE tier eligible)
   - **Storage**: 20 GB ✅ (FREE tier eligible)
   - ✅ Enable storage autoscaling (max 100 GB)
   
4. **Connectivity**:
   - **VPC**: Same as EC2
   - **Public access**: No
   - **Security group**: Create new
   
5. **Additional**:
   - **Initial database**: `smart_parking`
   - **Backup retention**: 7 days ✅ (FREE)
   - ✅ Enable automated backups
   
6. **Create database** (takes 5-10 minutes)

### Step 4: Setup EC2 Instance

```bash
# Connect to EC2
ssh -i "your-key.pem" ubuntu@your-elastic-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker (one-line install)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify
docker --version
docker-compose --version

# Clone your repository
git clone https://github.com/your-username/smart_car_parking.git
cd smart_car_parking
```

### Step 5: Configure Environment

```bash
# Copy environment template
cp .env.aws.example .env

# Edit configuration
nano .env
```

**Update these values**:
```env
# RDS Configuration (get from RDS console)
DB_HOST=smart-parking-db.xxxxxxxxx.us-east-1.rds.amazonaws.com
DB_PORT=3306
DB_NAME=smart_parking
DB_USER=admin
DB_PASSWORD=your-rds-password

# Generate JWT secret
# Run: openssl rand -base64 32
JWT_SECRET=paste-generated-secret-here

# Razorpay (get from dashboard)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Your Elastic IP
BACKEND_URL=http://your-elastic-ip:8081
FRONTEND_URL=http://your-elastic-ip

# Docker Hub username
DOCKER_REGISTRY=your-dockerhub-username
```

### Step 6: Update Docker Compose File

```bash
# Edit docker-compose-aws.yml
nano docker-compose-aws.yml
```

**Update image names** (lines 6 and 26):
```yaml
# Replace 'your-dockerhub-username' with your actual username
image: your-dockerhub-username/smart-parking-backend:latest
image: your-dockerhub-username/smart-parking-frontend:latest
```

### Step 7: Build Docker Images

**Option A: Build on EC2** (recommended for free tier):

```bash
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

**Option B: Build locally** (if you have a powerful local machine):
```bash
# Build on your local machine and push
# Then pull on EC2
```

### Step 8: Deploy Application

```bash
# Make deploy script executable
chmod +x deploy-aws.sh

# Deploy!
./deploy-aws.sh
```

### Step 9: Verify Deployment

```bash
# Check containers
docker ps

# Check backend health
curl http://localhost:8081/actuator/health

# Check frontend
curl http://localhost:80

# View logs
docker-compose -f docker-compose-aws.yml logs -f
```

### Step 10: Access Your Application

Open in browser:
- **Frontend**: `http://your-elastic-ip`
- **Backend API**: `http://your-elastic-ip:8081`

---

## 💰 Actual Monthly Costs (Free Tier)

### First 12 Months:

| Service | Cost | Notes |
|---------|------|-------|
| EC2 t2.small | **$17/month** | Not covered by free tier |
| RDS db.t3.micro | **$0** | ✅ FREE (750 hours/month) |
| EBS 20GB | **$0** | ✅ FREE (30 GB included) |
| Elastic IP | **$0** | ✅ FREE (when attached) |
| Data Transfer | **$0** | ✅ FREE (15 GB/month) |
| **TOTAL** | **~$17-20/month** | 💰 **60% cheaper than standard** |

### After 12 Months:

| Service | Cost | Notes |
|---------|------|-------|
| EC2 t2.small | **$17/month** | Same |
| RDS db.t3.micro | **$15/month** | No longer free |
| EBS 20GB | **$2/month** | No longer free |
| Elastic IP | **$0** | Still free when attached |
| **TOTAL** | **~$34-37/month** | Still reasonable |

---

## 🎯 Further Cost Optimization

### 1. Stop EC2 When Not Needed

```bash
# If you don't need 24/7 uptime:

# Stop instance (from AWS Console or CLI)
aws ec2 stop-instances --instance-ids i-1234567890abcdef0

# Start when needed
aws ec2 start-instances --instance-ids i-1234567890abcdef0

# Example: Run 12 hours/day = ~$8.50/month instead of $17
```

### 2. Use AWS Instance Scheduler

```bash
# Automatically start/stop instances on schedule
# Example: Run only Mon-Fri 9AM-6PM
# Savings: ~70% = ~$5/month instead of $17
```

### 3. Alternative: Use Docker MySQL on EC2

**After free tier expires**, save $15/month by running MySQL on EC2:

```bash
# Use the standard docker-compose.yml instead
docker-compose up -d

# This runs MySQL in a container on EC2
# No separate RDS cost
# Total cost: ~$17/month (EC2 only)
```

### 4. Use AWS Lightsail (Alternative)

**AWS Lightsail** offers simpler pricing:
- **$10/month**: 2GB RAM, 1 vCPU, 60GB SSD, 3TB transfer
- Includes everything (compute + storage + transfer)
- Easier to manage than EC2

```bash
# Lightsail is often cheaper for simple applications
# Consider switching if you want predictable costs
```

---

## 📊 Free Tier Monitoring

### Setup Billing Alerts (CRITICAL!)

1. **CloudWatch** → **Billing** → **Create Alarm**
2. Set threshold: **$5** (get notified early!)
3. Add your email

### Track Free Tier Usage

1. **Billing Dashboard** → **Free Tier**
2. Monitor usage:
   - EC2 hours (won't be free)
   - RDS hours (should stay under 750)
   - Data transfer (should stay under 15GB)

### Cost Explorer

1. **Billing** → **Cost Explorer**
2. View daily costs
3. Forecast monthly costs

---

## 🔒 Security Best Practices (Free!)

### 1. Restrict Security Groups

```bash
# SSH: Only your IP (not 0.0.0.0/0)
# Backend: Only if needed publicly
```

### 2. Use IAM Roles (Free)

```bash
# Don't store AWS credentials on EC2
# Use IAM roles instead
```

### 3. Enable CloudWatch Logs (Free tier: 5GB)

```bash
# Monitor application logs
# Free tier: 5GB ingestion, 5GB storage
```

### 4. Regular Backups (RDS automated backups are FREE!)

```bash
# RDS automated backups: FREE in free tier
# Manual snapshots: Also FREE
```

---

## 🚨 Common Free Tier Pitfalls

### ❌ Pitfall 1: Unattached Elastic IP

```bash
# COST: $3.60/month if not attached!
# FIX: Always keep it attached to running instance
```

### ❌ Pitfall 2: Exceeding Data Transfer

```bash
# FREE: 15 GB/month outbound
# COST: $0.09/GB after that
# FIX: Use CloudFront CDN (50GB free/month)
```

### ❌ Pitfall 3: Multiple Instances

```bash
# FREE: 750 hours total (not per instance)
# Running 2 instances = 1500 hours = charges!
# FIX: Run only one instance
```

### ❌ Pitfall 4: Forgetting to Stop Instances

```bash
# If testing, STOP instances when done
# Stopped instances don't incur EC2 charges
# (But EBS storage still charges after free tier)
```

---

## 📋 Free Tier Deployment Checklist

### Pre-Deployment
- [ ] AWS account created
- [ ] ✅ Selected **FREE TIER** template for RDS
- [ ] Billing alerts set ($5 threshold)
- [ ] Free tier usage dashboard bookmarked

### Instance Configuration
- [ ] EC2 t2.small launched (smallest viable size)
- [ ] RDS db.t3.micro launched (FREE tier)
- [ ] Elastic IP allocated and attached
- [ ] Security groups configured (minimal access)

### Cost Optimization
- [ ] Billing alerts enabled
- [ ] Cost Explorer reviewed
- [ ] Instance scheduler considered (if not 24/7)
- [ ] CloudFront considered (if high traffic)

### Deployment
- [ ] Docker installed
- [ ] Application deployed
- [ ] Health checks passing
- [ ] Backups configured (FREE RDS backups)

---

## 🎓 Learning Resources (All Free!)

- [AWS Free Tier Details](https://aws.amazon.com/free/)
- [AWS Cost Optimization](https://aws.amazon.com/pricing/cost-optimization/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [AWS Educate](https://aws.amazon.com/education/awseducate/) - Free credits for students

---

## 💡 Pro Tips

### 1. Use AWS Educate (Students)

```bash
# Students get $100 in AWS credits
# Apply at: aws.amazon.com/education/awseducate
# This covers ~6 months of hosting!
```

### 2. Use Test Mode for Razorpay

```bash
# Use Razorpay test keys during development
# No real transactions = no costs
```

### 3. Optimize Docker Images

```bash
# Use multi-stage builds
# Smaller images = faster deployment
# Less storage = lower costs (after free tier)
```

### 4. Monitor Daily Costs

```bash
# Check billing dashboard daily
# Catch unexpected charges early
```

---

## 🆘 Troubleshooting

### Issue: Costs higher than expected

**Check**:
```bash
# 1. Billing Dashboard → Cost Explorer
# 2. Check for unattached Elastic IPs
# 3. Check data transfer usage
# 4. Verify only one instance running
```

### Issue: Out of memory on t2.small

**Solutions**:
```bash
# 1. Add swap space (free!)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 2. Optimize Docker memory limits
# 3. Consider t2.medium ($35/month) if necessary
```

### Issue: Free tier exceeded

**Check**:
```bash
# Billing → Free Tier
# See what exceeded:
# - RDS hours > 750? (shouldn't happen if single instance)
# - Data transfer > 15GB? (use CloudFront)
# - Storage > 30GB? (clean up old data)
```

---

## 📞 Support

- **AWS Free Tier**: https://aws.amazon.com/free/
- **AWS Support**: Basic support is FREE
- **Application Issues**: grpansare2002@gmail.com

---

**Happy Free Tier Deploying! 🎉**

*Estimated Cost: $17-20/month for first 12 months*  
*After 12 months: $34-37/month*

---

*Last Updated: November 2025*
