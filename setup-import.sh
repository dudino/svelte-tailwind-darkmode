#!/bin/bash

# PocketBase Demo Data Import Setup Script

echo "🎭 PocketBase Demo Data Import Setup"
echo "==================================="
echo ""

# Check if Node.js is installed
echo "🔍 Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js is installed: $NODE_VERSION"
else
    echo "❌ Node.js is not installed"
    echo "   Please install Node.js from https://nodejs.org"
    exit 1
fi

# Check if PocketBase is running
echo "🔍 Checking PocketBase server..."
if curl -s http://127.0.0.1:8090/api/health &> /dev/null; then
    echo "✅ PocketBase server is running"
else
    echo "❌ PocketBase server is not running"
    echo "   Please start PocketBase with: ./pocketbase serve"
    echo "   Then run this script again"
    exit 1
fi

echo ""
echo "📦 Installing dependencies..."

# Install PocketBase SDK
if pnpm install pocketbase@^0.21.1 --no-save; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "🚀 Ready to import demo data!"
echo ""
echo "Choose import method:"
echo "1. SDK Import (Recommended) - Uses official PocketBase SDK"
echo "2. API Import - Direct REST API calls"
echo "3. Exit"
echo ""

read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🔧 Starting SDK Import..."
        echo "⚠️  Make sure you have created an admin account at http://127.0.0.1:8090/_/"
        echo "   Default credentials in script: admin@example.com / admin123456"
        echo ""
        read -p "Continue with import? (y/N): " confirm
        if [[ $confirm == [yY] ]]; then
            node import-sdk.js
        fi
        ;;
    2)
        echo ""
        echo "🔧 Starting API Import..."
        echo "⚠️  Make sure you have created an admin account at http://127.0.0.1:8090/_/"
        echo "   Default credentials in script: admin@pocketbase.com / admin123456"
        echo ""
        read -p "Continue with import? (y/N): " confirm
        if [[ $confirm == [yY] ]]; then
            node import-api.js
        fi
        ;;
    3)
        echo "👋 Goodbye!"
        ;;
    *)
        echo "❌ Invalid choice. Please enter 1, 2, or 3."
        ;;
esac

echo ""
echo "🎉 Setup completed!"
