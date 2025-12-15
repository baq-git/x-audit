import { beforeAll, describe, expect, test } from "bun:test";
import { csvWriter, writerAnalyzedResults } from "./writer";
import { createConfig } from "../config";
import type { AnalyzedTweet, Tweet } from "../models";

describe("csvWriter", async () => {
  beforeAll(async () => {
    const config = createConfig();
    const filePath = config.TRANSFORMEDTWEETSPATH;
    const file = Bun.file(filePath);
    const isFileExist = await file.exists();

    if (isFileExist) {
      file.delete();
    }
  });

  test("writer should have valid default path", async () => {
    const config = createConfig();
    const filePath = config.TRANSFORMEDTWEETSPATH;

    expect(filePath).toBeDefined();
    expect(filePath).not.toBe("");

    expect(filePath).toBe(
      `${process.cwd()}/src/app/storage/testdata/writer/tweets.csv`,
    );
  });

  test("writer should have valid custom path", async () => {
    const filePath = `${process.cwd()}/src/app/storage/testdata/tweets_custom_path.csv`;
    const config = createConfig({ TRANSFORMEDTWEETSPATH: filePath });
    const filePath2 = config.TRANSFORMEDTWEETSPATH;

    expect(filePath2).toBe(filePath);
  });

  test("writer should create new file with config path if it was set but doesn't have any file", async () => {
    const mock: Tweet[] = [{ id: "1", text: "file isn't exist" }];

    const config = createConfig();
    const filePath = config.TRANSFORMEDTWEETSPATH;

    const file = Bun.file(filePath);
    const isFileExist = await file.exists();

    if (!isFileExist) {
      const file = Bun.file(filePath);
      const isFileExist = await file.exists();

      expect(isFileExist).toBe(false);

      await csvWriter(mock);

      const newFile = Bun.file(filePath);
      const content = await newFile.text();

      expect(content).toContain("file isn't exist");
    }
  });
});

describe("writerAnalyzeedResults", async () => {
  beforeAll(async () => {
    const config = createConfig();
    const filePath = config.PROCESSEDTWEETSPATH;
    const file = Bun.file(filePath);
    const isFileExist = await file.exists();
    if (isFileExist) {
      file.delete();
    }
  });

  test("writerAnalyzedResults should have valid default path", async () => {
    const config = createConfig();
    const filePath = config.PROCESSEDTWEETSPATH;

    expect(filePath).toBeDefined();
    expect(filePath).not.toBe("");

    expect(filePath).toBe(
      `${process.cwd()}/src/app/storage/testdata/writer/tweets_result.csv`,
    );
  });

  test("writerAnalyzedResults should have valid custom path", async () => {
    const filePath = `${process.cwd()}/src/app/storage/testdata/writer/tweets_custom_path.csv`;
    const config = createConfig({ PROCESSEDTWEETSPATH: filePath });
    const filePath2 = config.PROCESSEDTWEETSPATH;

    expect(filePath2).toBe(filePath);
  });

  test("writerAnalyzedResults should create new file with config path if it was set but doesn't have any file", async () => {
    const mock: AnalyzedTweet = {
      id: "1",
      tweetURL: "x.com/tweets/1",
      shouldDelete: true,
    };

    const config = createConfig();
    const filePath = config.PROCESSEDTWEETSPATH;

    await writerAnalyzedResults(mock);

    const newFile = Bun.file(filePath);
    const isNewFileExist = await newFile.exists();
    const content = await newFile.text();

    expect(isNewFileExist).toBe(true);
    expect(content).toContain(mock.tweetURL);
  });

  test("writerAnalyzedResults should append content to existing file when file exists", async () => {
    const mock: AnalyzedTweet = {
      id: "append",
      tweetURL: "x.com/tweets/append",
      shouldDelete: true,
    };

    const config = createConfig();
    const filePath = config.PROCESSEDTWEETSPATH;

    await writerAnalyzedResults(mock);

    const appendedFile = Bun.file(filePath);
    const content = await appendedFile.text();

    expect(content).toContain(mock.tweetURL);
  });

  test("writerAnalyzedResults should append without new line", async () => {
    const mock: AnalyzedTweet = {
      id: "appendWithoutNewLine",
      tweetURL: "x.com/tweets/append_without_new_line",
      shouldDelete: true,
    };

    const config = createConfig();
    const filePath = config.PROCESSEDTWEETSPATH;

    await writerAnalyzedResults(mock);

    const appendWithoutNewLineFile = Bun.file(filePath);
    const content = await appendWithoutNewLineFile.text();

    expect(content).toContain(mock.id);
  });
});
