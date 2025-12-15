import TweetAuditError from "./error";
import { parseTweets } from "./storage/parser";
import { csvWriter, writerAnalyzedResults } from "./storage/writer";
import { printUsage } from "./utils";
import type { Analyzer } from "./analyzer";
import { type Config } from "./config";
import type { Checkpoint } from "./storage/checkpoint";

export default class App {
  config: Config;
  analyzer: Analyzer;
  checkpoint: Checkpoint;

  constructor(config: any, analyzer: Analyzer, checkpoint: Checkpoint) {
    this.config = config;
    this.analyzer = analyzer;
    this.checkpoint = checkpoint;
  }

  async extractTweets(filePath: string) {
    try {
      const tweets = await parseTweets(filePath);
      console.log("Tweets extracted", tweets.length);
      if (tweets) await csvWriter(tweets);
      console.log("Tweets extracted and written to file");
    } catch (error) {
      printUsage();
      throw error;
    }
  }

  async analyzeTweets() {
    try {
      if (!this.analyzer) {
        throw new TweetAuditError({
          name: "AnalyzeTweetsError",
          message: "Analyzer not initialized",
        });
      }

      const tweets = await parseTweets(this.config.TRANSFORMEDTWEETSPATH);

      if (tweets.length === 0 || !tweets) {
        throw new TweetAuditError({
          name: "AnalyzeTweetsError",
          message: "No tweets found",
        });
      }

      const { index: startIndex } = await this.checkpoint.load();
      const endIndex = Math.min(
        tweets.length,
        startIndex + this.config.BATCH_SIZE,
      );

      console.log(
        `Starting at tweet ${startIndex + 1} --> to tweet ${endIndex}`,
      );

      for (let i = startIndex; i < endIndex; i++) {
        const tweet = tweets[i];
        if (!tweet) continue;
        const analyzedTweet = await this.analyzer.analyzeTweet(tweet);
        if (!analyzedTweet.shouldDelete) {
          continue;
        }

        await writerAnalyzedResults(analyzedTweet);
      }

      await this.checkpoint.save(endIndex, new Date().toISOString());

      console.log(
        `Batch complete! Processed ${endIndex - startIndex} tweets (${
          endIndex
        }/${tweets.length} total)`,
      );
    } catch (error) {
      printUsage();
      throw error;
    }
  }
}
