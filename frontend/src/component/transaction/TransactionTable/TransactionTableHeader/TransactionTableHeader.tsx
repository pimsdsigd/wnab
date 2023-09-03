import React, {JSX} from "react"
import {Transaction} from "@damntools.fr/wnab-data"
import {defined, List, Optionable, Optional, toList} from "@damntools.fr/types"
import styles from "./TransactionTableHeader.module.scss"
import {CssClass, StringUtils} from "@damntools.fr/utils-simple"
import {png_sort_asc, png_sort_desc} from "../../../../assets"
import {
  FilterValue,
  TransactionFilter,
  TransactionTableOptionsConsumer,
  TransactionTableOptionsProviderState
} from "../../../../service"
import {CheckboxInput} from "@damntools.fr/react-inputs"

export type TransactionTableHeaderProps = {
  transactions: List<Transaction>
  showAccount: boolean
}

export type TransactionTableHeaderState = {
  optionExpand: Optionable<keyof Transaction>
}

export class TransactionTableHeader extends React.Component<
  TransactionTableHeaderProps,
  TransactionTableHeaderState
> {
  constructor(props: TransactionTableHeaderProps) {
    super(props)
    this.state = {optionExpand: Optional.empty()}
  }

  render() {
    return (
      <TransactionTableOptionsConsumer>
        {optionsProvider => {
          const filtered = TransactionFilter.filter(
            this.props.transactions,
            optionsProvider.search,
            optionsProvider.searchType,
            optionsProvider.filters
          )
          return (
            <div
              className={CssClass.from(
                styles.TableRow,
                styles.TableHeaderRow
              ).get()}>
              {this.getHeaderCell(
                optionsProvider,
                <CheckboxInput
                  onChange={() => optionsProvider.selectAllToggle(filtered)}
                  dark={true}
                  color={"rgb(139, 175, 115)"}
                  size={"16px"}
                  checked={optionsProvider.selected.hasElements()}
                />,
                styles.SelectionCheckbox
              )}
              {this.getHeaderCell(
                optionsProvider,
                <span>&#9873;</span>,
                styles.Flag,
                "flag",
                true,
                true
              )}
              {this.getHeaderCell(
                optionsProvider,
                "Date",
                styles.Date,
                "date",
                true
              )}
              {this.props.showAccount
                ? this.getHeaderCell(
                    optionsProvider,
                    "Account",
                    styles.Account,
                    "account",
                    true,
                    true
                  )
                : null}
              {this.getHeaderCell(
                optionsProvider,
                "Peer",
                styles.Peer,
                "peer",
                true,
                true
              )}
              {this.getHeaderCell(
                optionsProvider,
                "Category",
                styles.Category,
                "category",
                true,
                true
              )}
              {this.getHeaderCell(
                optionsProvider,
                "Description",
                styles.Desc,
                "description",
                false
              )}
              {this.getHeaderCell(
                optionsProvider,
                "Flow",
                styles.CashFlow,
                "cashFlow",
                true
              )}
              {this.getHeaderCell(
                optionsProvider,
                "Cleared",
                styles.StatusCheckbox,
                "status",
                true,
                true
              )}
            </div>
          )
        }}
      </TransactionTableOptionsConsumer>
    )
  }

  private getHeaderCell(
    optionsProvider: TransactionTableOptionsProviderState,
    value: string | JSX.Element,
    className: string,
    field?: keyof Transaction,
    sorted?: boolean,
    filter?: boolean
  ) {
    return (
      <div
        className={CssClass.from(className)
          .classIf(styles.Optionable, defined(field) && (!!sorted || !!filter))
          .get()}>
        <div onClick={() => this.onTableOptionFocus(field)}>{value}</div>
        {field &&
        this.state.optionExpand
          .filter(f => (!!sorted || !!filter) && f === field)
          .isPresent() ? (
          <div className={styles.HeaderColumnOptions}>
            <div>
              {sorted ? this.getSortZone(field, optionsProvider) : null}
              {filter ? this.getFilterZone(optionsProvider, field) : null}
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  private getFilterZone(
    optionsProvider: TransactionTableOptionsProviderState,
    field: keyof Transaction
  ) {
    const values = this.getFilterValuesForField(field)
    return (
      <div className={styles.FilterDiv}>
        <span>Filters ({values.size()})</span>
        <div className={styles.FilterList}>
          {this.getFilterItems(field, values, optionsProvider)}
        </div>
      </div>
    )
  }

  private getSortZone(
    field: keyof Transaction,
    optionsProvider: TransactionTableOptionsProviderState
  ) {
    const fieldSorted = optionsProvider.isFieldSorted(field)
    return (
      <div
        className={CssClass.from(styles.SortDiv)
          .classIf(styles.Unsorted, !fieldSorted)
          .classIf(
            styles.ASC,
            fieldSorted && optionsProvider.sort.get().direction === "asc"
          )
          .classIf(
            styles.DESC,
            fieldSorted && optionsProvider.sort.get().direction === "asc"
          )
          .get()}
        onClick={() => optionsProvider.setSort(field)}>
        <span></span>
        <span>Sort</span>
        <span>
          <img
            src={this.getSortImage(fieldSorted, optionsProvider.sort)}
            alt={this.getSortText(fieldSorted, optionsProvider.sort)}
            title={this.getSortText(fieldSorted, optionsProvider.sort)}
          />
        </span>
      </div>
    )
  }

  private getSortText(
    fieldSorted: boolean,
    sort: Optionable<{field: string; direction: "asc" | "desc"}>
  ) {
    if (!fieldSorted) return "Set ASC"
    if (sort.get().direction === "asc") return "Set DESC"
    if (sort.get().direction === "desc") return "Unset"
  }

  private getSortImage(
    fieldSorted: boolean,
    sort: Optionable<{field: string; direction: "asc" | "desc"}>
  ) {
    return fieldSorted && sort.get().direction === "asc"
      ? png_sort_asc
      : png_sort_desc
  }

  private onTableOptionFocus(field: keyof Transaction | undefined) {
    if (this.state.optionExpand.filter(f => f === field).isPresent())
      this.setState({optionExpand: Optional.empty()})
    else this.setState({optionExpand: Optional.nullable(field)})
  }

  private getFilterValuesForField(field: keyof Transaction) {
    return this.props.transactions
      .stream()
      .map<FilterValue>(tx => {
        if (field === "flag") return {ref: tx.flag, value: tx.flag?.name}
        else if (field === "account")
          return {ref: tx.account, value: tx.account?.name}
        else if (field === "peer") return {ref: tx.peer, value: tx.peer?.name}
        else if (field === "category")
          return {ref: tx.category, value: tx.category?.pretty()}
        else if (field === "status")
          return {ref: tx.status, value: tx.status?.key()}
        return undefined as any
      })
      .filter(a => !!a.value)
      .unique((a, b) => a.value.localeCompare(b.value) === 0)
      .sort((a, b) => a.value.localeCompare(b.value))
      .collect(toList)
  }

  private getFilterItems(
    field: keyof Transaction,
    values: List<FilterValue>,
    optionsProvider: TransactionTableOptionsProviderState
  ) {
    return values
      .stream()
      .map(v => {
        const checked = optionsProvider.filters
          .getOptional(field)
          .filter(f => !!f.stream().find(fv => fv.value === v.value))
          .isPresent()

        return (
          <div className={styles.FilterItem} key={v.value}>
            <span className={styles.FilterCheckbox}>
              <CheckboxInput
                size={"16px"}
                color={"#879f6a"}
                dark={true}
                checked={checked}
                onChange={() => optionsProvider.setFilter(field, v)}
              />
            </span>
            <span
              onClick={() => optionsProvider.setFilter(field, v)}
              className={CssClass.from(styles.FilterItemTitle)
                .classIf(styles.Checked, checked)
                .get()}>
              {StringUtils.firstToUpper(v.value)}
            </span>
          </div>
        )
      })
      .collectArray()
  }
}
