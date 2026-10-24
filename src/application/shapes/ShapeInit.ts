export interface ShapeInit {
  readonly typeName: string;
  readonly id: string;
  readonly attributes: Readonly<Record<string, string>>;
}
