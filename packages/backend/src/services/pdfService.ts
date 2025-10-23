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
    // Erkennung von nummerierten Positionen (z.B. "1. Installationskomponenten")
    const positionMatch = line.match(/^(\d+)\.\s*(.+)/);
    if (positionMatch) {
      // Speichere vorherige Position
      if (currentPosition?.description) {
        positions.push(currentPosition as ParsedPosition);
      }
      // Starte neue Position
      currentPosition = {
        number: positionMatch[1],
        description: positionMatch[2],
      };
      continue;
    }

    // Mengen-Erkennung
    const quantityMatch = line.match(/Menge:\s*(\d+(?:[.,]\d+)?)\s*(\w+)?/i);
    if (quantityMatch && currentPosition) {
      currentPosition.quantity = quantityMatch[1];
      currentPosition.unit = quantityMatch[2] || '';
      continue;
    }

    // Preis-Erkennung
    const priceMatch = line.match(/Preis:\s*([\d.,]+)\s*(?:EUR|€)?/i);
    if (priceMatch && currentPosition) {
      currentPosition.price = priceMatch[1];
      continue;
    }
  }

  // Speichere letzte Position
  if (currentPosition?.description) {
    positions.push(currentPosition as ParsedPosition);
  }

  return positions;
}
