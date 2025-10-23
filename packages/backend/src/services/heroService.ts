import fs from 'fs/promises';

export interface HeroPosition {
  number?: string;
  description: string;
  quantity?: string;
  unit?: string;
  price?: string;
  notes?: string;
}

export interface HeroDocument {
  title?: string;
  positions: HeroPosition[];
  totalAmount?: string;
}

/**
 * Parst eine Hero-Vorlage und extrahiert strukturierte Daten
 * @param filePath - Pfad zur Hero-Datei
 * @returns Strukturiertes HeroDocument
 */
export async function parseHeroFile(filePath: string): Promise<HeroDocument> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return parseHeroContent(content);
  } catch (error) {
    console.error('Hero file parsing error:', error);
    throw new Error(
      `Failed to parse Hero file: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Parst Hero-Datei-Inhalt und extrahiert Positionen
 * @param content - Text-Inhalt der Hero-Datei
 * @returns Strukturiertes HeroDocument
 */
export function parseHeroContent(content: string): HeroDocument {
  const lines = content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const document: HeroDocument = {
    positions: [],
  };

  let currentPosition: Partial<HeroPosition> | null = null;
  let inPositionsSection = false;

  for (const line of lines) {
    // Titel erkennen (erste nicht-leere Zeile)
    if (!document.title && !line.match(/^[-=]+$/)) {
      document.title = line;
      continue;
    }

    // Positionen-Sektion erkennen
    if (line.match(/POSITIONEN|LEISTUNGEN|ITEMS/i)) {
      inPositionsSection = true;
      continue;
    }

    // Summen-Zeile erkennen
    const totalMatch = line.match(/(?:SUMME|GESAMT|TOTAL):\s*([\d.,]+)\s*(?:EUR|€)?/i);
    if (totalMatch) {
      document.totalAmount = totalMatch[1];
      continue;
    }

    if (!inPositionsSection) continue;

    // Nummerierte Position erkennen
    const positionMatch = line.match(/^(\d+)\.\s*(.+)/);
    if (positionMatch) {
      // Speichere vorherige Position
      if (currentPosition?.description) {
        document.positions.push(currentPosition as HeroPosition);
      }
      // Starte neue Position
      currentPosition = {
        number: positionMatch[1],
        description: positionMatch[2],
      };
      continue;
    }

    // Attribute der aktuellen Position
    if (currentPosition) {
      // Menge
      const quantityMatch = line.match(/(?:Menge|Anzahl):\s*(\d+(?:[.,]\d+)?)\s*(\w+)?/i);
      if (quantityMatch) {
        currentPosition.quantity = quantityMatch[1];
        currentPosition.unit = quantityMatch[2] || '';
        continue;
      }

      // Preis
      const priceMatch = line.match(/Preis:\s*([\d.,]+)\s*(?:EUR|€)?/i);
      if (priceMatch) {
        currentPosition.price = priceMatch[1];
        continue;
      }

      // Standard-Position, Geschätzt, etc.
      if (line.match(/Standard|Geschätzt|Position/i)) {
        currentPosition.notes = (currentPosition.notes || '') + ' ' + line;
      }
    }
  }

  // Speichere letzte Position
  if (currentPosition?.description) {
    document.positions.push(currentPosition as HeroPosition);
  }

  return document;
}

/**
 * Konvertiert Hero-Positionen zu Text für Vergleich
 * @param document - Strukturiertes HeroDocument
 * @returns Array von Positions-Beschreibungen
 */
export function heroPositionsToTextArray(document: HeroDocument): string[] {
  return document.positions.map(pos => {
    const parts = [pos.description];
    if (pos.quantity && pos.unit) {
      parts.push(`${pos.quantity} ${pos.unit}`);
    }
    if (pos.price) {
      parts.push(`${pos.price} EUR`);
    }
    return parts.join(' | ');
  });
}
