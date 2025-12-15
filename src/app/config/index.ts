import path from "path";

type Criteria = {
  forbiddenWords: string[];
  topicsToExclude: string[];
  toneRequirements: string[];
  additionalInstructions: string;
};

export type Config = {
  TWEETSARCHIVEPATH: string;
  TRANSFORMEDTWEETSPATH: string;
  CHECKPOINTPATH: string;
  PROCESSEDTWEETSPATH: string;
  BASETWITTERURL: string;
  X_USERNAME: string;
  GEMINI_API_KEY: string;
  GEMINI_MODEL: string;
  BATCH_SIZE: number;
  CRITERIA: Criteria;
};

const loadFromEnv = (key: string, defaultValue: string): string => {
  const value = Bun.env[key];
  if (value) {
    return value;
  }
  return defaultValue;
};

const defaultCriteria = (): Criteria => {
  return {
    forbiddenWords: [],
    topicsToExclude: [
      "Profanity or unprofessional language",
      "Personal attacks or insults",
      "Outdated political opinions",
    ],
    toneRequirements: [
      "Professional language only",
      "Respectful communication",
    ],
    additionalInstructions:
      "Flag any content that could harm professional reputation",
  };
};

const getFilePath = (filePath: string) => {
  return path.join(process.cwd(), "src/app", filePath);
};

export const createConfig = ({
  TWEETSARCHIVEPATH,
  TRANSFORMEDTWEETSPATH,
  CHECKPOINTPATH,
  PROCESSEDTWEETSPATH,
  BASETWITTERURL,
  BATCH_SIZE,
  CRITERIA,
}: {
  TWEETSARCHIVEPATH?: string;
  TRANSFORMEDTWEETSPATH?: string;
  CHECKPOINTPATH?: string;
  PROCESSEDTWEETSPATH?: string;
  BASETWITTERURL?: string;
  BATCH_SIZE?: number;
  CRITERIA?: Criteria;
} = {}): Config => {
  if (Bun.env.NODE_ENV === "test") {
    return {
      TWEETSARCHIVEPATH:
        TWEETSARCHIVEPATH || getFilePath("storage/testdata/tweets.json"),
      TRANSFORMEDTWEETSPATH:
        TRANSFORMEDTWEETSPATH ||
        getFilePath("storage/testdata/writer/tweets.csv"),
      CHECKPOINTPATH:
        CHECKPOINTPATH ||
        getFilePath("storage/testdata/checkpoint/checkpoint.json"),
      PROCESSEDTWEETSPATH:
        PROCESSEDTWEETSPATH ||
        getFilePath("storage/testdata/writer/tweets_result.csv"),
      BASETWITTERURL: BASETWITTERURL || "https://x.com",
      X_USERNAME: loadFromEnv("X_USERNAME", "baq"),
      GEMINI_API_KEY: loadFromEnv("GEMINI_API_KEY", ""),
      GEMINI_MODEL: loadFromEnv("GEMINI_MODEL", "gemini-2.5-flash"),
      BATCH_SIZE: BATCH_SIZE || 5,
      CRITERIA: CRITERIA || defaultCriteria(),
    };
  }

  return {
    TWEETSARCHIVEPATH:
      TWEETSARCHIVEPATH || getFilePath("storage/data/tweets.json"),
    TRANSFORMEDTWEETSPATH:
      TRANSFORMEDTWEETSPATH || getFilePath("storage/data/tweets.csv"),
    CHECKPOINTPATH:
      CHECKPOINTPATH || getFilePath("storage/data/checkpoint.json"),
    PROCESSEDTWEETSPATH:
      PROCESSEDTWEETSPATH ||
      getFilePath("storage/data/tweets/tweets_result.csv"),
    BASETWITTERURL: BASETWITTERURL || "https://x.com",
    X_USERNAME: loadFromEnv("X_USERNAME", "baq"),
    GEMINI_API_KEY: loadFromEnv("GEMINI_API_KEY", ""),
    GEMINI_MODEL: loadFromEnv("GEMINI_MODEL", "gemini-2.5-flash"),
    BATCH_SIZE: BATCH_SIZE || 5,
    CRITERIA: CRITERIA || defaultCriteria(),
  };
};
