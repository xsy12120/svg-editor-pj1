import type { CommandResult } from "../commands/CommandResult.js";
import type { ExecutableCommand } from "../commands/ExecutableCommand.js";
import type { CommandInvoker } from "./CommandInvoker.js";
import { CommandRejectedError } from "../../shared/errors/CommandRejectedError.js";

export class CommandProcessor<TContext> {
  private readonly context: TContext;

  constructor(private readonly invoker: CommandInvoker<TContext>) {
    this.context = invoker.context;
  }

  execute(command: ExecutableCommand<TContext>): CommandResult {
    if (command.kind === "edit") {
      return this.invoker.execute(command);
    }

    try {
      command.validate(this.context);
    } catch (error) {
      throw CommandRejectedError.from(error);
    }
    const result = command.execute(this.context);
    if (result.success && command.kind === "document") {
      this.invoker.resetAfterDocumentCommand();
    }

    return result;
  }
}
