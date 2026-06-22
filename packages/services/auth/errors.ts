export type AppErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL_SERVER_ERROR";

export class AppError extends Error {
  readonly code: AppErrorCode;

  constructor(code: AppErrorCode, message: string) {
    super(message);
    this.name = new.target.name;
    this.code = code;
  }
}

export class EmailAlreadyExistsError extends AppError {
  constructor(email: string) {
    super("CONFLICT", `User with email ${email} already exists`);
  }
}

export class InvalidCredentialsError extends AppError {
  constructor(message = "Invalid email address or password") {
    super("UNAUTHORIZED", message);
  }
}

export class InvalidTokenError extends AppError {
  constructor(message = "Invalid token") {
    super("UNAUTHORIZED", message);
  }
}

export class UserNotFoundError extends AppError {
  constructor(message = "User not found") {
    super("NOT_FOUND", message);
  }
}
