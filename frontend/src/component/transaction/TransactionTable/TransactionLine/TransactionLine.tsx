import React from "react"
import {
  Transaction,
  TransactionFlag,
  TransactionStatus
} from "@damntools.fr/wnab-data"
import {CssClass} from "@damntools.fr/utils-simple"
import styles from "./TransactionLine.module.scss"
import {FlagSelector, PriceView} from "../../../static"
import {DateTime} from "luxon"
import {CheckboxInput} from "@damntools.fr/react-inputs"
import {
  AccountProvider,
  TransactionApiService,
  TransactionProvider
} from "../../../../service"
import {AlertProvider, Notification} from "@damntools.fr/react-alert"
import {Optionable, Optional} from "@damntools.fr/types"
import {openTransactionEditPopup} from "../../../page";

export type TransactionLineProps = {
  tx: Transaction
  className: string
  showAccount: boolean
  onSelect: (reset: boolean) => void
  selected: boolean
}

export type TransactionLineState = {
  editPrice: boolean
}

const tomorrow = DateTime.now()
  .set({hour: 0, minute: 0, second: 0, millisecond: 0})
  .plus({day: 1})

export const isTodayOrBefore = (v: Transaction): v is Transaction =>
  v.date.toMillis() < tomorrow.toMillis()

export class TransactionLine extends React.Component<
  TransactionLineProps,
  TransactionLineState
> {
  constructor(props: TransactionLineProps) {
    super(props)
    this.state = {
      editPrice: false
    }
  }

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
        {this.getFlag(tx.flag)}
        <div onClick={() => this.editTx()} className={styles.Date}>{tx.date.toFormat("dd.MM.yyyy")}</div>
        {this.props.showAccount ? (
          <div className={styles.Account} onClick={() => this.editTx()}>{tx.account?.name}</div>
        ) : null}
        <div onClick={() => this.editTx()} className={styles.Peer}>{tx.peer?.name}</div>
        <div onClick={() => this.editTx()} className={styles.Category}>
          {tx.category ? tx.category.pretty() : ""}
        </div>
        <div onClick={() => this.editTx()} className={styles.Desc}>{tx.description}</div>
        <div onClick={() => this.editTx()} className={styles.CashFlow}>
          <div>
            <PriceView value={tx.cashFlow} />
          </div>
        </div>
        <div className={styles.StatusCheckbox}>
          {!isFuture ? (
            <span onClick={() => this.onClickStatus()}>
              {TransactionStatus.UNCLEARED.equals(tx.status) ? (
                <span style={{color: "rgb(187,149,70)"}} title={"Uncleared"}>&#10007;</span>
              ) : (
                <span style={{color: "rgb(139, 175, 115)"}} title={"Cleared"}>&#10003;</span>
              )}
            </span>
          ) : null}
        </div>
      </div>
    )
  }

  private getFlag(flag?: TransactionFlag): JSX.Element {
    return (
      <div className={styles.Flag}>
        <span
          style={{color: flag?.color || "white"}}
          title={flag?.name || "Unset"}>
          &#9873;
        </span>
        <div>
          <FlagSelector
            selected={Optional.nullable(this.props.tx.flag)}
            onChange={(v: Optionable<TransactionFlag>) => this.onChangeFlag(v)}
          />
        </div>
      </div>
    )
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

  private onChangeFlag(v: Optionable<TransactionFlag>) {
    this.props.tx.flag = v.orElseUndefined()
    TransactionApiService.get()
      .updateTx(this.props.tx)
      .then(() => AccountProvider.refresh())
      .then(() => TransactionProvider.refresh())
      .catch(() => {
        AlertProvider.submitNotification(
          Notification.error().Subtitle("Could not set flag")
        )
      })
  }

    private editTx() {
        openTransactionEditPopup(Optional.nullable(this.props.tx), Optional.nullable(this.props.tx.account))
    }
}
