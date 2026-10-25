import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const projectRoot = fileURLToPath(new URL("../../", import.meta.url));

async function collectImports(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const imports: string[] = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      imports.push(...(await collectImports(path)));
      continue;
    }
    if (!entry.name.endsWith(".ts")) {
      continue;
    }

    const source = await readFile(path, "utf8");
    for (const match of source.matchAll(/from\s+["']([^"']+)["']/g)) {
      const specifier = match[1];
      if (specifier !== undefined) {
        imports.push(`${relative(projectRoot, path)} -> ${specifier}`);
      }
    }
  }
  return imports;
}

describe("architecture dependency rules", () => {
  it("keeps infrastructure behind application ports", async () => {
    const imports = await collectImports(join(projectRoot, "src", "infrastructure"));
    const applicationViolations = imports.filter((entry) => {
      const specifier = entry.split(" -> ")[1] ?? "";
      return (
        specifier.includes("/application/") &&
        !specifier.includes("/application/ports/")
      );
    });

    expect(applicationViolations).toEqual([]);
  });

  it("prevents domain and application reverse dependencies", async () => {
    const domainImports = await collectImports(join(projectRoot, "src", "domain"));
    const applicationImports = await collectImports(
      join(projectRoot, "src", "application")
    );

    expect(
      domainImports.filter(
        (entry) =>
          entry.includes("/application/") ||
          entry.includes("/infrastructure/") ||
          entry.includes("/interfaces/") ||
          entry.includes(" -> node:")
      )
    ).toEqual([]);
    expect(
      applicationImports.filter(
        (entry) =>
          entry.includes("/infrastructure/") ||
          entry.includes("/interfaces/")
      )
    ).toEqual([]);
  });
});
