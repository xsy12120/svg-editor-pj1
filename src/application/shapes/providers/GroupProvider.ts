import { Group } from "../../../domain/shapes/Group.js";
import type { Shape } from "../../../domain/shapes/Shape.js";
import type { ShapeInit } from "../ShapeInit.js";
import type { ShapeProvider } from "../ShapeProvider.js";
import { assertShapeType, requireShapeId } from "./ShapeProviderSupport.js";

export class GroupProvider implements ShapeProvider {
  readonly typeName = "g";

  createFromCliArgs(args: readonly string[]): ShapeInit {
    if (args.length !== 1) {
      throw new Error("usage: create g <id>");
    }

    return {
      typeName: this.typeName,
      id: requireShapeId(args[0], "group"),
      attributes: {}
    };
  }

  create(init: ShapeInit): Shape {
    assertShapeType(init, this.typeName);
    return new Group(init.id);
  }
}
