import React from "react"
import styles from "./BudgetInfoTable.module.scss"
import {Dict, List} from "@damntools.fr/types"
import {PriceLabel} from "../PriceLabel"
import {
  BudgetEntry,
  BudgetSelection,
  BudgetViewConsumer
} from "../../../../service"

export type BudgetInfoTableProps = {
  budgetSheet: Dict<number, BudgetEntry>
}

export class BudgetInfoTable extends React.Component<
  BudgetInfoTableProps,
  any
> {
  render() {
    return (
      <BudgetViewConsumer>
        {({selectedCategories}) => {
          let budgeted = this.getBudgeted(selectedCategories)
          let activity = this.getActivity(selectedCategories)
          let available = this.getAvailable(selectedCategories)
          let lastMonth = this.getLastMonth(selectedCategories)
          return (
            <div className={styles.InfoTable}>
              <div>
                <div>
                  <span>Left from month before</span>
                  <span>
                    <PriceLabel
                      withBackground={true}
                      value={lastMonth}
                      status={"default"}
                    />
                  </span>
                </div>
                <div>
                  <span>Budgeted</span>
                  <span>
                    <PriceLabel
                      withBackground={true}
                      value={budgeted}
                      status={"default"}
                    />
                  </span>
                </div>
                <div>
                  <span>Spending</span>
                  <span>
                    <PriceLabel
                      withBackground={true}
                      value={activity}
                      status={"default"}
                    />
                  </span>
                </div>
                <div>
                  <span style={{fontWeight: "bold"}}>Available</span>
                  <span>
                    <PriceLabel
                      withBackground={true}
                      value={available}
                      status={"default"}
                    />
                  </span>
                </div>
              </div>
            </div>
          )
        }}
      </BudgetViewConsumer>
    )
  }

  private getActivity(selectedCategories: List<BudgetSelection>) {
    return this.props.budgetSheet
      .values()
      .stream()
      .filter(e => this.filter(e, selectedCategories))
      .reduce((o, c) => o + c.budget.activity, 0)
  }

  private getAvailable(selectedCategories: List<BudgetSelection>) {
    return this.props.budgetSheet
      .values()
      .stream()
      .filter(e => this.filter(e, selectedCategories))
      .reduce((o, c) => o + c.budget.available, 0)
  }

  private getBudgeted(selectedCategories: List<BudgetSelection>) {
    return this.props.budgetSheet
      .values()
      .stream()
      .filter(e => this.filter(e, selectedCategories))
      .reduce((o, c) => o + c.budget.budgeted, 0)
  }

  private getLastMonth(selectedCategories: List<BudgetSelection>) {
    return this.props.budgetSheet
      .values()
      .stream()
      .filter(e => this.filter(e, selectedCategories))
      .reduce(
        (o, c) =>
          o +
          (c.lastMonth?.budget.budgeted || 0) +
          (c.lastMonth?.budget.activity || 0),
        0
      )
  }

  private filter(e: BudgetEntry, selectedCategories: List<BudgetSelection>) {
    return (
      selectedCategories
        .stream()
        .filter(s => s.selected)
        .count() === 0 ||
      selectedCategories
        .stream()
        .some(s => s.categoryId === e.budget.categoryId && s.selected)
    )
  }
}
