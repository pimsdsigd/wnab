import React from "react"
import styles from "./DatePicker.module.scss"
import {CssClass} from "@damntools.fr/utils-simple"
import ReactDatePicker from "react-datepicker"
import {DateTime} from "luxon"
import {Optionable} from "@damntools.fr/types"

export type DateTimePickerProps = {
  onChange: (date: Date) => void
  value: Optionable<DateTime>
}

export class DatePicker extends React.Component<DateTimePickerProps, any> {
  render() {
    return (
      <div className={CssClass.from(styles.DateTimePicker).get()}>
        <div>
          <div>
            <ReactDatePicker
                dateFormat={"MMMM dd, yyyy"}
              selected={this.props.value
                .map(d => d.toJSDate())
                .orElseUndefined()}
              popperClassName={styles.Popper}
              wrapperClassName={styles.Wrapper}
              calendarClassName={styles.Calendar}
              className={styles.DatePicker}
              onChange={this.props.onChange}
            />
          </div>
        </div>
      </div>
    )
  }
}
