# Deploy RestoHub to Kubernetes
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   RestoHub Kubernetes Deployment    " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Build Docker Images
Write-Host "[1/4] Building Docker Images..." -ForegroundColor Yellow
Write-Host ""

$services = @(
    "api-gateway",
    "frontend",
    "product-service",
    "user-service",
    "order-service",
    "payment-service",
    "inventory-service"
)

foreach ($service in $services) {
    Write-Host "Building restohub/${service}:latest..." -ForegroundColor Green
    docker build -t "restohub/${service}:latest" "./$service"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error building $service" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "All images built successfully!" -ForegroundColor Green
Write-Host ""

# Step 2: Deploy Infrastructure (MongoDB, Redis, RabbitMQ)
Write-Host "[2/4] Deploying Infrastructure..." -ForegroundColor Yellow
Write-Host ""

kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/mongodb-deployment.yaml
kubectl apply -f k8s/redis-deployment.yaml
kubectl apply -f k8s/rabbitmq-deployment.yaml

Write-Host ""
Write-Host "Waiting for infrastructure pods to be ready..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# Step 3: Deploy Services
Write-Host "[3/4] Deploying Microservices..." -ForegroundColor Yellow
Write-Host ""

$microservices = @(
    "product-service",
    "user-service",
    "order-service",
    "payment-service",
    "inventory-service"
)

foreach ($service in $microservices) {
    Write-Host "Deploying $service..." -ForegroundColor Green
    kubectl apply -f "$service/k8s/configmap.yaml"
    kubectl apply -f "$service/k8s/secret.yaml"
    kubectl apply -f "$service/k8s/deployment.yaml"
    kubectl apply -f "$service/k8s/service.yaml"
}

Write-Host ""
Write-Host "Waiting for services to be ready..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# Step 4: Deploy API Gateway and Frontend
Write-Host "[4/4] Deploying API Gateway and Frontend..." -ForegroundColor Yellow
Write-Host ""

Write-Host "Deploying API Gateway..." -ForegroundColor Green
kubectl apply -f api-gateway/k8s/configmap.yaml
kubectl apply -f api-gateway/k8s/deployment.yaml
kubectl apply -f api-gateway/k8s/service.yaml
kubectl apply -f api-gateway/k8s/ingress.yaml

Write-Host "Deploying Frontend..." -ForegroundColor Green
kubectl apply -f frontend/k8s/configmap.yaml
kubectl apply -f frontend/k8s/deployment.yaml
kubectl apply -f frontend/k8s/service.yaml
kubectl apply -f frontend/k8s/ingress.yaml

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   Deployment Complete!              " -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Show status
Write-Host "Current Status:" -ForegroundColor Yellow
Write-Host ""
kubectl get pods
Write-Host ""
kubectl get services

Write-Host ""
Write-Host "To access the application:" -ForegroundColor Cyan
Write-Host "  API Gateway: http://localhost:4000" -ForegroundColor White
Write-Host "  Frontend:    http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "To check logs:" -ForegroundColor Cyan
Write-Host "  kubectl logs <pod-name>" -ForegroundColor White
Write-Host ""
Write-Host "To check seeding logs:" -ForegroundColor Cyan
Write-Host "  kubectl logs <pod-name> -c seed-data" -ForegroundColor White
Write-Host ""
