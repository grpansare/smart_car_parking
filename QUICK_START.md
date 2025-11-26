# 🚀 Quick Start Guide - CI/CD Pipeline

Fast track guide to get your CI/CD pipeline running in 30 minutes!

---

## ⚡ Prerequisites Checklist

- [ ] AWS EC2 instance (t2.small, 2GB RAM minimum)
- [ ] Docker installed on EC2
- [ ] Jenkins installed (or will install)
- [ ] GitHub repository access
- [ ] Docker Hub account

---

## 🎯 Quick Setup (30 Minutes)

### Step 1: Start SonarQube (5 min)
```bash
cd /path/to/smart_car_parking
docker-compose -f docker-compose-sonarqube.yml up -d

# Wait 2-3 minutes, then access
# http://your-ec2-ip:9000
# Login: admin/admin (CHANGE PASSWORD!)
```

### Step 2: Generate SonarQube Token (2 min)
1. Login to SonarQube
2. Click **Administrator** → **My Account** → **Security**
3. Generate token named `jenkins-token`
4. **Copy and save it!**

### Step 3: Update Docker Image Names (3 min)
Replace `your-dockerhub-username` in these files:
- `smart-parking-backend/Jenkinsfile` (line 12)
- `smart-parking-frontend/Jenkinsfile` (line 11)
- `docker-compose.yml` (lines 6 and 26)

### Step 4: Install Jenkins (5 min)
```bash
docker run -d \
  --name jenkins \
  -p 8080:8080 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --restart unless-stopped \
  jenkins/jenkins:lts

# Get admin password
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

Access: `http://your-ec2-ip:8080`

### Step 5: Configure Jenkins (10 min)
1. Install suggested plugins
2. Install additional plugins:
   - Docker Pipeline
   - SonarQube Scanner
   - GitHub Integration
   - NodeJS Plugin

3. Configure tools (**Manage Jenkins** → **Global Tool Configuration**):
   - Maven3 (auto-install)
   - JDK17 (auto-install)
   - NodeJS18 (auto-install)
   - SonarScanner (auto-install)

### Step 6: Add Credentials (5 min)
**Manage Jenkins** → **Manage Credentials** → **Add Credentials**

Add these 3 essential credentials:
1. **GitHub** (ID: `github-credentials`)
   - Username + Personal Access Token
2. **Docker Hub** (ID: `dockerhub-credentials`)
   - Username + Password
3. **SonarQube** (ID: `sonarqube-token`)
   - Secret text (token from Step 2)

Configure SonarQube server:
- **Manage Jenkins** → **Configure System** → **SonarQube servers**
- Name: `SonarQube`
- URL: `http://localhost:9000`
- Token: Select `sonarqube-token`

### Step 7: Create Pipelines (3 min)
**New Item** → Pipeline

**Backend Pipeline:**
- Name: `smart-parking-backend-pipeline`
- Pipeline from SCM → Git
- Repository: Your GitHub repo URL
- Credentials: `github-credentials`
- Script Path: `smart-parking-backend/Jenkinsfile`
- ✅ GitHub hook trigger

**Frontend Pipeline:**
- Name: `smart-parking-frontend-pipeline`
- Pipeline from SCM → Git
- Repository: Your GitHub repo URL
- Credentials: `github-credentials`
- Script Path: `smart-parking-frontend/Jenkinsfile`
- ✅ GitHub hook trigger

### Step 8: Setup GitHub Webhook (2 min)
GitHub repo → **Settings** → **Webhooks** → **Add webhook**
- URL: `http://your-ec2-ip:8080/github-webhook/`
- Content type: `application/json`
- Events: Just the push event

### Step 9: Test! (5 min)
1. Click **Build Now** on both pipelines
2. Watch the magic happen! 🎉

---

## ✅ Verification

After successful build:
```bash
# Check containers
docker ps

# Check backend
curl http://localhost:8081/actuator/health

# Check frontend
curl http://localhost:80

# View SonarQube reports
# http://your-ec2-ip:9000
```

---

## 🎉 Success!

Your CI/CD pipeline is now live! Every push to GitHub will:
1. ✅ Trigger Jenkins automatically
2. ✅ Build and test your code
3. ✅ Analyze code quality with SonarQube
4. ✅ Build Docker images
5. ✅ Push to Docker Hub
6. ✅ Deploy to EC2
7. ✅ Run health checks

---

## 📚 Need More Details?

- **Full Setup Guide:** `CICD_SETUP.md`
- **Credentials Guide:** `jenkins-credentials-guide.md`
- **Complete Walkthrough:** `walkthrough.md` (in artifacts)

---

## 🆘 Quick Troubleshooting

**Pipeline fails at SonarQube?**
```bash
docker ps | grep sonarqube  # Check if running
docker logs sonarqube       # Check logs
```

**Docker push fails?**
- Verify Docker Hub credentials in Jenkins
- Check repository exists on Docker Hub

**Build fails?**
- Check Jenkins console output
- Verify all credentials are configured

---

**Happy Deploying! 🚀**
