import React from "react"
import {
  BudgetApiService,
  BudgetEntry,
  BudgetProvider,
  BudgetSelection,
  BudgetViewConsumer
} from "../../../../service"
import {Dict, List, toList} from "@damntools.fr/types"
import styles from "./BudgetActions.module.scss"
import {AlertProvider, Notification} from "@damntools.fr/react-alert"

export type BudgetAssignFormProps = {
  budgetSheet: Dict<number, BudgetEntry>
}

export class BudgetActions extends React.Component<BudgetAssignFormProps, any> {
  render() {
    return (
      <BudgetViewConsumer>
        {({selectedCategories}) => {
          return this.getContent(
            selectedCategories
              .stream()
              .filter(c => c.selected)
              .collect(toList)
          )
        }}
      </BudgetViewConsumer>
    )
  }

  private getContent(selectedCategories: List<BudgetSelection>) {
    return (
      <div className={styles.BudgetActions}>
        <div>{this.getAssignFromLastMonth(selectedCategories)}</div>
        <div>{this.getAssignFromLastMonthActivity(selectedCategories)}</div>
        <div
          onClick={() => this.onClickAssignFromAvailable(selectedCategories)}>
          {this.getAssignBudgetFromAvailable(selectedCategories)}
        </div>
        <div className={styles.Warning}>
          {this.getReset(selectedCategories)}
        </div>
        <div className={styles.Warning}>
          {this.getSendAvailableToInflux(selectedCategories)}
        </div>
      </div>
    )
  }

  private getAssignFromLastMonth(selectedCategories: List<BudgetSelection>) {
    if (selectedCategories.isEmpty())
      return "Assign last month budget for all categories"
    else if (selectedCategories.size() > 1)
      return "Assign last month budget for each category"
    else return "Assign last month budget for category"
  }

  private getAssignBudgetFromAvailable(
    selectedCategories: List<BudgetSelection>
  ) {
    if (selectedCategories.isEmpty())
      return "Fix budget from available amount for all categories"
    else if (selectedCategories.size() > 1)
      return "Fix budget from available amount for each category"
    else return "Fix budget from available amount for category"
  }

  private getAssignFromLastMonthActivity(
    selectedCategories: List<BudgetSelection>
  ) {
    if (selectedCategories.isEmpty())
      return "Assign last month spending as budget for all categories"
    else if (selectedCategories.size() > 1)
      return "Assign last month spending as budget for each category"
    else return "Assign last month spending as budget for category"
  }

  private getReset(selectedCategories: List<BudgetSelection>) {
    if (selectedCategories.isEmpty())
      return "Reset all categories budget to 0.00"
    else if (selectedCategories.size() > 1)
      return "Reset each category budget to 0.00"
    else return "Reset category budget to 0.00"
  }

  private getSendAvailableToInflux(selectedCategories: List<BudgetSelection>) {
    if (selectedCategories.isEmpty())
      return "Send available from all categories to influx"
    else if (selectedCategories.size() > 1)
      return "Send available from each category to influx"
    else return "Send available from category to influx"
  }

  private onClickAssignFromAvailable(
    selectedCategories: List<BudgetSelection>
  ) {
    if (selectedCategories.isEmpty()) {
      const promises = this.props.budgetSheet
        .values()
        .stream()
        .map(e => {
          e.budget.budgeted = e.budget.budgeted - e.budget.available
          return e.budget
        })
        .map(b => BudgetApiService.get().update(b))
        .collectArray()
      Promise.all(promises)
        .then(() => BudgetProvider.refresh())
        .then(() =>
          AlertProvider.submitNotification(Notification.info("All categories updated"))
        )
        .catch(err => console.debug("Month already exists", err))
    }
  }
}
