export interface Tweet {
  id: string;
  text: string;
}

export interface AnalyzedTweet {
  id: string;
  tweetURL: string;
  shouldDelete: boolean;
}
