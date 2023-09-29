import { CachedDataAccessor } from "@damntools.fr/sqlite";
import { BooleanNumberMapper } from "@damntools.fr/data";
import { TransactionFlagDbo } from "@damntools.fr/wnab-data";

export class TransactionFlagRepository extends CachedDataAccessor<
  number,
  TransactionFlagDbo
> {
  static INSTANCE: TransactionFlagRepository | null = null;

  constructor() {
    super("transactionFlag");
    this.addMapping({ from: "hidden", mapper: new BooleanNumberMapper() });
  }

  static get(): TransactionFlagRepository {
    if (this.INSTANCE === null) {
      this.INSTANCE = new TransactionFlagRepository();
    }
    return this.INSTANCE;
  }
}
