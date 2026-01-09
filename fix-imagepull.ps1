# Fix ImagePullPolicy for all deployments
Write-Host "Fixing imagePullPolicy for all services..." -ForegroundColor Yellow

$deployments = @(
    "product-service",
    "user-service", 
    "order-service",
    "payment-service",
    "inventory-service",
    "api-gateway",
    "restohub-frontend"
)

foreach ($deployment in $deployments) {
    Write-Host "Patching $deployment..." -ForegroundColor Green
    kubectl patch deployment $deployment -p '{\"spec\":{\"template\":{\"spec\":{\"initContainers\":[{\"name\":\"seed-data\",\"imagePullPolicy\":\"Never\"}],\"containers\":[{\"name\":\"'+ $deployment.Split('-')[0] + '\",\"imagePullPolicy\":\"Never\"}]}}}}'
}

Write-Host ""
Write-Host "Waiting for pods to restart..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

Write-Host ""
kubectl get pods
