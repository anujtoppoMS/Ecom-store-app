[Readme.md](https://github.com/user-attachments/files/20331719/Readme.md)

Ecommerce application kubernetes deployment:

Overview:
This README outlines the deployment process, best practices, and troubleshooting steps for setting up an AKS-hosted application. It serves as a guide for both initial deployment and improvement.

Architecture:

                               ingress (nginx)
                                      |
                                      | 
                                      |
                               nginx reverse proxy
                                      |
                                      |
                                      |
                               frontend (react/nextjs)____________________ backend(nodejs)____________________________________
                                      |                                        |                 |          |                 |
                                      |                                      Admin Dashboard   Cart      Authentication     Store
                                      |                                        |_____________________________________________ |
                                      |______________________________________________________________|           |
                                      |                  |                                            |           |
                                      |             RabbitMQ                                          |           |
                                      |                  |                                            |        MongoDB
                                      |__________________|____________________________________________|___________|
                                                                           |
                                                                           |
                                                      Exporter/ scraping endpints for prometheus metrics
                                                                           |
                                                                           |
                                                                        Prometheus Server
                                                                           |
                                                                        Grafana
  


AKS Deployment Plan

Platform Choice
For deployment, I have chosen Azure Kubernetes Service (AKS) to leverage its managed Kubernetes environment for scalability, security, and ease of operations.

Pre-requisites
Ensure the following resources and tools are available before proceeding with deployment:

1. Azure Setup
   - Active Azure subscription
   - Resource group for organizing resources
   - AKS cluster with appropriate access permissions (Owner or Contributor)

2. Local Development Tools
   - VS Code (or any preferred IDE)
   - Azure CLI for managing resources
   - Kubectl for interacting with the Kubernetes cluster

3. Application Stack
   - Node.js, Next.js, and React
   - Required npm packages and libraries

4. Containerization
   - Docker installed for building containerized applications
   - Artifact repository (Azure Container Registry or another registry) for storing Docker images

With these essentials in place, you can proceed to set up and deploy applications efficiently on AKS.



AKS Deployment Process  

Deploying to Azure Kubernetes Service (AKS) follows a structured sequence where components are defined in manifest files and applied using kubectl.

Example command:
sh
kubectl -n dev apply -f deployment.yaml


 Deployment Stages
1. Containerization – Build the application image using Docker, then push it to an artifact repository.  
2. Secrets & ConfigMaps – Store sensitive data and environment configs securely in Kubernetes objects.  
3. Persistent Storage – Choose between static PVs or dynamic storage classes based on needs (MongoDB, RabbitMQ).  
4. Database (MongoDB) – Deploy StatefulSet with ReplicaSet and persistent storage.  
5. Backend (Node.js) – Handles logic and data processing, deployed with RollingUpdate strategy.  
6. Message Broker (RabbitMQ) – Enables asynchronous communication, deployed as StatefulSet with dynamic storage.  
7. Frontend (React) – Serves UI assets and static content.  
8. Ingress & Networking – Uses Nginx Ingress Controller for routing and external exposure.  
9. Monitoring & Logging – Prometheus for metrics, Grafana for visualization, Fluentd & ELK for logs.  

This setup ensures scalability, reliability, and observability within AKS.

Here's the corrected version with improved grammar, readability, and clarity:

---

 Phase 1: Deployment Strategy  

1. Rolling Update – This is the default strategy and is used across all deployment objects to set the maximum unavailable replica count and control scheduling of extra replicas.  

2. Blue-Green Deployment – While service mesh (Istio) makes this more efficient, this setup uses traffic redirection via Kubernetes services instead. Two separate deployments (with distinct names, labels, and images) can be created, and traffic can be redirected by modifying the service object or Ingress rules, adjusting label selectors to point to the desired deployment.  

3. Canary Deployment – Without Istio or a service mesh, this is achieved by deploying two sets of images with the same deployment name and labels, gradually scaling up and down the versions.  

4. Liveness & Readiness Checks – Configured to monitor application health, enabling self-healing by restarting failed instances or controlling traffic acceptance. A mix of built-in commands and custom scripts ensures accuracy.  

5. Horizontal Pod Autoscaling – Uses the autoscaling/v1 object with a metrics-server deployment to collect CPU/memory usage. Minimum and maximum replicas are defined to automatically scale resources based on demand.  

6. Secrets & ConfigMaps – Managed through Kubernetes objects. Configuration can be passed via environment key-value pairs or mounted volumes. Kubernetes CSI secret provider driver is configured but disabled in the demo setup. It’s ready for integration with Azure Key Vault & OAuth-based workload identity.  

7. Resource Requests & Limits – Minimum and maximum resource constraints are configured and can be adjusted as needed.  

8. Service Monitoring – Prometheus annotations are added to enable automated metric scraping for cluster observability.  

9. Ingress, Nginx Reverse Proxy & Headless Services –  
   - Nginx Ingress Controller manages internet exposure.  
   - Reverse proxying for frontend applications is enabled.  
   - SSL/TLS termination, rate limiting, and DDoS protection are supported.  
   - Ingress rules allow traffic redirection to different paths and ports.  
   - Headless services enable stable connections for StatefulSets without load balancing.  

10. Persistent Volumes – Uses both static and dynamic provisioning with StorageClasses, ensuring predictable behavior for stateful applications. Combined with StatefulSet & Headless Services, this guarantees consistent pod identities and stable communication.  

---

 Phase 2: Observability & Scaling  

1. Instrumentation for Observability –  
   - MongoDB Exporter  
   - RabbitMQ Exporter  
   - Prometheus Service Monitor for frontend & backend services  

2. Horizontal Pod Autoscaling – Works alongside metrics-server to adjust replicas based on CPU/memory consumption.  

3. Cluster Autoscaling – Achieved via Virtual Machine Scale Set (VMSS):  
   sh
   az aks update -g rg -n aks_name --enable-cluster-autoscaler --min-count 3 --max-count 10
     
   - Nodes are provisioned dynamically using Azure Health Monitoring to match workload demands.  

---

 Phase 3: Debugging & Troubleshooting Scenarios  

 1. Frontend Accessibility Issue  
- Issue: The frontend service is inaccessible externally after deployment.  
- Observed Error: 502 Bad Gateway  
- Diagnosis:  
   - Checked pod status (kubectl -n dev get pods)  
   - Inspected events (kubectl -n dev describe pod podname)  
   - Reviewed frontend & Nginx logs  
   - Found "Connection refused" error in Nginx logs  
   - Investigated frontend service (kubectl get endpoints -A | grep frontend-app-service) → No endpoint found  
   - Discovered misconfigured service object label selector, preventing traffic routing  

- Resolution: Corrected the selector, restoring frontend accessibility.  

---

 2. Intermittent Backend-Database Connectivity Issue  
- Issue: Backend services randomly fail to connect to the MongoDB ReplicaSet due to authentication errors.  
- Observed Error: MongoServerSelectionError  
- Diagnosis:  
   - Ran a manual MongoDB connectivity test (passed)  
   - Monitored logs for authentication failures  
   - Found failures on one specific endpoint  
   - Confirmed certificate expiration/misconfiguration  

- Resolution: Updated the MongoDB TLS certificate, resolving connectivity issues.  


3.Order Processing Delays:
    - Issue: Users report delays in order processing, suspecting issues with the RabbitMQ message queue.
    - Task: Analyze and optimize the message queue setup, ensuring efficient message processing and minimal latency.
____________________________________________________________________________________________________________________________________________________

I have not handled any major issue related to rabbitMQ however here are few possible issues that could take place and possible troubleshooting steps:
_____________________________________________________________________________________________________________________________________________________

Troubleshooting RabbitMQ Order Processing Delays
Issue Type:
Symptoms: Orders take longer than expected to process.

Possible Causes:

   - High queue length causing processing bottlenecks.
   - Inefficient consumer prefetch settings.
   - Slow disk I/O affecting message persistence.
   - Network latency between producers and consumers.
   - Unoptimized exchange and queue bindings.
   - Check Queue Length & Message Backlog
   - rabbitmqctl list_queues name messages_ready messages_unacknowledged


 Optimize Consumer Prefetch Count
   - Monitor Disk I/O Performance
   - If using persistent messages, ensure fast SSD storage to reduce disk bottlenecks.

 Check RabbitMQ disk usage:
   - rabbitmq-diagnostics disk_space

 Tune Queue & Exchange Settings
   - Keep queues short to minimize processing overhead.

 Use multiple queues and consumers for parallel processing.
   - Avoid mandatory and immediate flags, as they slow down message delivery
