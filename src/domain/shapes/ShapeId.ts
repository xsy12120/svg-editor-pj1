export class ShapeId {
  private readonly value: string;

  constructor(value: string) {
    if (value.trim().length === 0) {
      throw new Error("shape id must not be empty");
    }
    this.value = value;
  }

  toString(): string {
    return this.value;
  }
}
