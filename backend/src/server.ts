import express from "express";
import cors, {CorsOptions} from "cors";
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
import routing from "~/config/routing";
import {
  AccountDataService,
  BudgetDataService,
  CategoryDataService,
  PeerDataService,
  TransactionDataService,
  TransactionFlagDataService,
} from "~/service";
import { RecurringTransactionTask } from "~/service/task/RecurringTransactionTask";
import {
  AuthenticationRegistry,
  ExecutionRegistry,
  ExecutionService,
  JWTAuthenticationService,
} from "@damntools.fr/express-utils";
import { UserProfileDataService } from "~/service/UserProfileDataService";
import cookieParser from "cookie-parser";
import {CustomAuthenticationProvider} from "~/service/CustomAuthenticationProvider";

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

const corsOptions: CorsOptions = {
  origin: "http://localhost:3000",
  credentials: true
};

const logger = Logging.getLogger("Main");

ExecutionRegistry.get().registerExecutor(new ExecutionService());
AuthenticationRegistry.get().setOptions({
  accessTokenSecret: "532279cb-a86e-4e58-a9d2-fa99b40f4ae9",
  refreshTokenSecret: "afcf1789-7dbb-464d-b968-28d77ddcd83c",
});
AuthenticationRegistry.get().registerUserService(UserProfileDataService.get());
AuthenticationRegistry.get().registerAuthenticationService(
  new JWTAuthenticationService(),
);
AuthenticationRegistry.get().registerAuthenticationProvider(new CustomAuthenticationProvider())

app.use(morganMiddleware());
app.use(cors(corsOptions));
app.use(helmet());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);
app.use("/api", routing());
app.use(express.static("public"));
ProcessHandler.do();

function loadDataIntoCaches() {
  return CategoryDataService.get()
    .getAll()
    .then((all) => logger.info(`Loaded ${all.size()} categories`))
    .then(() => PeerDataService.get().getAll())
    .then((all) => logger.info(`Loaded ${all.size()} peers`))
    .then(() => AccountDataService.get().getAll())
    .then((all) => logger.info(`Loaded ${all.size()} accounts`))
    .then(() => TransactionFlagDataService.get().getAll())
    .then((all) => logger.info(`Loaded ${all.size()} flags`))
    .then(() => TransactionDataService.get().getAll())
    .then((all) => logger.info(`Loaded ${all.size()} transactions`))
    .then(() => BudgetDataService.get().getAll())
    .then((all) => logger.info(`Loaded ${all.size()} budget entries`));
}

ConcurrentSqliteDb.init()
  .then(() => loadDataIntoCaches())
  .then(() => RecurringTransactionTask.get().init())
  .then(() =>
    app.listen(port, () => logger.info("Server app listening on port " + port)),
  );


//wnabadmin753987