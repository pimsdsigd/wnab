import {ArrayList, List, toList} from "@damntools.fr/types"
import {
  TransactionFlag,
  TransactionFlagDto,
  TransactionFlagDtoMapper
} from "@damntools.fr/wnab-data"
import axios from "axios"

export class TransactionFlagApiService {
  static INSTANCE: TransactionFlagApiService | null = null

  getFlags(): Promise<List<TransactionFlag>> {
    return axios
      .get("http://localhost:8000/api/transactionFlag")
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
    return axios.post(
      "http://localhost:8000/api/transactionFlag",
      TransactionFlagDtoMapper.get().mapFrom(flag)
    )
  }

  update(flag: TransactionFlag) {
    if (!flag.id) return Promise.reject("Account should contains id ! ")
    return axios.put(
      `http://localhost:8000/api/transactionFlag/${flag.id}`,
      TransactionFlagDtoMapper.get().mapFrom(flag)
    )
  }

  delete(flags: List<number>) {
    return axios
      .delete(
        `http://localhost:8000/api/transactionFlag?ids=${flags
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
