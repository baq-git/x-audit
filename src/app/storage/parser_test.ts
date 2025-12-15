import { describe, test, expect } from "bun:test";
import { parseTweets } from "./parser";

describe("Parser", async () => {
  test("file should be valid ext type", async () => {
    const txt = `${process.cwd()}/src/app/storage/testdata/tweet.txt`;
    const unknown = `${process.cwd()}/src/app/storage/testdata/tweet.unknown`;
    const csv = `${process.cwd()}/src/app/storage/testdata/tweets.csv`;
    const json = `${process.cwd()}/src/app/storage/testdata/tweets.json`;

    expect(() => parseTweets(txt)).toThrow("unknown file extension");
    expect(() => parseTweets(unknown)).toThrow("unknown file extension");
    expect(() => parseTweets(csv)).toBeDefined();
    expect(() => parseTweets(json)).toBeDefined();
  });

  test("parseTweets should return tweets", async () => {
    const csv = `${process.cwd()}/src/app/storage/testdata/parse/tweets.csv`;
    const parsed = await parseTweets(csv);

    const first = parsed[0];

    expect(parsed).not.toBeUndefined();
    expect(first).not.toBeUndefined();

    if (first) expect(Object.keys(first)).toEqual(["id", "text"]);
  });

  test("parsetTweets return error with malformed json", async () => {
    const malformed = `${process.cwd()}/src/app/storage/testdata/parse/malformed.json`;
    const file = Bun.file(malformed);
    const isFileExist = await file.exists();

    expect(isFileExist).toBe(true);
    expect(() => parseTweets(malformed)).toThrow("Failed to parse JSON");
  });

  test("parsetTweets return error with malformed csv", async () => {
    const malformed = `${process.cwd()}/src/app/storage/testdata/parse/malformed.csv`;

    const file = Bun.file(malformed);
    const isFileExist = await file.exists();

    expect(isFileExist).toBe(true);
    expect(() => parseTweets(malformed)).toThrow("Failed to parse CSV");
  });
});
