/**
 * Tokenizer tests
 */

import { describe, it, expect } from 'vitest';
import { tokenize, TokenType } from '../../src/parser/tokenizer.js';

describe('Tokenizer', () => {
  it('should tokenize empty array', () => {
    const tokens = tokenize([]);
    expect(tokens).toEqual([]);
  });

  it('should tokenize simple arguments', () => {
    const tokens = tokenize(['file1', 'file2']);
    expect(tokens).toHaveLength(2);
    expect(tokens[0].type).toBe(TokenType.Argument);
    expect(tokens[0].value).toBe('file1');
    expect(tokens[1].type).toBe(TokenType.Argument);
    expect(tokens[1].value).toBe('file2');
  });

  it('should tokenize long options', () => {
    const tokens = tokenize(['--help', '--verbose']);
    expect(tokens).toHaveLength(2);
    expect(tokens[0].type).toBe(TokenType.Option);
    expect(tokens[0].value).toBe('help');
    expect(tokens[0].raw).toBe('--help');
    expect(tokens[1].type).toBe(TokenType.Option);
    expect(tokens[1].value).toBe('verbose');
    expect(tokens[1].raw).toBe('--verbose');
  });

  it('should tokenize short options', () => {
    const tokens = tokenize(['-h', '-v']);
    expect(tokens).toHaveLength(2);
    expect(tokens[0].type).toBe(TokenType.Option);
    expect(tokens[0].value).toBe('h');
    expect(tokens[1].type).toBe(TokenType.Option);
    expect(tokens[1].value).toBe('v');
  });

  it('should tokenize option values', () => {
    const tokens = tokenize(['--output', 'dist']);
    expect(tokens).toHaveLength(2);
    expect(tokens[0].type).toBe(TokenType.Option);
    expect(tokens[0].value).toBe('output');
    // Standalone value tokens are arguments, not Value type
    expect(tokens[1].type).toBe(TokenType.Argument);
    expect(tokens[1].value).toBe('dist');
  });

  it('should tokenize option with equals', () => {
    const tokens = tokenize(['--output=dist']);
    expect(tokens).toHaveLength(2);
    expect(tokens[0].type).toBe(TokenType.Option);
    expect(tokens[0].value).toBe('output');
    // Value type is only for equals format
    expect(tokens[1].type).toBe(TokenType.Value);
    expect(tokens[1].value).toBe('dist');
  });

  it('should tokenize short option with value', () => {
    const tokens = tokenize(['-o', 'dist']);
    expect(tokens).toHaveLength(2);
    expect(tokens[0].type).toBe(TokenType.Option);
    expect(tokens[0].value).toBe('o');
    expect(tokens[1].type).toBe(TokenType.Argument);
    expect(tokens[1].value).toBe('dist');
  });

  it('should tokenize grouped short flags', () => {
    const tokens = tokenize(['-abc']);
    expect(tokens).toHaveLength(1);
    expect(tokens[0].type).toBe(TokenType.Flag);
    expect(tokens[0].value).toBe('abc');
    expect(tokens[0].raw).toBe('-abc');
  });

  it('should tokenize separator', () => {
    const tokens = tokenize(['--', '--not-an-option']);
    expect(tokens).toHaveLength(2);
    expect(tokens[0].type).toBe(TokenType.Separator);
    expect(tokens[0].raw).toBe('--');
    expect(tokens[1].type).toBe(TokenType.Argument);
    expect(tokens[1].value).toBe('--not-an-option');
  });

  it('should handle mixed tokens', () => {
    const tokens = tokenize(['build', '-o', 'dist', '--verbose', 'file.txt']);
    expect(tokens).toHaveLength(5);
    expect(tokens[0].type).toBe(TokenType.Argument);
    expect(tokens[0].value).toBe('build');
    expect(tokens[1].type).toBe(TokenType.Option);
    expect(tokens[1].value).toBe('o');
    expect(tokens[2].type).toBe(TokenType.Argument);
    expect(tokens[2].value).toBe('dist');
    expect(tokens[3].type).toBe(TokenType.Option);
    expect(tokens[3].value).toBe('verbose');
    expect(tokens[4].type).toBe(TokenType.Argument);
    expect(tokens[4].value).toBe('file.txt');
  });

  it('should handle negative numbers as arguments', () => {
    const tokens = tokenize(['-1', '-2.5']);
    expect(tokens).toHaveLength(2);
    expect(tokens[0].type).toBe(TokenType.Argument);
    expect(tokens[0].value).toBe('-1');
    expect(tokens[1].type).toBe(TokenType.Argument);
    expect(tokens[1].value).toBe('-2.5');
  });
});
