import fs from "fs";

export class Logger {
  private file: fs.WriteStream | undefined;
  private static logger: Logger;

  static getInstance() {
    if (!this.logger) {
      this.logger = new Logger();
    }
    return this.logger;
  }

  constructor() {
    if (process.env.LOGGER_DIR) {
      const date = new Date();
      const parsedDate =
        date.getDate().toString() + (date.getMonth() + 1).toString() + date.getFullYear().toString();
      this.file = fs.createWriteStream(`${process.env.LOGGER_DIR}/log${parsedDate}.log`, { flags: "a" });
    }
  }

  error(e: Error) {
    this.file?.write(`${e.stack}\n`);
    console.error(e);
  }

  log(msg: string) {
    this.file?.write(`${msg}\n`);
    console.log(msg);
  }
}
