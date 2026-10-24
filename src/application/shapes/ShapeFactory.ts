import type { Shape } from "../../domain/shapes/Shape.js";
import type { ShapeProvider } from "./ShapeProvider.js";

export class ShapeFactory {
  private readonly providers = new Map<string, ShapeProvider>();

  register(provider: ShapeProvider): void {
    if (this.providers.has(provider.typeName)) {
      throw new Error(`shape type already registered: ${provider.typeName}`);
    }

    this.providers.set(provider.typeName, provider);
  }

  create(typeName: string, args: readonly string[]): Shape {
    const provider = this.providers.get(typeName);
    if (provider === undefined) {
      throw new Error(`unknown shape type: ${typeName} (is the plugin loaded?)`);
    }

    return provider.create(args);
  }
}
