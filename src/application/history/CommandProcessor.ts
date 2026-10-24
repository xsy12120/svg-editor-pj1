import type { CommandResult } from "../commands/CommandResult.js";
import type { ExecutableCommand } from "../commands/ExecutableCommand.js";
import type { CommandInvoker } from "./CommandInvoker.js";

export class CommandProcessor<TContext> {
  constructor(
    private readonly context: TContext,
    private readonly invoker: CommandInvoker<TContext>
  ) {}

  execute(command: ExecutableCommand<TContext>): CommandResult {
    if (command.kind === "edit") {
      return this.invoker.execute(command);
    }

    command.validate(this.context);
    const result = command.execute(this.context);
    if (result.success && command.kind === "document") {
      this.invoker.resetAfterDocumentCommand();
    }

    return result;
  }
}
