import React from "react"
import styles from "./BudgetPage.module.scss"
import {Category} from "@damntools.fr/wnab-data"
import {Dict, List} from "@damntools.fr/types"
import {BudgetChildEntry} from "./BudgetChildEntry"
import {CheckboxInput} from "@damntools.fr/react-inputs"
import {CssClass} from "@damntools.fr/utils-simple"
import {PriceLabel} from "./PriceLabel"
import {BudgetEntry, BudgetViewConsumer} from "../../../service"

export type BudgetParentEntryProps = {
  category: Category
  children: List<Category>
  budgetSheet: Dict<number, BudgetEntry>
}

export type BudgetParentEntryState = {
  expand: boolean
}

export class BudgetParentEntry extends React.Component<
  BudgetParentEntryProps,
  BudgetParentEntryState
> {
  constructor(
    props: Readonly<BudgetParentEntryProps> | BudgetParentEntryProps
  ) {
    super(props)
    this.state = {expand: !props.category.hidden}
  }

  render() {
    const category = this.props.category
    const activity = this.getActivity()
    const budgeted = this.getBudgeted()
    const available = this.getAvailable()
    return (
      <div className={styles.BudgetParentEntry}>
        <div>
          <div
            className={CssClass.from(styles.ParentEntryBar)
              .classIf(styles.HiddenCategory, category.hidden)
              .get()}>
            <div>
              <div className={CssClass.from(styles.Checkbox).get()}>
                <BudgetViewConsumer>
                  {({isCategorySelected, select}) => {
                    return (
                      <CheckboxInput
                        size={"16px"}
                        checked={isCategorySelected(category.id as number)}
                        onChange={() => select(category, this.props.children)}
                        dark={true}
                        color={"#70ab00"}
                      />
                    )
                  }}
                </BudgetViewConsumer>
              </div>
              <div className={CssClass.from(styles.Name).get()}>
                <span>{category.name}</span>
                <span
                  onClick={() => this.setState({expand: !this.state.expand})}
                  className={styles.ParentToggle}>
                  {!this.state.expand ? "▼" : "▲"}
                </span>
              </div>
              <div className={CssClass.from(styles.Budgeted).get()}>
                <PriceLabel
                  withBackground={false}
                  value={budgeted}
                  status={"default"}
                />
              </div>
              <div className={CssClass.from(styles.Activity).get()}>
                <PriceLabel
                  withBackground={false}
                  value={activity}
                  status={"default"}
                />
              </div>
              <div className={CssClass.from(styles.Available).get()}>
                <PriceLabel
                  withBackground={false}
                  value={available}
                  status={"default"}
                />
              </div>
            </div>
          </div>
          <div className={styles.Children}>
            <div>
              {this.state.expand
                ? this.props.children
                    .stream()
                    .sortWith("name")
                    .map(c => {
                      const budget = this.props.budgetSheet.get(c.id as number)
                      return (
                        <BudgetChildEntry
                          category={c}
                          key={c.id}
                          budget={budget}
                        />
                      )
                    })
                    .collectArray()
                : null}
            </div>
          </div>
        </div>
      </div>
    )
  }

  private getActivity() {
    return this.props.children
      .stream()
      .map(c => this.props.budgetSheet.get(c.id as number))
      .filterPresent()
      .reduce((o, c) => o + c.budget.activity, 0)
  }

  private getAvailable() {
    return this.props.children
      .stream()
      .map(c => this.props.budgetSheet.get(c.id as number))
      .filterPresent()
      .reduce((o, c) => o + c.budget.available, 0)
  }

  private getBudgeted() {
    return this.props.children
      .stream()
      .map(c => this.props.budgetSheet.get(c.id as number))
      .filterPresent()
      .reduce((o, c) => o + c.budget.budgeted, 0)
  }
}
