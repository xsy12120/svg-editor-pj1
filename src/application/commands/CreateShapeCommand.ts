import type { EditorSession } from "../EditorSession.js";
import type { ShapeFactory } from "../shapes/ShapeFactory.js";
import { ContainerShape } from "../../domain/shapes/ContainerShape.js";
import { CreateShapeEdit } from "./CreateShapeEdit.js";
import type { PreparedEdit } from "./PreparedEdit.js";
import type { UndoableCommand } from "./UndoableCommand.js";

export class CreateShapeCommand implements UndoableCommand<EditorSession> {
  readonly kind = "edit";

  constructor(
    private readonly shapeFactory: ShapeFactory,
    private readonly typeName: string,
    private readonly args: readonly string[]
  ) {}

  prepare(session: EditorSession): PreparedEdit<EditorSession> {
    const document = session.document;
    if (document === null) {
      throw new Error("no document. use 'init' or 'read' first");
    }

    const parsed = this.parseContainerClause();
    const shape = this.shapeFactory.createFromCliArgs(
      this.typeName,
      parsed.shapeArgs
    );
    if (document.hasShape(shape.id)) {
      throw new Error(`id already exists: ${shape.id}`);
    }

    let parent: ContainerShape | null = null;
    if (parsed.containerId !== undefined) {
      const container = document.findShape(parsed.containerId);
      if (container === undefined) {
        throw new Error(`no such container: ${parsed.containerId}`);
      }
      if (!(container instanceof ContainerShape)) {
        throw new Error(`not a container: ${parsed.containerId}`);
      }
      parent = container;
    }

    return new CreateShapeEdit(
      this.typeName,
      shape,
      parent,
      parent?.children.length ?? document.shapes.length
    );
  }

  private parseContainerClause(): {
    readonly shapeArgs: readonly string[];
    readonly containerId?: string;
  } {
    const maybeKeyword = this.args.at(-2);
    if (maybeKeyword !== "in") {
      return { shapeArgs: this.args };
    }

    const containerId = this.args.at(-1);
    if (containerId === undefined) {
      throw new Error("container id is required after 'in'");
    }

    return {
      shapeArgs: this.args.slice(0, -2),
      containerId
    };
  }
}
