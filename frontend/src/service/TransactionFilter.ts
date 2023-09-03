import {Dict, List, Optionable, toList} from "@damntools.fr/types"
import {Transaction} from "@damntools.fr/wnab-data"
import {FilterValue, SearchType} from "./provider"

export class TransactionFilter {
  static filter(
    transactions: List<Transaction>,
    search: Optionable<string>,
    searchType: SearchType,
    filters: Dict<keyof Transaction, List<FilterValue>>
  ) {
    return transactions
      .copy()
      .stream()
      .filter(tx => TransactionFilter.filterByFilters(tx, filters))
      .filter(tx => TransactionFilter.filterBySearch(tx, search, searchType))
      .collect(toList)
  }

  static filterBySearch(
    tx: Transaction,
    search: Optionable<string>,
    type: SearchType
  ): boolean {
    if (search.isEmpty()) {
      return true
    } else if (search.get().length >= 2) {
      if (type === "account") {
        return search
          .filter(
            s => !!tx.account?.name.toLowerCase().includes(s.toLowerCase())
          )
          .isPresent()
      } else if (type === "category") {
        return search
          .filter(
            s =>
              !!tx.category?.name.toLowerCase().includes(s.toLowerCase()) ||
              !!tx.category?.parentCategory?.name
                .toLowerCase()
                .includes(s.toLowerCase())
          )
          .isPresent()
      } else if (type === "description") {
        return search
          .filter(s => tx.description.toLowerCase().includes(s.toLowerCase()))
          .isPresent()
      } else if (type === "peer") {
        return search
          .filter(s => !!tx.peer?.name.toLowerCase().includes(s.toLowerCase()))
          .isPresent()
      } else if (type === "all") {
        return search
          .filter(
            s =>
              tx.account?.name.toLowerCase().includes(s.toLowerCase()) ||
              tx.peer?.name.toLowerCase().includes(s.toLowerCase()) ||
              tx.flag?.name.toLowerCase().includes(s.toLowerCase()) ||
              tx.description.toLowerCase().includes(s.toLowerCase()) ||
              tx.category?.name.toLowerCase().includes(s.toLowerCase()) ||
              tx.category?.parentCategory?.name
                .toLowerCase()
                .includes(s.toLowerCase()) ||
              `${tx.cashFlow}`.includes(s)
          )
          .isPresent()
      }
    }
    return true
  }

  static filterByFilters(
    tx: Transaction,
    filters: Dict<keyof Transaction, List<FilterValue>>
  ): boolean {
    if (filters.isEmpty()) {
      return true
    } else {
      return filters
        .keys()
        .stream()
        .every(field => {
          const values = filters.get(field)
          if (values.isEmpty()) {
            return true
          } else if (field === "flag") {
            return !!values.stream().find(v => v.value === tx.flag?.name)
          } else if (field === "account") {
            return !!values.stream().find(v => v.value === tx.account?.name)
          } else if (field === "peer") {
            return !!values.stream().find(v => v.value === tx.peer?.name)
          } else if (field === "status") {
            return !!values.stream().find(v => v.value === tx.status?.key())
          } else if (field === "category") {
            return !!values
              .stream()
              .find(v => v.value === tx.category?.pretty())
          } else {
            return false
          }
        })
    }
  }
}
