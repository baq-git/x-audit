// For those who read my code, I'm following the pattern
// https://engineering.udacity.com/handling-errors-like-a-pro-in-typescript-d7a314ad4991

type ErrorName =
  | "InvalidArgumentError"
  | "ExtractTweetsError"
  | "AnalyzeTweetsError"
  | "WriteCheckpointError"
  | "ReadCheckpointError"
  | "ParsingError"
  | "ConfigurationError"
  | "PermissionError"
  | "ApiError"
  | "UnknownError";

type errorConstructor =
  | { name: ErrorName; message: string; cause?: any }
  | string;

class TweetAuditError extends Error {
  override name: ErrorName;
  override message: string;
  override cause?: any;

  constructor(error: errorConstructor) {
    super();
    if (typeof error === "string") {
      this.name = "UnknownError";
      this.message = error;
    } else {
      this.name = error.name;
      this.message = error.message;
      this.cause = error.cause;
    }
    Object.setPrototypeOf(this, TweetAuditError.prototype);
  }
}

export default TweetAuditError;
