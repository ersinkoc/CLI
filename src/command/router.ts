import type { Command } from './command.js';
import type { Token } from '../parser/tokenizer.js';
import { tokenize, TokenType } from '../parser/tokenizer.js';
import { UnknownCommandError } from '../errors/cli-error.js';
import { levenshteinSimilarity } from '../utils/levenshtein.js';

/**
 * Route result from parsing argv
 */
export interface RouteResult {
  /** Matched command */
  command: Command;
  /** Remaining tokens for this command */
  tokens: Token[];
  /** Command path taken */
  path: string[];
  /** Original argv */
  argv: string[];
}

/**
 * Command router for matching argv to commands
 *
 * @example
 * ```typescript
 * const router = new CommandRegistry();
 * const root = new Command('cli');
 * const build = root.addCommand('build');
 * router.register(root);
 *
 * const result = router.route(['build', 'src']);
 * // { command: build, tokens: [...], path: ['build'], argv: ['build', 'src'] }
 * ```
 */
export class CommandRouter {
  private root: Command;

  constructor(root: Command) {
    this.root = root;
  }

  /**
   * Route argv to a command
   *
   * @param argv - Arguments array
   * @returns Route result
   * @throws UnknownCommandError if command not found
   *
   * @example
   * ```typescript
   * const result = router.route(['build', 'src', '-o', 'dist']);
   * // Also works: router.route(['--verbose', 'build', 'src']);
   * ```
   */
  route(argv: string[]): RouteResult {
    const tokens = tokenize(argv);
    const path: string[] = [];
    let command = this.root;

    // Track which argument tokens were consumed as command names
    const consumedIndices = new Set<number>();

    // Navigate through subcommands, skipping option tokens
    // This allows: cli --verbose build (flags before subcommands)
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      // Skip option/flag tokens - they'll be processed later
      if (token.type === TokenType.Option || token.type === TokenType.Flag) {
        // Also skip the next token if it's a value for this option
        const nextToken = tokens[i + 1];
        if (nextToken?.type === TokenType.Value) {
          i++; // Skip the value token too
        }
        continue;
      }

      // Skip separator tokens
      if (token.type === TokenType.Separator) {
        break; // Stop routing at -- separator
      }

      // Only process argument tokens as potential subcommands
      if (token.type !== TokenType.Argument) {
        continue;
      }

      const name = token.value;

      // Check if this is a subcommand
      const subcommand = command.getByNameOrAlias(name);
      if (!subcommand) {
        // Not a subcommand, stop looking for more subcommands
        break;
      }

      // Navigate to subcommand
      path.push(name);
      command = subcommand;
      consumedIndices.add(i);
    }

    // Return remaining tokens (exclude consumed command names)
    const remaining = tokens.filter((_, i) => !consumedIndices.has(i));

    return {
      command,
      tokens: remaining,
      path,
      argv,
    };
  }

  /**
   * Find the closest matching command name for suggestions
   *
   * @param name - Command name that wasn't found
   * @returns Suggested command name or undefined
   *
   * @example
   * ```typescript
   * const suggestion = router.suggest('bulid'); // 'build'
   * ```
   */
  suggest(name: string): string | undefined {
    const candidates = this.getAllCommandNames();
    const suggestions = this.getSuggestions(name, candidates);
    return suggestions[0];
  }

  /**
   * Get multiple command name suggestions
   *
   * @param name - Command name that wasn't found
   * @param candidates - Available command names
   * @returns Array of suggested names
   *
   * @example
   * ```typescript
   * const suggestions = router.getSuggestions('conf', ['config', 'context', 'help']);
   * // ['config', 'context']
   * ```
   */
  private getSuggestions(name: string, candidates: string[]): string[] {
    const suggestions: Array<{ name: string; score: number }> = [];

    for (const candidate of candidates) {
      // Check for prefix match (highest priority)
      if (candidate.startsWith(name)) {
        suggestions.push({ name: candidate, score: 1 });
        continue;
      }

      // Check for contains match
      if (candidate.includes(name)) {
        suggestions.push({ name: candidate, score: 0.8 });
        continue;
      }

      // Use Levenshtein distance for typos
      const score = levenshteinSimilarity(name, candidate);
      if (score > 0.6) {
        suggestions.push({ name: candidate, score });
      }
    }

    // Sort by score descending
    suggestions.sort((a, b) => b.score - a.score);

    return suggestions.slice(0, 3).map((s) => s.name);
  }

  /**
   * Get all command names in the tree
   */
  private getAllCommandNames(): string[] {
    const names: string[] = [];

    const collect = (cmd: Command) => {
      names.push(cmd.name);
      names.push(...cmd.aliases);
      for (const sub of cmd.commands.values()) {
        collect(sub);
      }
    };

    collect(this.root);
    return names;
  }
}
