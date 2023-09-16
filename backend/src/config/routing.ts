import express from "express";
import { Logging } from "@damntools.fr/logger-simple";
import {
  AccountController,
  TransactionController,
  TransactionFlagController,
} from "~/controller";
import { Controller } from "@damntools.fr/express-utils";
import { Lists } from "@damntools.fr/types";
import { CategoryController } from "~/controller/CategoryController";
import { PeerController } from "~/controller/PeerController";

const logger = Logging.getLogger("Routing");

export default function routing() {
  const router = express.Router();
  logger.debug("Preparing routes...");

  const controllers = Lists.of<Controller>(
    new AccountController(),
    new TransactionController(),
    new CategoryController(),
    new PeerController(),
    new TransactionFlagController(),
  );

  controllers.forEach((controller) => {
    controller.register(router);
    controller.printRoutes();
  });

  logger.debug(`Loaded ${controllers.size()} controllers !`);

  return router;
}
