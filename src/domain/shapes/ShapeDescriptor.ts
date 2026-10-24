export interface ShapeAttribute {
  readonly name: string;
  readonly value: string;
}

export interface ShapeDescriptor {
  readonly typeName: string;
  readonly id: string;
  readonly attributes: readonly ShapeAttribute[];
}
