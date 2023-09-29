import {
  TransactionFlag,
  TransactionFlagDto,
  TransactionFlagDtoMapper,
} from "@damntools.fr/wnab-data";
import { TransactionFlagDataService } from "~/service";
import {
  AuthenticatedDataController,
  Http400Error,
} from "@damntools.fr/express-utils";
import {
  DataWriteError,
  SqlConstraintViolationError,
  SqlUniqueConstraintViolationError,
} from "@damntools.fr/sqlite";
import { AuthenticationIdHook } from "~/service/CustomAuthenticationProvider";

export class TransactionFlagController extends AuthenticatedDataController<
  number,
  TransactionFlag,
  TransactionFlagDto
> {
  constructor() {
    super(
      "/transactionFlag",
      TransactionFlagDataService.get(),
      TransactionFlagDtoMapper.get(),
      "userProfileId",
      AuthenticationIdHook,
      true,
    );
    this.builder = this.builder
      .authenticated()
      .mapException<DataWriteError>(DataWriteError, (error) => {
        if (error.reason() instanceof SqlUniqueConstraintViolationError)
          return new Http400Error(
            (error.reason() as SqlUniqueConstraintViolationError).constraint() +
              " should be unique",
          );
        if (error.reason() instanceof SqlConstraintViolationError)
          return new Http400Error(error.reason().message);
        return new Http400Error(error.message);
      });
  }
}
