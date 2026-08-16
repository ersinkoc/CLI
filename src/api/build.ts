/**
 * Shared declarative command-tree builder
 *
 * Used by both the Object Config API and the Decorator API to convert
 * `CommandDef` records into live `Command` instances. Works directly on
 * `Command` objects so it has no dependency on the CLI implementation.
 */

import { Command } from '../command/command.js';
import type { CommandDef } from '../types.js';

/**
 * Apply a declarative command definition onto a Command instance.
 * Recursively applies nested subcommands.
 *
 * @param cmd - Target command instance
 * @param def - Declarative definition
 *
 * @internal
 */
export function buildCommandInto(cmd: Command, def: CommandDef): void {
  if (def.description !== undefined) {
    cmd.description = def.description;
  }

  if (def.aliases) {
    cmd.aliases.push(...def.aliases);
  }

  if (def.arguments) {
    for (const [name, argDef] of Object.entries(def.arguments)) {
      cmd.addArgument({ ...argDef, name });
    }
  }

  if (def.options) {
    for (const [name, optDef] of Object.entries(def.options)) {
      cmd.addOption({ ...optDef, name });
    }
  }

  if (def.middleware) {
    cmd.middleware.push(...def.middleware);
  }

  if (def.action) {
    cmd.action = def.action;
  }

  if (def.commands) {
    for (const [name, childDef] of Object.entries(def.commands)) {
      buildCommandInto(cmd.addCommand(name), childDef);
    }
  }
}
