import {ArrayList, List, toList} from "@damntools.fr/types"
import {
  Transaction,
  TransactionDto,
  TransactionDtoMapper,
  TransactionFlag,
  TransactionFlagMapper
} from "@damntools.fr/wnab-data"
import axios from "axios"

export class TransactionApiService {
    static INSTANCE: TransactionApiService | null = null

    getTxs(): Promise<List<Transaction>> {
        return axios
            .get("http://localhost:8000/api/transaction")
            .then(res => new ArrayList<TransactionDto>(res.data))
            .then(res =>
                res
                    .stream()
                    .map(a => TransactionDtoMapper.get().mapTo(a))
                    .collect(toList)
            )
    }

    getFlags(): Promise<List<TransactionFlag>>{
      return axios
          .get("http://localhost:8000/api/transaction/flag")
          .then(res => new ArrayList<string>(res.data))
          .then(res =>
              res
                  .stream()
                  .map(a => TransactionFlagMapper.get().mapTo(a))
                  .collect(toList)
          )
    }

    createTx(tx: Transaction) {
        if (tx.id) return Promise.reject("Account should not contains id ! ")
        return axios.post(
            "http://localhost:8000/api/transaction",
            TransactionDtoMapper.get().mapFrom(tx)
        )
    }

    updateTx(tx: Transaction) {
        if (!tx.id) return Promise.reject("Account should contains id ! ")
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
            .then(() => {
            })
    }

    clearTxs(txs: List<number>) {
        return axios
            .get(
                `http://localhost:8000/api/transaction/clear?ids=${txs.stream().join(",")}`
            )
            .then(() => {
            })
    }

    duplicateTx(txId: number) {
        return axios
            .get(
                `http://localhost:8000/api/transaction/${txId}/duplicate`
            )
            .then(() => {
            })
    }

    static get(): TransactionApiService {
        if (this.INSTANCE === null) {
            this.INSTANCE = new TransactionApiService()
        }
        return this.INSTANCE
    }
}
