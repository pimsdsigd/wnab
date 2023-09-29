import React from "react"
import styles from "./MonthSelector.module.scss"
import {CssClass} from "@damntools.fr/utils-simple"
import {Optionable} from "@damntools.fr/types"
import {DateTime} from "luxon"

export type MonthSelectorProps = {
  date: Optionable<DateTime>
  onChange: (value: DateTime) => void
}

export class MonthSelector extends React.Component<MonthSelectorProps, any> {
  render() {
    const month = this.formatMonth().get()
    const strings = month.toFormat("yyyy LLLL").split(" ")
    return (
      <div className={CssClass.from(styles.MonthSelector).get()}>
        <div>
          <div className={styles.Left}>
            <span onClick={() => this.onClickPrevious(month)}>&#10094;</span>
          </div>
          <div className={styles.Middle}>
            <div>
              <div className={styles.Year}>{strings[0]}</div>
              <div className={styles.Month}>{strings[1]}</div>
            </div>
          </div>
          <div className={styles.Right}>
            <span onClick={() => this.onClickNext(month)}>&#10095;</span>
          </div>
        </div>
      </div>
    )
  }

  onClickPrevious(month: DateTime) {
    this.props.onChange(month.minus({month: 1}))
  }

  onClickNext(month: DateTime) {
    this.props.onChange(month.plus({month: 1}))
  }

  formatMonth() {
    return this.props.date.mapEmpty(DateTime.now).map(d =>
      d.set({
        day: 1,
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0
      })
    )
  }
}
