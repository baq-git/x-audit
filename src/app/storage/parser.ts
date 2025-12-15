import { csv2json } from "json-2-csv";
import TweetAuditError from "../error";
import type { Tweet } from "../models";

type parseType = "json" | "csv";

const isValidType = (ext: string): boolean => {
  switch (ext) {
    case "json":
      return true;
    case "csv":
      return true;
    default:
      return false;
  }
};

const parseTweetCSV = async (path: string) => {
  try {
    const file = Bun.file(path);
    const content = await file.text();

    const json = csv2json(content) as Array<{ id: string; text: string }>;
    const tweets: Tweet[] = json.map(({ id, text }) => ({ id, text }));

    if (tweets.length === 0)
      throw new TweetAuditError({
        name: "ParsingError",
        message: "No tweets found",
      });

    if (tweets.length > 0) {
      const first = tweets[0];
      if (first?.id === undefined || first?.text === undefined)
        throw new TweetAuditError({
          name: "ParsingError",
          message: "Malformed CSV",
        });
    }

    return tweets;
  } catch (e: any) {
    switch (e) {
      case e.name === "SyntaxError":
        throw new TweetAuditError({
          name: e.name,
          message: e.message,
          cause: e,
        });
      default:
        throw new TweetAuditError({
          name: "ParsingError",
          message: "Failed to parse CSV",
          cause: e,
        });
    }
  }
};

const parseTweetJSON = async (path: string): Promise<Tweet[]> => {
  try {
    const file = Bun.file(path);
    const content = await file.json();

    // I don't have enough the X Archive tweets for testing, so I'm just going to
    // download tweets fron other account using some browser extensions
    // and then parse them
    // for the specific personal account, i will change the loop logic

    const tweets: Tweet[] = [];
    for (const c of content) {
      tweets.push({
        id: c.id,
        text: c.full_text,
      });
    }

    if (tweets.length === 0)
      throw new TweetAuditError({
        name: "ParsingError",
        message: "No tweets found",
      });

    if (tweets.length > 0) {
      const first = tweets[0];
      if (first?.id === undefined || first?.text === undefined)
        throw new TweetAuditError({
          name: "ParsingError",
          message: "Malformed CSV",
        });
    }

    return tweets;
  } catch (e: any) {
    switch (e) {
      case e.name === "SyntaxError":
        throw new TweetAuditError({
          name: e.name,
          message: e.message,
          cause: e,
        });
      default:
        throw new TweetAuditError({
          name: "ParsingError",
          message: "Failed to parse JSON",
          cause: e,
        });
    }
  }
};

const parseTweets = async (path: string): Promise<Tweet[]> => {
  const ext = path.split(".").pop() as parseType;

  if (!isValidType(ext)) {
    throw new TweetAuditError({
      name: "ParsingError",
      message: "unknown file extension",
      cause: new Error(`Unknown file extension: ${ext}`),
    });
  } else {
    switch (ext) {
      case "json":
        return await parseTweetJSON(path);
      case "csv":
        return await parseTweetCSV(path);
      default:
        throw new TweetAuditError({
          name: "ParsingError",
          message: "unknown file extension",
          cause: new Error(`Unknown file extension: ${ext}`),
        });
    }
  }
};

export { parseTweets, parseTweetCSV, parseTweetJSON };
