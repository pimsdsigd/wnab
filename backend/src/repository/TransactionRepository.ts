import {
  BooleanNumberMapper,
  DateTimeTimestampMapper,
  EnumMapper,
} from "@damntools.fr/data";
import { CachedDataAccessor } from "@damntools.fr/sqlite";
import {
  RecurringTransactionStep,
  TransactionDbo,
  TransactionStatus,
} from "@damntools.fr/wnab-data";

export class TransactionRepository extends CachedDataAccessor<
  number,
  TransactionDbo
> {
  static INSTANCE: TransactionRepository | null = null;

  constructor() {
    super("transactionEvent");
    this.addMapping({ from: "date", mapper: new DateTimeTimestampMapper() });
    this.addMapping({
      from: "status",
      mapper: new EnumMapper(TransactionStatus),
    });
    this.addMapping({
      from: "repeat",
      mapper: new EnumMapper(RecurringTransactionStep),
    });
    this.addMapping({ from: "repeated", mapper: new BooleanNumberMapper() });
  }

  static get(): TransactionRepository {
    if (this.INSTANCE === null) {
      this.INSTANCE = new TransactionRepository();
    }
    return this.INSTANCE;
  }
}
