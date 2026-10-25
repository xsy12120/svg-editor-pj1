import type { Document } from "../../domain/model/Document.js";

export interface ParsedSvgDocument {
  readonly document: Document;
  readonly warnings: readonly string[];
}

export interface SvgCodec {
  encode(document: Document): string;
  decode(content: string): ParsedSvgDocument;
}
