import express from "express";
import cors from "cors";
import morganMiddleware from "./config/morganMiddleware";
import bodyParser from "body-parser";
import { ProcessHandler } from "./config/ProcessHandler";
import {
  consoleTransport,
  Logging,
  LogLevel,
  nativeConsoleInterceptor,
} from "@damntools.fr/logger-simple";
import helmet from "helmet";
import { ConcurrentSqliteDb } from "@damntools.fr/sqlite";
import { AccountController } from "~/controller";
import routing from "~/config/routing";

Logging.configure({
  httpParsePattern:
    ":method :url :status :res[content-length] - :response-time ms",
  transports: [consoleTransport()],
  nativeConsoleInterceptor,
  level: LogLevel.DEBUG,
});

const app = express();
app.disable("x-powered-by");

const port = process.env.APP_PORT || 8000;

const corsOptions = {
  origin: "*",
};

app.use(morganMiddleware());
app.use(cors(corsOptions));
app.use(helmet());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);
app.use("/api", routing());
app.use(express.static("public"));
new AccountController().register(app);
ProcessHandler.do();

ConcurrentSqliteDb.init().then((db) => {
  // return TransactionDataService.get()
  //   .getAll()
  //   .then((all) => {
  //     console.log(all.size());
  app.listen(port, () =>
    Logging.getLogger("Main").info("Server app listening on port " + port),
  );
  // });
});
