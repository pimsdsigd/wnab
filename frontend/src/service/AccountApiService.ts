import {ArrayList, defined, List, toList} from "@damntools.fr/types"
import {Account, AccountDto, AccountDtoMapper} from "@damntools.fr/wnab-data"
import {AxiosWrapper} from "@damntools.fr/http"
import {AxiosService} from "./AxiosService"

export type EnrichedAccount = Account & {
  balance: number
}

export class AccountApiService {
  static INSTANCE: AccountApiService | null = null
  private readonly axios: AxiosWrapper

  constructor() {
    this.axios = AxiosService.getAuthenticatedInstance().child({
      baseURL: "/account"
    })
  }

  getAccounts(): Promise<List<Account>> {
    return this.axios
      .get("")
      .then(res => new ArrayList<AccountDto>(res.data))
      .then(res =>
        res
          .stream()
          .map(a => AccountDtoMapper.get().mapTo(a))
          .collect(toList)
      )
  }

  getSplitBalances(accounts: List<Account>): Promise<List<EnrichedAccount>> {
    return this.axios
      .get("/balance/split")
      .then(res => res.data)
      .then(res => {
        return accounts
          .stream()
          .filter((a): a is Account => defined(a.id))
          .map(a => a as EnrichedAccount)
          .peek(a => (a.balance = res[a.id as number]))
          .collect(toList)
      })
  }

  createAccount(account: Account) {
    if (account.id) return Promise.reject("Account should not contains id ! ")
    return this.axios.post("", AccountDtoMapper.get().mapFrom(account))
  }

  updateAccount(account: Account) {
    if (!account.id) return Promise.reject("Account should contains id ! ")
    return this.axios.put(
      `/${account.id}`,
      AccountDtoMapper.get().mapFrom(account)
    )
  }

  closeAccount(account: Account) {
    account.closed = true
    return this.updateAccount(account)
  }

  openAccount(account: Account) {
    account.closed = false
    return this.updateAccount(account)
  }

  clearAll(account: Account) {
    return this.axios.get(`/${account.id}/clear`).then(res => res.data as void)
  }

  reconcile(account: Account, amount: number) {
    return this.axios
      .put(`/${account.id}/reconcile`, {
        amount
      })
      .then(res => res.data as void)
  }

  static get(): AccountApiService {
    if (this.INSTANCE === null) {
      this.INSTANCE = new AccountApiService()
    }
    return this.INSTANCE
  }
}
