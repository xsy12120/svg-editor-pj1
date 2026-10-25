import type { Document } from "../../domain/model/Document.js";

export interface DocumentTreeRenderer {
  render(document: Document, rootId?: string): string;
}
