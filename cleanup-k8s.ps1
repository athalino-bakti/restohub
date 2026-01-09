# Cleanup RestoHub Kubernetes Resources
Write-Host "=====================================" -ForegroundColor Red
Write-Host "   Cleaning Up Kubernetes Resources  " -ForegroundColor Red
Write-Host "=====================================" -ForegroundColor Red
Write-Host ""

Write-Host "Deleting all deployments, services, and configs..." -ForegroundColor Yellow
Write-Host ""

# Delete in reverse order
kubectl delete -f frontend/k8s/ --ignore-not-found=true
kubectl delete -f api-gateway/k8s/ --ignore-not-found=true
kubectl delete -f inventory-service/k8s/ --ignore-not-found=true
kubectl delete -f payment-service/k8s/ --ignore-not-found=true
kubectl delete -f order-service/k8s/ --ignore-not-found=true
kubectl delete -f user-service/k8s/ --ignore-not-found=true
kubectl delete -f product-service/k8s/ --ignore-not-found=true
kubectl delete -f k8s/ --ignore-not-found=true

Write-Host ""
Write-Host "Deleting persistent volume claims..." -ForegroundColor Yellow
kubectl delete pvc --all

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "   Cleanup Complete!                 " -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

Write-Host "Remaining resources:" -ForegroundColor Cyan
kubectl get all
