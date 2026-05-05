# Technical Tradeoffs & Design Decisions
This is the project that I reprogramming one of small feature that implement in my recent jobs but make it more socilize to use by everyone to filter their post in the X-social media.

<<<<<<< HEAD
## Language Choice: 
=======
## Language Choice: Typescript with Bun
I choose Typescript because this is the first statically typed language that I learn and I can write it proficiently. Furthermore, it ensures type safety for Data Models. Secondly, in most of technologies we faced today, there is a faith that Bun is run faster than the other JS environments in I/O systems. Very approriate with small CLI tool in JS ecosystems.
>>>>>>> bfe8dc7 (update TRADEOFFS.md)

The downside of Bun is the stability and the compatiblilty with JS Api although the Typescript is quite mature. The community is small and lack of guiding and bugs fixtures. Bun for Windows OS is under development and face more problems than the others.

## Modular Package Structure

Faster in writing Unit Test because component can be tested independently, and allows infrastructure code to be reused elsewhere. The disavantage is we use more files and packages instead of a flat structure.

## Architecture: Batch Processing with Checkpointing

The tool processes tweets in fixed-size batches, saves progress after each batch, and exits. This design is cron-friendly: each run is short (60-90 seconds), easy to monitor, and stateless.

Sequential processing trades speed for simplicity. It naturally rate-limits API calls, makes debugging straightforward, and the checkpoint mechanism means failures don't lose progress. The next run just picks up where it left off.

I thoght about using concurrent processing for 5-10x faster throughput, but that adds complexity: partial batch failures, retry logic, rate limit management, and harder-to-track progress. For a workflow that runs continuously on a schedule, the sequential approach is more maintainable.

## Simple State Management

Progress tracking stores a single integer: the index of the next tweet to process. This assumes the CSV doesn't change between runs, which is valid since extraction and analysis are separate phases.

The alternative, tracking individual processed tweet IDs would handle dataset changes better but requires state serialization, more memory, and complex resume logic. The simple approach works fine for this use case.

## AI models intergration: GEMINI first

Free tier and low-cost with flash GEMINI. Easy in criteria config. Use structured output (JSON schema) + clear prompt so the output is quitely deterministic.

The problem was It reached the rate limit quickly although analyzing the small batch. The time is slow and.

## Fail-Fast Error Handling
Errors immediately stop processing instead of retrying automatically. When a batch fails, the checkpoint doesn't update, so the next cron run retries that batch automatically.

This removes the need for retry policies, backoff algorithms, and partial state tracking. It assumes cron provides sufficient retry semantics, which works for batch jobs where immediate completion isn't critical.
