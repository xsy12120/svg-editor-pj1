import type { Readable, Writable } from "node:stream";

import { EditorSession } from "../application/EditorSession.js";
import { CreateCommandProvider } from "../application/commands/CreateCommandProvider.js";
import { InitCommandProvider } from "../application/commands/InitCommandProvider.js";
import { RedoCommandProvider } from "../application/commands/RedoCommandProvider.js";
import { TreeCommandProvider } from "../application/commands/TreeCommandProvider.js";
import { UndoCommandProvider } from "../application/commands/UndoCommandProvider.js";
import { CommandRegistry } from "../application/extensions/CommandRegistry.js";
import { CommandInvoker } from "../application/history/CommandInvoker.js";
import { CommandProcessor } from "../application/history/CommandProcessor.js";
import { RectProvider } from "../application/shapes/providers/RectProvider.js";
import { ShapeFactory } from "../application/shapes/ShapeFactory.js";
import { CliApplication } from "../interfaces/cli/CliApplication.js";
import { CliPresenter } from "../interfaces/cli/CliPresenter.js";
import { CliTreeRenderer } from "../interfaces/cli/CliTreeRenderer.js";

export function createCliApplication(
  input: Readable,
  output: Writable
): CliApplication {
  const session = new EditorSession();
  const invoker = new CommandInvoker(session);
  const processor = new CommandProcessor(session, invoker);
  const commands = new CommandRegistry<EditorSession>();
  const shapes = new ShapeFactory();
  shapes.register(new RectProvider());

  commands.register(new InitCommandProvider());
  commands.register(new CreateCommandProvider(shapes));
  commands.register(new TreeCommandProvider(new CliTreeRenderer()));
  commands.register(new UndoCommandProvider(invoker));
  commands.register(new RedoCommandProvider(invoker));

  return new CliApplication(
    input,
    output,
    commands,
    processor,
    new CliPresenter(output)
  );
}
