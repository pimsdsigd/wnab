import express from "express";
import { Logging } from "@damntools.fr/logger-simple";
import { AccountController, TransactionController } from "~/controller";
import { Controller } from "@damntools.fr/express-utils";
import { Lists } from "@damntools.fr/types";

const logger = Logging.getLogger("Routing");

export default function routing() {
  const router = express.Router();
  logger.debug("Preparing routes...");

  const controllers = Lists.of<Controller>(
    new AccountController(),
    new TransactionController(),
  );

  controllers.forEach((controller) => {
    controller.register(router);
    controller.printRoutes()
  });

  logger.debug(`Loaded ${controllers.size()} controllers !`);

  return router;
}
