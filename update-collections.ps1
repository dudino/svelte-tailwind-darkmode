# Update PocketBase Collections with Enhanced Data Structure
# This script updates the PocketBase collections with the new comprehensive structure

$POCKETBASE_URL = "http://localhost:8090"
$ADMIN_EMAIL = "admin@admin.com"
$ADMIN_PASSWORD = "1234567890"

Write-Host "🔄 Updating PocketBase Collections..." -ForegroundColor Cyan

# Function to authenticate and get token
function Get-AuthToken {
    try {
        $authBody = @{
            identity = $ADMIN_EMAIL
            password = $ADMIN_PASSWORD
        } | ConvertTo-Json

        $authResponse = Invoke-RestMethod -Uri "$POCKETBASE_URL/api/admins/auth-with-password" -Method POST -Body $authBody -ContentType "application/json"
        return $authResponse.token
    }
    catch {
        Write-Host "❌ Failed to authenticate with PocketBase admin" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        exit 1
    }
}

# Function to delete existing collections
function Remove-ExistingCollections {
    param($token)
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }

    # Get all collections
    try {
        $collections = Invoke-RestMethod -Uri "$POCKETBASE_URL/api/collections" -Method GET -Headers $headers
        
        # Delete non-auth collections (keep the users collection)
        foreach ($collection in $collections.items) {
            if ($collection.type -ne "auth") {
                Write-Host "🗑️ Deleting collection: $($collection.name)" -ForegroundColor Yellow
                try {
                    Invoke-RestMethod -Uri "$POCKETBASE_URL/api/collections/$($collection.id)" -Method DELETE -Headers $headers
                    Write-Host "✅ Deleted collection: $($collection.name)" -ForegroundColor Green
                }
                catch {
                    Write-Host "⚠️ Could not delete collection $($collection.name): $($_.Exception.Message)" -ForegroundColor Yellow
                }
            }
        }
    }
    catch {
        Write-Host "⚠️ Could not fetch existing collections: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Function to create/update collections
function Update-Collections {
    param($token)
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }

    # Read the collections JSON file
    $collectionsJson = Get-Content -Path "pocketbase-collections.json" -Raw
    $collections = $collectionsJson | ConvertFrom-Json

    foreach ($collection in $collections) {
        Write-Host "🔄 Processing collection: $($collection.name)" -ForegroundColor Cyan
        
        try {
            # Check if collection exists
            $existingCollection = $null
            try {
                if ($collection.type -eq "auth") {
                    $existingCollection = Invoke-RestMethod -Uri "$POCKETBASE_URL/api/collections/_pb_users_auth_" -Method GET -Headers $headers
                } else {
                    $existingCollection = Invoke-RestMethod -Uri "$POCKETBASE_URL/api/collections/$($collection.name)" -Method GET -Headers $headers
                }
            }
            catch {
                # Collection doesn't exist, will create it
            }

            $collectionBody = $collection | ConvertTo-Json -Depth 10

            if ($existingCollection) {
                # Update existing collection
                Write-Host "📝 Updating collection: $($collection.name)" -ForegroundColor Blue
                $updateUrl = "$POCKETBASE_URL/api/collections/$($existingCollection.id)"
                $response = Invoke-RestMethod -Uri $updateUrl -Method PATCH -Body $collectionBody -Headers $headers
                Write-Host "✅ Updated collection: $($collection.name)" -ForegroundColor Green
            } else {
                # Create new collection
                Write-Host "➕ Creating collection: $($collection.name)" -ForegroundColor Blue
                $response = Invoke-RestMethod -Uri "$POCKETBASE_URL/api/collections" -Method POST -Body $collectionBody -Headers $headers
                Write-Host "✅ Created collection: $($collection.name)" -ForegroundColor Green
            }
        }
        catch {
            Write-Host "❌ Failed to process collection $($collection.name): $($_.Exception.Message)" -ForegroundColor Red
            if ($_.Exception.Response) {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                $responseBody = $reader.ReadToEnd()
                Write-Host "Response: $responseBody" -ForegroundColor Red
            }
        }
    }
}

# Function to create sample data
function Create-SampleData {
    param($token)
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }

    Write-Host "📊 Creating sample data..." -ForegroundColor Cyan

    # Create sample location
    try {
        $locationData = @{
            name = "Main Spa Location"
            address = "123 Wellness Street"
            city = "Prague"
            postal_code = "10000"
            country = "Czech Republic"
            is_active = $true
        }
        $locationResponse = Invoke-RestMethod -Uri "$POCKETBASE_URL/api/collections/locations/records" -Method POST -Body ($locationData | ConvertTo-Json) -Headers $headers
        $locationId = $locationResponse.id
        Write-Host "✅ Created sample location" -ForegroundColor Green

        # Create sample room
        $roomData = @{
            location_id = $locationId
            name = "Deluxe Suite 1"
            type = "regular"
            capacity = 2
            amenities = @("shower", "sauna", "air_conditioning", "music_system")
            hourly_rate = 150
            is_active = $true
        }
        $roomResponse = Invoke-RestMethod -Uri "$POCKETBASE_URL/api/collections/rooms/records" -Method POST -Body ($roomData | ConvertTo-Json) -Headers $headers
        Write-Host "✅ Created sample room" -ForegroundColor Green

        # Create sample services
        $services = @(
            @{
                name = "Swedish Massage"
                description = "Relaxing full body massage"
                duration_minutes = 60
                price = 80
                category = "massage"
                is_active = $true
            },
            @{
                name = "Hot Stone Therapy"
                description = "Therapeutic hot stone massage"
                duration_minutes = 90
                price = 120
                category = "therapy"
                is_active = $true
            }
        )

        foreach ($service in $services) {
            $serviceResponse = Invoke-RestMethod -Uri "$POCKETBASE_URL/api/collections/services/records" -Method POST -Body ($service | ConvertTo-Json) -Headers $headers
        }
        Write-Host "✅ Created sample services" -ForegroundColor Green

        # Create sample client
        $clientData = @{
            phone_number = "+420123456789"
            channel = "whatsapp"
            nickname = "John D."
            first_name = "John"
            last_name = "Doe"
            email = "john.doe@example.com"
            preferred_language = "en"
            description = "Regular client, prefers morning appointments"
            is_blocked = $false
            total_visits = 0
        }
        $clientResponse = Invoke-RestMethod -Uri "$POCKETBASE_URL/api/collections/clients/records" -Method POST -Body ($clientData | ConvertTo-Json) -Headers $headers
        Write-Host "✅ Created sample client" -ForegroundColor Green

    }
    catch {
        Write-Host "⚠️ Could not create all sample data: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Main execution
try {
    # Test PocketBase connection
    try {
        Invoke-RestMethod -Uri "$POCKETBASE_URL/api/health" -Method GET -TimeoutSec 5
        Write-Host "✅ PocketBase is running at $POCKETBASE_URL" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Cannot connect to PocketBase at $POCKETBASE_URL" -ForegroundColor Red
        Write-Host "Please ensure PocketBase is running with: .\pocketbase.exe serve" -ForegroundColor Yellow
        exit 1
    }

    # Get auth token
    $token = Get-AuthToken
    Write-Host "✅ Authenticated successfully" -ForegroundColor Green

    # Remove existing collections (except users)
    Remove-ExistingCollections -token $token

    # Update collections with new structure
    Update-Collections -token $token

    # Create sample data
    Create-SampleData -token $token

    Write-Host ""
    Write-Host "🎉 Collections updated successfully!" -ForegroundColor Green
    Write-Host "📊 PocketBase Admin UI: $POCKETBASE_URL/_/" -ForegroundColor Cyan
    Write-Host "🔑 Admin Login: $ADMIN_EMAIL / $ADMIN_PASSWORD" -ForegroundColor Cyan
}
catch {
    Write-Host "❌ Script failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
