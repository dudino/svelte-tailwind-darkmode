#!/usr/bin/env pwsh
# Automated PocketBase Setup Script
# This script will create collections and demo users automatically

$POCKETBASE_URL = "http://localhost:8090"

Write-Host "Starting automated PocketBase setup..." -ForegroundColor Green
Write-Host ""

# Function to make HTTP requests
function Invoke-PBRequest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Body = @{},
        [hashtable]$Headers = @{"Content-Type" = "application/json"}
    )
    
    $url = "$POCKETBASE_URL$Endpoint"
    
    try {
        if ($Body.Count -gt 0) {
            $jsonBody = $Body | ConvertTo-Json -Depth 10
            $response = Invoke-RestMethod -Uri $url -Method $Method -Body $jsonBody -Headers $Headers
        } else {
            $response = Invoke-RestMethod -Uri $url -Method $Method -Headers $Headers
        }
        return $response
    } catch {
        Write-Host "❌ Error calling $Endpoint : $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Test PocketBase connection
Write-Host "Testing PocketBase connection..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$POCKETBASE_URL/api/health" -Method GET | Out-Null
    Write-Host "✅ PocketBase is running!" -ForegroundColor Green
} catch {
    Write-Host "❌ PocketBase is not running. Please start it first with: .\start-pocketbase.ps1" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Create Users Collection (Auth Collection)
Write-Host "Creating 'users' collection..." -ForegroundColor Yellow

$usersCollection = @{
    name = "users"
    type = "auth"
    schema = @(
        @{
            name = "name"
            type = "text"
            required = $true
            options = @{
                min = 1
                max = 100
            }
        },
        @{
            name = "role"
            type = "select"
            required = $true
            options = @{
                maxSelect = 1
                values = @("admin", "operator", "user")
            }
        },
        @{
            name = "status"
            type = "select"
            required = $true
            options = @{
                maxSelect = 1
                values = @("active", "inactive")
            }
        },
        @{
            name = "phone"
            type = "text"
            required = $false
            options = @{
                min = 0
                max = 20
            }
        }
    )
    options = @{
        allowEmailAuth = $true
        allowUsernameAuth = $false
        allowOAuth2Auth = $false
        requireEmail = $true
        minPasswordLength = 6
    }
}

$result = Invoke-PBRequest -Method "POST" -Endpoint "/api/collections" -Body $usersCollection
if ($result) {
    Write-Host "✅ Users collection created successfully!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Users collection may already exist or there was an error" -ForegroundColor Yellow
}

# Create Clients Collection (Base Collection)
Write-Host "Creating 'clients' collection..." -ForegroundColor Yellow

$clientsCollection = @{
    name = "clients"
    type = "base"
    schema = @(
        @{
            name = "name"
            type = "text"
            required = $true
            options = @{
                min = 1
                max = 100
            }
        },
        @{
            name = "email"
            type = "email"
            required = $false
        },
        @{
            name = "phone"
            type = "text"
            required = $false
            options = @{
                min = 0
                max = 20
            }
        },
        @{
            name = "status"
            type = "select"
            required = $true
            options = @{
                maxSelect = 1
                values = @("active", "inactive", "banned")
            }
        },
        @{
            name = "notes"
            type = "text"
            required = $false
            options = @{
                min = 0
                max = 1000
            }
        }
    )
}

$result = Invoke-PBRequest -Method "POST" -Endpoint "/api/collections" -Body $clientsCollection
if ($result) {
    Write-Host "✅ Clients collection created successfully!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Clients collection may already exist or there was an error" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Creating demo users..." -ForegroundColor Yellow

# Demo users to create
$demoUsers = @(
    @{
        email = "admin@affinity.com"
        password = "admin123"
        passwordConfirm = "admin123"
        name = "System Administrator"
        role = "admin"
        status = "active"
        emailVisibility = $true
    },
    @{
        email = "operator@affinity.com"
        password = "operator123"
        passwordConfirm = "operator123"
        name = "Massage Operator"
        role = "operator"
        status = "active"
        emailVisibility = $true
    },
    @{
        email = "user@affinity.com"
        password = "user123"
        passwordConfirm = "user123"
        name = "Regular User"
        role = "user"
        status = "active"
        emailVisibility = $true
    }
)

# Create each demo user
foreach ($user in $demoUsers) {
    Write-Host "  Creating user: $($user.email)..." -ForegroundColor Cyan
    
    $result = Invoke-PBRequest -Method "POST" -Endpoint "/api/collections/users/records" -Body $user
    if ($result) {
        Write-Host "  ✅ $($user.email) created successfully!" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  $($user.email) may already exist or there was an error" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Testing authentication..." -ForegroundColor Yellow

# Test authentication with admin user
$authTest = @{
    identity = "admin@affinity.com"
    password = "admin123"
}

$authResult = Invoke-PBRequest -Method "POST" -Endpoint "/api/collections/users/auth-with-password" -Body $authTest
if ($authResult) {
    Write-Host "✅ Authentication test successful!" -ForegroundColor Green
    Write-Host "  User: $($authResult.record.name) ($($authResult.record.role))" -ForegroundColor Green
} else {
    Write-Host "❌ Authentication test failed" -ForegroundColor Red
}

Write-Host ""
Write-Host "PocketBase setup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Demo Login Credentials:" -ForegroundColor Yellow
Write-Host "  Admin:    admin@affinity.com    / admin123" -ForegroundColor White
Write-Host "  Operator: operator@affinity.com / operator123" -ForegroundColor White
Write-Host "  User:     user@affinity.com     / user123" -ForegroundColor White
Write-Host ""
Write-Host "Test your app at: http://localhost:5173/login" -ForegroundColor Cyan
Write-Host "PocketBase Admin: http://localhost:8090/_/" -ForegroundColor Cyan
