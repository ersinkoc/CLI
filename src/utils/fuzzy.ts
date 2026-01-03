/**
 * Fuzzy search utilities
 * Provides fuzzy matching and scoring for string search
 *
 * @example
 * ```typescript
 * fuzzyMatch('abc', 'a-big-cat'); // { match: true, score: 1.0 }
 * fuzzyFilter('usr', ['user', 'usr/bin', 'ursula']); // ['usr/bin', 'user']
 * ```
 */

/**
 * Fuzzy match result
 */
export interface FuzzyMatchResult {
  /** Whether the pattern matched */
  match: boolean;
  /** Match score (0-1, higher is better) */
  score: number;
  /** Matched character indices */
  indices: number[];
}

/**
 * Calculate fuzzy match score and positions
 *
 * @param pattern - Pattern to search for
 * @param text - Text to search in
 * @returns Match result with score and positions
 *
 * @example
 * ```typescript
 * fuzzyMatch('abc', 'abc'); // { match: true, score: 1.0, indices: [0, 1, 2] }
 * fuzzyMatch('abc', 'a-b-c'); // { match: true, score: ~0.5, indices: [0, 2, 4] }
 * fuzzyMatch('xyz', 'abc'); // { match: false, score: 0, indices: [] }
 * ```
 */
export function fuzzyMatch(pattern: string, text: string): FuzzyMatchResult {
  if (pattern.length === 0) {
    return { match: true, score: 1, indices: [] };
  }

  if (text.length === 0) {
    return { match: false, score: 0, indices: [] };
  }

  const patternLower = pattern.toLowerCase();
  const textLower = text.toLowerCase();
  const indices: number[] = [];
  let patternIdx = 0;
  let consecutiveMatches = 0;
  let totalDistance = 0;

  for (let i = 0; i < textLower.length && patternIdx < patternLower.length; i++) {
    if (textLower[i] === patternLower[patternIdx]) {
      indices.push(i);

      // Track consecutive matches for higher score
      if (patternIdx > 0 && indices[patternIdx] === indices[patternIdx - 1] + 1) {
        consecutiveMatches++;
      }

      // Track distance between matches
      if (patternIdx > 0) {
        totalDistance += indices[patternIdx] - indices[patternIdx - 1] - 1;
      }

      patternIdx++;
    }
  }

  // Check if pattern was fully matched
  if (patternIdx < pattern.length) {
    return { match: false, score: 0, indices: [] };
  }

  // Calculate score based on multiple factors
  const matchLength = indices[indices.length - 1] - indices[0] + 1;
  const textLength = text.length;
  const patternLength = pattern.length;

  // Base score from match coverage
  let score = patternLength / matchLength;

  // Boost for starting the match early
  const startBonus = (1 - indices[0] / textLength) * 0.1;
  score += startBonus;

  // Boost for consecutive matches
  const consecutiveBonus = (consecutiveMatches / patternLength) * 0.2;
  score += consecutiveBonus;

  // Penalty for gaps between matches
  const avgGap = totalDistance / (patternLength - 1 || 1);
  const gapPenalty = (avgGap / textLength) * 0.2;
  score -= gapPenalty;

  // Ensure score is in [0, 1]
  score = Math.max(0, Math.min(1, score));

  return { match: true, score, indices };
}

/**
 * Filter and sort candidates by fuzzy match score
 *
 * @param pattern - Pattern to search for
 * @param candidates - List of candidate strings
 * @param threshold - Minimum score threshold (default: 0.3)
 * @returns Filtered and sorted candidates with scores
 *
 * @example
 * ```typescript
 * fuzzyFilter('usr', ['user', 'usr/bin', 'ursula', 'admin']);
 * // [
 * //   { value: 'usr/bin', score: 1.0 },
 * //   { value: 'user', score: ~0.9 }
 * // ]
 * ```
 */
export function fuzzyFilter(
  pattern: string,
  candidates: string[],
  threshold = 0.3
): Array<{ value: string; score: number; indices: number[] }> {
  const results: Array<{ value: string; score: number; indices: number[] }> = [];

  for (const candidate of candidates) {
    const result = fuzzyMatch(pattern, candidate);
    if (result.match && result.score >= threshold) {
      results.push({
        value: candidate,
        score: result.score,
        indices: result.indices,
      });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results;
}

/**
 * Check if pattern is a subset match in text
 *
 * @param pattern - Pattern to check
 * @param text - Text to check in
 * @returns true if all characters in pattern appear in text in order
 *
 * @example
 * ```typescript
 * fuzzySubset('abc', 'a-big-cat'); // true
 * fuzzySubset('abc', 'cab'); // false (wrong order)
 * ```
 */
export function fuzzySubset(pattern: string, text: string): boolean {
  const patternLower = pattern.toLowerCase();
  const textLower = text.toLowerCase();
  let patternIdx = 0;

  for (let i = 0; i < textLower.length && patternIdx < patternLower.length; i++) {
    if (textLower[i] === patternLower[patternIdx]) {
      patternIdx++;
    }
  }

  return patternIdx === patternLower.length;
}

/**
 * Highlight matched characters in text
 *
 * @param text - Original text
 * @param indices - Indices of matched characters
 * @param before - String to insert before matches
 * @param after - String to insert after matches
 * @returns Text with highlighted matches
 *
 * @example
 * ```typescript
 * fuzzyHighlight('hello world', [0, 2, 3], '[', ']'); // "h[el]lo world"
 * ```
 */
export function fuzzyHighlight(
  text: string,
  indices: number[],
  before = '\x1b[1m',
  after = '\x1b[0m'
): string {
  if (indices.length === 0) {
    return text;
  }

  // Sort indices
  const sorted = [...indices].sort((a, b) => a - b);

  let result = '';
  let lastIndex = 0;

  for (const index of sorted) {
    // Add text before match
    if (index > lastIndex) {
      result += text.slice(lastIndex, index);
    }

    // Add matched character with highlighting
    result += before + text[index] + after;
    lastIndex = index + 1;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    result += text.slice(lastIndex);
  }

  return result;
}

/**
 * Find best match using fuzzy search
 *
 * @param pattern - Pattern to search for
 * @param candidates - List of candidate strings
 * @param threshold - Minimum score threshold (default: 0.3)
 * @returns Best match or undefined
 *
 * @example
 * ```typescript
 * fuzzyFindBest('usr', ['user', 'usr/bin', 'ursula']); // 'usr/bin'
 * fuzzyFindBest('xyz', ['user', 'admin']); // undefined
 * ```
 */
export function fuzzyFindBest(
  pattern: string,
  candidates: string[],
  threshold = 0.3
): string | undefined {
  const results = fuzzyFilter(pattern, candidates, threshold);
  return results.length > 0 ? results[0].value : undefined;
}

/**
 * Calculate fuzzy similarity between two strings
 *
 * @param a - First string
 * @param b - Second string
 * @returns Similarity score (0-1, higher is better)
 *
 * @example
 * ```typescript
 * fuzzySimilarity('hello', 'hello'); // 1.0
 * fuzzySimilarity('hello', 'helo'); // ~0.9
 * fuzzySimilarity('hello', 'world'); // ~0.2
 * ```
 */
export function fuzzySimilarity(a: string, b: string): number {
  // Try both directions and take the maximum
  const result1 = fuzzyMatch(a, b);
  const result2 = fuzzyMatch(b, a);
  return Math.max(result1.score, result2.score);
}
