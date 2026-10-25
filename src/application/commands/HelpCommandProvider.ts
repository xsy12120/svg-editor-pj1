import type { EditorSession } from "../EditorSession.js";
import type { CommandProvider } from "../extensions/CommandProvider.js";
import type { CommandRegistry } from "../extensions/CommandRegistry.js";
import type { QueryCommand } from "./ExecutableCommand.js";
import { HelpCommand } from "./HelpCommand.js";

export class HelpCommandProvider implements CommandProvider<EditorSession> {
  readonly name = "help";
  readonly usage = "help";

  constructor(private readonly commands: CommandRegistry<EditorSession>) {}

  create(args: readonly string[]): QueryCommand<EditorSession> {
    if (args.length > 0) {
      throw new Error(`usage: ${this.usage}`);
    }
    return new HelpCommand(this.commands);
  }
}
