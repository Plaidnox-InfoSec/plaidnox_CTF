#!/bin/bash

echo "Building CTF Challenge Platform..."
docker compose build

echo ""
echo "Starting all services..."
docker compose up -d

echo ""
echo "Waiting for services to be ready..."
sleep 10

echo ""
echo "Checking service health..."

services=(
    "Flask Backend:http://localhost:5000"
    "Node.js Service:http://localhost:3000"
    "Frontend:http://localhost:8081"
    "Nginx Proxy:http://localhost:80"
)

for service in "${services[@]}"; do
    IFS=':' read -r name url <<< "$service"
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200\|404"; then
        echo "✓ $name - OK"
    else
        echo "✗ $name - Failed"
    fi
done

echo ""
echo "========================================"
echo "CTF Challenge Platform is ready!"
echo "========================================"
echo ""
echo "Access Points:"
echo "  Main Application: http://localhost:80"
echo "  Flask API: http://localhost:5000"
echo "  Node.js API: http://localhost:3000"
echo "  Frontend: http://localhost:8081"
echo ""
echo "To view logs: docker compose logs -f"
echo "To stop: docker compose down"
echo ""
echo "Check VULNERABILITIES.md for exploitation details"
