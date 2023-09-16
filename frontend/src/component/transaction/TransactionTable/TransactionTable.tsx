import React from "react"
import {Account, Transaction} from "@damntools.fr/wnab-data"
import {KV, List, Optionable, Optional} from "@damntools.fr/types"
import styles from "./TransactionTable.module.scss"
import {TransactionLine} from "./TransactionLine"
import {
  TransactionFilter,
  TransactionSorter,
  TransactionTableOptionsConsumer,
  TransactionTableOptionsProvider
} from "../../../service"
import {TransactionTableHeader} from "./TransactionTableHeader"
import {TimeUtils} from "@damntools.fr/utils-simple"
import {TransactionTableToolbar} from "./TransactionTableToolbar"
import {LoaderDiv} from "../../static"

export type TransactionTableProps = {
  transactions: List<Transaction>
  showAccount: boolean
  account: Optionable<Account>
}

export type TransactionTableState = {
  optionExpand: Optionable<keyof Transaction>
  start: number
  end: number
  listAmplitude: number
  filtered: List<Transaction>
}

export class TransactionTable extends React.Component<
  TransactionTableProps,
  TransactionTableState
> {
  private static readonly LIST_AMPLITUDE = 1
  private lastScroll: number
  private tableRef: HTMLDivElement | null = null
  private scrollBarZone: HTMLDivElement | null = null

  constructor(props: Readonly<TransactionTableProps> | TransactionTableProps) {
    super(props)
    this.lastScroll = 0
    const filtered = TransactionFilter.filter(
      props.transactions,
      Optional.empty(),
      "all",
      KV.empty()
    )
    this.state = {
      end: Math.min(TransactionTable.LIST_AMPLITUDE, filtered.size()),
      optionExpand: Optional.empty(),
      start: 0,
      listAmplitude: TransactionTable.LIST_AMPLITUDE,
      filtered
    }
  }

  componentDidMount() {
    this.prepareState()
  }

  prepareState() {
    if (this.tableRef?.offsetHeight) {
      const amp = Math.floor((this.tableRef?.offsetHeight || 0) / 22.29)
      console.log(this.tableRef?.offsetHeight, amp)
      this.setState({
        listAmplitude: amp,
        start: this.state.start,
        end: Math.min(amp, this.state.filtered.size())
      })
    }
  }

  render() {
    return (
      <div className={styles.TransactionTable}>
        <div>
          <TransactionTableOptionsProvider>
            <TransactionTableToolbar account={this.props.account} transactions={this.props.transactions} />
            <TransactionTableHeader
              showAccount={this.props.showAccount}
              transactions={this.props.transactions}
            />
            <TransactionTableOptionsConsumer>
              {({
                search,
                searchType,
                sort,
                filters,
                isSelected,
                setSelected
              }) => {
                const filtered = TransactionFilter.filter(
                  this.props.transactions,
                  search,
                  searchType,
                  filters
                )
                const sorted = TransactionSorter.sort(sort, filtered)
                /*console.log(
                                                                  `txs=${filtered.size()} start=${this.state.start} end=${
                                                                    this.state.end
                                                                  } amp=${this.state.listAmplitude}`
                                                                )*/
                if (sorted.isEmpty()) return <LoaderDiv />
                return (
                  <div
                    className={styles.Table}
                    onWheel={e => this.onScroll(e, sorted)}
                    ref={r => (this.tableRef = r)}>
                    <div>
                      {this.getTransactionsToDisplay(sorted)
                        .stream()
                        .map(tx => (
                          <TransactionLine
                            onSelect={(reset: boolean) =>
                              setSelected(reset, tx)
                            }
                            selected={isSelected(tx)}
                            showAccount={this.props.showAccount}
                            className={styles.TableRow}
                            key={tx.id}
                            tx={tx}
                          />
                        ))
                        .collectArray()}
                    </div>
                    <div ref={r => (this.scrollBarZone = r)}>
                      <div
                        style={{
                          height: this.getScrollbarHeight(),
                          top: this.getScrollbarPosition()
                        }}
                        className={styles.Scrollbar}></div>
                    </div>
                  </div>
                )
              }}
            </TransactionTableOptionsConsumer>
          </TransactionTableOptionsProvider>
        </div>
      </div>
    )
  }

  private getTransactionsToDisplay(transactions: List<Transaction>) {
    if (transactions.hasElements())
      transactions = transactions
        .copy()
        .sub(this.state.start, Math.min(this.state.end, transactions.size()))
    return transactions
  }

  private onScroll(
    event: React.WheelEvent<HTMLDivElement>,
    filtered: List<Transaction>
  ) {
    const now = TimeUtils.now()
    const timeout = 30
    const altGap = 10
    if (
      this.lastScroll + timeout <
      now /* &&
      this.state.listAmplitude < filtered.size()*/
    ) {
      this.lastScroll = now
      // @ts-ignore
      if (event.nativeEvent.wheelDelta > 0) {
        this.setState({
          start: this.getStartForUp(filtered, event.altKey ? altGap : 1),
          end: this.getEndForUp(filtered, event.altKey ? altGap : 1)
        })
      }
      // @ts-ignore
      else if (event.nativeEvent.wheelDelta < 0) {
        this.setState({
          start: this.getStartForDown(filtered, event.altKey ? altGap : 1),
          end: this.getEndForDown(filtered, event.altKey ? altGap : 1)
        })
      }
    }
  }

  getStartForUp(filtered: List<Transaction>, number: number) {
    return Math.max(
      0,
      Math.min(
        this.state.start - number,
        filtered.size() - this.state.listAmplitude
      )
    )
  }

  getStartForDown(filtered: List<Transaction>, number: number) {
    return Math.max(
      0,
      Math.min(
        this.state.start + number,
        filtered.size() - this.state.listAmplitude
      )
    )
  }

  getEndForUp(filtered: List<Transaction>, number: number) {
    return Math.max(
      number,
      Math.min(
        Math.max(
          this.state.start - 1 + this.state.listAmplitude,
          this.state.listAmplitude
        ),
        filtered.size()
      )
    )
  }

  getEndForDown(filtered: List<Transaction>, number: number) {
    return Math.max(
      number,
      Math.min(
        this.state.start + number + this.state.listAmplitude,
        filtered.size()
      )
    )
  }

  private getScrollbarHeight() {
    if (this.scrollBarZone?.offsetHeight) {
      const diff = this.state.end - this.state.start
      return (
        (this.scrollBarZone?.offsetHeight * diff) / this.state.filtered.size() +
        "px"
      )
    } else return "5px"
  }

  private getScrollbarPosition() {
    if (this.scrollBarZone?.offsetHeight) {
      return (
        (this.scrollBarZone?.offsetHeight * this.state.start) /
          this.state.filtered.size() +
        "px"
      )
    } else return "5px"
  }
}
