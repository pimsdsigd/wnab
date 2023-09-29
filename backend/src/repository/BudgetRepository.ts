import { CachedDataAccessor } from "@damntools.fr/sqlite";
import { BudgetDbo } from "@damntools.fr/wnab-data";
import { DateTimeTimestampMapper } from "@damntools.fr/data";

export class BudgetRepository extends CachedDataAccessor<number, BudgetDbo> {
  static INSTANCE: BudgetRepository | null = null;

  constructor() {
    super("budget");
    this.addMapping({ from: "month", mapper: new DateTimeTimestampMapper() });
  }

  static get(): BudgetRepository {
    if (this.INSTANCE === null) {
      this.INSTANCE = new BudgetRepository();
    }
    return this.INSTANCE;
  }
}
