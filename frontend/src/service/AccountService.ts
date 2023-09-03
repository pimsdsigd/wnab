import {ArrayList, defined, List, toList} from "@damntools.fr/types"
import {Account, AccountDto, AccountDtoMapper} from "@damntools.fr/wnab-data"
import axios from "axios"

export type EnrichedAccount = Account & {
  balance: number
}

export class AccountService {
  static INSTANCE: AccountService | null = null

  getAccounts(): Promise<List<Account>> {
    return axios
      .get("http://localhost:8000/api/account")
      .then(res => new ArrayList<AccountDto>(res.data))
      .then(res =>
        res
          .stream()
          .map(a => AccountDtoMapper.get().mapTo(a))
          .collect(toList)
      )
  }

  getSplitBalances(accounts: List<Account>): Promise<List<EnrichedAccount>> {
    return axios
      .get("http://localhost:8000/api/account/balance/split")
      .then(res => res.data as any)
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
    return axios.post(
      "http://localhost:8000/api/account",
      AccountDtoMapper.get().mapFrom(account)
    )
  }

  updateAccount(account: Account) {
    if (!account.id) return Promise.reject("Account should contains id ! ")
    return axios.put(
      `http://localhost:8000/api/account/${account.id}`,
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
    return axios
      .get(`http://localhost:8000/api/account/${account.id}/clear`)
      .then(res => res.data as void)
  }

  reconcile(account: Account, amount: number) {
    return axios
      .put(`http://localhost:8000/api/account/${account.id}/reconcile`, {
        amount
      })
      .then(res => res.data as void)
  }

  static get(): AccountService {
    if (this.INSTANCE === null) {
      this.INSTANCE = new AccountService()
    }
    return this.INSTANCE
  }
}
