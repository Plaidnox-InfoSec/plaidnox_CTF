#!/bin/bash

echo "Stopping CTF Challenge Platform..."
docker compose down

echo ""
echo "Cleaning up..."
docker compose down -v

echo ""
echo "✓ All services stopped"
