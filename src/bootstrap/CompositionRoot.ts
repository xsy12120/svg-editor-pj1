import type { Readable, Writable } from "node:stream";

import { CliApplication } from "../interfaces/cli/CliApplication.js";

export function createCliApplication(
  input: Readable,
  output: Writable
): CliApplication {
  return new CliApplication(input, output);
}
