import { BooleanNumberMapper, EnumMapper } from "@damntools.fr/data";
import { AccountDbo, AccountType } from "@damntools.fr/wnab-data";
import { SimpleDataAccessor } from "@damntools.fr/sqlite";

export class AccountRepository extends SimpleDataAccessor<number, AccountDbo> {
  static INSTANCE: AccountRepository | null = null;

  constructor() {
    super("account");
    this.addMapping({ from: "type", mapper: new EnumMapper(AccountType) });
    this.addMapping({ from: "closed", mapper: new BooleanNumberMapper() });
  }

  static get(): AccountRepository {
    if (this.INSTANCE === null) {
      this.INSTANCE = new AccountRepository();
    }
    return this.INSTANCE;
  }
}
