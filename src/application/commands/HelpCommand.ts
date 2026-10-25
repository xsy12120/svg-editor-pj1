import type { EditorSession } from "../EditorSession.js";
import type { CommandRegistry } from "../extensions/CommandRegistry.js";
import type { CommandResult } from "./CommandResult.js";
import type { QueryCommand } from "./ExecutableCommand.js";

export class HelpCommand implements QueryCommand<EditorSession> {
  readonly kind = "query";

  constructor(private readonly commands: CommandRegistry<EditorSession>) {}

  validate(): void {}

  execute(): CommandResult {
    const lines = ["Available commands:"];
    for (const entry of this.commands.listHelpEntries()) {
      lines.push(`  ${entry.usage}`);
    }
    return {
      success: true,
      message: lines.join("\n"),
      affectedIds: []
    };
  }
}
