import React from "react"
import {BudgetSelection, BudgetViewConsumer} from "../../../../service"
import {List, toList} from "@damntools.fr/types"
import styles from "./BudgetActions.module.scss"

export type BudgetAssignFormProps = {}

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
        <div className={styles.Warning}>{this.getReset(selectedCategories)}</div>
        <div className={styles.Warning}>{this.getSendAvailableToInflux(selectedCategories)}</div>
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

  private getAssignFromLastMonthActivity(selectedCategories: List<BudgetSelection>) {
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
    else
      return "Reset category budget to 0.00"
  }

  private getSendAvailableToInflux(selectedCategories: List<BudgetSelection>) {
    if (selectedCategories.isEmpty())
      return "Send available from all categories to influx"
    else if (selectedCategories.size() > 1)
      return "Send available from each category to influx"
    else
      return "Send available from category to influx"
  }
}
