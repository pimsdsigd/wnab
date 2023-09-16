import React from "react"
import {List, Optionable, Optional} from "@damntools.fr/types"
import styles from "./TransactionTableToolbar.module.scss"
import {CssClass, StringUtils} from "@damntools.fr/utils-simple"
import {
  png_asterisk,
  png_bank,
  png_category,
  png_menu_overview,
  png_peer_logo
} from "../../../../assets"
import {
  AccountProvider,
  SearchType,
  TransactionApiService,
  TransactionProvider,
  TransactionTableOptionsConsumer
} from "../../../../service"
import {TextInput, VD} from "@damntools.fr/react-inputs"
import {AlertProvider, Notification, Popin} from "@damntools.fr/react-alert"
import {Account, Transaction} from "@damntools.fr/wnab-data"
import {openTransactionEditPopup} from "../../../page";

export type TransactionTableToolbarProps = {
  transactions: List<Transaction>
  account: Optionable<Account>
}

export type TransactionTableToolbarState = {}

export class TransactionTableToolbar extends React.Component<
  TransactionTableToolbarProps,
  TransactionTableToolbarState
> {
  constructor(props: TransactionTableToolbarProps) {
    super(props)
    this.state = {optionExpand: Optional.empty()}
  }

  render() {
    return (
      <div className={styles.TransactionTableToolbar}>
        <TransactionTableOptionsConsumer>
          {options => (
            <div>
              <div
                className={styles.ToolbarButton}
                onClick={() => this.onClickAdd()}>
                <div>Add</div>
              </div>
              {options.selected.size() === 1 ? (
                <div
                  className={styles.ToolbarButton}
                  onClick={() => this.onClickEdit(options.selected)}>
                  <div>Edit</div>
                </div>
              ) : null}
              {options.selected.hasElements() ? (
                <div
                  className={styles.ToolbarButton}
                  onClick={() => this.onClickDelete(options.selected)}>
                  <div>Delete</div>
                </div>
              ) : null}
              {options.selected.hasElements() ? (
                <div
                  className={styles.ToolbarButton}
                  onClick={() => this.onClickClear(options.selected)}>
                  <div>Clear</div>
                </div>
              ) : null}
              {options.selected.size() === 1 ? (
                <div
                  className={styles.ToolbarButton}
                  onClick={() => this.onClickDuplicate(options.selected)}>
                  <div>Duplicate</div>
                </div>
              ) : null}
              <div className={styles.ToolbarSeparator}>
                <div>|</div>
              </div>
              <div className={CssClass.from(styles.ToolbarFilterBar).get()}>
                <div>
                  <div>
                    <div>
                      <TextInput
                        dark={true}
                        placeholder={"Filter..."}
                        hideFormat={true}
                        value={options.search.map(VD)}
                        onChange={options.setSearch}
                      />
                      <img
                        onClick={() => options.toggleSearchType()}
                        src={this.getSearchTypeIcon(options.searchType)}
                        alt={
                          "Active: " +
                          StringUtils.firstToUpper(options.searchType)
                        }
                        title={
                          "Active: " +
                          StringUtils.firstToUpper(options.searchType)
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </TransactionTableOptionsConsumer>
      </div>
    )
  }

  private getSearchTypeIcon(searchType: SearchType) {
    if (searchType === "category") return png_category
    else if (searchType === "peer") return png_peer_logo
    else if (searchType === "description") return png_menu_overview
    else if (searchType === "account") return png_bank
    else return png_asterisk
  }

  private onClickDelete(selected: List<number>) {
    this.runAction(
      "delete",
      s => TransactionApiService.get().deleteTxs(s),
      selected
    )
  }

  private onClickClear(selected: List<number>) {
    this.runAction(
      "clear",
      s => TransactionApiService.get().clearTxs(s),
      selected
    )
  }

  private onClickDuplicate(selected: List<number>) {
    this.runAction(
      "duplicate",
      s => TransactionApiService.get().duplicateTx(s.get(0) as number),
      selected
    )
  }

  private onClickAdd() {
    openTransactionEditPopup(Optional.empty(), this.props.account)
  }

  private onClickEdit(selected: List<number>) {
    const tx = this.props.transactions
      .stream()
      .find(tx => tx.id === selected.get(0))
    openTransactionEditPopup(Optional.nullable(tx), this.props.account)
  }

  private runAction(
    action: string,
    supplier: (s: List<number>) => Promise<any>,
    selected: List<number>
  ) {
    AlertProvider.submitPopin(
      Popin.warning()
        .Subtitle(
          `Are you sure you want to ${action} ${selected.size()} transaction${
            selected.size() > 1 ? "s" : ""
          } ?`
        )
        .SuccessAction(
          id =>
            supplier(selected)
              .then(() =>
                AlertProvider.submitNotification(Notification.success())
              )
              .then(() => TransactionProvider.refresh())
              .then(() => AccountProvider.refresh())
              .catch(() => {
                AlertProvider.submitNotification(
                  Notification.error().Subtitle(
                    `Could not ${action} transaction${
                      selected.size() > 1 ? "s" : ""
                    }`
                  )
                )
              })
              .then(() => AlertProvider.removeAlert(id)),
          "Yes"
        )
    )
  }
}
