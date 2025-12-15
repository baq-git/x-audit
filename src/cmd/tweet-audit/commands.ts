import App from "../../app";
import TweetAuditError from "../../app/error";
import { createConfig } from "../../app/config";
import { Checkpoint } from "../../app/storage/checkpoint";
import GeminiAnalyzer from "../../app/analyzer/gemini";

const extractTweetsCommand = "extract-tweets";
const analyzeTweetsCommand = "analyze-tweets";

export const run = async () => {
  const [, , ...args] = Bun.argv;

  if (args.length === 0) {
    throw new TweetAuditError({
      name: "InvalidArgumentError",
      message: "No command specified",
    });
  }

  if (args.length > 2) {
    throw new TweetAuditError({
      name: "InvalidArgumentError",
      message: "Too many arguments",
    });
  }

  const command = args[0];

  if (command !== extractTweetsCommand && command !== analyzeTweetsCommand) {
    throw new TweetAuditError({
      name: "InvalidArgumentError",
      message: "Unknown command",
    });
  }

  const config = createConfig();
  const checkpoint = new Checkpoint();
  const analyzer = new GeminiAnalyzer(config);
  const app = new App(config, analyzer, checkpoint);

  switch (command) {
    case extractTweetsCommand:
      if (!args[1]) {
        throw new TweetAuditError({
          name: "InvalidArgumentError",
          message: "No file specified",
        });
      }

      await app.extractTweets(args[1]);
      console.log("Extracted tweets");
      break;
    case analyzeTweetsCommand:
      await app.analyzeTweets();
      break;
    default:
      throw new TweetAuditError({
        name: "InvalidArgumentError",
        message: "Unknown command",
      });
  }

  return null;
};
