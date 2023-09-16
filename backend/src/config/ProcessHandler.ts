import { Logging } from "@damntools.fr/logger-simple";
import { RecurringTransactionTask } from "~/service";

let HANDLER: any = null;

const exitHandler = (options: any, exitCode: any): any => {
  const logger = Logging.getLogger("ProcessHandler");
  if (options.cleanup) logger.debug("Cleaning...");
  RecurringTransactionTask.get().close();
};

export class ProcessHandler {
  done: boolean;

  constructor() {
    this.done = false;
  }

  addEvents() {
    if (!this.done) {
      process.on("exit", exitHandler.bind(null, { cleanup: true }));

      process.on("SIGINT", exitHandler.bind(null, { exit: true }));

      process.on("SIGUSR1", exitHandler.bind(null, { exit: true }));
      process.on("SIGUSR2", exitHandler.bind(null, { exit: true }));

      process.on("uncaughtException", exitHandler.bind(null, { exit: true }));
      this.done = true;
    }
  }

  static do() {
    if (HANDLER === null) HANDLER = new ProcessHandler();
    HANDLER.addEvents();
  }
}
