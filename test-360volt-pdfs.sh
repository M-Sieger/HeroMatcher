#!/bin/bash

# 360Volt PDF Testing Script
# Testet HeroMatcher mit echten PDF-Dokumenten

echo "🧪 360Volt PDF Testing Script"
echo "=============================="
echo ""

# Farben für Output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Backend Health Check
echo "1️⃣  Checking Backend Status..."
HEALTH=$(curl -s http://localhost:5000/api/health 2>&1)
if [[ $HEALTH == *"OK"* ]]; then
    echo -e "${GREEN}✓ Backend is running${NC}"
else
    echo -e "${RED}✗ Backend is not running. Start with: npm run dev:backend${NC}"
    exit 1
fi
echo ""

# Funktion zum Testen einer PDF
test_pdf() {
    local PDF_NAME=$1
    local PDF_PATH=$2
    local HERO_PATH=$3
    
    echo "📄 Testing: $PDF_NAME"
    echo "   PDF:  $PDF_PATH"
    echo "   Hero: $HERO_PATH"
    
    if [ ! -f "$PDF_PATH" ]; then
        echo -e "   ${RED}✗ PDF file not found${NC}"
        return 1
    fi
    
    if [ ! -f "$HERO_PATH" ]; then
        echo -e "   ${RED}✗ Hero file not found${NC}"
        return 1
    fi
    
    # API Call
    RESPONSE=$(curl -s -X POST http://localhost:5000/api/compare \
        -F "pdfFile=@$PDF_PATH" \
        -F "heroFile=@$HERO_PATH" 2>&1)
    
    # Check for errors
    if [[ $RESPONSE == *"error"* ]] && [[ $RESPONSE != *"result"* ]]; then
        echo -e "   ${RED}✗ API Error:${NC}"
        echo "$RESPONSE" | jq -r '.error // .message' 2>/dev/null || echo "$RESPONSE"
        return 1
    fi
    
    # Parse Results
    PDF_POSITIONS=$(echo "$RESPONSE" | jq -r '.pdfDocument.positionsCount // 0' 2>/dev/null)
    HERO_POSITIONS=$(echo "$RESPONSE" | jq -r '.heroDocument.positionsCount // 0' 2>/dev/null)
    MATCHES=$(echo "$RESPONSE" | jq -r '.result.summary.matchCount // 0' 2>/dev/null)
    SIMILAR=$(echo "$RESPONSE" | jq -r '.result.summary.similarCount // 0' 2>/dev/null)
    MISSING=$(echo "$RESPONSE" | jq -r '.result.summary.missingCount // 0' 2>/dev/null)
    ADDITIONAL=$(echo "$RESPONSE" | jq -r '.result.summary.additionalCount // 0' 2>/dev/null)
    
    echo -e "   ${GREEN}✓ Comparison completed${NC}"
    echo ""
    echo "   📊 Results:"
    echo "   ├─ PDF Positions:    $PDF_POSITIONS"
    echo "   ├─ Hero Positions:   $HERO_POSITIONS"
    echo "   ├─ Exact Matches:    $MATCHES"
    echo "   ├─ Similar Matches:  $SIMILAR"
    echo "   ├─ Missing in Hero:  $MISSING"
    echo "   └─ Additional Hero:  $ADDITIONAL"
    echo ""
    
    # Show sample positions
    echo "   🔍 Sample PDF Position:"
    echo "$RESPONSE" | jq -r '.pdfDocument.positions[0] // "No positions found"' 2>/dev/null | sed 's/^/      /'
    echo ""
    
    # Save full result
    RESULT_FILE="test-results/result-$(basename $PDF_PATH .txt)-$(date +%Y%m%d-%H%M%S).json"
    mkdir -p test-results
    echo "$RESPONSE" | jq '.' > "$RESULT_FILE" 2>/dev/null
    echo -e "   ${YELLOW}💾 Full results saved to: $RESULT_FILE${NC}"
    echo ""
    
    return 0
}

# Test Cases
echo "2️⃣  Running Test Cases..."
echo ""

# Test 1: 360Volt Angebot vs Hero
test_pdf "360Volt Sample" \
    "test-files/test-360volt-angebot.txt" \
    "test-files/test-360volt-hero.txt"

echo "═══════════════════════════════════════"
echo ""

# Test 2: Table Format
test_pdf "Table Format" \
    "test-files/test-pdf-table.txt" \
    "test-files/test-hero.txt"

echo "═══════════════════════════════════════"
echo ""

# Test 3: Text Format
test_pdf "Text Format" \
    "test-files/test-pdf-text.txt" \
    "test-files/test-hero.txt"

echo ""
echo "✅ Testing Complete!"
echo ""
echo "📁 To upload real PDFs:"
echo "   1. Place PDF files in: test-files/"
echo "   2. Update this script with new test cases"
echo "   3. Run: ./test-360volt-pdfs.sh"
echo ""
