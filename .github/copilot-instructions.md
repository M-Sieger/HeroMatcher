# GitHub Copilot Instructions für HeroMatcher

## 📋 Primary Source of Truth (SoT)

**Wichtigste Dokumente (in dieser Reihenfolge):**

1. `/Projektplan` - Projektplanung und Sprint-Übersicht
2. `/Kontext.md` - Geschäftskontext und Problemstellung
3. `/docs/PRODUCT-VISION.md` - Product Vision und MVP-Anforderungen (falls vorhanden)
4. `/docs/ARCHITECTURE.md` - Architektur-Entscheidungen (falls vorhanden)
5. `/README.md` - Technische Dokumentation und Setup

**Bei Widersprüchen:** Projektplan hat Vorrang vor anderen Dokumenten.

## 🎯 Projekt-Kontext

**Projektname:** HeroMatcher (Angebots-Matcher)

**Hauptziel:** Automatisierung des Vergleichs zwischen unterschriebenen Kundenangeboten (PDF) und Hero-Vorlagen

**Zielgruppe:** Interne Mitarbeiter, die Angebote manuell vergleichen müssen

**Tech-Stack:**

- **Frontend:** React 18 + TypeScript 5 + Vite 5 + Material-UI 5
- **Backend:** Node.js + Express + TypeScript
- **State-Management:** React Context API
- **Testing:** Vitest (Unit) + Cypress (E2E - geplant)
- **OCR:** Tesseract.js
- **Monorepo:** npm Workspaces

## 🏗️ Architektur-Prinzipien

### Code-Qualität

- **TypeScript Strict Mode:** Immer aktiviert, kein `any` verwenden
- **ESLint + Prettier:** Code wird automatisch durch Pre-Commit-Hooks geprüft
- **Conventional Commits:** Commit-Messages im Format `type(scope): message`

### Ordnerstruktur

```
packages/
├── frontend/
│   ├── src/
│   │   ├── components/    # Wiederverwendbare UI-Komponenten
│   │   ├── pages/         # Seiten-Komponenten (Routen)
│   │   ├── services/      # API-Calls und externe Services
│   │   └── App.tsx
│   └── package.json
└── backend/
    ├── src/
    │   ├── routes/        # Express-Routen
    │   ├── services/      # Business-Logic
    │   └── index.ts
    └── package.json
```

### Coding-Standards

**TypeScript:**

- Verwende explizite Typen, keine `any`
- Interfaces für Props und Datenstrukturen
- Nutze Type Guards für Runtime-Checks

**React:**

- Funktionale Komponenten mit TypeScript
- Props-Interfaces immer definieren
- Custom Hooks für wiederverwendbare Logik

**Backend:**

- RESTful API-Design
- Error-Handling in allen Routen
- Input-Validation für alle Endpoints

## 🔧 Workflow-Regeln

### Bei neuen Features

1. ✅ Verstehe User-Story aus `/Projektplan`
2. ✅ Implementiere in entsprechendem Package (frontend/backend)
3. ✅ Schreibe Tests (TODO: Test-Setup in Phase 2)
4. ✅ Dokumentiere komplexe Logik inline (deutsch)
5. ✅ Update README.md falls neue Dependencies/Scripts

### Bei Bug-Fixes

1. ✅ Prüfe bestehende Tests
2. ✅ Reproduziere Bug
3. ✅ Fixe Bug
4. ✅ Validiere mit Tests

### Pre-Commit-Checks

**Automatisch durch Husky:**

- ESLint --fix
- Prettier --write

**Manuell vor Commit:**

- `npm run lint` - Code-Qualität prüfen
- `npm run build` - Build-Fehler vermeiden

## 📝 Kommentar-Stil

**Inline-Kommentare:** Deutsch

```typescript
// Extrahiere Text aus PDF mittels Tesseract OCR
const extractedText = await extractTextFromPDF(filePath);
```

**JSDoc für Public-APIs:** Deutsch

```typescript
/**
 * Vergleicht zwei Dokumente und gibt Übereinstimmungen zurück
 * @param pdfText - Extrahierter Text aus PDF
 * @param heroText - Text aus Hero-Vorlage
 * @returns Vergleichsergebnis mit Matches, Missing, Additional
 */
export function compareDocuments(pdfText: string, heroText: string): ComparisonResult {
  // ...
}
```

## 🚀 Development-Commands

```bash
# Installation
npm install

# Entwicklung
npm run dev              # Beide Server (Frontend + Backend)
npm run dev:frontend     # Nur Frontend (Port 3000)
npm run dev:backend      # Nur Backend (Port 5000)

# Build
npm run build            # Alle Packages
npm run build:frontend   # Nur Frontend
npm run build:backend    # Nur Backend

# Code-Qualität
npm run lint             # ESLint prüfen
npm run format           # Prettier formatieren
npm test                 # Tests (wenn implementiert)
```

## 🎯 MVP-Features (Phase 1-3)

**Aktuelle Phase:** Phase 3 ✅ (Abgeschlossen)
**Nächste Phase:** Phase 2 - Kernfunktionen

### Phase 1: Grundgerüst ✅

- [x] Monorepo-Struktur
- [x] Frontend mit React + TypeScript + Material-UI
- [x] Backend mit Express + TypeScript
- [x] Basis-Upload-Funktionalität
- [x] Pre-Commit Hooks

### Phase 2: Kernfunktionen (Nächste)

- [ ] OCR-Integration mit Tesseract.js
- [ ] Erweiterte PDF-Textextraktion
- [ ] Intelligente Vergleichsalgorithmen (Fuzzy-Matching)
- [ ] Hero-Format-Parser

### Phase 3: UI-Erweiterung

- [ ] Detaillierte Ergebnisvisualisierung
- [ ] Farbcodierung (Grün=Match, Gelb=Ähnlich, Rot=Fehlend)
- [ ] Interaktive Zuordnung
- [ ] Export-Funktionen

## 🔒 Security & Best Practices

**Environment Variables:**

- Nie in Git committen
- `.env.example` als Template bereitstellen
- Dokumentiere alle Variablen

**File Uploads:**

- Max. 10MB Dateigröße
- Nur PDF und definierte Formate erlauben
- Temporäre Dateien nach Verarbeitung löschen

**API-Security:**

- CORS korrekt konfiguriert
- Input-Validation für alle Endpoints
- Error-Messages keine sensitive Daten leaken

## 📊 Testing-Strategie (Geplant)

**Phase 2:**

- Unit-Tests für Services (Vitest)
- Component-Tests für React (Vitest + Testing Library)

**Phase 3:**

- E2E-Tests für kritische Pfade (Cypress)
- Coverage-Ziel: >70%

## 🤝 Zusammenarbeit mit Copilot

**Erwartungen an Copilot:**

1. ✅ Lese `/Projektplan` für Sprint-Kontext
2. ✅ Beachte TypeScript Strict Mode (kein `any`)
3. ✅ Nutze Material-UI Komponenten (Frontend)
4. ✅ Schreibe deutsche Kommentare für komplexe Logik
5. ✅ Validiere Änderungen mit `npm run lint` vor Vorschlag
6. ✅ Erkläre Implementierungs-Entscheidungen kurz

**Bei Unsicherheiten:**

- Frage nach, bevor du rätst
- Verweise auf relevante Dokumente (Projektplan, README)
- Schlage Alternativen vor wenn möglich

## 📚 Wichtige Referenzen

- **Material-UI:** https://mui.com/material-ui/getting-started/
- **React Router:** https://reactrouter.com/
- **Express:** https://expressjs.com/
- **Tesseract.js:** https://tesseract.projectnaptha.com/

## 🔄 Updates

**Letzte Aktualisierung:** 23. Oktober 2025
**Version:** 1.0.0
**Status:** Phase 3 abgeschlossen, Phase 2 startet als nächstes

---

**Hinweis für Copilot:** Diese Datei ist die zentrale Anlaufstelle für Projekt-spezifische Anweisungen. Bei Widersprüchen zu anderen Quellen hat diese Datei Vorrang für Development-Entscheidungen.
