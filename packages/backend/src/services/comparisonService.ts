export interface ComparisonResult {
  matches: Array<{ pdf: string; hero: string; confidence: number }>;
  similar: Array<{ pdf: string; hero: string; similarity: number; confidence: number }>;
  missing: string[];
  additional: string[];
  summary: {
    totalPdfItems: number;
    totalHeroItems: number;
    matchCount: number;
    similarCount: number;
    missingCount: number;
    additionalCount: number;
  };
}

interface BestMatch {
  index: number;
  similarity: number;
  hero: string;
}

/**
 * Vergleicht zwei Dokumente intelligent mit Fuzzy-Matching
 * @param pdfText - Extrahierter Text aus PDF
 * @param heroText - Text aus Hero-Vorlage
 * @returns Detailliertes Vergleichsergebnis
 */
export function compareDocuments(pdfText: string, heroText: string): ComparisonResult {
  const pdfLines = pdfText.split('\n').filter(line => line.trim().length > 0);
  const heroLines = heroText.split('\n').filter(line => line.trim().length > 0);

  const matches: Array<{ pdf: string; hero: string; confidence: number }> = [];
  const similar: Array<{ pdf: string; hero: string; similarity: number; confidence: number }> = [];
  const missing: string[] = [];
  const additional: string[] = [];

  const usedHeroIndices = new Set<number>();

  // Durchlaufe alle PDF-Zeilen
  for (const pdfLine of pdfLines) {
    let bestMatch: BestMatch | null = null;

    // Finde beste Übereinstimmung in Hero-Zeilen
    for (let index = 0; index < heroLines.length; index++) {
      if (usedHeroIndices.has(index)) continue;

      const heroLine = heroLines[index];
      const similarity = calculateAdvancedSimilarity(pdfLine, heroLine);

      if (!bestMatch || similarity > bestMatch.similarity) {
        bestMatch = { index, similarity, hero: heroLine };
      }
    }

    if (bestMatch) {
      if (bestMatch.similarity >= 0.95) {
        // Exakte oder sehr hohe Übereinstimmung
        matches.push({
          pdf: pdfLine,
          hero: bestMatch.hero,
          confidence: Math.round(bestMatch.similarity * 100),
        });
        usedHeroIndices.add(bestMatch.index);
      } else if (bestMatch.similarity >= 0.6) {
        // Ähnliche Übereinstimmung (Fuzzy-Match)
        similar.push({
          pdf: pdfLine,
          hero: bestMatch.hero,
          similarity: bestMatch.similarity,
          confidence: Math.round(bestMatch.similarity * 100),
        });
        usedHeroIndices.add(bestMatch.index);
      } else {
        // Keine ausreichende Übereinstimmung
        missing.push(pdfLine);
      }
    } else {
      missing.push(pdfLine);
    }
  }

  // Finde Hero-Zeilen, die nicht zugeordnet wurden
  heroLines.forEach((heroLine, index) => {
    if (!usedHeroIndices.has(index)) {
      additional.push(heroLine);
    }
  });

  return {
    matches,
    similar,
    missing,
    additional,
    summary: {
      totalPdfItems: pdfLines.length,
      totalHeroItems: heroLines.length,
      matchCount: matches.length,
      similarCount: similar.length,
      missingCount: missing.length,
      additionalCount: additional.length,
    },
  };
}

/**
 * Erweiterte Ähnlichkeitsberechnung mit mehreren Metriken
 */
function calculateAdvancedSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  // Exakte Übereinstimmung
  if (s1 === s2) return 1.0;

  // Levenshtein-Distanz
  const levenshteinScore = calculateSimilarity(str1, str2);

  // Token-basierter Vergleich (Wortübereinstimmung)
  const tokenScore = calculateTokenSimilarity(s1, s2);

  // N-Gram-Ähnlichkeit
  const ngramScore = calculateNGramSimilarity(s1, s2, 2);

  // Gewichteter Durchschnitt
  return levenshteinScore * 0.4 + tokenScore * 0.4 + ngramScore * 0.2;
}

/**
 * Token-basierte Ähnlichkeit (Wortübereinstimmung)
 */
function calculateTokenSimilarity(str1: string, str2: string): number {
  const tokens1 = new Set(str1.split(/\s+/));
  const tokens2 = new Set(str2.split(/\s+/));

  const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
  const union = new Set([...tokens1, ...tokens2]);

  return union.size > 0 ? intersection.size / union.size : 0;
}

/**
 * N-Gram-Ähnlichkeit
 */
function calculateNGramSimilarity(str1: string, str2: string, n: number): number {
  const getNGrams = (str: string): Set<string> => {
    const ngrams = new Set<string>();
    for (let i = 0; i <= str.length - n; i++) {
      ngrams.add(str.substring(i, i + n));
    }
    return ngrams;
  };

  const ngrams1 = getNGrams(str1);
  const ngrams2 = getNGrams(str2);

  const intersection = new Set([...ngrams1].filter(x => ngrams2.has(x)));
  const union = new Set([...ngrams1, ...ngrams2]);

  return union.size > 0 ? intersection.size / union.size : 0;
}

function calculateSimilarity(str1: string, str2: string): number {
  // Simple similarity calculation
  // TODO: Implement Levenshtein distance or other sophisticated algorithm
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) {
    return 1.0;
  }

  const editDistance = getEditDistance(longer.toLowerCase(), shorter.toLowerCase());
  return (longer.length - editDistance) / longer.length;
}

function getEditDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}
