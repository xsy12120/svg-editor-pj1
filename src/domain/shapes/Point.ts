export class Point {
  constructor(
    private readonly xValue: number,
    private readonly yValue: number
  ) {
    if (!Number.isFinite(xValue) || !Number.isFinite(yValue)) {
      throw new Error("point coordinates must be finite");
    }
  }

  get x(): number {
    return this.xValue;
  }

  get y(): number {
    return this.yValue;
  }

  translate(dx: number, dy: number): Point {
    return new Point(this.xValue + dx, this.yValue + dy);
  }

  scale(factor: number): Point {
    return new Point(this.xValue * factor, this.yValue * factor);
  }
}
