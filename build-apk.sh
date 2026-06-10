#!/bin/bash

# ========================================
# ABC Handicrafts — Android APK Build
# ========================================

set -e

echo ""
echo "=========================================="
echo "  ABC Handicrafts — APK Build"
echo "=========================================="
echo ""

# Check Node
if ! command -v node &> /dev/null; then
  echo "❌ Node.js nahi mila. Install karein: https://nodejs.org"
  exit 1
fi

echo "✅ Node.js: $(node -v)"
echo ""

# Install EAS CLI
echo "📦 Step 1/4: EAS CLI install ho rahi hai..."
npm install -g eas-cli --silent
echo "✅ EAS CLI ready"
echo ""

# Login
echo "🔐 Step 2/4: Expo account mein login karein"
echo "   (Account nahi hai? https://expo.dev/signup — FREE)"
echo ""
eas login
echo ""

echo "⚙️  Step 3/4: eas.json mein apni Firebase keys daalo"
echo "   File: eas.json"
echo "   'YOUR_API_KEY' ki jagah apni actual Firebase values daalo"
echo ""
read -p "   Keys daal diye? (y dabao): " confirm
echo ""

# Build APK
echo "🔨 Step 4/4: APK build ho rahi hai (10-15 min)..."
eas build --platform android --profile preview --non-interactive

echo ""
echo "=========================================="
echo "✅ APK Ready!"
echo ""
echo "Ab kya karein:"
echo "  1. Upar wala download link kholo"
echo "  2. APK apne Android phone mein download karo"
echo "  3. File tap karo → Install"
echo "  4. 'Unknown source' warning aaye toh 'Install anyway' dabao"
echo "=========================================="
echo ""
