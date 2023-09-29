import {ArrayList, KV, List} from "@damntools.fr/types"
import {Transaction} from "@damntools.fr/wnab-data"

export class ReportUtils {
  static groupTransactionsByMonths(transactions: List<Transaction>) {
    const groups = KV.empty<number, List<Transaction>>()
    transactions.forEach(tx => {
      const date = tx.date
        .set({day: 1, hour: 0, minute: 0, second: 0, millisecond: 0})
        .toMillis()
      if (groups.hasKey(date)) {
        groups.get(date).push(tx)
      } else {
        groups.put(date, new ArrayList([tx]))
      }
    })
    return groups
  }

  static groupTransactionsByDays(transactions: List<Transaction>) {
    const groups = KV.empty<number, List<Transaction>>()
    transactions.forEach(tx => {
      const date = tx.date
        .set({hour: 0, minute: 0, second: 0, millisecond: 0})
        .toMillis()
      if (groups.hasKey(date)) {
        groups.get(date).push(tx)
      } else {
        groups.put(date, new ArrayList([tx]))
      }
    })
    return groups
  }
}
