import React from "react"
import {Account, AccountType} from "@damntools.fr/wnab-data"
import styles from "./AccountInfoCartouche.module.scss"
import {CssClass, StringUtils} from "@damntools.fr/utils-simple"
import {
  png_cash,
  png_credit_card,
  png_menu_chart,
  png_savings
} from "../../../assets"
import {openAccountViewPopup} from "../../page"
import {AlertProvider, Notification, Popin} from "@damntools.fr/react-alert"
import {AccountService} from "../../../service/AccountService"
import {AccountProvider, TransactionProvider} from "../../../service"
import {openAccountReconcilePopup} from "../../page/AccountReconcileView";

export type AccountInfoCartoucheProps = {
  account: Account
  showButtons: boolean
}

export class AccountInfoCartouche extends React.Component<
  AccountInfoCartoucheProps,
  any
> {
  render() {
    const account = this.props.account
    return (
      <div className={styles.AccountInfo}>
        <div>
          <div>
            <h1>{account.name}</h1>
            <h2>
              <span></span>
              <img
                src={this.getImageForType(account.type)}
                alt={account.type.key()}
                title={account.type.key()}
              />
              <span>
                {StringUtils.firstToUpper(account.type.key()) + " account"}
              </span>
            </h2>
          </div>
        </div>
        {this.props.showButtons ? (
          <div className={CssClass.from(styles.Actions).get()}>
            <div>
              <div className={styles.Configure}>
                <span onClick={() => this.onConfigureClick(account)}>
                  Configure
                </span>
              </div>
              <div className={styles.Reconcile}>
                <span onClick={() => this.onReconcileClick(account)}>
                  Reconcile
                </span>
              </div>
              <div className={styles.ClearAll}>
                <span onClick={() => this.onClearClick(account)}>
                  Clear all
                </span>
              </div>
              <div
                className={CssClass.classIf(
                  styles.Open,
                  account.closed,
                  styles.Close
                ).get()}>
                <span onClick={() => this.onCloseClick(account)}>
                  {account.closed ? "Open" : "Close"}
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  private getImageForType(type: AccountType) {
    if (AccountType.CASH.equals(type)) return png_cash
    else if (AccountType.INVESTMENT.equals(type)) return png_menu_chart
    else if (AccountType.DAILY_USAGE.equals(type)) return png_credit_card
    else if (AccountType.SAVINGS.equals(type)) return png_savings
  }

  private onConfigureClick(account: Account) {
    openAccountViewPopup(account)
  }

  private onCloseClick(account: Account) {
    if (account.closed) {
      this.openAccount(account)
    } else {
      this.closeAccount(account)
    }
  }

  private closeAccount(account: Account) {
    AlertProvider.submitPopin(
      Popin.warning("Are you sure to close account ?").SuccessAction(id => {
        AccountService.get()
          .closeAccount(account)
          .catch(() => {
            AlertProvider.submitNotification(
              Notification.error().Subtitle("Could not close account")
            )
          })
          .then(() => AlertProvider.removeAlert(id))
          .then(() => AccountProvider.refresh())
      }, "Yes")
    )
  }

  private openAccount(account: Account) {
    AlertProvider.submitPopin(
      Popin.warning("Are you sure to open account ?").SuccessAction(id => {
        AccountService.get()
          .openAccount(account)
          .catch(() => {
            AlertProvider.submitNotification(
              Notification.error().Subtitle("Could not open account")
            )
          })
          .then(() => AlertProvider.removeAlert(id))
          .then(() => AccountProvider.refresh())
      }, "Yes")
    )
  }

  private onClearClick(account: Account) {
    AlertProvider.submitPopin(
      Popin.warning("Are you sure to clear all transactions ?").SuccessAction(
        id => {
          AccountService.get()
            .clearAll(account)
            .catch(() => {
              AlertProvider.submitNotification(
                Notification.error().Subtitle("Could not clear transactions")
              )
            })
            .then(() => TransactionProvider.refresh())
            .then(() => AccountProvider.refresh())
            .then(() => AlertProvider.removeAlert(id))
        },
        "Yes"
      )
    )
  }

  private onReconcileClick(account: Account) {
    openAccountReconcilePopup(account)
  }
}
