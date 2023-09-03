import { DateTimeTimestampMapper, EnumMapper } from "@damntools.fr/data";
import { SimpleDataAccessor } from "@damntools.fr/sqlite";
import {
  TransactionDbo,
  TransactionFlagMapper,
  TransactionStatus,
} from "@damntools.fr/wnab-data";

export class TransactionRepository extends SimpleDataAccessor<
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
    this.addMapping({ from: "flag", mapper: TransactionFlagMapper.get() });
  }

  static get(): TransactionRepository {
    if (this.INSTANCE === null) {
      this.INSTANCE = new TransactionRepository();
    }
    return this.INSTANCE;
  }
}
