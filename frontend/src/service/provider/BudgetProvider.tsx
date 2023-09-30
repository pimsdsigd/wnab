import React from "react"
import {Dict, KV, List, Lists, toList} from "@damntools.fr/types"
import {Budget, Transaction} from "@damntools.fr/wnab-data"
import {BudgetApiService} from "../BudgetApiService"
import {DateTime} from "luxon"
import {BudgetEntry} from "./BudgetViewProvider"

export type BudgetProviderState = {
  budgets: List<Budget>
  refresh: () => void
  getSheetForMonth: (
    transactions: List<Transaction>,
    month: DateTime
  ) => Dict<number, BudgetEntry>
}

export const BudgetContext = React.createContext({} as BudgetProviderState)

export const BudgetConsumer = BudgetContext.Consumer

export class BudgetProvider extends React.Component<any, BudgetProviderState> {
  private static INSTANCE: BudgetProvider | null = null

  state: BudgetProviderState = {
    budgets: Lists.empty(),
    refresh: () => {
      void this.prepareData()
    },
    getSheetForMonth: (transactions: List<Transaction>, month: DateTime) => {
      return this.getBudgetSheet(transactions, month)
    }
  }

  constructor(props: any) {
    super(props)
    BudgetProvider.INSTANCE = this
  }

  static refresh() {
    if (this.INSTANCE) this.INSTANCE.state.refresh()
  }

  componentDidMount() {
    void this.prepareData()
  }

  prepareData() {
    return BudgetApiService.get()
      .getBudgets()
      .then(
        budgets =>
          new Promise<List<Budget>>(resolve =>
            this.setState({budgets: budgets as List<Budget>}, () =>
              resolve(budgets)
            )
          )
      )
  }

  getBudgetSheet(transactions: List<Transaction>, month: DateTime) {
    const tomorrow = DateTime.now()
      .set({
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0
      })
      .plus({day: 1})
      .toMillis()

    const rangeStart = month.toMillis()
    const rangeEnd = month.plus({month: 1}).toMillis()
    const monthBudgets = this.state.budgets
      .stream()
      .filter(
        b => b.month.toMillis() >= rangeStart && b.month.toMillis() < rangeEnd
      )
      .collect(toList)
    return this.getSheetForBudgets(
      monthBudgets,
      transactions,
      rangeStart,
      rangeEnd,
      tomorrow
    )
  }

  private getSheetForBudgets(
    monthBudgets: List<Budget>,
    transactions: List<Transaction>,
    rangeStart: number,
    rangeEnd: number,
    tomorrow: number
  ) {
    const budgetSheet = KV.empty<number, BudgetEntry>()
    monthBudgets.forEach((b: Budget) => {
      const processed = this.processBudget(
        transactions,
        b,
        rangeStart,
        rangeEnd,
        tomorrow
      )
      budgetSheet.put(b.categoryId as number, processed)
    })
    return budgetSheet
  }

  private processBudget(
    transactions: List<Transaction>,
    budget: Budget,
    rangeStart: number,
    rangeEnd: number,
    tomorrow: number
  ): BudgetEntry {
    const txs = transactions
      .stream()
      .filter(
        tx =>
          tx.categoryId === budget.categoryId &&
          tx.date.toMillis() >= rangeStart &&
          tx.date.toMillis() < rangeEnd
      )
      .collect(toList)
    const pending = txs
      .stream()
      .filter(
        tx => tx.date.toMillis() >= tomorrow && tx.date.toMillis() < rangeEnd
      )
      .collect(toList)
    const current = txs
      .stream()
      .filter(tx => tx.date.toMillis() < tomorrow)
      .collect(toList)
    const lastMonth = this.getLastMonthBudget(budget, transactions)
    budget.activity = current.stream().reduce((o, c) => o + c.cashFlow, 0)
    budget.available = budget.budgeted + budget.activity
    return {
      month: budget.month.toFormat("yyyy-MM"),
      lastMonth,
      budget: budget,
      transactions: txs,
      pendingTransactions: pending,
      currentTransactions: current
    }
  }

  render() {
    return (
      <BudgetContext.Provider value={this.state}>
        {this.props.children}
      </BudgetContext.Provider>
    )
  }

  private getLastMonthBudget(
    budget: Budget,
    transactions: List<Transaction>
  ): BudgetEntry | undefined {
    const next = budget.month.set({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0
    })
    const last = next.minus({month: 1})
    const rangeStart = last.toMillis()
    const rangeEnd = next.toMillis()
    return this.state.budgets
      .stream()
      .findFirst(
        b =>
          b.month.toMillis() >= rangeStart &&
          b.month.toMillis() < rangeEnd &&
          b.categoryId === budget.categoryId
      )
      .map(b =>
        this.processBudget(transactions, b, rangeStart, rangeEnd, rangeEnd)
      )
      .orElseUndefined()
  }
}
