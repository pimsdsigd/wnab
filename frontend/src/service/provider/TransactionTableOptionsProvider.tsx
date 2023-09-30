import React from "react"
import {Transaction} from "@damntools.fr/wnab-data"
import {
  ArrayList,
  Dict,
  KV,
  List,
  Lists,
  Optionable,
  Optional,
  toList
} from "@damntools.fr/types"

export type SearchType = "account" | "peer" | "category" | "description" | "all"
export const SearchTypeList = Lists.of<SearchType>(
  "account",
  "peer",
  "category",
  "description",
  "all"
)

export type SortParam<T> = {
  field: keyof T
  direction: "asc" | "desc"
}

export type FilterValue = {ref: any; value: string}

export type TransactionTableOptionsProviderState = {
  selected: List<number>
  setSelected: (reset: boolean, tx: Transaction) => void
  selectAllToggle: (transactions: List<Transaction>) => void
  isSelected: (tx: Transaction) => boolean
  sort: Optionable<SortParam<Transaction>>
  search: Optionable<string>
  searchType: SearchType
  setSearch: (search: Optionable<string>) => void
  toggleSearchType: () => void
  setSort: (field: keyof Transaction) => void
  filters: Dict<keyof Transaction, List<FilterValue>>
  setFilter: (field: keyof Transaction, value: FilterValue) => void
  isFieldSorted: (field: keyof Transaction) => boolean
}

export const TransactionTableOptionsContext = React.createContext(
  {} as TransactionTableOptionsProviderState
)

export const TransactionTableOptionsConsumer =
  TransactionTableOptionsContext.Consumer

export class TransactionTableOptionsProvider extends React.Component<
  any,
  TransactionTableOptionsProviderState
> {
  state: TransactionTableOptionsProviderState = {
    selected: new ArrayList(),
    isSelected: (tx: Transaction): boolean => {
      return this.state.selected.stream().findIndex(s => s === tx.id) !== -1
    },
    selectAllToggle: (transactions: List<Transaction>) => {
      if (this.state.selected.hasElements())
        this.setState({selected: this.state.selected.clear()})
      else {
        this.setState({
          selected: transactions
            .stream()
            .map(tx => tx.id as number)
            .collect(toList)
        })
      }
    },
    setSelected: (reset: boolean, tx: Transaction): void => {
      const index = this.state.selected.stream().findIndex(s => s === tx.id)
      if (reset && index === -1) {
        this.setState({selected: new ArrayList([tx.id as number])})
      } else if (reset) {
        this.setState({selected: new ArrayList()})
      } else if (index === -1) {
        this.setState({selected: this.state.selected.push(tx.id)})
      } else {
        this.setState({selected: this.state.selected.remove(index)})
      }
    },
    isFieldSorted: (field: keyof Transaction): boolean => {
      return this.state.sort.filter(f => f.field === field).isPresent()
    },
    setSearch: (search: Optionable<string>) => this.setState({search}),
    search: Optional.empty(),
    searchType: "all",
    toggleSearchType: () => {
      const index = SearchTypeList.stream().findIndex(
        t => this.state.searchType === t
      )
      if (index >= SearchTypeList.size() - 1)
        this.setState({searchType: SearchTypeList.get(0) as SearchType})
      else
        return this.setState({
          searchType: SearchTypeList.get(index + 1) as SearchType
        })
    },
    sort: Optional.of({field: "date", direction: "asc"}),
    filters: KV.empty(),
    setFilter: (field: keyof Transaction, value: FilterValue) => {
      if (this.state.filters.hasKey(field)) {
        const values = this.state.filters.get(field)
        const index = values.stream().findIndex(v => v.value === value.value)
        if (index !== -1)
          this.setState({
            filters: this.state.filters.put(field, values.remove(index))
          })
        else
          this.setState({
            filters: this.state.filters.put(field, values.push(value))
          })
      } else {
        this.setState(
          {
            filters: this.state.filters.put(field, new ArrayList([value]))
          }
        )
      }
    },
    setSort: (field: keyof Transaction): void => {
      if (this.state.sort.isPresent()) {
        const found = this.state.sort.filter(s => s.field === field)
        if (
          found
            .filter(f => f.field === field && f.direction === "asc")
            .isPresent()
        ) {
          this.setState({sort: Optional.of({direction: "desc", field})})
        } else if (
          found
            .filter(f => f.field === field && f.direction === "desc")
            .isPresent()
        ) {
          this.setState({sort: Optional.empty()})
        } else if (found.filter(f => f.field === field).isEmpty()) {
          this.setState({sort: Optional.of({direction: "asc", field})})
        }
      } else {
        this.setState({sort: Optional.of({direction: "asc", field})})
      }
    }
  }

  render() {
    return (
      <TransactionTableOptionsContext.Provider value={this.state}>
        {this.props.children}
      </TransactionTableOptionsContext.Provider>
    )
  }
}
