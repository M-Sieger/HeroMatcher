# 360Volt PDF Testing Guide

## 🎯 Ziel

Test von HeroMatcher mit echten 360Volt PDF-Dokumenten

## 📋 Voraussetzungen

1. **Backend läuft**

   ```bash
   cd /workspaces/HeroMatcher
   npm run dev:backend
   ```

   Backend sollte auf http://localhost:5000 laufen

2. **Test-Dateien vorhanden**
   - Kundenangebot (PDF oder TXT): `test-files/test-360volt-angebot.txt`
   - Hero-Vorlage (TXT): `test-files/test-360volt-hero.txt`

## 🧪 Test-Szenarien

### Scenario 1: Basis-Vergleich mit existierenden Test-Dateien

```bash
curl -X POST http://localhost:5000/api/compare \
  -F "pdfFile=@test-files/test-360volt-angebot.txt" \
  -F "heroFile=@test-files/test-360volt-hero.txt" \
  | jq '.'
```

**Erwartetes Ergebnis:**

- PDF-Positionen extrahiert (3 Positionen: 6, 7, 8)
- Hero-Positionen extrahiert (3 Positionen: 1.002, 2.001, 2.002)
- Vergleichsergebnis mit Matches/Similar/Missing

### Scenario 2: Nur PDF-Positionen anzeigen

```bash
curl -X POST http://localhost:5000/api/compare \
  -F "pdfFile=@test-files/test-360volt-angebot.txt" \
  -F "heroFile=@test-files/test-360volt-hero.txt" \
  | jq '.pdfDocument.positions'
```

**Check:**

- [ ] Position 6: Schichtspeicher 500l erkannt?
- [ ] Preis 1.381,00 € extrahiert?
- [ ] Position 7: Heizungswasseraufbereitung erkannt?
- [ ] Position 8: Installationskomponenten erkannt?

### Scenario 3: Vergleichs-Summary anzeigen

```bash
curl -X POST http://localhost:5000/api/compare \
  -F "pdfFile=@test-files/test-360volt-angebot.txt" \
  -F "heroFile=@test-files/test-360volt-hero.txt" \
  | jq '.result.summary'
```

**Check:**

- [ ] `matchCount`: Anzahl exakter Übereinstimmungen
- [ ] `similarCount`: Anzahl ähnlicher Positionen
- [ ] `missingCount`: Positionen nur im PDF
- [ ] `additionalCount`: Positionen nur in Hero

### Scenario 4: Matches im Detail

```bash
curl -X POST http://localhost:5000/api/compare \
  -F "pdfFile=@test-files/test-360volt-angebot.txt" \
  -F "heroFile=@test-files/test-360volt-hero.txt" \
  | jq '.result.matches'
```

**Check:**

- [ ] Welche Positionen wurden als exakte Matches erkannt?
- [ ] Confidence-Scores > 95%?

### Scenario 5: Similar Matches (Fuzzy)

```bash
curl -X POST http://localhost:5000/api/compare \
  -F "pdfFile=@test-files/test-360volt-angebot.txt" \
  -F "heroFile=@test-files/test-360volt-hero.txt" \
  | jq '.result.similar'
```

**Check:**

- [ ] Welche Positionen sind ähnlich?
- [ ] Similarity-Scores zwischen 60-95%?
- [ ] Sinnvolle Zuordnungen?

## 📁 Echte PDFs testen

### Schritt 1: PDF vorbereiten

1. **Option A: PDF direkt hochladen**

   ```bash
   # Ersetze DEIN-PDF.pdf mit deinem Dateinamen
   curl -X POST http://localhost:5000/api/compare \
     -F "pdfFile=@test-files/DEIN-PDF.pdf" \
     -F "heroFile=@test-files/test-360volt-hero.txt" \
     | jq '.' > results/test-result.json
   ```

2. **Option B: PDF → Text konvertieren** (für bessere Kontrolle)

   ```bash
   # Mit pdftotext (falls installiert)
   pdftotext test-files/DEIN-PDF.pdf test-files/DEIN-PDF.txt

   # Dann testen
   curl -X POST http://localhost:5000/api/compare \
     -F "pdfFile=@test-files/DEIN-PDF.txt" \
     -F "heroFile=@test-files/test-360volt-hero.txt" \
     | jq '.' > results/test-result.json
   ```

### Schritt 2: Hero-Vorlage vorbereiten

1. Hero-Entwurfsansicht öffnen
2. Relevante Positionen kopieren
3. Als TXT-Datei speichern in `test-files/hero-vorlage.txt`
4. Format wie in `test-360volt-hero.txt`

### Schritt 3: Vergleich durchführen

```bash
curl -X POST http://localhost:5000/api/compare \
  -F "pdfFile=@test-files/DEIN-PDF.txt" \
  -F "heroFile=@test-files/hero-vorlage.txt" \
  | jq '.' > results/comparison-$(date +%Y%m%d-%H%M%S).json
```

## 🔍 Ergebnisse analysieren

### Quick-Check Script

```bash
#!/bin/bash
# save as: quick-check.sh

PDF="$1"
HERO="$2"

if [ -z "$PDF" ] || [ -z "$HERO" ]; then
    echo "Usage: ./quick-check.sh <pdf-file> <hero-file>"
    exit 1
fi

echo "📊 Quick Comparison Check"
echo "========================="

RESULT=$(curl -s -X POST http://localhost:5000/api/compare \
  -F "pdfFile=@$PDF" \
  -F "heroFile=@$HERO")

echo "PDF Positions:  $(echo $RESULT | jq -r '.pdfDocument.positionsCount')"
echo "Hero Positions: $(echo $RESULT | jq -r '.heroDocument.positionsCount')"
echo ""
echo "✓ Exact Matches:  $(echo $RESULT | jq -r '.result.summary.matchCount')"
echo "≈ Similar Matches: $(echo $RESULT | jq -r '.result.summary.similarCount')"
echo "✗ Missing in Hero: $(echo $RESULT | jq -r '.result.summary.missingCount')"
echo "+ Extra in Hero:   $(echo $RESULT | jq -r '.result.summary.additionalCount')"
```

Usage:

```bash
chmod +x quick-check.sh
./quick-check.sh test-files/angebot.txt test-files/hero.txt
```

## 🐛 Troubleshooting

### Backend läuft nicht

```bash
cd /workspaces/HeroMatcher
npm run dev:backend
```

### Port 5000 bereits belegt

```bash
lsof -ti:5000 | xargs kill -9
```

### PDF-Upload-Fehler

- Max. Dateigröße: 10MB
- Unterstützte Formate: PDF, PNG, JPG, TXT
- Prüfe Datei-Pfad und -Namen

### Keine Positionen erkannt

1. Öffne PDF in Editor
2. Prüfe Format (Tabelle vs. Fließtext)
3. Checke ob Positions-Nummern erkennbar sind (Pos., Position, 1., 1.002, etc.)
4. Schaue in Backend-Logs nach OCR-Output

## 📝 Test-Protokoll

Date: ******\_\_\_******
Tester: ******\_\_\_******

### Test-Datei Details

- PDF: ******\_\_\_******
- Hero: ******\_\_\_******
- PDF Positions erkannt: **\_** / **\_**
- Hero Positions erkannt: **\_** / **\_**

### Qualität der Zuordnung

- Exact Matches: **\_** ✓
- Similar Matches: **\_** ≈
- False Positives: **\_** ✗
- Missing Positions: **\_** ?

### Notizen

```
_______________________________________
_______________________________________
_______________________________________
```

### Verbesserungsvorschläge

```
_______________________________________
_______________________________________
_______________________________________
```

## ✅ Akzeptanzkriterien

- [ ] Backend startet ohne Fehler
- [ ] PDF-Upload funktioniert (< 10MB)
- [ ] Positionen werden extrahiert (min. 50% erkannt)
- [ ] Vergleich liefert Ergebnisse
- [ ] Matches haben sinnvolle Confidence-Scores
- [ ] Similar Matches sind nachvollziehbar
- [ ] Missing Positions werden korrekt identifiziert
- [ ] Ergebnis ist hilfreich für manuelle Nachbearbeitung

## 🚀 Nächste Schritte nach erfolgreichem Test

1. **Feedback sammeln**: Was funktioniert gut? Was nicht?
2. **Edge-Cases dokumentieren**: Welche PDF-Formate machen Probleme?
3. **Synonym-Liste erweitern**: Welche Begriffe sollten als gleich erkannt werden?
4. **UI verbessern**: Frontend für einfacheren Upload/Vergleich
5. **Export-Funktion**: Ergebnisse als Excel/CSV für Hero-Import
