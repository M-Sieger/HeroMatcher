#!/bin/bash
# Quick Check Script für 360Volt PDF Testing

PDF="$1"
HERO="$2"

if [ -z "$PDF" ] || [ -z "$HERO" ]; then
    echo "Usage: ./quick-check.sh <pdf-file> <hero-file>"
    echo ""
    echo "Example:"
    echo "  ./quick-check.sh test-files/angebot.txt test-files/hero.txt"
    exit 1
fi

if [ ! -f "$PDF" ]; then
    echo "Error: PDF file not found: $PDF"
    exit 1
fi

if [ ! -f "$HERO" ]; then
    echo "Error: Hero file not found: $HERO"
    exit 1
fi

echo "📊 HeroMatcher Quick Comparison Check"
echo "====================================="
echo ""
echo "PDF File:  $PDF"
echo "Hero File: $HERO"
echo ""

# Check if backend is running
if ! curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "❌ Backend is not running!"
    echo ""
    echo "Start backend with:"
    echo "  cd /workspaces/HeroMatcher"
    echo "  npm run dev:backend"
    exit 1
fi

echo "⏳ Running comparison..."

RESULT=$(curl -s -X POST http://localhost:5000/api/compare \
  -F "pdfFile=@$PDF" \
  -F "heroFile=@$HERO" 2>&1)

# Check for errors
if echo "$RESULT" | grep -q "error" && ! echo "$RESULT" | grep -q "result"; then
    echo "❌ Comparison failed!"
    echo ""
    echo "$RESULT" | jq -r '.error // .message' 2>/dev/null || echo "$RESULT"
    exit 1
fi

echo "✅ Comparison completed!"
echo ""

# Parse results
PDF_COUNT=$(echo "$RESULT" | jq -r '.pdfDocument.positionsCount // 0')
HERO_COUNT=$(echo "$RESULT" | jq -r '.heroDocument.positionsCount // 0')
MATCHES=$(echo "$RESULT" | jq -r '.result.summary.matchCount // 0')
SIMILAR=$(echo "$RESULT" | jq -r '.result.summary.similarCount // 0')
MISSING=$(echo "$RESULT" | jq -r '.result.summary.missingCount // 0')
ADDITIONAL=$(echo "$RESULT" | jq -r '.result.summary.additionalCount // 0')

echo "📈 Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PDF Positions:   $PDF_COUNT"
echo "Hero Positions:  $HERO_COUNT"
echo ""
echo "✓ Exact Matches:    $MATCHES"
echo "≈ Similar Matches:  $SIMILAR"
echo "✗ Missing in Hero:  $MISSING"
echo "+ Extra in Hero:    $ADDITIONAL"
echo ""

# Calculate success rate
if [ "$PDF_COUNT" -gt 0 ]; then
    MATCHED=$((MATCHES + SIMILAR))
    SUCCESS_RATE=$((MATCHED * 100 / PDF_COUNT))
    echo "Success Rate: $SUCCESS_RATE% ($MATCHED/$PDF_COUNT)"
    echo ""
fi

# Show sample positions
echo "🔍 Sample Results"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "First PDF Position:"
echo "$RESULT" | jq -r '.pdfDocument.positions[0] // "No positions found"' 2>/dev/null | sed 's/^/  /'
echo ""

if [ "$MATCHES" -gt 0 ]; then
    echo "First Exact Match:"
    echo "$RESULT" | jq -r '.result.matches[0] // "No matches"' 2>/dev/null | sed 's/^/  /'
    echo ""
fi

if [ "$SIMILAR" -gt 0 ]; then
    echo "First Similar Match:"
    echo "$RESULT" | jq -r '.result.similar[0] // "No similar matches"' 2>/dev/null | sed 's/^/  /'
    echo ""
fi

# Save full result
mkdir -p test-results
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
RESULT_FILE="test-results/result-$TIMESTAMP.json"
echo "$RESULT" | jq '.' > "$RESULT_FILE" 2>/dev/null

echo "💾 Full results saved to: $RESULT_FILE"
echo ""
