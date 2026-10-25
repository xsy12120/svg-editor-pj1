import type {
  ParsedSvgDocument,
  SvgCodec
} from "../../application/ports/SvgCodec.js";
import type { ShapeFactory } from "../../application/shapes/ShapeFactory.js";
import type { Document } from "../../domain/model/Document.js";
import { SvgDocumentParser } from "./SvgDocumentParser.js";
import { SvgDocumentSerializer } from "./SvgDocumentSerializer.js";

export class XmlSvgCodec implements SvgCodec {
  private readonly parser: SvgDocumentParser;
  private readonly serializer: SvgDocumentSerializer;

  constructor(shapeFactory: ShapeFactory) {
    this.parser = new SvgDocumentParser(shapeFactory);
    this.serializer = new SvgDocumentSerializer();
  }

  decode(content: string): ParsedSvgDocument {
    return this.parser.parse(content);
  }

  encode(document: Document): string {
    return this.serializer.serialize(document);
  }
}
