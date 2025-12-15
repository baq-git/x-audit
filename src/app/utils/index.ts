import { createConfig } from "../config";

const config = createConfig();

export const printUsage = () => {
  console.log(`
-------------------------------------------------
  Usage: tweet-audit <command> [options]
    Commands:
      extract-tweets  Extract tweets from a file
      analyze-tweets  Analyze tweets
--------------------------------------------------
`);
};

export const getTweetURL = (id: string) => {
  return `https://x.com/${config.X_USERNAME}/status/${id}`;
};
