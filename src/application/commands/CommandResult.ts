export interface CommandResult {
  readonly success: boolean;
  readonly message: string;
  readonly affectedIds: readonly string[];
}
