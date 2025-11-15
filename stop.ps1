# Stop all services
Write-Host "Stopping CTF Challenge Platform..." -ForegroundColor Cyan
docker-compose down

Write-Host "`nCleaning up..." -ForegroundColor Yellow
docker-compose down -v

Write-Host "`n✓ All services stopped" -ForegroundColor Green
