import type { ShapeInit } from "../ShapeInit.js";

export function requireShapeId(
  value: string | undefined,
  typeName: string
): string {
  if (value === undefined || value.length === 0) {
    throw new Error(`${typeName} id is required`);
  }
  return value;
}

export function requireAttribute(
  value: string | undefined,
  name: string
): string {
  if (value === undefined) {
    throw new Error(`${name} is required`);
  }
  return value;
}

export function parseFiniteNumber(
  value: string | undefined,
  name: string
): number {
  const required = requireAttribute(value, name);
  const parsed = Number(required);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${name} must be a finite number`);
  }
  return parsed;
}

export function parsePositiveNumber(
  value: string | undefined,
  name: string
): number {
  const parsed = parseFiniteNumber(value, name);
  if (parsed <= 0) {
    throw new Error(`${name} must be positive`);
  }
  return parsed;
}

export function assertShapeType(init: ShapeInit, typeName: string): void {
  if (init.typeName !== typeName) {
    throw new Error(
      `${typeName} provider cannot create shape type: ${init.typeName}`
    );
  }
}
