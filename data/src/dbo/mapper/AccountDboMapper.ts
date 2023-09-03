import {DboMapper} from "@damntools.fr/data"
import {AccountDbo} from "../AccountDbo"
import {Account} from "../../dto"

export class AccountDboMapper extends DboMapper<Account, number, AccountDbo> {
  static INSTANCE: AccountDboMapper | null = null

  constructor() {
    super(Account)
  }

  static get(): AccountDboMapper {
    if (this.INSTANCE === null) {
      this.INSTANCE = new AccountDboMapper()
    }
    return this.INSTANCE
  }
}
