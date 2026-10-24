import { Document } from "../domain/model/Document.js";

export class EditorSession {
  private activeDocument: Document | null = null;

  get document(): Document | null {
    return this.activeDocument;
  }

  initializeCanvas(width: number, height: number): Document {
    this.activeDocument = new Document(width, height);
    return this.activeDocument;
  }
}
