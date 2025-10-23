# HeroMatcher 🧩

Automatischer Vergleich zwischen unterschriebenen Angeboten und Hero-Vorlagen

## 📋 Projektübersicht

HeroMatcher ist eine Webanwendung zur Automatisierung des Vergleichs zwischen unterschriebenen Kundenangeboten (PDF) und Hero-Vorlagen. Die Anwendung extrahiert Text aus PDFs mittels OCR, strukturiert die Daten und visualisiert Übereinstimmungen, Unterschiede und fehlende Positionen.

## 🏗️ Architektur

Dieses Projekt verwendet eine **Monorepo-Struktur** mit zwei Hauptpaketen:

- **Frontend**: React + TypeScript + Material-UI + Vite
- **Backend**: Node.js + Express + TypeScript

### Technologie-Stack

#### Frontend

- ⚛️ React 18 mit TypeScript
- 🎨 Material-UI (MUI) für UI-Komponenten
- ⚡ Vite als Build-Tool
- 🧭 React Router für Navigation
- 📄 PDF.js für PDF-Rendering

#### Backend

- 🟢 Node.js mit Express
- 📝 TypeScript
- 📤 Multer für File-Uploads
- 🔍 PDF-Parse für Textextraktion
- 🔬 Tesseract.js für OCR

## 🚀 Schnellstart

### Voraussetzungen

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

1. Repository klonen und Dependencies installieren:

```bash
npm install
```

Dies installiert alle Dependencies für das Root-Projekt sowie für Frontend und Backend.

### Entwicklung

1. **Beide Services gleichzeitig starten:**

```bash
npm run dev
```

Dies startet:

- Frontend auf http://localhost:3000
- Backend auf http://localhost:5000

2. **Services einzeln starten:**

```bash
# Nur Frontend
npm run dev:frontend

# Nur Backend
npm run dev:backend
```

### Build

```bash
# Alle Pakete bauen
npm run build

# Einzelne Pakete bauen
npm run build:frontend
npm run build:backend
```

## 📁 Projektstruktur

```
HeroMatcher/
├── packages/
│   ├── frontend/              # React Frontend
│   │   ├── src/
│   │   │   ├── components/    # Wiederverwendbare Komponenten
│   │   │   ├── pages/         # Seiten-Komponenten
│   │   │   ├── App.tsx        # Haupt-App-Komponente
│   │   │   └── main.tsx       # Entry Point
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   │
│   └── backend/               # Express Backend
│       ├── src/
│       │   ├── routes/        # API-Routen
│       │   ├── services/      # Business Logic
│       │   └── index.ts       # Server Entry Point
│       ├── uploads/           # Temporäre Datei-Uploads
│       ├── package.json
│       └── tsconfig.json
│
├── .eslintrc.json            # ESLint-Konfiguration
├── .prettierrc               # Prettier-Konfiguration
├── .lintstagedrc.json        # Lint-Staged-Konfiguration
├── package.json              # Root package.json mit Workspaces
├── tsconfig.json             # Root TypeScript-Konfiguration
└── README.md
```

## 🧪 Testing

```bash
npm run test
```

## 🎨 Code-Qualität

### Linting

```bash
npm run lint
```

### Formatierung

```bash
npm run format
```

### Pre-Commit Hooks

Das Projekt verwendet Husky und lint-staged für automatische Code-Qualitätsprüfungen vor jedem Commit:

- ESLint für Code-Linting
- Prettier für Code-Formatierung

## 🔧 API-Endpunkte

### Health Check

```
GET /api/health
```

### Datei-Upload

```
POST /api/upload
Content-Type: multipart/form-data
Body: file (PDF, text, or JSON)
```

### Dokumente vergleichen

```
POST /api/compare
Content-Type: multipart/form-data
Body:
  - pdfFile: Unterschriebenes Angebot (PDF)
  - heroFile: Hero-Vorlage
```

## 📝 Entwicklungs-Roadmap

### Phase 1: Grundgerüst ✅

- [x] Monorepo-Struktur aufsetzen
- [x] Frontend mit React + TypeScript + Material-UI
- [x] Backend mit Express + TypeScript
- [x] Basis-Upload-Funktionalität
- [x] Pre-Commit Hooks

### Phase 2: Kernfunktionen (In Arbeit)

- [ ] OCR-Integration mit Tesseract.js
- [ ] Erweiterte PDF-Textextraktion
- [ ] Intelligente Vergleichsalgorithmen
- [ ] Hero-Format-Parser

### Phase 3: UI-Erweiterung

- [ ] Detaillierte Ergebnisvisualisierung
- [ ] Interaktive Zuordnung
- [ ] Export-Funktionen
- [ ] Responsive Design

## 🤝 Beitragen

1. Fork das Repository
2. Erstelle einen Feature-Branch (`git checkout -b feature/AmazingFeature`)
3. Committe deine Änderungen (`git commit -m 'Add some AmazingFeature'`)
4. Pushe zum Branch (`git push origin feature/AmazingFeature`)
5. Öffne einen Pull Request

## 📄 Lizenz

MIT License - siehe LICENSE-Datei für Details

## 👥 Autoren

- Entwickelt für die Optimierung des Angebotsvergleichs-Prozesses
