export interface ComparisonResult {
  matches: string[];
  similar: Array<{ pdf: string; hero: string; similarity: number }>;
  missing: string[];
  additional: string[];
}

export function compareDocuments(pdfText: string, heroText: string): ComparisonResult {
  // Simple comparison logic - to be enhanced with fuzzy matching
  const pdfLines = pdfText.split('\n').filter(line => line.trim().length > 0);
  const heroLines = heroText.split('\n').filter(line => line.trim().length > 0);

  const matches: string[] = [];
  const missing: string[] = [];
  const similar: Array<{ pdf: string; hero: string; similarity: number }> = [];
  const additional: string[] = [];

  // Exact matches
  pdfLines.forEach(pdfLine => {
    if (heroLines.includes(pdfLine)) {
      matches.push(pdfLine);
    } else {
      // Check for similar items (simple implementation)
      const similarItem = findSimilar(pdfLine, heroLines);
      if (similarItem) {
        similar.push({
          pdf: pdfLine,
          hero: similarItem.line,
          similarity: similarItem.score,
        });
      } else {
        missing.push(pdfLine);
      }
    }
  });

  // Items in Hero but not in PDF
  heroLines.forEach(heroLine => {
    if (!matches.includes(heroLine) && !similar.some(s => s.hero === heroLine)) {
      additional.push(heroLine);
    }
  });

  return {
    matches,
    similar,
    missing,
    additional,
  };
}

function findSimilar(text: string, candidates: string[]): { line: string; score: number } | null {
  // Simple similarity check using Levenshtein-like approach
  // TODO: Implement proper fuzzy matching
  let bestMatch: { line: string; score: number } | null = null;
  const threshold = 0.7;

  candidates.forEach(candidate => {
    const score = calculateSimilarity(text, candidate);
    if (score > threshold && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { line: candidate, score };
    }
  });

  return bestMatch;
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
