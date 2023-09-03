import React from "react"
import {
  Transaction,
  TransactionFlag,
  TransactionStatus
} from "@damntools.fr/wnab-data"
import {CssClass} from "@damntools.fr/utils-simple"
import styles from "./TransactionLine.module.scss"
import {PriceView} from "../../../static"
import {DateTime} from "luxon"
import {CheckboxInput} from "@damntools.fr/react-inputs"
import {AccountProvider, TransactionApiService} from "../../../../service"
import {AlertProvider, Notification} from "@damntools.fr/react-alert"

export type TransactionLineProps = {
  tx: Transaction
  className: string
  showAccount: boolean
  onSelect: (reset: boolean) => void
  selected: boolean
}

const tomorrow = DateTime.now()
  .set({hour: 0, minute: 0, second: 0, millisecond: 0})
  .plus({day: 1})

export const isTodayOrBefore = (v: Transaction): v is Transaction =>
  v.date.toMillis() < tomorrow.toMillis()

export class TransactionLine extends React.Component<
  TransactionLineProps,
  any
> {
  render() {
    const tx = this.props.tx
    const isFuture = !isTodayOrBefore(tx)
    return (
      <div
        className={CssClass.from(this.props.className, styles.TransactionLine)
          .classIf(
            styles.Uncleared,
            TransactionStatus.UNCLEARED.equals(tx.status)
          )
          .classIf(styles.Future, isFuture)
          .get()}>
        <div className={styles.SelectionCheckbox} title={tx.id + ""}>
          <CheckboxInput
            size={"16px"}
            checked={this.props.selected}
            onChange={() => this.props.onSelect(false)}
            dark={true}
            color={"rgb(139, 175, 115)"}
          />
        </div>
        <div className={styles.Flag}>{this.getFlag(tx.flag)}</div>
        <div className={styles.Date}>{tx.date.toFormat("dd.MM.yyyy")}</div>
        {this.props.showAccount ? (
          <div className={styles.Account}>{tx.account?.name}</div>
        ) : null}
        <div className={styles.Peer}>{tx.peer?.name}</div>
        <div className={styles.Category}>
          {tx.category ? tx.category.pretty() : ""}
        </div>
        <div className={styles.Desc}>{tx.description}</div>
        <div className={styles.CashFlow}>
          <PriceView value={tx.cashFlow} />
        </div>
        <div className={styles.StatusCheckbox}>
          {!isFuture ? (
            <span onClick={() => this.onClickStatus()}>
              {TransactionStatus.UNCLEARED.equals(tx.status) ? (
                <span style={{color: "rgb(187,149,70)"}}>&#10007;</span>
              ) : (
                <span style={{color: "rgb(139, 175, 115)"}}>&#10003;</span>
              )}
            </span>
          ) : null}
        </div>
      </div>
    )
  }

  private getFlag(flag?: TransactionFlag): JSX.Element {
    if (!flag) return <span>&#9873;</span>
    return <span style={{color: flag.color}}>&#9873;</span>
  }

  private onClickStatus() {
    let status: TransactionStatus | null = null
    if (TransactionStatus.UNCLEARED.equals(this.props.tx.status))
      status = TransactionStatus.CLEARED
    else if (TransactionStatus.CLEARED.equals(this.props.tx.status))
      status = TransactionStatus.UNCLEARED
    if (status) {
      this.props.tx.status = status
      TransactionApiService.get()
        .updateTx(this.props.tx)
        .then(() => AccountProvider.refresh())
        .catch(() => {
          AlertProvider.submitNotification(
            Notification.error().Subtitle("Could not set status")
          )
        })
    }
  }
}
