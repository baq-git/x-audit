import { $ } from "bun";
import { describe, test, expect } from "bun:test";
import { run } from "./commands";

describe("Commands", async () => {
  test("should throw error if no command", async () => {
    expect(() => run()).toThrow("No command specified");
  });

  test("should throw unknown command", async () => {
    try {
      await $`bun start unknown-command`;
    } catch (error: any) {
      expect(error.message).toBe("Unknown command");
    }
  });

  test("should throw error if no arguments", async () => {
    try {
      await $`bun start extract-tweets`;
    } catch (error: any) {
      expect(error.message).toBe("No file specified");
    }
  });

  test("should throw error if too many arguments", async () => {
    try {
      await $`bun start extract-tweets file.csv file2.csv`;
    } catch (error: any) {
      expect(error.message).toBe("Too many arguments");
    }
  });

  test("should throw error if invalid argument", async () => {
    try {
      await $`bun start extract-tweets file.csv --invalid-argument`;
    } catch (error: any) {
      expect(error.message).toBe("Unknown command");
    }
  });
});
