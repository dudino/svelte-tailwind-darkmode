#!/usr/bin/env pwsh
# Quick User Creation Script for PocketBase
# Usage: .\create-user.ps1 -Email "test@example.com" -Password "password123" -Name "Test User" -Role "user"

param(
    [Parameter(Mandatory=$true)]
    [string]$Email,
    
    [Parameter(Mandatory=$true)]
    [string]$Password,
    
    [Parameter(Mandatory=$true)]
    [string]$Name,
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("admin", "operator", "user")]
    [string]$Role = "user",
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("active", "inactive")]
    [string]$Status = "active"
)

$POCKETBASE_URL = "http://localhost:8090"

Write-Host "Creating user: $Email..." -ForegroundColor Yellow

$userData = @{
    email = $Email
    password = $Password
    passwordConfirm = $Password
    name = $Name
    role = $Role
    status = $Status
    emailVisibility = $true
}

try {
    $jsonBody = $userData | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$POCKETBASE_URL/api/collections/users/records" -Method POST -Body $jsonBody -Headers @{"Content-Type" = "application/json"}
    
    Write-Host "✅ User created successfully!" -ForegroundColor Green
    Write-Host "  ID: $($response.id)" -ForegroundColor White
    Write-Host "  Email: $($response.email)" -ForegroundColor White
    Write-Host "  Name: $($response.name)" -ForegroundColor White
    Write-Host "  Role: $($response.role)" -ForegroundColor White
    Write-Host "  Status: $($response.status)" -ForegroundColor White
    
} catch {
    Write-Host "❌ Error creating user: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "   This usually means the email already exists or validation failed." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Test login at: http://localhost:5173/login" -ForegroundColor Cyan
