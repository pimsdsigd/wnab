import React from "react"
import {
  BudgetEntry,
  BudgetSelection,
  BudgetViewConsumer
} from "../../../../service"
import {ArrayList, Dict, List, toList} from "@damntools.fr/types"
import styles from "./BudgetTransactions.module.scss"
import {
  Account,
  AccountType,
  Transaction,
  TransactionStatus
} from "@damntools.fr/wnab-data"
import {CssClass} from "@damntools.fr/utils-simple"
import {
  png_cash,
  png_coin,
  png_credit_card,
  png_savings
} from "../../../../assets"
import {PriceView} from "../../../static"

export type BudgetAssignFormProps = {
  budgetSheet: Dict<number, BudgetEntry>
}

export class BudgetTransactions extends React.Component<
  BudgetAssignFormProps,
  any
> {
  render() {
    return (
      <BudgetViewConsumer>
        {({selectedCategories}) => {
          return this.getContent(
            selectedCategories
              .stream()
              .filter(c => c.selected)
              .collect(toList)
          )
        }}
      </BudgetViewConsumer>
    )
  }

  private getContent(selectedCategories: List<BudgetSelection>) {
    if (selectedCategories.isEmpty()) return <div></div>
    const budgets: List<BudgetEntry> = selectedCategories
      .stream()
      .map(s => this.props.budgetSheet.get(s.categoryId))
      .filterPresent()
      .collect(toList)
    const currentTransactions = budgets.stream().reduce((a, e) => {
      console.log("bt cur", e.currentTransactions.size())
      return e.currentTransactions.hasElements()
        ? a.concat(e.currentTransactions)
        : a
    }, new ArrayList<Transaction>())
    console.log("bt full cur", currentTransactions.size())
    const pendingTransactions = budgets
      .stream()
      .reduce(
        (a, e) =>
          e.pendingTransactions.hasElements()
            ? a.concat(e.pendingTransactions)
            : a,
        new ArrayList<Transaction>()
      )
    return (
      <div className={styles.BudgetTransactions}>
        <div>
          <div>
            {pendingTransactions
              .stream()
              .filterPresent()
              .map(tx => this.getTransactionEntry(tx, true))
              .concat(
                currentTransactions
                  .stream()
                  .filterPresent()
                  .map(tx => this.getTransactionEntry(tx, false))
              )
              .log()
              .sort((a, b) => b.date - a.date)
              .map(e => e.element)
              .collectArray()}
          </div>
        </div>
      </div>
    )
  }

  private getTransactionEntry(tx: Transaction, pending: boolean) {
    return {
      element: (
        <div key={tx.id}
          className={CssClass.from(styles.TxEntry)
            .classIf(styles.Pending, pending)
            .get()}>
          <div className={styles.Flag}>
            <span
              style={{color: tx.flag?.color || "white"}}
              title={tx.flag?.name || "Unset"}>
              &#9873;
            </span>
          </div>
          <div className={styles.Account}>
            {this.getAccountIcon(tx.account as Account)}
          </div>
          <div className={styles.Date}>{tx.date.toFormat("dd.MM.yy")}</div>
          <div className={styles.Peer}>{tx.peer?.name}</div>
          <div className={styles.Price}>
            <PriceView value={tx.cashFlow} />
          </div>
          <div className={styles.Status}>
            {TransactionStatus.UNCLEARED.equals(tx.status) ? (
              <span style={{color: "rgb(187,149,70)"}} title={"Uncleared"}>
                &#10007;
              </span>
            ) : (
              <span style={{color: "rgb(139, 175, 115)"}} title={"Cleared"}>
                &#10003;
              </span>
            )}
          </div>
        </div>
      ),
      date: tx.date.toMillis()
    }
  }

  private getAccountIcon(account: Account) {
    if (AccountType.CASH.equals(account.type))
      return <img src={png_cash} title={account.name} alt={account.name} />
    else if (AccountType.DAILY_USAGE.equals(account.type))
      return (
        <img src={png_credit_card} title={account.name} alt={account.name} />
      )
    else if (AccountType.SAVINGS.equals(account.type))
      return <img src={png_savings} title={account.name} alt={account.name} />
    else if (AccountType.INVESTMENT.equals(account.type))
      return <img src={png_coin} title={account.name} alt={account.name} />
  }
}
