import type { AnalyzedTweet, Tweet } from "../models";
import TweetAuditError from "../error";
import { appendFile } from "node:fs/promises";
import { privateFileMode } from "./permission";
import { createConfig } from "../config";
import { json2csv } from "json-2-csv";

export const csvWriter = async (tweets: Tweet[]) => {
  try {
    const config = createConfig();

    const filePath = config.TRANSFORMEDTWEETSPATH;

    const file = Bun.file(filePath);
    const isFileExist = await Bun.file(filePath).exists();

    if (isFileExist) {
      await file.delete();
    }

    const csv = json2csv(tweets);

    Bun.write(filePath, csv, {
      mode: privateFileMode,
      createPath: true,
    });

    return;
  } catch (e: any) {
    throw new TweetAuditError({
      name: e.name,
      message: e.message,
      cause: e,
    });
  }
};

export const writerAnalyzedResults = async (tweet: AnalyzedTweet) => {
  const config = createConfig();
  const filePath = config.PROCESSEDTWEETSPATH;

  const file = Bun.file(filePath);
  const isFileExist = await file.exists();

  if (isFileExist) {
    const csv = json2csv([tweet], {
      prependHeader: false,
    });

    appendFile(filePath, `\n${csv}`);
    return;
  } else {
    const csv = json2csv([tweet]);

    Bun.write(filePath, csv, {
      mode: privateFileMode,
      createPath: true,
    });

    return;
  }
};
