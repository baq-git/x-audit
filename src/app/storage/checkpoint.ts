import { createConfig, type Config } from "../config";
import TweetAuditError from "../error";
import { privateFileMode } from "./permission";

type checkpoint = {
  index: number;
  date: string;
};

export class Checkpoint {
  config: Config;
  constructor() {
    this.config = createConfig();
  }

  async load(): Promise<checkpoint> {
    try {
      const config = this.config;
      const file = Bun.file(config.CHECKPOINTPATH);
      const isFileExists = await file.exists();

      if (!isFileExists) {
        await Bun.write(
          config.CHECKPOINTPATH,
          JSON.stringify({ index: 0, date: new Date() }),
          {
            mode: privateFileMode,
          },
        );

        return {
          index: 0,
          date: new Date().toISOString(),
        };
      }

      const { index, date } = await file.json();
      if (!index || !date) {
        return {
          index: 0,
          date: new Date().toISOString(),
        };
      }

      return {
        index: index,
        date: new Date(date).toISOString(),
      };
    } catch (error: any) {
      if (error.code === "ENOENT") {
        return {
          index: 0,
          date: new Date().toISOString(),
        };
      } else if (error instanceof SyntaxError) {
        throw new TweetAuditError({
          name: "ReadCheckpointError",
          message: "Checkpoint file is empty",
          cause: error,
        });
      } else {
        throw new TweetAuditError({
          name: "ReadCheckpointError",
          message: "Failed to read checkpoint",
          cause: error,
        });
      }
    }
  }

  async save(index: number, date: string) {
    try {
      const config = this.config;
      if (config.CHECKPOINTPATH === "") {
        throw new TweetAuditError({
          name: "WriteCheckpointError",
          message: "Checkpoint path not set",
        });
      }

      await Bun.write(config.CHECKPOINTPATH, JSON.stringify({ index, date }), {
        mode: privateFileMode,
      });

      console.log("Saved checkpoint", { index, date });
    } catch (error: any) {
      if (error.code === "ENOENT") {
        throw new TweetAuditError({
          name: "WriteCheckpointError",
          message: "Unknow checkpoint path",
        });
      }
      throw new TweetAuditError({
        name: "WriteCheckpointError",
        message: "Failed to write checkpoint",
        cause: error,
      });
    }
  }
}
