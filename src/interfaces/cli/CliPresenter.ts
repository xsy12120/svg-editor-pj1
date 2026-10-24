import type { Writable } from "node:stream";

import type { CommandResult } from "../../application/commands/CommandResult.js";

export class CliPresenter {
  constructor(private readonly output: Writable) {}

  present(result: CommandResult): void {
    const prefix = result.success ? "" : "error: ";
    this.output.write(`${prefix}${result.message}\n`);
  }

  presentError(error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    this.output.write(`error: ${message}\n`);
  }
}
