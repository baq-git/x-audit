import { run } from "./tweet-audit/commands";

async function main() {
  try {
    await run();
  } catch (error: any) {
    console.error(error);
  }
}

main();
