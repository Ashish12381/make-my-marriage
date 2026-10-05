export type ErrorDetail = { path: string; message: string };

// Only explicitly safe messages belong in an AppError; unexpected errors are sanitized.
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: readonly ErrorDetail[],
  ) {
    super(message);
    this.name = 'AppError';
  }
}
