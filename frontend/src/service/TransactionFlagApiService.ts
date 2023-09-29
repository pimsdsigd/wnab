import {ArrayList, List, toList} from "@damntools.fr/types"
import {
  TransactionFlag,
  TransactionFlagDto,
  TransactionFlagDtoMapper
} from "@damntools.fr/wnab-data"
import {AxiosWrapper} from "@damntools.fr/http"
import {AxiosService} from "./AxiosService"

export class TransactionFlagApiService {
  static INSTANCE: TransactionFlagApiService | null = null
  private readonly axios: AxiosWrapper

  constructor() {
    this.axios = AxiosService.getAuthenticatedInstance().child({
      baseURL: "/transactionFlag"
    })
  }

  getFlags(): Promise<List<TransactionFlag>> {
    return this.axios
      .get("")
      .then(res => new ArrayList<TransactionFlagDto>(res.data))
      .then(res =>
        res
          .stream()
          .map(a => TransactionFlagDtoMapper.get().mapTo(a))
          .collect(toList)
      )
  }

  create(flag: TransactionFlag) {
    if (flag.id) return Promise.reject("Account should not contains id ! ")
    return this.axios.post(
      "",
      TransactionFlagDtoMapper.get().mapFrom(flag)
    )
  }

  update(flag: TransactionFlag) {
    if (!flag.id) return Promise.reject("Account should contains id ! ")
    return this.axios.put(
      `/${flag.id}`,
      TransactionFlagDtoMapper.get().mapFrom(flag)
    )
  }

  delete(flags: List<number>) {
    return this.axios
      .delete(
        `?ids=${flags
          .stream()
          .join(",")}`
      )
      .then(() => {})
  }

  static get(): TransactionFlagApiService {
    if (this.INSTANCE === null) {
      this.INSTANCE = new TransactionFlagApiService()
    }
    return this.INSTANCE
  }
}
