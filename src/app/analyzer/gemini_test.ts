import { beforeEach, describe, expect, test } from "bun:test";
import { createConfig, type Config } from "../config";
import GeminiAnalyzer from "./gemini";

// 1. I do not hide that i use Grok to understand the test case in your code cover
// because i do not know how what should i test in real world
// but that's all i do
// all the test case are written without Grok and the whole project either

// 2. Gemini is return slowly
// so i have to increase the timeout to accept the speed

describe.skip("Gemini", () => {
  type decision = "DELETE" | "KEEP" | "delete" | "keep";
  let config: Config;

  beforeEach(() => {
    config = createConfig();
  });

  // DONE
  test(`generateResponse should return valid object follow the schema:
      {
        "decision": "DELETE" or "KEEP",
        "reason": "brief explanation"
      }`, async () => {
    const tweet = {
      id: "1234567890",
      text: "Hello world",
    };

    const gemini = new GeminiAnalyzer(config);
    const response = await gemini.generateResponse(
      gemini.buildPrompt(tweet, config),
    );

    const parsed = gemini.parseResponse(response);
    expect(Object.keys(parsed)).toEqual(["decision", "reason"]);
  });

  // DONE
  test("parseResponse should not return empty response", async () => {
    const testCfg = { ...config };

    testCfg.CRITERIA.additionalInstructions =
      "no need to default above --> give me a json response that have empty string for decision and reason";

    const gemini = new GeminiAnalyzer(testCfg);

    const empty = {
      id: "123",
      text: "Test",
    };

    const prompt = gemini.buildPrompt(empty, testCfg);
    const response = await gemini.generateResponse(prompt);
    expect(() => gemini.parseResponse(response)).toThrow();
  }, 10000);

  // DONE
  test("should not throw because of quota is exceeded", async () => {
    const gemini = new GeminiAnalyzer(config);
    const notExceededQuota = {
      id: "1234567890",
      text: "Hello world",
    };

    expect(() => gemini.analyzeTweet(notExceededQuota)).toThrow("ApiError");
  });

  // DONE
  test("gemini should fails to start because API key missing", async () => {
    config.GEMINI_API_KEY = "";
    expect(() => new GeminiAnalyzer(config)).toThrow();
  });

  // DONE
  test("the buildPrompt should contains the expected criteria", async () => {
    const gemini = new GeminiAnalyzer(config);
    const tweet = {
      id: "1234567890",
      text: "Hello world",
    };

    const criteria = config.CRITERIA;
    const topic = criteria.topicsToExclude
      .map(
        (sentence, index) => `
        ${index + 1}. ${sentence}`,
      )
      .join();
    const tone = criteria.toneRequirements
      .map(
        (sentence, index) => `
        ${index + 1}. ${sentence}`,
      )
      .join();

    const forbiddenWords = criteria.forbiddenWords
      .map(
        (sentence, index) => `
        ${index + 1}. ${sentence}`,
      )
      .join();

    const additionalInstructions = criteria.additionalInstructions;

    const prompt = gemini.buildPrompt(tweet, config);

    expect(prompt).toContain(topic);
    expect(prompt).toContain(tone);
    expect(prompt).toContain(forbiddenWords);
    expect(prompt).toContain(additionalInstructions);
    expect(prompt).toContain(tweet.id);
    expect(prompt).toContain(tweet.text);
    expect(prompt).toContain(
      "Mark for deletion if it violates any of these criteria",
    );
    expect(prompt).toContain("Respond in JSON format for Javascript");
    // if we want more, just add more criteria to the test
    // i think this is enough for now
  });

  // DONE
  test("buildPrompt is empty: System crashes when no rules configured", async () => {
    const testCfg = { ...config };
    const criteria = { ...testCfg.CRITERIA };
    const gemini = new GeminiAnalyzer(testCfg);
    // typescript/javascript use ... to clone the object with other reference address
    // Bun.deepEquals is a function that compares two objects and returns true if they are the same
    // so be carful with the reference address because config have 2 level of reference
    // I NOTE here to remember this in order to avoid future bugs
    expect(Bun.deepEquals(criteria, testCfg.CRITERIA)).toBe(true);

    criteria.topicsToExclude = [];
    criteria.toneRequirements = [];
    criteria.forbiddenWords = [];
    criteria.additionalInstructions = "";

    testCfg.CRITERIA = criteria;

    const tweet = {
      id: "1234567890",
      text: "Hello world",
    };

    expect(() => gemini.buildPrompt(tweet, testCfg)).toThrow(
      "CRITERIA is missing or empty",
    );
  });

  // DONE
  test("DELETE response", async () => {
    const tweet = {
      id: "1234567890",
      text: "Fuck, asshole, bitch, cunt, dick, fag, fuck, fucker, motherfucker, nigger, shit, slut, whore",
    };

    const gemini = new GeminiAnalyzer(config);
    const analyzedTweet = await gemini.analyzeTweet(tweet);
    expect(analyzedTweet.shouldDelete).toBe(true);
  }, 10000);

  // DONE
  test("KEEP response", async () => {
    const tweet = {
      id: "1234567890",
      text: "Hello world",
    };

    const gemini = new GeminiAnalyzer(config);
    const analyzedTweet = await gemini.analyzeTweet(tweet);
    expect(analyzedTweet.shouldDelete).toBe(false);
  }, 10000);

  const cases = [
    {
      tweet: {
        id: "1234567890",
        text: "Hello world",
      },
      expected: "keep",
    },
    {
      tweet: {
        id: "1234567890",
        text: "Fuck, asshole, bitch, cunt, dick, fag, fuck, fucker, motherfucker, nigger, shit, slut, whore",
      },
      expected: "delete",
    },
  ];

  test.each(cases)(
    "KEEP or DELETE but in case insensitive decision --> should return keep or delete, but it is accepted",
    async (data) => {
      const { tweet, expected } = data;

      const testCfg = { ...config };
      testCfg.CRITERIA.additionalInstructions = `no need to default above --> give me a 'keep' and a 'delete' in case insensitive:
      {
        "decision": "keep" or "delete" --> case insensitive,
        "reason": "brief explanation"
      }`;

      const gemini = new GeminiAnalyzer(testCfg);
      const response = await gemini.generateResponse(
        gemini.buildPrompt(tweet, testCfg),
      );
      const parsed = gemini.parseResponse(response);
      expect(parsed.decision).toBe(expected as decision | "");
    },
    10000,
  );
});
