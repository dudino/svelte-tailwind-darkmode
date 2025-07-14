#!/usr/bin/env pwsh
# PocketBase Startup Script for TimeIt Application

Write-Host "Starting PocketBase server..." -ForegroundColor Green
Write-Host "Admin UI will be available at: http://localhost:8090/_/" -ForegroundColor Yellow
Write-Host "API will be available at: http://localhost:8090/api/" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Red
Write-Host ""

# Start PocketBase
.\pocketbase\pocketbase.exe serve --http="0.0.0.0:8090"
