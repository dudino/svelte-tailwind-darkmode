# PowerShell script to fix all displayFields references
param()

$filePath = "pocketbase-collections.json"
$content = Get-Content -Path $filePath -Raw

# Replace all remaining displayFields references from nickname to name for users collection
$content = $content -replace '"displayFields": \["nickname"\]', '"displayFields": ["name"]'

# Write back to file
$content | Set-Content -Path $filePath -NoNewline

Write-Host "✅ Fixed all displayFields references from 'nickname' to 'name'"
