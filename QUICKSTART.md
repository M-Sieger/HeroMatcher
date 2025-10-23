# 🚀 HeroMatcher - Quick Start Guide

## Status: Phase 3 Abgeschlossen ✅

Beide Server laufen erfolgreich!

## Sofort loslegen

### Option 1: Beide Server gleichzeitig starten

```bash
npm run dev
```

### Option 2: Server einzeln starten

```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

## URLs

| Service      | URL                              | Status       |
| ------------ | -------------------------------- | ------------ |
| Frontend     | http://localhost:3000            | ✅ Läuft     |
| Backend API  | http://localhost:5000            | ✅ Läuft     |
| Health Check | http://localhost:5000/api/health | ✅ Verfügbar |

## Verfügbare Seiten

- **Homepage**: http://localhost:3000/
  - Projektübersicht
  - Feature-Beschreibungen
- **Vergleichsseite**: http://localhost:3000/compare
  - PDF-Upload
  - Hero-Datei-Upload
  - Dokumentenvergleich starten

## API-Endpunkte

### Health Check

```bash
curl http://localhost:5000/api/health
```

Response: `{"status":"OK","message":"HeroMatcher API is running"}`

### File Upload

```bash
POST http://localhost:5000/api/upload
Content-Type: multipart/form-data
Body: file (PDF, text, or JSON)
```

### Dokumentenvergleich

```bash
POST http://localhost:5000/api/compare
Content-Type: multipart/form-data
Body:
  - pdfFile: Unterschriebenes Angebot (PDF)
  - heroFile: Hero-Vorlage
```

## Projekt-Struktur

```
HeroMatcher/
├── packages/
│   ├── frontend/        # React App (Port 3000)
│   └── backend/         # Express API (Port 5000)
├── .husky/              # Git Hooks
├── package.json         # Root Package
└── README.md            # Vollständige Dokumentation
```

## Entwicklung

### Code ändern

- Frontend-Code: `packages/frontend/src/`
- Backend-Code: `packages/backend/src/`
- Hot-Reload ist aktiviert ⚡

### Code-Qualität

```bash
npm run lint      # Code prüfen
npm run format    # Code formatieren
```

### Pre-Commit Hook

- Läuft automatisch bei `git commit`
- Führt ESLint und Prettier aus
- Verhindert fehlerhafte Commits

## Nächste Schritte

### Testen Sie die App:

1. Öffnen Sie http://localhost:3000 im Browser
2. Navigieren Sie zur Vergleichsseite
3. Probieren Sie die Upload-Funktionalität aus

### Implementieren Sie Features:

- OCR-Integration (Phase 2)
- Hero-Format-Parser (Phase 2)
- Erweiterte Vergleichsalgorithmen (Phase 2)
- Ergebnisvisualisierung (Phase 3)

## Hilfe

Bei Fragen oder Problemen:

1. Prüfen Sie die Konsole auf Fehler
2. Lesen Sie die vollständige Dokumentation in `README.md`
3. Schauen Sie in `PHASE3_COMPLETE.md` für Details

## 🎉 Viel Erfolg!

Das Projekt-Skeleton ist bereit. Alle Grundlagen sind implementiert.
Jetzt können Sie mit der Entwicklung der Kernfunktionen beginnen!
