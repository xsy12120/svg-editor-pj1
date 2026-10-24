export class Document {
  constructor(
    private readonly canvasWidth: number,
    private readonly canvasHeight: number
  ) {}

  get width(): number {
    return this.canvasWidth;
  }

  get height(): number {
    return this.canvasHeight;
  }
}
