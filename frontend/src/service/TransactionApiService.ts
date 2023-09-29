import {ArrayList, List, toList} from "@damntools.fr/types"
import {
  Transaction,
  TransactionDto,
  TransactionDtoMapper
} from "@damntools.fr/wnab-data"
import {AxiosService} from "./AxiosService"
import {AxiosWrapper} from "@damntools.fr/http"

export class TransactionApiService {
  static INSTANCE: TransactionApiService | null = null
  private readonly axios: AxiosWrapper

  constructor() {
    this.axios = AxiosService.getAuthenticatedInstance().child({
      baseURL: "/transaction"
    })
  }

  getTxs(): Promise<List<Transaction>> {
    return this.axios
      .get("")
      .then(res => new ArrayList<TransactionDto>(res.data))
      .then(res => {
        return res
          .stream()
          .map(a => {
            return TransactionDtoMapper.get().mapTo(a)
          })
          .collect(toList)
      })
  }

  createTx(tx: Transaction) {
    if (tx.id) return Promise.reject("Transaction should not contains id ! ")
    return this.axios.post("", TransactionDtoMapper.get().mapFrom(tx))
  }

  updateTx(tx: Transaction) {
    if (!tx.id) return Promise.reject("Transaction should contains id ! ")
    return this.axios.put(`/${tx.id}`, TransactionDtoMapper.get().mapFrom(tx))
  }

  deleteTxs(txs: List<number>) {
    return this.axios.delete(`?ids=${txs.stream().join(",")}`).then(() => {})
  }

  clearTxs(txs: List<number>) {
    return this.axios.get(`/clear?ids=${txs.stream().join(",")}`).then(() => {})
  }

  duplicateTx(txId: number) {
    return this.axios.get(`/${txId}/duplicate`).then(() => {})
  }

  static get(): TransactionApiService {
    if (this.INSTANCE === null) {
      this.INSTANCE = new TransactionApiService()
    }
    return this.INSTANCE
  }
}
