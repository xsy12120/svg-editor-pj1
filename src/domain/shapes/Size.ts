export class Size {
  constructor(
    private readonly widthValue: number,
    private readonly heightValue: number
  ) {
    if (!Number.isFinite(widthValue) || widthValue <= 0) {
      throw new Error("size must be positive");
    }
    if (!Number.isFinite(heightValue) || heightValue <= 0) {
      throw new Error("size must be positive");
    }
  }

  get width(): number {
    return this.widthValue;
  }

  get height(): number {
    return this.heightValue;
  }

  scale(factor: number): Size {
    return new Size(this.widthValue * factor, this.heightValue * factor);
  }
}
