pipeline {
    agent {
        kubernetes {
            inheritFrom 'default'
            yaml '''
spec:
  containers:
  - name: jnlp
    resources:
      limits:
        memory: "2Gi"
        cpu: "2"
      requests:
        memory: "1Gi"
        cpu: "1"
'''
        }
    }
    
    tools {
        maven 'maven3'
        jdk 'JDK17-Adoptium'
        nodejs 'NodeJS18'
    }
    
    environment {
        // Nexus Docker Registry
        NEXUS_DOCKER_REGISTRY = 'nexus.imcc.com:8082'
        NEXUS_CREDENTIALS = credentials('nexus-credentials')
        
        // SonarQube
        SONAR_HOST_URL = 'http://sonarqube.imcc.com'
        SONAR_TOKEN = credentials('sonarqube-token')
        SCANNER_HOME = tool 'SonarScanner'
        
        // Nexus Maven Repository
        NEXUS_URL = 'http://nexus.imcc.com'
        NEXUS_REPOSITORY = 'maven-snapshots'
        
        // Build version
        BUILD_VERSION = "${env.BUILD_NUMBER}"
    }
    
    triggers {
        // Poll SCM every 5 minutes (can be replaced with GitHub webhook)
        pollSCM('H/5 * * * *')
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '📥 Checking out code from GitHub...'
                checkout scm
                script {
                    env.GIT_COMMIT_MSG = sh(script: 'git log -1 --pretty=%B', returnStdout: true).trim()
                    env.GIT_AUTHOR = sh(script: 'git log -1 --pretty=%an', returnStdout: true).trim()
                    echo "Commit: ${env.GIT_COMMIT_MSG} by ${env.GIT_AUTHOR}"
                }
            }
        }
        
        stage('Build & Test') {
            parallel {
                stage('Backend Pipeline') {
                    stages {
                        stage('Backend: Build') {
                            steps {
                                echo '🔨 Building backend with Maven...'
                                dir('smark-parking-backend') {
                                    sh 'mvn clean compile -DskipTests'
                                }
                            }
                        }
                        
                        stage('Backend: Unit Tests') {
                            steps {
                                echo '🧪 Running backend unit tests...'
                                dir('smark-parking-backend') {
                                    sh 'mvn test'
                                }
                            }
                            post {
                                always {
                                    dir('smark-parking-backend') {
                                        junit '**/target/surefire-reports/*.xml'
                                    }
                                }
                            }
                        }
                        
                        stage('Backend: SonarQube Analysis') {
                            steps {
                                echo '🔍 Running backend SonarQube analysis...'
                                dir('smark-parking-backend') {
                                    withSonarQubeEnv('SonarQube') {
                                        sh """
                                            mvn sonar:sonar \
                                                -Dsonar.projectKey=smart-parking-backend \
                                                -Dsonar.projectName='Smart Parking Backend' \
                                                -Dsonar.host.url=${SONAR_HOST_URL} \
                                                -Dsonar.login=${SONAR_TOKEN}
                                        """
                                    }
                                }
                            }
                        }
                        
                        stage('Backend: Package') {
                            steps {
                                echo '📦 Packaging backend application...'
                                dir('smark-parking-backend') {
                                    sh 'mvn package -DskipTests'
                                }
                            }
                        }
                        
                        stage('Backend: Deploy to Nexus') {
                            steps {
                                echo '📤 Deploying backend artifact to Nexus...'
                                dir('smark-parking-backend') {
                                    sh """
                                        mvn deploy -DskipTests \
                                            -DaltDeploymentRepository=nexus::default::${NEXUS_URL}/repository/${NEXUS_REPOSITORY}
                                    """
                                }
                            }
                        }
                        
                        stage('Backend: Build Docker Image') {
                            steps {
                                echo '🐳 Building backend Docker image...'
                                dir('smark-parking-backend') {
                                    script {
                                        env.BACKEND_IMAGE = docker.build("${NEXUS_DOCKER_REGISTRY}/smart-parking-backend:${BUILD_VERSION}")
                                        docker.build("${NEXUS_DOCKER_REGISTRY}/smart-parking-backend:latest")
                                    }
                                }
                            }
                        }
                        
                        stage('Backend: Push to Nexus') {
                            steps {
                                echo '🚀 Pushing backend image to Nexus...'
                                script {
                                    docker.withRegistry("http://${NEXUS_DOCKER_REGISTRY}", 'nexus-credentials') {
                                        env.BACKEND_IMAGE.push("${BUILD_VERSION}")
                                        env.BACKEND_IMAGE.push("latest")
                                    }
                                }
                            }
                        }
                    }
                }
                
                stage('Frontend Pipeline') {
                    stages {
                        stage('Frontend: Install Dependencies') {
                            steps {
                                echo '📦 Installing frontend dependencies...'
                                dir('smart-parking-frontend') {
                                    sh 'npm ci --prefer-offline --no-audit'
                                }
                            }
                        }
                        
                        stage('Frontend: Lint') {
                            steps {
                                echo '🔍 Running frontend linting...'
                                dir('smart-parking-frontend') {
                                    sh 'npm run lint || true'
                                }
                            }
                        }
                        
                        stage('Frontend: Build') {
                            steps {
                                echo '🔨 Building frontend React application...'
                                dir('smart-parking-frontend') {
                                    sh 'npm run build'
                                }
                            }
                        }
                        
                        stage('Frontend: SonarQube Analysis') {
                            steps {
                                echo '🔍 Running frontend SonarQube analysis...'
                                dir('smart-parking-frontend') {
                                    withSonarQubeEnv('SonarQube') {
                                        sh """
                                            ${SCANNER_HOME}/bin/sonar-scanner \
                                                -Dsonar.projectKey=smart-parking-frontend \
                                                -Dsonar.projectName='Smart Parking Frontend' \
                                                -Dsonar.sources=src \
                                                -Dsonar.host.url=${SONAR_HOST_URL} \
                                                -Dsonar.login=${SONAR_TOKEN}
                                        """
                                    }
                                }
                            }
                        }
                        
                        stage('Frontend: Build Docker Image') {
                            steps {
                                echo '🐳 Building frontend Docker image...'
                                dir('smart-parking-frontend') {
                                    script {
                                        env.FRONTEND_IMAGE = docker.build("${NEXUS_DOCKER_REGISTRY}/smart-parking-frontend:${BUILD_VERSION}")
                                        docker.build("${NEXUS_DOCKER_REGISTRY}/smart-parking-frontend:latest")
                                    }
                                }
                            }
                        }
                        
                        stage('Frontend: Push to Nexus') {
                            steps {
                                echo '🚀 Pushing frontend image to Nexus...'
                                script {
                                    docker.withRegistry("http://${NEXUS_DOCKER_REGISTRY}", 'nexus-credentials') {
                                        env.FRONTEND_IMAGE.push("${BUILD_VERSION}")
                                        env.FRONTEND_IMAGE.push("latest")
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        
        stage('Quality Gate') {
            steps {
                echo '🚦 Checking SonarQube Quality Gates...'
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
        
        stage('Deploy Full Stack') {
            steps {
                echo '🌐 Deploying full stack application...'
                script {
                    sh """
                        # Stop existing containers
                        docker-compose down || true
                        
                        # Pull latest images from Nexus
                        docker pull ${NEXUS_DOCKER_REGISTRY}/smart-parking-backend:latest || true
                        docker pull ${NEXUS_DOCKER_REGISTRY}/smart-parking-frontend:latest || true
                        
                        # Deploy using docker-compose
                        docker-compose up -d
                    """
                }
            }
        }
        
        stage('Health Checks') {
            parallel {
                stage('Backend Health Check') {
                    steps {
                        echo '❤️ Checking backend health...'
                        script {
                            sleep(time: 30, unit: 'SECONDS')
                            sh 'curl -f http://localhost:8081/actuator/health || exit 1'
                            echo '✅ Backend is healthy!'
                        }
                    }
                }
                
                stage('Frontend Health Check') {
                    steps {
                        echo '❤️ Checking frontend health...'
                        script {
                            sleep(time: 10, unit: 'SECONDS')
                            sh 'curl -f http://localhost:80 || exit 1'
                            echo '✅ Frontend is healthy!'
                        }
                    }
                }
            }
        }
    }
    
    post {
        success {
            echo '✅ Full Stack Pipeline completed successfully!'
            echo "🎉 Backend and Frontend v${BUILD_VERSION} deployed!"
            // Add notification here (email, Slack, etc.)
        }
        failure {
            echo '❌ Pipeline failed!'
            echo '🔄 Rolling back deployment...'
            script {
                sh """
                    docker-compose down || true
                """
            }
        }
        always {
            echo '🧹 Cleaning up workspace...'
            cleanWs()
        }
    }
}
