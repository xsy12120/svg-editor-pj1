import type { Writable } from "node:stream";

import type { CommandResult } from "../../application/commands/CommandResult.js";
import type { CommandView } from "../../application/queries/CommandView.js";
import type { TreeSnapshotRenderer } from "../../application/ports/TreeSnapshotRenderer.js";
import type { ShapeDetailsRenderer } from "../../application/ports/ShapeDetailsRenderer.js";

export class CliPresenter {
  constructor(
    private readonly output: Writable,
    private readonly treeRenderer: TreeSnapshotRenderer,
    private readonly shapeDetailsRenderer: ShapeDetailsRenderer
  ) {}

  present(result: CommandResult): void {
    if (!result.success) {
      this.output.write(`error: ${result.message}\n`);
      return;
    }
    if (result.view !== undefined) {
      this.output.write(`${this.renderView(result.view)}\n`);
      return;
    }
    this.output.write(`${result.message}\n`);
  }

  presentError(error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    this.output.write(`error: ${message}\n`);
  }

  private renderView(view: CommandView): string {
    switch (view.kind) {
      case "tree":
        return this.treeRenderer.render(view.snapshot);
      case "shape-details":
        return this.shapeDetailsRenderer.render(view.snapshot);
    }
  }
}
