import {DtoMapper, EnumMapper} from "@damntools.fr/data"
import {Account, AccountDto} from "../Account"
import {AccountType} from "../../AccountType"

export class AccountDtoMapper extends DtoMapper<Account, AccountDto> {
  static INSTANCE: AccountDtoMapper | null = null

  constructor() {
    super(Account)
    this.addMapping({from: "type", mapper: new EnumMapper(AccountType)})
    this.ignoreField("balance")
  }

  static get(): AccountDtoMapper {
    if (this.INSTANCE === null) {
      this.INSTANCE = new AccountDtoMapper()
    }
    return this.INSTANCE
  }
}
