import { GoogleGenAI } from "@google/genai";
import { type Config } from "../config";
import type { AnalyzedTweet, Tweet } from "../models";
import type { Analyzer } from ".";
import { getTweetURL } from "../utils";
import TweetAuditError from "../error";

type decision = "DELETE" | "KEEP" | "delete" | "keep";

type GeminiResponse = {
  decision: decision | "";
  reason: string;
};

export default class GeminiAnalyzer implements Analyzer {
  config: Config;
  gemini: GoogleGenAI;
  analyzeTweet: (tweet: Tweet) => Promise<AnalyzedTweet>;

  constructor(config: Config) {
    this.config = config;
    this.gemini = this.initGemini();
    this.analyzeTweet = this.analyze;
  }

  initGemini() {
    const apiKey = this.config.GEMINI_API_KEY;
    if (!apiKey) {
      throw new TweetAuditError({
        name: "ConfigurationError",
        message: "GEMINI_API_KEY is missing",
      });
    }

    const gemini = new GoogleGenAI({
      apiKey,
    });

    return gemini;
  }

  buildPrompt(tweet: Tweet, config: Config): string {
    if (
      !config.CRITERIA ||
      (!config.CRITERIA.topicsToExclude.length &&
        !config.CRITERIA.toneRequirements.length &&
        !config.CRITERIA.forbiddenWords.length &&
        !config.CRITERIA.additionalInstructions)
    ) {
      throw new TweetAuditError({
        name: "ConfigurationError",
        message: "CRITERIA is missing or empty",
      });
    }
    const criteria = config.CRITERIA;
    let criteriaList: string = "";

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

    criteriaList = `
      a) Topics to exclude:${topic}
      b) Tone requirements:${tone}
      c) Fobidden words:${forbiddenWords}
    `;

    const finalPrompt = `
  You are evaluating tweets for a professional's Twitter cleanup.

  Tweet ID: ${tweet.id}
  Tweet: ${tweet.text}

  Mark for deletion if it violates any of these criteria:
      ${criteriaList}

  Respond in JSON format for Javascript:

  {
    "decision": "DELETE" or "KEEP",
    "reason": "brief explanation"
  }

  Additional instructions: ${additionalInstructions}
`;

    return finalPrompt;
  }

  parseResponse(response: any) {
    if (!response.text) {
      throw new TweetAuditError({
        name: "ApiError",
        message: "Gemini API error",
      });
    }

    const geminiResponse: GeminiResponse = {
      decision: "",
      reason: "",
    };

    if (response.text) {
      const object = response.text?.replace(/```json\n?|```/g, "");
      geminiResponse.decision = JSON.parse(object).decision as decision;
      geminiResponse.reason = JSON.parse(object).reason as string;
    }

    if (!geminiResponse.decision || !geminiResponse.reason)
      throw new TweetAuditError({
        name: "ApiError",
        message: "Gemini API error",
      });

    return geminiResponse;
  }

  async generateResponse(prompt: string) {
    const schema = {
      type: "object",
      properties: {
        decision: {
          type: "string",
          description: "Decision to delete or keep the tweet",
        },
        reason: {
          type: "string",
          description: "Brief explanation of the decision",
        },
      },
    };

    const response = await this.gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: schema,
      },
    });

    return response;
  }

  async analyze(tweet: Tweet) {
    const prompt = this.buildPrompt(tweet, this.config);
    const response = await this.generateResponse(prompt);
    const geminiResponse = this.parseResponse(response);

    const result: AnalyzedTweet = {
      id: tweet.id,
      tweetURL: getTweetURL(tweet.id),
      shouldDelete:
        geminiResponse.decision === "DELETE" ||
        geminiResponse.decision === "delete"
          ? true
          : false,
    };

    return result;
  }
}
