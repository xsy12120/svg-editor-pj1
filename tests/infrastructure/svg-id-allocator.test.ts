import { describe, expect, it } from "vitest";

import { SvgIdAllocator } from "../../src/infrastructure/svg/SvgIdAllocator.js";

describe("SvgIdAllocator", () => {
  it("skips explicit ids and allocates a stable sequence per tag", () => {
    const allocator = new SvgIdAllocator(["rect1", "rect3", "circle1"]);

    expect(allocator.allocate("rect")).toBe("rect2");
    expect(allocator.allocate("rect")).toBe("rect4");
    expect(allocator.allocate("circle")).toBe("circle2");
  });
});
