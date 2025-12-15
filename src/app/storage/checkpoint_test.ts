import { test, expect, describe } from "bun:test";
import { Checkpoint } from "./checkpoint";
import { createConfig } from "../config";

describe("Checkpoint", () => {
  const config = createConfig();

  test("should create file automatically if it does not exist", async () => {
    const file = Bun.file(config.CHECKPOINTPATH);
    if (await file.exists()) {
      file.delete();
    }

    const checkpoint = new Checkpoint();
    await checkpoint.load();

    const newFile = Bun.file(config.CHECKPOINTPATH);
    expect(await newFile.exists()).toBe(true);
  });

  test("should create checkpoint file and load with default values", async () => {
    const checkpoint = new Checkpoint();
    const result = await checkpoint.load();
    const { index, date } = result;
    expect(index).toBe(0);
    expect(date).toBe(new Date().toISOString());
  });

  test("checkpoint file should exist", async () => {
    const checkpoint = Bun.file(config.CHECKPOINTPATH);
    const exists = await checkpoint.exists();
    expect(exists).toBe(true);
  });

  test("checkpoint file should be not empty", async () => {
    try {
      const checkpoint = Bun.file(
        "./src/app/storage/testdata/checkpoint/checkpoint_empty.json",
      );
      const exists = await checkpoint.exists();
      expect(exists).toBe(true);
      const result = await checkpoint.json();
      expect(result).toBe(undefined);
    } catch (error) {
      const catched = error as SyntaxError;
      const message = catched.message;
      expect(message === "Unexpected end of JSON input").toBe(true);
    }
  });

  test("checkpoint file should not contain invalid value", async () => {
    const checkpoint = Bun.file(
      "./src/app/storage/testdata/checkpoint/checkpoint_invalid.json",
    );

    const exists = await checkpoint.exists();
    expect(exists).toBe(true);
    const cpjson = await checkpoint.json();
    const { date } = cpjson;
    const paresedDate = new Date(date);
    expect(paresedDate instanceof Date).toBe(true);
    const d = paresedDate as Date;
    expect(d.toString()).toBe("Invalid Date");
  });
});
