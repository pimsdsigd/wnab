import React, {JSX} from "react"
import styles from "./TransactionEditView.module.scss"
import {
  Account,
  Category,
  Peer,
  PeerType,
  RecurringTransactionStep,
  Transaction,
  TransactionFlag,
  TransactionStatus
} from "@damntools.fr/wnab-data"
import {
  ArrayList,
  List,
  Lists,
  Optionable,
  Optional,
  toList
} from "@damntools.fr/types"
import {
  AlertProvider,
  Notification,
  Popin,
  PopinButton,
  PopinButtonRow
} from "@damntools.fr/react-alert"
import {DateTime} from "luxon"
import {
  ChoiceSelector,
  DropDownSelector,
  SimpleCalculatorInput,
  TextInput,
  ValueDesc,
  VD
} from "@damntools.fr/react-inputs"
import {
  AccountConsumer,
  CategoryConsumer,
  PeerConsumer,
  PeerProvider,
  TransactionApiService,
  TransactionProvider
} from "../../../../service"
import {
  TransactionEditViewProps,
  TransactionEditViewState
} from "./TransactionEditView.types"
import {StringUtils} from "@damntools.fr/utils-simple"
import {DatePicker, FlagSelector} from "../../../static"

export const openTransactionEditPopup = (
  tx: Optionable<Transaction>,
  account: Optionable<Account>
) => {
  AlertProvider.submitPopin(
    Popin.title(tx.isPresent() ? "Transaction edit" : "Transaction creation")
      .DisableActions()
      .Content(id => (
        <TransactionEditView account={account} popinId={id} tx={tx} />
      ))
  )
}

export class TransactionEditView extends React.Component<
  TransactionEditViewProps,
  TransactionEditViewState
> {
  private initState: Readonly<TransactionEditViewState>

  constructor(props: TransactionEditViewProps) {
    super(props)
    if (this.props.tx.isPresent()) {
      const tx = this.props.tx.get()
      this.state = {
        date: Optional.of(tx.date),
        description: Optional.of(tx.description),
        flag: Optional.nullable(tx.flag),
        cashFlow: Optional.of(tx.cashFlow),
        status: Optional.of(tx.status),
        category: Optional.nullable(tx.category),
        peer: Optional.nullable(tx.peer),
        account: Optional.nullable(tx.account)
      }
    } else {
      this.state = {
        date: Optional.of(DateTime.now()),
        description: Optional.empty(),
        flag: Optional.empty(),
        cashFlow: Optional.of(0),
        status: Optional.of(TransactionStatus.UNCLEARED),
        category: Optional.empty(),
        peer: Optional.empty(),
        account: this.props.account
      }
    }
    this.initState = this.state
  }

  render() {
    return (
      <AccountConsumer>
        {({accounts}) => {
          return (
            <CategoryConsumer>
              {({subCategories}) => {
                return (
                  <PeerConsumer>
                    {({peers}) => {
                      const peerValues = this.getPeerValues(peers)
                      const accountsValues = this.getAccountValues(accounts)
                      const categoryValues =
                        this.getCategoriesValues(subCategories)
                      const selectedPeer = peerValues
                        .stream()
                        .filter(vd =>
                          this.state.peer
                            .filter(p => p.id === vd.returnValue.id)
                            .isPresent()
                        )
                        .collect(toList)
                      const selectedCategory = categoryValues
                        .stream()
                        .filter(vd =>
                          this.state.category
                            .filter(p => p.id === vd.returnValue.id)
                            .isPresent()
                        )
                        .collect(toList)
                      const selectedAccount = accountsValues
                        .stream()
                        .filter(vd =>
                          this.state.account
                            .filter(p => p.id === vd.returnValue.id)
                            .isPresent()
                        )
                        .collect(toList)
                      return (
                        <div className={styles.Form}>
                          <div className={styles.FormContent}>
                            <div>
                              <div className={styles.Rows}>
                                {this.getRow(
                                  "Date",
                                  <DatePicker
                                    value={this.state.date}
                                    onChange={v =>
                                      this.onChangeDate(Optional.nullable(v))
                                    }
                                  />
                                )}
                                {this.getRow(
                                  "Repeat",
                                  this.getDropdown(
                                    v => this.onChangePeer(v),
                                    this.getRecurringValues(),
                                    new ArrayList()
                                  )
                                )}
                                {this.getRow(
                                  "Amount",
                                  <SimpleCalculatorInput
                                    unit={"€"}
                                    precision={2}
                                    dark
                                    onChange={v => this.onChangeAmount(v)}
                                    value={this.state.cashFlow.map(VD)}
                                  />
                                )}
                                {this.getRow(
                                  "Description",
                                  <TextInput
                                    hideFormat
                                    dark
                                    onChange={v => this.onChangeDescription(v)}
                                    value={this.state.description.map(VD)}
                                  />
                                )}
                                {this.getRow(
                                  "Status",
                                  <ChoiceSelector
                                    dark
                                    onChange={v => this.onChangeStatus(v)}
                                    values={this.getStatusValues()}
                                    selectedValue={this.state.status.map(VD)}
                                  />,
                                  "middle"
                                )}
                                {this.getRow(
                                  "Flag",
                                  <FlagSelector
                                    onChange={v => this.onChangeFlag(v)}
                                    selected={this.state.flag}
                                  />,
                                  "middle"
                                )}
                              </div>
                            </div>
                            <div>
                              <div className={styles.Rows}>
                                {this.getRow(
                                  "Account",
                                  this.getDropdown(
                                    v => this.onChangeAccount(v),
                                    accountsValues,
                                    selectedAccount
                                  )
                                )}
                                {this.getRow(
                                  "Peer",
                                  this.getDropdown(
                                    v => this.onChangePeer(v),
                                    peerValues,
                                    selectedPeer,
                                    (v: Optionable<string>) =>
                                      this.onChangeSearchPeer(v)
                                  )
                                )}
                                {this.getRow(
                                  "Category",
                                  this.getDropdown(
                                    v => this.onChangeCategory(v),
                                    categoryValues,
                                    selectedCategory
                                  )
                                )}
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
                                  key={this.props.popinId + "reset"}
                                  popinId={this.props.popinId}
                                  action={{
                                    callback: () => this.onResetForm(),
                                    type: "other",
                                    title: "Reset"
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
                    }}
                  </PeerConsumer>
                )
              }}
            </CategoryConsumer>
          )
        }}
      </AccountConsumer>
    )
  }

  private getDropdown(
    onChange: (v: Optionable<ValueDesc<any>>) => void,
    values: List<any>,
    selectedValues: List<any>,
    onSearch?: (value: Optionable<string>) => void
  ) {
    return (
      <DropDownSelector
        maxHeight={"100px"}
        showSelection
        showSearch
        dark
        onChange={onChange}
        values={values}
        multiple={false}
        showValuesOnFocus
        dontShowValuesIfSearchEmpty
        selectedValues={selectedValues}
        onSearchChange={onSearch}
      />
    )
  }

  private getRow(
    label: string,
    input: JSX.Element,
    align?: string
  ): JSX.Element {
    return (
      <div className={styles.FormRow}>
        <div
          className={styles.RowLabel}
          style={{verticalAlign: align || "top"}}>
          <span>{label}</span>
        </div>
        <div className={styles.RowInput}>{input}</div>
      </div>
    )
  }

  private getStatusValues() {
    return [
      VD(TransactionStatus.CLEARED).Display("Cleared").Color("green"),
      VD(TransactionStatus.UNCLEARED).Display("Uncleared").Color("grey")
    ]
  }

  private getRecurringValues() {
    return RecurringTransactionStep.all<RecurringTransactionStep>()
      .stream()
      .map(s => {
        return VD(s)
          .Display(
            StringUtils.firstToUpper(s.key().replace(/_/g, " ").toLowerCase())
          )
          .Sort(s.index())
      })
      .collect(toList)
  }

  private getPeerValues(peers: List<Peer>) {
    return peers
      .copy()
      .stream()
      .map(p => VD(p).Compare(p.id).Display(p.name).Sort(p.name))
      .collect(toList)
  }

  private getAccountValues(accounts: List<Account>) {
    return accounts
      .copy()
      .stream()
      .map(a => VD(a).Compare(a.id).Display(a.name).Sort(a.name))
      .collect(toList)
  }

  private getCategoriesValues(categories: List<Category>) {
    return categories
      .copy()
      .stream()
      .map(p => VD(p).Compare(p.id).Display(p.pretty()).Sort(p.pretty()))
      .collect(toList)
  }

  private onCancel() {
    AlertProvider.removeAlert(this.props.popinId)
  }

  private onChangeDate(value: Optionable<Date>) {
    this.setState({date: value.map(DateTime.fromJSDate).log()})
  }

  private onChangeStatus(value: Optionable<TransactionStatus>) {
    this.setState({status: value})
  }

  private onChangeFlag(value: Optionable<TransactionFlag>) {
    this.setState({flag: value})
  }

  private onChangeAmount(value: Optionable<number>) {
    this.setState({cashFlow: value})
  }

  private onChangeDescription(value: Optionable<string>) {
    this.setState({description: value})
  }

  private onChangePeer(value: Optionable<ValueDesc<Peer>>) {
    this.setState({peer: value.map(v => v.returnValue)})
  }

  private onChangeAccount(value: Optionable<ValueDesc<Account>>) {
    this.setState({account: value.map(v => v.returnValue)})
  }

  private onChangeCategory(value: Optionable<ValueDesc<Category>>) {
    this.setState({category: value.map(v => v.returnValue)})
  }

  private onChangeSearchPeer(value: Optionable<string>) {
    this.setState({
      peer: value.map(
        v =>
          new Peer({
            userProfileId: 0,
            hidden: false,
            name: v,
            type: PeerType.PERSON
          })
      )
    })
  }

  private onSuccess(): void {
    if (this.state.category.isEmpty()) {
      this.pushValidationNotification("Category should be set")
      return
    }
    if (this.state.account.isEmpty()) {
      this.pushValidationNotification("Account should be set")
      return
    }
    if (this.state.date.isEmpty()) {
      this.pushValidationNotification("Date should be set")
      return
    }
    if (this.state.peer.isEmpty()) {
      this.pushValidationNotification("Peer should be set")
      return
    }
    if (this.state.status.isEmpty()) {
      this.pushValidationNotification("Status should be set")
      return
    }
    if (this.state.cashFlow.isEmpty()) {
      this.pushValidationNotification("Amount should be set")
      return
    }
    const tx = new Transaction({
      userProfileId: 0,
      account: this.state.account.get(),
      cashFlow: this.state.cashFlow.get(),
      category: this.state.category.get(),
      date: this.state.date.get(),
      description: this.state.description.orElseReturn(""),
      flag: this.state.flag.orElseUndefined(),
      peer: this.state.peer.get(),
      repeat: this.props.tx.map(t => t.repeat).orElseUndefined(),
      repeated: this.props.tx.map(t => t.repeated).orElseReturn(false),
      status: this.state.status.get()
    })
    if (this.props.tx.isPresent()) {
      tx.id = this.props.tx.get().id
      void TransactionApiService.get()
        .updateTx(tx)
        .then(() => TransactionProvider.refresh())
        .then(() => PeerProvider.refresh())
        .catch(err => {
          console.error(err)
          AlertProvider.submitNotification(
            Notification.error("Could not update transaction !").Subtitle(
              err?.response?.data?.reason || ""
            )
          )
        })
        .then(() => AlertProvider.removeAlert(this.props.popinId))
    } else {
      void TransactionApiService.get()
        .createTx(tx)
        .then(() => TransactionProvider.refresh())
        .then(() => PeerProvider.refresh())
        .catch(err => {
          console.error("err", err)
          AlertProvider.submitNotification(
            Notification.error("Could not create transaction !").Subtitle(
              err?.response?.data?.reason || ""
            )
          )
        })
        .then(() => AlertProvider.removeAlert(this.props.popinId))
    }
  }

  private pushValidationNotification(message: string) {
    AlertProvider.submitNotification(
      Notification.error("Validation issue").Subtitle(message)
    )
  }

  private onResetForm() {
    AlertProvider.submitPopin(
      Popin.warning()
        .Subtitle("Are you sure you want to reset form ?")
        .SuccessAction(id => {
          this.setState(this.initState)
          AlertProvider.removeAlert(id)
        })
    )
  }
}
