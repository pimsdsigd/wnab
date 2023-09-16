import {ArrayList, List, toList} from "@damntools.fr/types"
import {
  Transaction,
  TransactionDto,
  TransactionDtoMapper
} from "@damntools.fr/wnab-data"
import axios from "axios"

export class TransactionApiService {
  static INSTANCE: TransactionApiService | null = null

  getTxs(): Promise<List<Transaction>> {
    return axios
      .get("http://localhost:8000/api/transaction")
      .then(res => new ArrayList<TransactionDto>(res.data))
      .then(res => {
        return res
          .stream()
          .map(a => {
            if( a.id === 2216)
              debugger
            const re =  TransactionDtoMapper.get().mapTo(a)
            if( a.id === 2216)
              debugger
            return re
          })
          .collect(toList)
      })
  }

  createTx(tx: Transaction) {
    if (tx.id) return Promise.reject("Transaction should not contains id ! ")
    return axios.post(
      "http://localhost:8000/api/transaction",
      TransactionDtoMapper.get().mapFrom(tx)
    )
  }

  updateTx(tx: Transaction) {
    if (!tx.id) return Promise.reject("Transaction should contains id ! ")
    return axios.put(
      `http://localhost:8000/api/transaction/${tx.id}`,
      TransactionDtoMapper.get().mapFrom(tx)
    )
  }

  deleteTxs(txs: List<number>) {
    return axios
      .delete(
        `http://localhost:8000/api/transaction?ids=${txs.stream().join(",")}`
      )
      .then(() => {})
  }

  clearTxs(txs: List<number>) {
    return axios
      .get(
        `http://localhost:8000/api/transaction/clear?ids=${txs
          .stream()
          .join(",")}`
      )
      .then(() => {})
  }

  duplicateTx(txId: number) {
    return axios
      .get(`http://localhost:8000/api/transaction/${txId}/duplicate`)
      .then(() => {})
  }

  static get(): TransactionApiService {
    if (this.INSTANCE === null) {
      this.INSTANCE = new TransactionApiService()
    }
    return this.INSTANCE
  }
}
