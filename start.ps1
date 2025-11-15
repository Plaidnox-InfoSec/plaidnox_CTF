# Build and start all services
Write-Host "Building CTF Challenge Platform..." -ForegroundColor Cyan
docker-compose build

Write-Host "`nStarting all services..." -ForegroundColor Cyan
docker-compose up -d

Write-Host "`nWaiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "`nChecking service health..." -ForegroundColor Cyan

$services = @(
    @{Name="Flask Backend"; URL="http://localhost:5000"},
    @{Name="Node.js Service"; URL="http://localhost:3000"},
    @{Name="Frontend"; URL="http://localhost:8081"},
    @{Name="Nginx Proxy"; URL="http://localhost:80"}
)

foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri $service.URL -TimeoutSec 5 -UseBasicParsing
        Write-Host "✓ $($service.Name) - OK" -ForegroundColor Green
    }
    catch {
        Write-Host "✗ $($service.Name) - Failed" -ForegroundColor Red
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "CTF Challenge Platform is ready!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nAccess Points:" -ForegroundColor Yellow
Write-Host "  Main Application: http://localhost:80"
Write-Host "  Flask API: http://localhost:5000"
Write-Host "  Node.js API: http://localhost:3000"
Write-Host "  Frontend: http://localhost:8081"
Write-Host "`nTo view logs: docker-compose logs -f" -ForegroundColor Yellow
Write-Host "To stop: docker-compose down" -ForegroundColor Yellow
Write-Host "`nCheck VULNERABILITIES.md for exploitation details" -ForegroundColor Cyan
