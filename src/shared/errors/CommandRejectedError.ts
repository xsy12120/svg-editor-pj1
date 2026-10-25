import { UserFacingError } from "./UserFacingError.js";

export class CommandRejectedError extends UserFacingError {
  static from(error: unknown): UserFacingError {
    if (error instanceof UserFacingError) {
      return error;
    }
    const message = error instanceof Error ? error.message : String(error);
    return new CommandRejectedError(message);
  }
}
