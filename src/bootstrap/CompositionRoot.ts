import type { Readable, Writable } from "node:stream";

import { EditorSession } from "../application/EditorSession.js";
import { InitCommandProvider } from "../application/commands/InitCommandProvider.js";
import { CommandRegistry } from "../application/extensions/CommandRegistry.js";
import { CliApplication } from "../interfaces/cli/CliApplication.js";
import { CliPresenter } from "../interfaces/cli/CliPresenter.js";

export function createCliApplication(
  input: Readable,
  output: Writable
): CliApplication {
  const session = new EditorSession();
  const commands = new CommandRegistry<EditorSession>();
  commands.register(new InitCommandProvider());

  return new CliApplication(
    input,
    output,
    session,
    commands,
    new CliPresenter(output)
  );
}
