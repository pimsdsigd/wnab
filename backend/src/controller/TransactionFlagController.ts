import {
  TransactionFlag,
  TransactionFlagDto,
  TransactionFlagDtoMapper,
} from "@damntools.fr/wnab-data";
import { TransactionFlagDataService } from "~/service";
import { DataController, Http400Error } from "@damntools.fr/express-utils";
import {
  DataWriteError,
  SqlConstraintViolationError,
  SqlUniqueConstraintViolationError,
} from "@damntools.fr/sqlite";

export class TransactionFlagController extends DataController<
  number,
  TransactionFlag,
  TransactionFlagDto
> {
  constructor() {
    super(
      "/transactionFlag",
      TransactionFlagDataService.get(),
      TransactionFlagDtoMapper.get(),
      true,
    );
    this.builder = this.builder.mapException<DataWriteError>(
      DataWriteError,
      (error) => {
        if (error.reason() instanceof SqlUniqueConstraintViolationError)
          return new Http400Error(
            (error.reason() as SqlUniqueConstraintViolationError).constraint() +
              " should be unique",
          );
        if (error.reason() instanceof SqlConstraintViolationError)
          return new Http400Error(error.reason().message);
        return new Http400Error(error.message);
      },
    );
  }
}
