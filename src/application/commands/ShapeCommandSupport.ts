import type { EditorSession } from "../EditorSession.js";
import type { Document } from "../../domain/model/Document.js";
import type { Shape } from "../../domain/shapes/Shape.js";

export function requireDocument(session: EditorSession): Document {
  const document = session.document;
  if (document === null) {
    throw new Error("no document. use 'init' or 'read' first");
  }
  return document;
}

export function requireShape(session: EditorSession, id: string): Shape {
  const shape = requireDocument(session).findShape(id);
  if (shape === undefined) {
    throw new Error(`no such shape: ${id}`);
  }
  return shape;
}
