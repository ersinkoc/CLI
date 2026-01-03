/**
 * Levenshtein distance algorithm
 * Measures the minimum number of single-character edits needed to change one string into another
 *
 * @example
 * ```typescript
 * levenshtein('kitten', 'sitting'); // 3
 * levenshtein('Saturday', 'Sunday'); // 3
 * ```
 */

/**
 * Calculate Levenshtein distance between two strings
 *
 * @param a - First string
 * @param b - Second string
 * @returns Number of edits required to transform a into b
 *
 * @example
 * ```typescript
 * levenshtein('hello', 'hello'); // 0
 * levenshtein('hello', 'hallo'); // 1
 * levenshtein('hello', 'world'); // 4
 * ```
 */
export function levenshtein(a: string, b: string): number {
  // Handle empty strings
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  // Create a matrix
  const matrix: number[][] = [];

  // Initialize first row and column
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        // Characters match, no edit needed
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        // Take minimum of:
        // - deletion (matrix[i][j-1] + 1)
        // - insertion (matrix[i-1][j] + 1)
        // - substitution (matrix[i-1][j-1] + 1)
        matrix[i][j] = Math.min(
          matrix[i][j - 1] + 1, // deletion
          matrix[i - 1][j] + 1, // insertion
          matrix[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calculate normalized Levenshtein distance (0 to 1)
 *
 * @param a - First string
 * @param b - Second string
 * @returns Normalized distance where 0 is identical and 1 is completely different
 *
 * @example
 * ```typescript
 * levenshteinNormalized('hello', 'hello'); // 0
 * levenshteinNormalized('hello', 'world'); // 0.8
 * ```
 */
export function levenshteinNormalized(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 0;
  return levenshtein(a, b) / maxLen;
}

/**
 * Calculate similarity ratio (0 to 1)
 *
 * @param a - First string
 * @param b - Second string
 * @returns Similarity ratio where 1 is identical and 0 is completely different
 *
 * @example
 * ```typescript
 * levenshteinSimilarity('hello', 'hello'); // 1
 * levenshteinSimilarity('hello', 'hallo'); // 0.8
 * levenshteinSimilarity('hello', 'world'); // 0.2
 * ```
 */
export function levenshteinSimilarity(a: string, b: string): number {
  return 1 - levenshteinNormalized(a, b);
}

/**
 * Find the best match from a list of candidates
 *
 * @param target - Target string
 * @param candidates - List of candidate strings
 * @param threshold - Minimum similarity threshold (default: 0.6)
 * @returns Best matching candidate or undefined if below threshold
 *
 * @example
 * ```typescript
 * findBestMatch('instll', ['install', 'uninstall', 'update']); // 'install'
 * findBestMatch('xyz', ['install', 'uninstall', 'update']); // undefined
 * ```
 */
export function findBestMatch(
  target: string,
  candidates: string[],
  threshold = 0.6
): string | undefined {
  let bestMatch: string | undefined;
  let bestScore = 0;

  for (const candidate of candidates) {
    const score = levenshteinSimilarity(target.toLowerCase(), candidate.toLowerCase());
    if (score > bestScore && score >= threshold) {
      bestScore = score;
      bestMatch = candidate;
    }
  }

  return bestMatch;
}

/**
 * Find all matches above a threshold
 *
 * @param target - Target string
 * @param candidates - List of candidate strings
 * @param threshold - Minimum similarity threshold (default: 0.6)
 * @returns Array of matching candidates sorted by similarity
 *
 * @example
 * ```typescript
 * findAllMatches('config', ['configure', 'context', 'conflict', 'test'], 0.5);
 * // ['configure', 'context', 'conflict']
 * ```
 */
export function findAllMatches(
  target: string,
  candidates: string[],
  threshold = 0.6
): Array<{ candidate: string; score: number }> {
  const matches: Array<{ candidate: string; score: number }> = [];

  for (const candidate of candidates) {
    const score = levenshteinSimilarity(target.toLowerCase(), candidate.toLowerCase());
    if (score >= threshold) {
      matches.push({ candidate, score });
    }
  }

  // Sort by score descending
  matches.sort((a, b) => b.score - a.score);

  return matches;
}
