import type { Command } from './command.js';
import type { Token } from '../parser/tokenizer.js';
import { tokenize } from '../parser/tokenizer.js';
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
   * ```
   */
  route(argv: string[]): RouteResult {
    const tokens = tokenize(argv);
    const path: string[] = [];
    let command = this.root;
    let tokenIndex = 0;

    // Navigate through subcommands
    while (tokenIndex < tokens.length) {
      const token = tokens[tokenIndex];

      // Stop at first non-argument token (option or separator)
      if (token.type !== 'argument') {
        break;
      }

      const name = token.value;

      // Check if this is a subcommand
      const subcommand = command.getByNameOrAlias(name);
      if (!subcommand) {
        // Not a subcommand, this is the target command
        break;
      }

      // Navigate to subcommand
      path.push(name);
      command = subcommand;
      tokenIndex++;
    }

    return {
      command,
      tokens: tokens.slice(tokenIndex),
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
