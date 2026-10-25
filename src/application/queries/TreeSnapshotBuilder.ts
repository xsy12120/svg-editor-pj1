import type { Document } from "../../domain/model/Document.js";
import { ContainerShape } from "../../domain/shapes/ContainerShape.js";
import type { Shape } from "../../domain/shapes/Shape.js";
import type {
  TreeSnapshot,
  TreeSnapshotNode
} from "./TreeSnapshot.js";

export class TreeSnapshotBuilder {
  build(document: Document, rootId?: string): TreeSnapshot {
    if (rootId !== undefined) {
      const root = document.findShape(rootId);
      if (root === undefined) {
        throw new Error(`no such shape: ${rootId}`);
      }
      return {
        width: document.width,
        height: document.height,
        root: this.createNode(root),
        roots: []
      };
    }

    return {
      width: document.width,
      height: document.height,
      root: null,
      roots: document.shapes.map((shape) => this.createNode(shape))
    };
  }

  private createNode(shape: Shape): TreeSnapshotNode {
    const descriptor = shape.toDescriptor();
    return {
      id: descriptor.id,
      typeName: descriptor.typeName,
      attributes: descriptor.attributes,
      children:
        shape instanceof ContainerShape
          ? shape.children.map((child) => this.createNode(child))
          : []
    };
  }
}
