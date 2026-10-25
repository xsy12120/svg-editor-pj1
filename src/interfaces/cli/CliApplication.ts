import { createInterface } from "node:readline";
import type { Readable, Writable } from "node:stream";

import type { CommandRegistry } from "../../application/extensions/CommandRegistry.js";
import type { EditorSession } from "../../application/EditorSession.js";
import type { CommandProcessor } from "../../application/history/CommandProcessor.js";
import { CommandParser } from "./CommandParser.js";
import type { CliPresenter } from "./CliPresenter.js";
import { UserFacingError } from "../../shared/errors/UserFacingError.js";

const BANNER = "svg-editor 0.1 — type 'help' for commands";
const PROMPT = "svg> ";

export class CliApplication {
  constructor(
    private readonly input: Readable,
    private readonly output: Writable,
    private readonly commands: CommandRegistry<EditorSession>,
    private readonly processor: CommandProcessor<EditorSession>,
    private readonly presenter: CliPresenter,
    private readonly parser = new CommandParser()
  ) {}

  async run(): Promise<number> {
    this.output.write(`${BANNER}\n\n`);
    this.output.write(PROMPT);

    const lines = createInterface({
      input: this.input,
      terminal: false
    });

    for await (const line of lines) {
      const parsed = this.parser.parse(line);
      if (parsed !== null) {
        try {
          const command = this.commands.create(parsed.name, parsed.args);
          this.presenter.present(this.processor.execute(command));
        } catch (error) {
          if (!(error instanceof UserFacingError)) {
            throw error;
          }
          this.presenter.presentError(error);
        }
      }

      this.output.write(PROMPT);
    }

    return 0;
  }
}
