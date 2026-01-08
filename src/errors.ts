export class HttpError extends Error {
  public readonly status: number;
  public readonly details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string, details?: unknown) {
    super(400, message, details);
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string = 'Not Found', details?: unknown) {
    super(404, message, details);
  }
}

export class ConflictError extends HttpError {
  constructor(message: string, details?: unknown) {
    super(409, message, details);
  }
}
