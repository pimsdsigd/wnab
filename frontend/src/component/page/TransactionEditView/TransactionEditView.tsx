import React, {JSX} from "react"
import styles from "./AccountCreationView.module.scss"
import {
  CheckboxInput,
  ChoiceSelector,
  TextInput,
  VD
} from "@damntools.fr/react-inputs"
import {Lists, Optionable, Optional} from "@damntools.fr/types"
import {Account, AccountType} from "@damntools.fr/wnab-data"
import {png_cash, png_coin, png_credit_card, png_savings} from "../../../assets"
import {
  AlertProvider,
  Notification,
  Popin,
  PopinButton,
  PopinButtonRow
} from "@damntools.fr/react-alert"
import {AccountProvider} from "../../../service"
import {AccountApiService} from "../../../service/AccountApiService"

export type AccountCreationViewProps = {
  popinId: string
  onSave?: (account: Account) => Promise<any>
  onUpdate?: (account: Account) => Promise<any>
  account: Optionable<Account>
}

export type AccountCreationViewState = {
  closed: Optionable<boolean>
  name: Optionable<string>
  type: Optionable<AccountType>
}

export const openAccountViewPopup = (account?: Account) => {
  AlertProvider.submitPopin(
    Popin.title("Account configuration")
      .DisableActions()
      .Content(id => (
        <AccountCreationView
          popinId={id}
          account={Optional.nullable(account)}
        />
      ))
  )
}

export class AccountCreationView extends React.Component<
  AccountCreationViewProps,
  AccountCreationViewState
> {
  constructor(props: AccountCreationViewProps) {
    super(props)
    if (this.props.account.isPresent()) {
      const account = this.props.account.get()
      this.state = {
        closed: Optional.of(account.closed),
        name: Optional.of(account.name),
        type: Optional.of(account.type)
      }
    } else {
      this.state = {
        closed: Optional.of(false),
        name: Optional.empty(),
        type: Optional.empty()
      }
    }
  }

  render() {
    return (
      <div className={styles.Form}>
        <div className={styles.Rows}>
          {this.getRow(
            "Name",
            <TextInput
              dark={true}
              onChange={v => this.onChangeName(v)}
              hideFormat={true}
              value={this.state.name.map(VD)}
            />
          )}
          {this.getRow(
            "Type",
            <ChoiceSelector
              dark={true}
              onChange={v => this.onChangeType(v)}
              values={this.getTypeValues()}
              selectedValue={this.state.type.map(VD)}
            />
          )}
          {this.getRow(
            "Closed",
            <div>
              <CheckboxInput
                size={"25px"}
                dark={true}
                onChange={v => this.onChangeClosed(v)}
                checked={this.state.closed.orElseReturn(false)}
              />
            </div>
          )}
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

  private getRow(label: string, input: JSX.Element): JSX.Element {
    return (
      <div className={styles.FormRow}>
        <div className={styles.RowLabel}>
          <span>{label}</span>
        </div>
        <div className={styles.RowInput}>{input}</div>
      </div>
    )
  }

  private getTypeValues() {
    return [
      VD(AccountType.CASH).Display("Cash").Icon(png_cash),
      VD(AccountType.DAILY_USAGE).Display("Daily usage").Icon(png_credit_card),
      VD(AccountType.SAVINGS).Display("Savings").Icon(png_savings),
      VD(AccountType.INVESTMENT).Display("Investment").Icon(png_coin)
    ]
  }

  private onSuccess() {
    let errored = false
    if (this.state.name.isEmpty()) {
      AlertProvider.submitNotification(
        Notification.error("Validation issue").Subtitle(
          "Name should not be empty"
        )
      )
      errored = true
    }
    if (this.state.type.isEmpty()) {
      AlertProvider.submitNotification(
        Notification.error("Validation issue").Subtitle("Type should be set")
      )
      errored = true
    }
    if (!errored) {
      const account = new Account({
        closed: this.state.closed.orElseReturn(false),
        name: this.state.name.get(),
        type: this.state.type.get()
      })
      if (this.props.account.isPresent()) {
        account.id = this.props.account.get().id
        void AccountApiService.get()
          .updateAccount(account)
          .then(() => AccountProvider.refresh())
          .then(() => AlertProvider.removeAlert(this.props.popinId))
      } else {
        void AccountApiService.get()
          .createAccount(account)
          .then(() => AccountProvider.refresh())
          .then(() => AlertProvider.removeAlert(this.props.popinId))
      }
    }
  }

  private onCancel() {
    AlertProvider.removeAlert(this.props.popinId)
  }

  private onChangeName(value: Optionable<string>) {
    this.setState({name: value})
  }

  private onChangeType(value: Optionable<AccountType>) {
    this.setState({type: value})
  }

  private onChangeClosed(value: Optionable<boolean>) {
    this.setState({closed: value})
  }
}
