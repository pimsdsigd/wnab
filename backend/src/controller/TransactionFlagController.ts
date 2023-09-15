import {
  Transaction,
  TransactionDto,
  TransactionDtoMapper,
} from "@damntools.fr/wnab-data";
import { TransactionDataService } from "~/service";
import { DataController, withQueryParam } from "@damntools.fr/express-utils";
import { Request } from "express";
import { ValueListMapper } from "@damntools.fr/data";
import { List, toList } from "@damntools.fr/types";

export class TransactionController extends DataController<
  number,
  Transaction,
  TransactionDto
> {
  constructor() {
    super(
      "/transaction",
      TransactionDataService.get(),
      TransactionDtoMapper.get(),
      true,
    );
  }

  setRoutes() {
    this.get(
      "/clear",
      this.do((r) => this.clearTransactions(r)),
    );
    this.get(
      "/flag",
      this.do(() => this.getAllFlags()),
    );
    super.setRoutes();
  }

  private clearTransactions(r: Request): Promise<List<Transaction>> {
    return withQueryParam<string>(r, "ids")
      .then((ids) => ValueListMapper.stringArray().mapFrom(ids))
      .then((ids) =>
        ids
          .stream()
          .map((id) => this.idMapper().mapFrom(id))
          .collect(toList),
      )
      .then((ids) =>
        this.service<TransactionDataService>().clearTransactions(ids),
      );
  }

  private getAllFlags(): Promise<List<string>> {
    return this.service<TransactionDataService>().getAllFlags();
  }
}
