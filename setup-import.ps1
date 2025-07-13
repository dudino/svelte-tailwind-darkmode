#!/usr/bin/env powershell

# PocketBase Demo Data Import Setup Script

Write-Host "PocketBase Demo Data Import Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js is not installed" -ForegroundColor Red
    Write-Host "   Please install Node.js from https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

# Check if PocketBase is running
Write-Host "Checking PocketBase server..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8090/api/health" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "PocketBase server is running" -ForegroundColor Green
    } else {
        throw "PocketBase not responding"
    }
} catch {
    Write-Host "PocketBase server is not running" -ForegroundColor Red
    Write-Host "   Please start PocketBase with: ./pocketbase serve" -ForegroundColor Yellow
    Write-Host "   Then run this script again" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow

# Install dependencies
try {
    npm install pocketbase@^0.21.1 --no-save 2>$null
    Write-Host "Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "Failed to install dependencies" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Ready to import demo data!" -ForegroundColor Green
Write-Host ""
Write-Host "Choose import method:" -ForegroundColor Cyan
Write-Host "1. SDK Import (Recommended) - Uses official PocketBase SDK" -ForegroundColor Yellow
Write-Host "2. API Import - Direct REST API calls" -ForegroundColor Yellow
Write-Host "3. Exit" -ForegroundColor Yellow
Write-Host ""

do {
    $choice = Read-Host "Enter your choice (1-3)"
    
    switch ($choice) {
        "1" {
            Write-Host ""
            Write-Host "Starting SDK Import..." -ForegroundColor Cyan
            Write-Host "Make sure you have created an admin account at http://127.0.0.1:8090/_/" -ForegroundColor Yellow
            Write-Host "   Default credentials in script: admin@example.com / admin123456" -ForegroundColor Yellow
            Write-Host ""
            $confirm = Read-Host "Continue with import? (y/N)"
            if ($confirm -eq "y" -or $confirm -eq "Y") {
                node import-sdk.js
            }
            break
        }
        "2" {
            Write-Host ""
            Write-Host "Starting API Import..." -ForegroundColor Cyan
            Write-Host "Make sure you have created an admin account at http://127.0.0.1:8090/_/" -ForegroundColor Yellow
            Write-Host "   Default credentials in script: admin@pocketbase.com / admin123456" -ForegroundColor Yellow
            Write-Host ""
            $confirm = Read-Host "Continue with import? (y/N)"
            if ($confirm -eq "y" -or $confirm -eq "Y") {
                node import-api.js
            }
            break
        }
        "3" {
            Write-Host "Goodbye!" -ForegroundColor Green
            break
        }
        default {
            Write-Host "Invalid choice. Please enter 1, 2, or 3." -ForegroundColor Red
        }
    }
} while ($choice -ne "1" -and $choice -ne "2" -and $choice -ne "3")

Write-Host ""
Write-Host "Setup completed!" -ForegroundColor Green
