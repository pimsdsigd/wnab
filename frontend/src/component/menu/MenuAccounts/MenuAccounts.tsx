import React from "react"
import {AccountType} from "@damntools.fr/wnab-data"
import styles from "./MenuAccounts.module.scss"
import {AccountConsumer, EnrichedAccount} from "../../../service"
import {List, toList} from "@damntools.fr/types"
import {MenuAccount} from "../MenuAccount"
import {PriceView} from "../../static"
import {PRICE_POSITIVE_COLOR} from "../../../constants"

const budgetFilter = (account: EnrichedAccount): account is EnrichedAccount =>
  !account.closed &&
  (account.type.equals(AccountType.CASH) ||
    account.type.equals(AccountType.DAILY_USAGE))
const trackingFilter = (account: EnrichedAccount): account is EnrichedAccount =>
  !account.closed &&
  (account.type.equals(AccountType.INVESTMENT) ||
    account.type.equals(AccountType.SAVINGS))

const closedFilter = (account: EnrichedAccount): account is EnrichedAccount =>
  account.closed

export type MenuAccountsState = {
  budgetExpand: boolean
  trackingExpand: boolean
  closedExpand: boolean
}

export class MenuAccounts extends React.Component<any, MenuAccountsState> {
  state: MenuAccountsState = {
    budgetExpand: true,
    closedExpand: false,
    trackingExpand: true
  }

  render() {
    return (
      <AccountConsumer>
        {({accounts}) => {
          const budgetAccounts = this.getBudgetAccounts(accounts)
          const trackingAccounts = this.getTrackingAccounts(accounts)
          const closedAccounts = this.getClosedAccounts(accounts)
          const budgetTotal = budgetAccounts
            .stream()
            .map(a => a.balance || 0.0)
            .reduce((o, c) => o + c, 0)
          const trackingTotal = trackingAccounts
            .stream()
            .map(a => a.balance || 0.0)
            .reduce((o, c) => o + c, 0)
          const closedTotal = closedAccounts
            .stream()
            .map(a => a.balance || 0.0)
            .reduce((o, c) => o + c, 0)
          return (
            <div>
              <div className={styles.SpecificAccounts}>
                <div
                  className={styles.AccountsTitle}
                  onClick={() =>
                    this.setState({budgetExpand: !this.state.budgetExpand})
                  }>
                  <span>
                    {this.state.budgetExpand ? "▲" : "▼"} Budget accounts
                  </span>
                  <PriceView
                    value={budgetTotal}
                    positiveColor={PRICE_POSITIVE_COLOR}
                  />
                </div>
                <div className={styles.BudgetAccounts}>
                  {this.state.budgetExpand
                    ? this.getAccountMenus(budgetAccounts).collectArray()
                    : null}
                </div>
              </div>
              <div className={styles.SpecificAccounts}>
                <div
                  className={styles.AccountsTitle}
                  onClick={() =>
                    this.setState({trackingExpand: !this.state.trackingExpand})
                  }>
                  <span>
                    {this.state.trackingExpand ? "▲" : "▼"} Tracking accounts
                  </span>
                  <PriceView
                    value={trackingTotal}
                    positiveColor={PRICE_POSITIVE_COLOR}
                  />
                </div>
                <div className={styles.TrackingAccounts}>
                  {this.state.trackingExpand
                    ? this.getAccountMenus(trackingAccounts).collectArray()
                    : null}
                </div>
              </div>
              <div className={styles.SpecificAccounts}>
                <div
                  className={styles.AccountsTitle}
                  onClick={() =>
                    this.setState({closedExpand: !this.state.closedExpand})
                  }>
                  <span>
                    {this.state.closedExpand ? "▲" : "▼"} Closed accounts
                  </span>
                  <PriceView
                    value={closedTotal}
                    positiveColor={PRICE_POSITIVE_COLOR}
                  />
                </div>
                <div className={styles.ClosedAccounts}>
                  {this.state.closedExpand
                    ? this.getAccountMenus(closedAccounts).collectArray()
                    : null}
                </div>
              </div>
            </div>
          )
        }}
      </AccountConsumer>
    )
  }

  private getAccountMenus(accounts: List<EnrichedAccount>) {
    return accounts
      .stream()
      .map(account => <MenuAccount key={account.name} account={account} />)
  }

  private getBudgetAccounts(
    accounts: List<EnrichedAccount>
  ): List<EnrichedAccount> {
    return accounts.stream().filter(budgetFilter).collect(toList)
  }

  private getTrackingAccounts(
    accounts: List<EnrichedAccount>
  ): List<EnrichedAccount> {
    return accounts.stream().filter(trackingFilter).collect(toList)
  }

  private getClosedAccounts(
    accounts: List<EnrichedAccount>
  ): List<EnrichedAccount> {
    return accounts.stream().filter(closedFilter).collect(toList)
  }
}
