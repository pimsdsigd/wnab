import React from "react"
import styles from "./BudgetPage.module.scss"
import {Category} from "@damntools.fr/wnab-data"
import {CssClass} from "@damntools.fr/utils-simple"
import {
  CheckboxInput,
  SimpleCalculatorInput,
  VD
} from "@damntools.fr/react-inputs"
import {PriceLabel} from "./PriceLabel"
import {Lists, Optionable, Optional} from "@damntools.fr/types"
import {
  BudgetApiService,
  BudgetEntry,
  BudgetProvider,
  BudgetViewConsumer,
  FormType
} from "../../../service"
import {AlertProvider, Notification} from "@damntools.fr/react-alert"

export type BudgetChildEntryProps = {
  category: Category
  budget: BudgetEntry
}

export type BudgetChildState = {
  showBudgetedInput: boolean
  showActivityInput: boolean
  showAvailableInput: boolean
}

export class BudgetChildEntry extends React.Component<
  BudgetChildEntryProps,
  BudgetChildState
> {
  constructor(props: Readonly<BudgetChildEntryProps> | BudgetChildEntryProps) {
    super(props)
    this.state = {
      showBudgetedInput: false,
      showActivityInput: false,
      showAvailableInput: false
    }
  }

  render() {
    const category = this.props.category
    const budget = this.props.budget?.budget
    const pendingTxs = this.props.budget?.pendingTransactions || Lists.empty()
    return (
      <BudgetViewConsumer>
        {({isCategorySelected, select, assignForm}) => (
          <div className={styles.BudgetChildEntry}>
            <div>
              <div className={CssClass.from(styles.Checkbox).get()}>
                <CheckboxInput
                  size={"16px"}
                  onChange={() => select(category, Lists.empty())}
                  checked={isCategorySelected(category.id as number)}
                  dark={true}
                  color={"#70ab00"}
                />
              </div>
              <div
                onClick={() => select(category, Lists.empty())}
                className={CssClass.from(styles.Name).get()}>
                {category.name}
              </div>
              <div className={CssClass.from(styles.Budgeted).get()}>
                <div>
                  {this.state.showBudgetedInput ? (
                    <div className={styles.BudgetedInput}>
                      <SimpleCalculatorInput
                        onEnterKey={() => this.onClickBudgeted()}
                        onBlur={() => this.onClickBudgeted()}
                        precision={2}
                        value={Optional.nullable(budget?.budgeted).map(VD)}
                        dark
                        rightAlign
                        focus
                        unit={"€"}
                        hideFormat
                        onChange={v => this.onChangeBudgeted(v)}
                      />
                    </div>
                  ) : (
                    <div>
                      <PriceLabel
                        onClick={() => this.onClickBudgeted()}
                        withBackground={true}
                        value={budget?.budgeted}
                        status={"default"}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className={CssClass.from(styles.Activity).get()}>
                <div>
                  {this.state.showActivityInput ? null : (
                    <div>
                      <PriceLabel
                        onClick={() => this.onClickActivity(assignForm)}
                        withBackground={true}
                        value={budget?.activity}
                        status={
                          pendingTxs.hasElements() ? "pending" : "default"
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className={CssClass.from(styles.Available).get()}>
                <div>
                  <div className={styles.AvailableInput}>
                    {this.state.showAvailableInput ? null : (
                      <PriceLabel
                        onClick={() => this.onClickAvailable(assignForm)}
                        withBackground={true}
                        value={budget?.available}
                        status={"available"}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </BudgetViewConsumer>
    )
  }

  private onClickBudgeted() {
    this.setState({showBudgetedInput: !this.state.showBudgetedInput})
  }

  private onClickAvailable(
    assignForm: (budget: BudgetEntry, type: FormType) => void
  ) {
    assignForm(this.props.budget, "available")
  }

  private onClickActivity(
    assignForm: (budget: BudgetEntry, type: FormType) => void
  ) {
    assignForm(this.props.budget, "activity")
  }

  private onChangeBudgeted(v: Optionable<number>) {
    this.props.budget.budget.budgeted = v.orElseReturn(0.0)
    BudgetApiService.get()
      .update(this.props.budget.budget)
      .then(() => BudgetProvider.refresh())
      .catch(err => {
        console.error("err", err)
        AlertProvider.submitNotification(
          Notification.error(
            "Could not update budget activity value !"
          ).Subtitle(err?.response?.data?.reason || "")
        )
      })
  }
}
