import { describe, expect, test } from "bun:test";
import { createConfig } from "../config";
import { getTweetURL } from "../utils";

const loadFromEnv = (key: string, defaultValue: string): string => {
  const value = Bun.env[key];
  if (value) {
    return value;
  }
  return defaultValue;
};

describe("Config", async () => {
  test("loadFromEnv should return loads values from environment when set", async () => {
    Bun.env.X_USERNAME = "env_user";
    Bun.env.GEMINI_MODEL = "gemini-1.5-pro";
    Bun.env.GEMINI_API_KEY = "fake-key-123";

    const config = createConfig();

    expect(config.X_USERNAME).toBe("env_user");
    expect(config.GEMINI_MODEL).toBe("gemini-1.5-pro");
    expect(config.GEMINI_API_KEY).toBe("fake-key-123");
  });

  test("loadFromEnv should return default values when env is not set", async () => {
    delete Bun.env.X_USERNAME;
    delete Bun.env.GEMINI_MODEL;
    delete Bun.env.GEMINI_API_KEY;

    const config = createConfig();

    expect(config.X_USERNAME).toBe("baq");
    expect(config.GEMINI_MODEL).toBe("gemini-2.5-flash");
    expect(config.GEMINI_API_KEY).toBe("");
  });
});

describe("Utils", async () => {
  test("getTweetURL", async () => {
    const config = createConfig();
    const userName = config.X_USERNAME;
    expect(getTweetURL("1234567890")).toBe(
      `https://x.com/${userName}/status/1234567890`,
    );
  });
});
