pipeline {
    agent any
  
  environment {
   JAVA_HOME = "/usr/lib/jvm/java-11-openjdk-amd64"
   REGISTRY_URL = "default-route-openshift-image-registry.apps.cluster-98ae.98ae.example.opentlc.com"
   NAMESPACE = "nsp"
   APPLICATION_NAME = "captcha-microservice"
  }
    stages {
        
       stage('Create Image') {
            steps {
                echo 'Testing..'
                sh "docker build -t ${REGISTRY_URL}/${NAMESPACE}/${APPLICATION_NAME} ."
                //
            }
        }
        stage('Push Image') {
            steps {
             sh "docker push ${REGISTRY_URL}/${NAMESPACE}/${APPLICATION_NAME}"
                      }
        } 
        stage('Deploy Application') {
            steps {
             sh "oc new-app ${APPLICATION_NAME} -n nsp --dry-run -o yaml| oc apply -f - -n nsp"
                      }
        } 
    }
}