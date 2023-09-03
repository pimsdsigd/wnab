import React from "react"
import styles from "./AccountReconcileView.module.scss"
import {FloatInput, VD} from "@damntools.fr/react-inputs"
import {Lists, Optionable, Optional} from "@damntools.fr/types"
import {Account} from "@damntools.fr/wnab-data"
import {
  AlertProvider,
  Notification,
  Popin,
  PopinButton,
  PopinButtonRow
} from "@damntools.fr/react-alert"
import {
  AccountProvider,
  AccountService,
  TransactionProvider
} from "../../../service"

export type AccountReconcileViewProps = {
  popinId: string
  onSave?: (account: Account) => Promise<any>
  onUpdate?: (account: Account) => Promise<any>
  account: Account
}

export type AccountReconcileViewState = {
  currentAmount: Optionable<number>
}

export const openAccountReconcilePopup = (account: Account) => {
  AlertProvider.submitPopin(
    Popin.title("Reconcile account")
      .DisableActions()
      .Content(id => <AccountReconcileView popinId={id} account={account} />)
  )
}

export class AccountReconcileView extends React.Component<
  AccountReconcileViewProps,
  AccountReconcileViewState
> {
  constructor(props: AccountReconcileViewProps) {
    super(props)
    this.state = {
      currentAmount: Optional.empty()
    }
  }

  render() {
    return (
      <div className={styles.Form}>
        <div className={styles.Rows}>
          <div className={styles.FormRow}>
            <div className={styles.RowLabel}>
              <span>Current amount</span>
            </div>
            <div className={styles.RowInput}>
              <FloatInput
                dark={true}
                onChange={v => this.onChangeAmount(v)}
                hideFormat={true}
                value={this.state.currentAmount.map(VD)}
              />
            </div>
          </div>
        </div>
        <div className={styles.Buttons}>
          <PopinButtonRow
            buttons={Lists.of(
              <PopinButton
                key={this.props.popinId + "ok"}
                popinId={this.props.popinId}
                action={{
                  callback: () => this.onSuccess(),
                  type: "success",
                  title: "Save"
                }}
                theme={"dark"}
              />,
              <PopinButton
                key={this.props.popinId + "cancel"}
                popinId={this.props.popinId}
                action={{
                  callback: () => this.onCancel(),
                  type: "cancel",
                  title: "Cancel"
                }}
                theme={"dark"}
              />
            )}
          />
        </div>
      </div>
    )
  }

  private onSuccess() {
    if (this.state.currentAmount.isEmpty()) {
      AlertProvider.submitNotification(
        Notification.error("Validation issue").Subtitle(
          "Amount should be provided"
        )
      )
    } else {
      void AccountService.get()
        .reconcile(this.props.account, this.state.currentAmount.get())
        .then(() => TransactionProvider.refresh())
        .then(() => AccountProvider.refresh())
        .then(() => AlertProvider.removeAlert(this.props.popinId))
    }
  }

  private onCancel() {
    AlertProvider.removeAlert(this.props.popinId)
  }

  private onChangeAmount(v: Optionable<number>) {
    this.setState({currentAmount: v})
  }
}
