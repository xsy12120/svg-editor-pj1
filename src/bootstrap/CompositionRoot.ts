import type { Readable, Writable } from "node:stream";

import { EditorSession } from "../application/EditorSession.js";
import { CreateCommandProvider } from "../application/commands/CreateCommandProvider.js";
import { DeleteCommandProvider } from "../application/commands/DeleteCommandProvider.js";
import { InitCommandProvider } from "../application/commands/InitCommandProvider.js";
import { MoveCommandProvider } from "../application/commands/MoveCommandProvider.js";
import { RedoCommandProvider } from "../application/commands/RedoCommandProvider.js";
import { ScaleCommandProvider } from "../application/commands/ScaleCommandProvider.js";
import { SetAttributeCommandProvider } from "../application/commands/SetAttributeCommandProvider.js";
import { TreeCommandProvider } from "../application/commands/TreeCommandProvider.js";
import { UndoCommandProvider } from "../application/commands/UndoCommandProvider.js";
import { CommandRegistry } from "../application/extensions/CommandRegistry.js";
import { CommandInvoker } from "../application/history/CommandInvoker.js";
import { CommandProcessor } from "../application/history/CommandProcessor.js";
import { CircleProvider } from "../application/shapes/providers/CircleProvider.js";
import { EllipseProvider } from "../application/shapes/providers/EllipseProvider.js";
import { GroupProvider } from "../application/shapes/providers/GroupProvider.js";
import { LineProvider } from "../application/shapes/providers/LineProvider.js";
import { RectProvider } from "../application/shapes/providers/RectProvider.js";
import { TextProvider } from "../application/shapes/providers/TextProvider.js";
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
  shapes.register(new CircleProvider());
  shapes.register(new EllipseProvider());
  shapes.register(new LineProvider());
  shapes.register(new RectProvider());
  shapes.register(new TextProvider());
  shapes.register(new GroupProvider());

  commands.register(new InitCommandProvider());
  commands.register(new CreateCommandProvider(shapes));
  commands.register(new MoveCommandProvider());
  commands.register(new ScaleCommandProvider());
  commands.register(new SetAttributeCommandProvider());
  commands.register(new DeleteCommandProvider());
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
