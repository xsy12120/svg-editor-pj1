import type { Readable, Writable } from "node:stream";

import { EditorSession } from "../application/EditorSession.js";
import { AddToCommandProvider } from "../application/commands/AddToCommandProvider.js";
import { BackCommandProvider } from "../application/commands/BackCommandProvider.js";
import { CanvasCommandProvider } from "../application/commands/CanvasCommandProvider.js";
import { CreateCommandProvider } from "../application/commands/CreateCommandProvider.js";
import { DeleteCommandProvider } from "../application/commands/DeleteCommandProvider.js";
import { FrontCommandProvider } from "../application/commands/FrontCommandProvider.js";
import { GroupCommandProvider } from "../application/commands/GroupCommandProvider.js";
import { HelpCommandProvider } from "../application/commands/HelpCommandProvider.js";
import { InitCommandProvider } from "../application/commands/InitCommandProvider.js";
import { MoveCommandProvider } from "../application/commands/MoveCommandProvider.js";
import { ReadDocumentCommandProvider } from "../application/commands/ReadDocumentCommandProvider.js";
import { RedoCommandProvider } from "../application/commands/RedoCommandProvider.js";
import { SaveDocumentCommandProvider } from "../application/commands/SaveDocumentCommandProvider.js";
import { ScaleCommandProvider } from "../application/commands/ScaleCommandProvider.js";
import { SetAttributeCommandProvider } from "../application/commands/SetAttributeCommandProvider.js";
import { ShowCommandProvider } from "../application/commands/ShowCommandProvider.js";
import { TreeCommandProvider } from "../application/commands/TreeCommandProvider.js";
import { UngroupCommandProvider } from "../application/commands/UngroupCommandProvider.js";
import { UndoCommandProvider } from "../application/commands/UndoCommandProvider.js";
import { CommandRegistry } from "../application/extensions/CommandRegistry.js";
import { CommandInvoker } from "../application/history/CommandInvoker.js";
import { CommandProcessor } from "../application/history/CommandProcessor.js";
import { ShapeDetailsSnapshotBuilder } from "../application/queries/ShapeDetailsSnapshotBuilder.js";
import { TreeSnapshotBuilder } from "../application/queries/TreeSnapshotBuilder.js";
import { CircleProvider } from "../application/shapes/providers/CircleProvider.js";
import { EllipseProvider } from "../application/shapes/providers/EllipseProvider.js";
import { GroupProvider } from "../application/shapes/providers/GroupProvider.js";
import { LineProvider } from "../application/shapes/providers/LineProvider.js";
import { RectProvider } from "../application/shapes/providers/RectProvider.js";
import { TextProvider } from "../application/shapes/providers/TextProvider.js";
import { ShapeFactory } from "../application/shapes/ShapeFactory.js";
import { CliApplication } from "../interfaces/cli/CliApplication.js";
import { CliPresenter } from "../interfaces/cli/CliPresenter.js";
import { CliShapeDetailsRenderer } from "../interfaces/cli/CliShapeDetailsRenderer.js";
import { CliTreeRenderer } from "../interfaces/cli/CliTreeRenderer.js";
import { NodeFileStore } from "../infrastructure/fs/NodeFileStore.js";
import { XmlSvgCodec } from "../infrastructure/svg/XmlSvgCodec.js";

export function createCliApplication(
  input: Readable,
  output: Writable
): CliApplication {
  const session = new EditorSession();
  const invoker = new CommandInvoker(session);
  const processor = new CommandProcessor(invoker);
  const commands = new CommandRegistry<EditorSession>();
  const files = new NodeFileStore();
  const shapes = new ShapeFactory();
  shapes.register(new CircleProvider());
  shapes.register(new EllipseProvider());
  shapes.register(new LineProvider());
  shapes.register(new RectProvider());
  shapes.register(new TextProvider());
  shapes.register(new GroupProvider());
  const svgCodec = new XmlSvgCodec(shapes);

  commands.register(new InitCommandProvider());
  commands.register(new ReadDocumentCommandProvider(files, svgCodec));
  commands.register(new SaveDocumentCommandProvider(files, svgCodec));
  commands.register(new CanvasCommandProvider());
  commands.register(new CreateCommandProvider(shapes));
  commands.register(new MoveCommandProvider());
  commands.register(new ScaleCommandProvider());
  commands.register(new SetAttributeCommandProvider());
  commands.register(new DeleteCommandProvider());
  commands.register(new GroupCommandProvider());
  commands.register(new UngroupCommandProvider());
  commands.register(new AddToCommandProvider());
  commands.register(new FrontCommandProvider());
  commands.register(new BackCommandProvider());
  commands.register(new TreeCommandProvider(new TreeSnapshotBuilder()));
  commands.register(
    new ShowCommandProvider(new ShapeDetailsSnapshotBuilder())
  );
  commands.register(new UndoCommandProvider(invoker));
  commands.register(new RedoCommandProvider(invoker));
  commands.register(new HelpCommandProvider(commands));

  const treeRenderer = new CliTreeRenderer();
  const shapeDetailsRenderer = new CliShapeDetailsRenderer();
  return new CliApplication(
    input,
    output,
    commands,
    processor,
    new CliPresenter(output, treeRenderer, shapeDetailsRenderer)
  );
}
