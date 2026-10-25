import type { ExecutableCommand } from "../commands/ExecutableCommand.js";
import { CommandRejectedError } from "../../shared/errors/CommandRejectedError.js";
import type { CommandProvider } from "./CommandProvider.js";

export interface CommandHelpEntry {
  readonly name: string;
  readonly usage: string;
}

export class CommandRegistry<TContext> {
  private readonly providers = new Map<string, CommandProvider<TContext>>();

  register(provider: CommandProvider<TContext>): void {
    if (this.providers.has(provider.name)) {
      throw new Error(`command already registered: ${provider.name}`);
    }

    this.providers.set(provider.name, provider);
  }

  create(name: string, args: readonly string[]): ExecutableCommand<TContext> {
    try {
      const provider = this.providers.get(name);
      if (provider === undefined) {
        throw new CommandRejectedError(`unknown command: ${name}`);
      }
      return provider.create(args);
    } catch (error) {
      throw CommandRejectedError.from(error);
    }
  }

  listHelpEntries(): readonly CommandHelpEntry[] {
    return [...this.providers.values()]
      .map(({ name, usage }) => ({ name, usage }))
      .sort((left, right) => left.name.localeCompare(right.name));
  }
}
