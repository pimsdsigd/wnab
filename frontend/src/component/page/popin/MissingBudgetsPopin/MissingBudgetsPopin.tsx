import React from "react"
import styles from "./MissingBudgetsPopin.module.scss"
import {List, Lists} from "@damntools.fr/types"
import {Category, Peer} from "@damntools.fr/wnab-data"
import {
  AlertProvider,
  Notification,
  Popin,
  PopinButton,
  PopinButtonRow
} from "@damntools.fr/react-alert"
import {DateTime} from "luxon"
import {BudgetApiService, BudgetProvider} from "../../../../service"

export type MissingBudgetsPopinProps = {
  popinId: string
  onSave?: (peer: Peer) => Promise<any>
  onUpdate?: (peer: Peer) => Promise<any>
  missingBudgets: List<Category>
  month: DateTime
}

export type MissingBudgetsPopinState = {}

export const openMissingBudgetsPopup = (
  missingBudgets: List<Category>,
  month: DateTime
) => {
  AlertProvider.submitPopin(
    Popin.title(`Missing budgets (${missingBudgets.size()})`)
      .DisableActions()
      .Content(id => (
        <MissingBudgetsPopin
          popinId={id}
          missingBudgets={missingBudgets}
          month={month}
        />
      ))
  )
}

export class MissingBudgetsPopin extends React.Component<
  MissingBudgetsPopinProps,
  MissingBudgetsPopinState
> {
  render() {
    const missingBudgets = this.props.missingBudgets
    return (
      <div className={styles.MissingBudgetsPopin}>
        <div>
          <div className={styles.Title}>
            <h2>
              {missingBudgets.size() > 1
                ? "Categories do not"
                : "Category does not"}{" "}
              have budget for month {this.props.month.toFormat("yyyy-MM")}
              {" :"}
            </h2>
          </div>
          <div className={styles.Entries}>
            {missingBudgets
              .stream()
              .sort((a, b) => a.pretty().localeCompare(b.pretty()))
              .map(value => this.getCategoryEntry(value))
              .collectArray()}
          </div>
        </div>
        <div className={styles.Question}>
          <h2>Would you like to create budget entries for each ?</h2>
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
                  title: "Yes"
                }}
                theme={"dark"}
              />,
              <PopinButton
                key={this.props.popinId + "cancel"}
                popinId={this.props.popinId}
                action={{
                  callback: () => this.onCancel(),
                  type: "cancel",
                  title: "No"
                }}
                theme={"dark"}
              />
            )}
          />
        </div>
      </div>
    )
  }

  private onCancel() {
    AlertProvider.removeAlert(this.props.popinId)
  }

  getCategoryEntry(category: Category) {
    return <div className={styles.CategoryEntry}>{category.pretty()}</div>
  }

  private onSuccess() {
    const promises = this.props.missingBudgets
      .stream()
      .map(c =>
        BudgetApiService.get().createBudgetForMonthAndCategory(
          this.props.month,
          c
        )
      )
      .collectArray()
    Promise.all(promises)
      .then(() => BudgetProvider.refresh())
      .then(() =>
        AlertProvider.submitNotification(
          Notification.info("Budget entries created")
        )
      )
      .catch(err => {
        console.error(err)
        AlertProvider.submitPopin(Popin.error("Could not create entries"))
      })
      .then(() => AlertProvider.removeAlert(this.props.popinId))
  }
}
