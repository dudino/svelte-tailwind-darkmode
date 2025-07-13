# Fix displayFields references from nickname to name
$content = Get-Content -Path "pocketbase-collections.json" -Raw
$content = $content -replace '"displayFields": \["nickname"\]', '"displayFields": ["name"]'
$content | Set-Content -Path "pocketbase-collections.json" -NoNewline
