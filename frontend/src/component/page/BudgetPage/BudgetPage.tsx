import React from "react"
import {
  BudgetApiService,
  BudgetConsumer,
  BudgetEntry,
  BudgetProvider,
  BudgetViewProvider,
  CategoryConsumer,
  TransactionConsumer
} from "../../../service"
import styles from "./BudgetPage.module.scss"
import {MonthSelector} from "../../static"
import {Dict, List, Optional, toList} from "@damntools.fr/types"
import {DateTime} from "luxon"
import {AgeOfMoneyDisplay} from "../AgeOfMoneyDisplay"
import {BudgetParentEntry} from "./BudgetParentEntry"
import {BudgetPageState} from "./BudgetPage.types"
import {AlertProvider, Notification} from "@damntools.fr/react-alert"
import {Category, Transaction} from "@damntools.fr/wnab-data"
import {openMissingBudgetsPopup} from "../popin"
import {UUID} from "@damntools.fr/identifiers"
import {BudgetAssignForm} from "./BudgetAssignForm"
import {BudgetInfoTable} from "./BudgetInfoTable"
import {BudgetActions} from "./BudgetActions";
import {BudgetTransactions} from "./BudgetTransactions"

export class BudgetPage extends React.Component<any, BudgetPageState> {
  private pending: boolean

  constructor(props: any) {
    super(props)
    const urlDate = this.props.match?.params?.date
    this.pending = false
    this.state = {
      currentMonth: urlDate
        ? DateTime.fromFormat(urlDate, "yyyy-MM")
        : DateTime.now().set({
            day: 1,
            hour: 0,
            minute: 0,
            second: 0,
            millisecond: 0
          })
    }
  }

  render() {
    return (
      <BudgetViewProvider>
        <TransactionConsumer>
          {({transactions}) => this.getContent(transactions)}
        </TransactionConsumer>
      </BudgetViewProvider>
    )
  }

  getContent(transactions: List<Transaction>) {
    return (
      <BudgetConsumer>
        {({getSheetForMonth}) => {
          const budgetSheet = getSheetForMonth(
            transactions,
            this.state.currentMonth
          )
          return (
            <div className={styles.BudgetPage}>
              <div>
                <div className={styles.Header}>
                  <div>
                    <div className={styles.MonthSelector}>
                      <MonthSelector
                        date={Optional.of(this.state.currentMonth)}
                        onChange={value =>
                          this.onChangeMonth(
                            value,
                            getSheetForMonth,
                            transactions
                          )
                        }
                      />
                    </div>
                    <div className={styles.HeaderContent}></div>
                    <div className={styles.AgeOfMoney}>
                      <AgeOfMoneyDisplay />
                    </div>
                  </div>
                </div>
                <div className={styles.Options}></div>
                <div className={styles.Content}>
                  <div>
                    <div className={styles.LeftPanel}>
                      <CategoryConsumer>
                        {({subCategories, parentCategories}) => {
                          const missing = this.getMissingCategories(
                            subCategories,
                            budgetSheet
                          )
                          if (
                            missing.hasElements() &&
                            budgetSheet.hasElements()
                          ) {
                            this.createMissingBudgetsPopin(missing)
                          }
                          return (
                            <div>
                              {parentCategories
                                .stream()
                                .sortWith("name")
                                .map(c => {
                                  const children = subCategories
                                    .stream()
                                    .filter(cc => cc.parentId === c.id)
                                    .collect(toList)
                                  return (
                                    <BudgetParentEntry
                                      key={c.id}
                                      budgetSheet={budgetSheet}
                                      category={c}
                                      children={children}
                                    />
                                  )
                                })
                                .collectArray()}
                            </div>
                          )
                        }}
                      </CategoryConsumer>
                    </div>
                    <div className={styles.RightPanel}>
                      <div>
                        <div className={styles.PanelInfo}>
                          <h1>Info</h1>
                          <BudgetInfoTable
                            key={UUID.random()}
                            budgetSheet={budgetSheet}
                          />
                        </div>
                        <div className={styles.PanelActions}>
                          <h1>Actions</h1>
                          <BudgetActions key={UUID.random()}
                                         budgetSheet={budgetSheet}/>
                        </div>
                        <div className={styles.PanelOther}>
                          <h1>Other</h1>
                          <BudgetAssignForm key={UUID.random()} />
                        </div>
                        <div className={styles.PanelTransactions}>
                          <h1>Transactions</h1>
                          <BudgetTransactions key={UUID.random()}
                                              budgetSheet={budgetSheet}/>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        }}
      </BudgetConsumer>
    )
  }

  private getMissingCategories(
    subCategories: List<Category>,
    budgetSheet: Dict<number, BudgetEntry>
  ) {
    return subCategories
      .stream()
      .filter(c => !budgetSheet.hasKey(c.id as number) && !c.hidden)
      .collect(toList)
  }

  private createMissingBudgetsPopin(missingBudgets: List<Category>) {
    if (!this.pending) {
      this.pending = true
      setTimeout(() => {
        openMissingBudgetsPopup(missingBudgets, this.state.currentMonth)
        this.pending = false
      }, 100)
    }
  }

  onChangeMonth(
    value: DateTime,
    getSheetForMonth: (
      transactions: List<Transaction>,
      month: DateTime
    ) => Dict<number, BudgetEntry>,
    transactions: List<Transaction>
  ) {
    const newMonthSheet = getSheetForMonth(transactions, value)
    if (newMonthSheet.isEmpty()) {
      BudgetApiService.get()
        .createBudgetForMonth(value)
        .then(() => BudgetProvider.refresh())
        .then(() =>
          AlertProvider.submitNotification(Notification.info("Month created"))
        )
        .catch(err => console.debug("Month already exists", err))
        .then(() => {
          this.setState({currentMonth: value})
          window.location.hash = `/budget/${value.toFormat("yyyy-MM")}`
        })
    } else {
      this.setState({currentMonth: value})
      window.location.hash = `/budget/${value.toFormat("yyyy-MM")}`
    }
  }
}
