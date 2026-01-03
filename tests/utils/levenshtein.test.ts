/**
 * Levenshtein distance tests
 */

import { describe, it, expect } from 'vitest';
import {
  levenshtein,
  levenshteinSimilarity,
  findBestMatch,
  findAllMatches,
} from '../../src/utils/levenshtein.js';

describe('Levenshtein Distance', () => {
  describe('levenshtein', () => {
    it('should return 0 for identical strings', () => {
      expect(levenshtein('hello', 'hello')).toBe(0);
    });

    it('should return length for empty string', () => {
      expect(levenshtein('', 'hello')).toBe(5);
      expect(levenshtein('hello', '')).toBe(5);
    });

    it('should return 0 for two empty strings', () => {
      expect(levenshtein('', '')).toBe(0);
    });

    it('should calculate distance for substitutions', () => {
      expect(levenshtein('cat', 'dog')).toBe(3);
      expect(levenshtein('hello', 'hallo')).toBe(1);
    });

    it('should calculate distance for insertions', () => {
      expect(levenshtein('cat', 'cats')).toBe(1);
      expect(levenshtein('cat', 'caster')).toBe(3);
    });

    it('should calculate distance for deletions', () => {
      expect(levenshtein('cats', 'cat')).toBe(1);
      expect(levenshtein('caster', 'cat')).toBe(3);
    });

    it('should handle mixed operations', () => {
      expect(levenshtein('kitten', 'sitting')).toBe(3);
    });

    it('should be case sensitive', () => {
      expect(levenshtein('hello', 'Hello')).toBe(1);
    });

    it('should handle unicode characters', () => {
      expect(levenshtein('café', 'cafe')).toBe(1);
    });
  });

  describe('levenshteinSimilarity', () => {
    it('should return 1 for identical strings', () => {
      expect(levenshteinSimilarity('hello', 'hello')).toBe(1);
    });

    it('should return 0 for completely different strings', () => {
      expect(levenshteinSimilarity('abc', 'xyz')).toBeCloseTo(0, 1);
    });

    it('should return high similarity for small differences', () => {
      const similarity = levenshteinSimilarity('hello', 'hallo');
      expect(similarity).toBeGreaterThan(0.7);
    });

    it('should return low similarity for large differences', () => {
      const similarity = levenshteinSimilarity('short', 'veryverylongstring');
      expect(similarity).toBeLessThan(0.5);
    });

    it('should handle empty strings', () => {
      expect(levenshteinSimilarity('', '')).toBe(1);
    });

    it('should normalize by maximum length', () => {
      const sim1 = levenshteinSimilarity('test', 'test');
      const sim2 = levenshteinSimilarity('test', 'testing');
      expect(sim1).toBeGreaterThan(sim2);
    });
  });

  describe('findBestMatch', () => {
    it('should find best match from candidates', () => {
      const result = findBestMatch('instll', ['install', 'uninstall', 'update']);
      expect(result).toBe('install');
    });

    it('should return undefined when no match meets threshold', () => {
      const result = findBestMatch('xyz', ['install', 'uninstall', 'update']);
      expect(result).toBeUndefined();
    });

    it('should be case insensitive', () => {
      const result = findBestMatch('INSTALL', ['install', 'uninstall']);
      expect(result).toBe('install');
    });

    it('should use custom threshold', () => {
      const result1 = findBestMatch('tst', ['test', 'testing'], 0.5);
      expect(result1).toBeDefined();
    });

    it('should return undefined for empty candidates', () => {
      const result = findBestMatch('test', []);
      expect(result).toBeUndefined();
    });

    it('should handle exact match', () => {
      const result = findBestMatch('install', ['install', 'uninstall']);
      expect(result).toBe('install');
    });
  });

  describe('findAllMatches', () => {
    it('should find all matches above threshold', () => {
      const result = findAllMatches('config', ['configure', 'context', 'conflict', 'test'], 0.4);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].candidate).toBe('configure');
    });

    it('should return empty array when no matches', () => {
      const result = findAllMatches('xyz', ['abc', 'def']);
      expect(result).toEqual([]);
    });

    it('should be case insensitive', () => {
      const result = findAllMatches('TEST', ['test', 'testing', 'contest']);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should sort by score descending', () => {
      const result = findAllMatches('test', ['test', 'testing', 'contest']);
      expect(result[0].score).toBeGreaterThanOrEqual(result[1]?.score ?? 0);
    });

    it('should include score in results', () => {
      const result = findAllMatches('test', ['test', 'testing']);
      expect(result[0].score).toBeDefined();
      expect(typeof result[0].score).toBe('number');
    });

    it('should handle empty candidates', () => {
      const result = findAllMatches('test', []);
      expect(result).toEqual([]);
    });

    it('should use custom threshold', () => {
      const result = findAllMatches('tst', ['test', 'testing', 'toast'], 0.3);
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
