export class SvgIdAllocator {
  private readonly usedIds: Set<string>;
  private readonly counters = new Map<string, number>();

  constructor(explicitIds: Iterable<string>) {
    this.usedIds = new Set(explicitIds);
  }

  allocate(typeName: string): string {
    let counter = this.counters.get(typeName) ?? 0;
    let id: string;
    do {
      counter += 1;
      id = `${typeName}${counter}`;
    } while (this.usedIds.has(id));

    this.counters.set(typeName, counter);
    this.usedIds.add(id);
    return id;
  }
}
