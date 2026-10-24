import type { ExecutableCommand } from "../commands/ExecutableCommand.js";
import type { CommandProvider } from "./CommandProvider.js";

export class CommandRegistry<TContext> {
  private readonly providers = new Map<string, CommandProvider<TContext>>();

  register(provider: CommandProvider<TContext>): void {
    if (this.providers.has(provider.name)) {
      throw new Error(`command already registered: ${provider.name}`);
    }

    this.providers.set(provider.name, provider);
  }

  create(name: string, args: readonly string[]): ExecutableCommand<TContext> {
    const provider = this.providers.get(name);
    if (provider === undefined) {
      throw new Error(`unknown command: ${name}`);
    }

    return provider.create(args);
  }
}
