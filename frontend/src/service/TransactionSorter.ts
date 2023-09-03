import {List, Optionable} from "@damntools.fr/types"
import {Transaction} from "@damntools.fr/wnab-data"
import {SortParam} from "./provider"

export class TransactionSorter {
  static sort(
    sort: Optionable<SortParam<Transaction>>,
    filtered: List<Transaction>
  ): List<Transaction> {
    if (sort.isPresent()) {
      const sortParam = sort.get()
      filtered.sort((a, b) => {
        if (sortParam.field === "peer")
          return (
            a.peer?.name
              .toLowerCase()
              .localeCompare(b.peer?.name.toLowerCase() as string) ||
            b.date.toMillis() - a.date.toMillis()
          )
        else if (sortParam.field === "account")
          return (
            a.account?.name
              .toLowerCase()
              .localeCompare(b.account?.name.toLowerCase() as string) ||
            b.date.toMillis() - a.date.toMillis()
          )
        else if (sortParam.field === "category")
          return (
            a.category
              ?.pretty()
              .toLowerCase()
              .localeCompare(b.category?.pretty().toLowerCase() as string) ||
            b.date.toMillis() - a.date.toMillis()
          )
        else if (sortParam.field === "flag")
          return (
            a.flag?.name
              .toLowerCase()
              .localeCompare(b.flag?.name.toLowerCase() as string) ||
            b.date.toMillis() - a.date.toMillis()
          )
        else if (sortParam.field === "date")
          return b.date.toMillis() - a.date.toMillis()
        else if (sortParam.field === "cashFlow")
          return (
            b.cashFlow - a.cashFlow || b.date.toMillis() - a.date.toMillis()
          )
        else if (sortParam.field === "status")
          return (
            a.status.compare(b.status) || b.date.toMillis() - a.date.toMillis()
          )
        return b.date.toMillis() - a.date.toMillis()
      })
      if (sortParam.direction === "desc") filtered.reverse()
    }
    return filtered
  }
}
