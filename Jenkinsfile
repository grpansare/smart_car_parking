pipeline {
    agent {
        kubernetes {
            inheritFrom ''
            yaml '''
spec:
  containers:
  - name: jnlp
    image: "jenkins/inbound-agent-jdk17:latest"
    resources:
      limits:
        memory: "2Gi"
        cpu: "2"
      requests:
        memory: "1Gi"
        cpu: "1"
    volumeMounts:
    - mountPath: "/home/jenkins/agent"
      name: "workspace-volume"
      readOnly: false

  - name: dind
    image: "docker:dind"
    securityContext:
      privileged: true
    resources:
      limits:
        memory: "4Gi"
        cpu: "2"
      requests:
        memory: "1Gi"
        cpu: "1"
    volumeMounts:
    - mountPath: "/home/jenkins/agent"
      name: "workspace-volume"
      readOnly: false

  volumes:
  - name: "workspace-volume"
    emptyDir: {}
'''
        }
    }

    tools {
        maven 'maven3'
        nodejs 'NodeJS18'
        // removed: jdk 'JDK17-Adoptium' → JDK already inside inbound-agent image
    }

    environment {
        JAVA_HOME = "/opt/java/openjdk"   // JDK from agent image
        PATH = "${JAVA_HOME}/bin:${PATH}"

        NEXUS_DOCKER_REGISTRY = 'nexus.imcc.com:8082'
        NEXUS_CREDENTIALS = credentials('nexus-credentials')

        SONAR_HOST_URL = 'http://sonarqube.imcc.com'
        SONAR_TOKEN = credentials('sonarqube-token')
        SCANNER_HOME = tool 'SonarScanner'

        NEXUS_URL = 'http://nexus.imcc.com'
        NEXUS_REPOSITORY = 'maven-snapshots'

        BUILD_VERSION = "${env.BUILD_NUMBER}"
    }

    triggers {
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
                                echo '🔨 Building backend...'
                                dir('smark-parking-backend') {
                                    sh 'mvn clean compile -DskipTests'
                                }
                            }
                        }

                        stage('Backend: Unit Tests') {
                            steps {
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

                        stage('Backend: SonarQube') {
                            steps {
                                dir('smark-parking-backend') {
                                    withSonarQubeEnv('SonarQube') {
                                        sh """
                                            mvn sonar:sonar \
                                                -Dsonar.projectKey=smart-parking-backend \
                                                -Dsonar.projectName='Smart Parking Backend'
                                        """
                                    }
                                }
                            }
                        }

                        stage('Backend: Package') {
                            steps {
                                dir('smark-parking-backend') {
                                    sh 'mvn package -DskipTests'
                                }
                            }
                        }

                        stage('Backend: Deploy to Nexus') {
                            steps {
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

                // ---------- Frontend ----------
                stage('Frontend Pipeline') {
                    stages {

                        stage('Frontend: Install') {
                            steps {
                                dir('smart-parking-frontend') {
                                    sh 'npm ci'
                                }
                            }
                        }

                        stage('Frontend: Lint') {
                            steps {
                                dir('smart-parking-frontend') {
                                    sh 'npm run lint || true'
                                }
                            }
                        }

                        stage('Frontend: Build') {
                            steps {
                                dir('smart-parking-frontend') {
                                    sh 'npm run build'
                                }
                            }
                        }

                        stage('Frontend: SonarQube') {
                            steps {
                                dir('smart-parking-frontend') {
                                    withSonarQubeEnv('SonarQube') {
                                        sh """
                                            ${SCANNER_HOME}/bin/sonar-scanner \
                                                -Dsonar.projectKey=smart-parking-frontend \
                                                -Dsonar.projectName='Smart Parking Frontend' \
                                                -Dsonar.sources=src
                                        """
                                    }
                                }
                            }
                        }

                        stage('Frontend: Build Docker Image') {
                            steps {
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
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Deploy Full Stack') {
            steps {
                sh """
                    docker-compose down || true
                    docker pull ${NEXUS_DOCKER_REGISTRY}/smart-parking-backend:latest || true
                    docker pull ${NEXUS_DOCKER_REGISTRY}/smart-parking-frontend:latest || true
                    docker-compose up -d
                """
            }
        }
    }

    post {
        success {
            echo "🎉 Smart Parking ${BUILD_VERSION} deployed successfully!"
        }

       failure {
    echo '❌ Pipeline failed!'
    echo '🔄 Rolling back deployment...'
    script {
        sh "docker-compose down || true"
    }
}


        always {
            echo "🧹 Cleaning workspace..."
            deleteDir()     // FIX: cleanWs() removed
        }
    }
}
