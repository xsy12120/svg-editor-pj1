import { createInterface } from "node:readline";
import type { Readable, Writable } from "node:stream";

const BANNER = "svg-editor 0.1 — type 'help' for commands";
const PROMPT = "svg> ";

export class CliApplication {
  constructor(
    private readonly input: Readable,
    private readonly output: Writable
  ) {}

  async run(): Promise<number> {
    this.output.write(`${BANNER}\n\n`);
    this.output.write(PROMPT);

    const lines = createInterface({
      input: this.input,
      terminal: false
    });

    for await (const _line of lines) {
      this.output.write(PROMPT);
    }

    return 0;
  }
}
