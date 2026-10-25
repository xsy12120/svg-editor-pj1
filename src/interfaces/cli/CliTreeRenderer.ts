import type { DocumentTreeRenderer } from "../../application/ports/DocumentTreeRenderer.js";
import type {
  TreeSnapshot,
  TreeSnapshotNode
} from "../../application/queries/TreeSnapshot.js";

export class CliTreeRenderer implements DocumentTreeRenderer {
  render(snapshot: TreeSnapshot): string {
    if (snapshot.root !== null) {
      const lines = [this.formatNode(snapshot.root)];
      this.appendChildren(lines, snapshot.root, "");
      return lines.join("\n");
    }

    const lines = [`svg (${snapshot.width}x${snapshot.height})`];
    snapshot.roots.forEach((node, index) => {
      const connector = index === snapshot.roots.length - 1 ? "└── " : "├── ";
      lines.push(`${connector}${this.formatNode(node)}`);
      this.appendChildren(
        lines,
        node,
        connector === "└── " ? "    " : "│   "
      );
    });
    return lines.join("\n");
  }

  private appendChildren(
    lines: string[],
    node: TreeSnapshotNode,
    prefix: string
  ): void {
    node.children.forEach((child, index) => {
      const isLast = index === node.children.length - 1;
      const connector = isLast ? "└── " : "├── ";
      lines.push(`${prefix}${connector}${this.formatNode(child)}`);
      this.appendChildren(
        lines,
        child,
        prefix + (isLast ? "    " : "│   ")
      );
    });
  }

  private formatNode(node: TreeSnapshotNode): string {
    const attributes = node.attributes
      .map((attribute) => `${attribute.name}=${attribute.value}`)
      .join(" ");
    const suffix = attributes.length === 0 ? "" : ` ${attributes}`;
    return `${node.typeName}#${node.id}${suffix}`;
  }
}
