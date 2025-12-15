import type { GoogleGenAI } from "@google/genai";
import type { AnalyzedTweet, Tweet } from "../models";

export interface Analyzer {
  gemini?: GoogleGenAI;
  analyzeTweet(tweet: Tweet): Promise<AnalyzedTweet>;
}
