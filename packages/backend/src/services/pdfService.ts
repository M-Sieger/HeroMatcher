import fs from 'fs/promises';
import Tesseract from 'tesseract.js';
import path from 'path';

/**
 * Extrahiert Text aus einer PDF-Datei mittels OCR
 * @param filePath - Pfad zur PDF-Datei
 * @returns Extrahierter Text als String
 */
export async function extractTextFromPDF(filePath: string): Promise<string> {
  try {
    const exists = await fs
      .access(filePath)
      .then(() => true)
      .catch(() => false);
    if (!exists) {
      throw new Error(`File not found: ${filePath}`);
    }

    const fileExtension = path.extname(filePath).toLowerCase();

    // Für Text-Dateien: Direkt auslesen (für Tests)
    if (fileExtension === '.txt') {
      const content = await fs.readFile(filePath, 'utf-8');
      return content;
    }

    // Für PDFs und Bilder: OCR mit Tesseract
    if (fileExtension === '.pdf' || ['.png', '.jpg', '.jpeg'].includes(fileExtension)) {
      console.log(`🔍 Starting OCR extraction for: ${filePath}`);

      const result = await Tesseract.recognize(filePath, 'deu+eng', {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      console.log(`✅ OCR extraction completed. Confidence: ${result.data.confidence}%`);
      return result.data.text;
    }

    throw new Error(`Unsupported file format: ${fileExtension}`);
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error(
      `Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Parst extrahierten Text in strukturierte Zeilen
 * @param text - Roher Text aus PDF
 * @returns Array von bereinigten Textzeilen
 */
export function parsePDFItems(text: string): string[] {
  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  return lines;
}

/**
 * Extrahiert Leistungspositionen aus strukturiertem Text
 * Sucht nach Mustern wie: "1. Position", "Menge:", "Preis:"
 */
export interface ParsedPosition {
  number?: string;
  description: string;
  quantity?: string;
  unit?: string;
  price?: string;
}

export function extractPositions(text: string): ParsedPosition[] {
  const positions: ParsedPosition[] = [];
  const lines = parsePDFItems(text);

  let currentPosition: Partial<ParsedPosition> | null = null;

  for (const line of lines) {
    // Ignoriere Summen-Zeilen (z.B. "Summe 1 Beratung, Planung & Service")
    if (/^Summe\s+\d+/i.test(line)) {
      continue;
    }

    // Erkennung von nummerierten Positionen
    // Unterstützt: "Position 1:", "Pos. 1.002:", "1. Beschreibung", "2.001 Beschreibung"
    const positionMatch = line.match(
      /^(?:Position|Pos.?)\s*(\d+(?:\.\d+)?)[.:]\s*(.+)|^(\d+(?:\.\d+)?)[.:]\s*(.+)/i
    );
    if (positionMatch) {
      // Speichere vorherige Position
      if (currentPosition?.description) {
        positions.push(currentPosition as ParsedPosition);
      }
      // Starte neue Position - Handle beide Regex-Gruppen
      const number = positionMatch[1] || positionMatch[3];
      const description = positionMatch[2] || positionMatch[4];
      currentPosition = {
        number,
        description,
      };
      continue;
    }

    // Mengen-Erkennung (erweitert)
    // Unterstützt: "Menge: 50 m³", "1x 1.381,00 €", "1 pauschal"
    const quantityMatch = line.match(
      /(?:Menge|Anzahl):\s*(\d+(?:[.,]\d+)?)\s*(\w+)?|^(\d+)x\s+|^(\d+)\s+(pauschal)/i
    );
    if (quantityMatch && currentPosition) {
      currentPosition.quantity = quantityMatch[1] || quantityMatch[3] || quantityMatch[4] || '1';
      currentPosition.unit = quantityMatch[2] || quantityMatch[5] || '';
      continue;
    }

    // Preis-Erkennung (erweitert)
    const priceMatch = line.match(
      /(?:Preis|EP|GP|Gesamt):\s*([\d.,]+)\s*(?:EUR|€)?|(\d+)x\s+([\d.,]+)\s*€/i
    );
    if (priceMatch && currentPosition) {
      currentPosition.price = priceMatch[1] || priceMatch[3];
      continue;
    }

    // Ignoriere Bullet-Points und "Ihre Vorteile" Sektionen
    if (/^[•·-]\s+/.test(line) || /^Ihre Vorteile:/i.test(line)) {
      // Füge als Beschreibungs-Detail hinzu (optional)
      continue;
    }

    // Falls es eine Fortsetzung der Beschreibung ist (keine neue Position, Menge oder Preis)
    if (currentPosition && !currentPosition.quantity && !currentPosition.price) {
      currentPosition.description += ' ' + line;
    }
  }

  // Speichere letzte Position
  if (currentPosition?.description) {
    positions.push(currentPosition as ParsedPosition);
  }

  return positions;
}

/**
 * Erkennt tabellarische Strukturen im Text
 * Nutzt Layout-Analyse basierend auf Whitespace und Alignment
 */
export interface TableCell {
  content: string;
  column: number;
}

export interface TableRow {
  cells: TableCell[];
  isHeader: boolean;
}

export function detectTableStructure(text: string): TableRow[] {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  const rows: TableRow[] = [];

  for (const line of lines) {
    // Erkenne Zeilen mit mehreren Spalten (durch mehrere Leerzeichen getrennt)
    // Beispiel: "Pos. 1    Erdarbeiten    50 m³    35,00 €    1.750,00 €"
    const cells = line
      .split(/\s{2,}/)
      .map(cell => cell.trim())
      .filter(cell => cell.length > 0);

    if (cells.length > 1) {
      const isHeader = /^(Pos|Position|Nr|Bezeichnung|Menge|Einheit|EP|GP|Preis|Gesamt)/i.test(
        cells[0]
      );

      rows.push({
        cells: cells.map((content, index) => ({ content, column: index })),
        isHeader,
      });
    }
  }

  return rows;
}

/**
 * Konvertiert Tabellen-Struktur in ParsedPositions
 */
export function tableToPositions(table: TableRow[]): ParsedPosition[] {
  const positions: ParsedPosition[] = [];

  // Filtere Header-Zeilen heraus
  const dataRows = table.filter(row => !row.isHeader);

  for (const row of dataRows) {
    const position: ParsedPosition = {
      description: '',
    };

    // Spalten-Mapping basierend auf typischen Layouts
    if (row.cells.length >= 2) {
      // Spalte 0: Nummer (z.B. "1", "Pos. 1")
      const numberMatch = row.cells[0].content.match(/(\d+)/);
      if (numberMatch) {
        position.number = numberMatch[1];
      }

      // Spalte 1: Beschreibung
      position.description = row.cells[1].content;

      // Spalte 2: Menge + Einheit
      if (row.cells.length >= 3) {
        const quantityMatch = row.cells[2].content.match(/(\d+(?:[.,]\d+)?)\s*(\w+)?/);
        if (quantityMatch) {
          position.quantity = quantityMatch[1];
          position.unit = quantityMatch[2] || '';
        }
      }

      // Spalte 3 oder 4: Preis
      if (row.cells.length >= 4) {
        const priceMatch = row.cells[row.cells.length - 1].content.match(/([\d.,]+)/);
        if (priceMatch) {
          position.price = priceMatch[1];
        }
      }

      if (position.description) {
        positions.push(position);
      }
    }
  }

  return positions;
}

/**
 * Intelligente Position-Extraktion mit Tabellenerkennung
 * Kombiniert verschiedene Erkennungsmethoden
 */
export function extractPositionsAdvanced(text: string): ParsedPosition[] {
  // Versuche zuerst Tabellen-Struktur zu erkennen
  const tableStructure = detectTableStructure(text);

  if (tableStructure.length > 0) {
    console.log(`📊 Detected ${tableStructure.length} table rows`);
    const tablePositions = tableToPositions(tableStructure);
    if (tablePositions.length > 0) {
      return tablePositions;
    }
  }

  // Fallback: Standard-Extraktion
  console.log('📝 Using standard position extraction');
  return extractPositions(text);
}
