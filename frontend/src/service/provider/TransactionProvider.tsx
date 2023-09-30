import React from "react"
import {List, Lists, toList} from "@damntools.fr/types"
import {Account, Transaction, TransactionFlag} from "@damntools.fr/wnab-data"
import {DateTime} from "luxon"
import {TransactionApiService} from "../TransactionApiService"
import {TransactionFlagApiService} from "../TransactionFlagApiService"

export type TransactionProviderState = {
  transactions: List<Transaction>
  flags: List<TransactionFlag>
  txByAccount: (account: Account) => List<Transaction>
  refresh: () => void
}

export const TransactionContext = React.createContext(
  {} as TransactionProviderState
)

const newMonthFromToday = DateTime.now()
  .set({hour: 0, minute: 0, second: 0, millisecond: 0})
  .plus({month: 1})

export const isBeforeNextMonth = (v: Transaction): v is Transaction =>
  v.date.toMillis() < newMonthFromToday.toMillis()

export const TransactionConsumer = TransactionContext.Consumer

export const filterTodayAndBefore = (v: Transaction): v is Transaction =>
  v.date.toMillis() <
  DateTime.now()
    .set({hour: 0, minute: 0, second: 0, millisecond: 0})
    .plus({day: 1})
    .toMillis()

export class TransactionProvider extends React.Component<
  any,
  TransactionProviderState
> {
  private static INSTANCE: TransactionProvider | null = null

  state: TransactionProviderState = {
    txByAccount: (account: Account) => {
      return this.state.transactions
        .stream()
        .filter(
          (tx): tx is Transaction =>
            tx.account?.id === account.id && isBeforeNextMonth(tx)
        )
        .collect(toList)
    },
    transactions: Lists.empty(),
    flags: Lists.empty(),
    refresh: () => {
      this.prepareData()
    }
  }

  constructor(props: any) {
    super(props)
    TransactionProvider.INSTANCE = this
  }

  static refresh() {
    if (this.INSTANCE) this.INSTANCE.state.refresh()
  }

  componentDidMount() {
    this.prepareData()
  }

  prepareData() {
    TransactionApiService.get()
      .getTxs()
      .then(txs =>
        TransactionFlagApiService.get()
          .getFlags()
          .then(flags => this.setState({transactions: txs, flags}))
      )
  }

  render() {
    return (
      <TransactionContext.Provider value={this.state}>
        {this.props.children}
      </TransactionContext.Provider>
    )
  }
}
