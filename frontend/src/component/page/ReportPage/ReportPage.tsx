import React from "react"
import styles from "./ReportPage.module.scss"
import {
  png_chart_candle,
  png_chart_line,
  png_chart_pie,
  png_menu_chart
} from "../../../assets"
import {CssClass} from "@damntools.fr/utils-simple"
import {BalanceReportView} from "./BalanceReportView"

export type ReportPageViewType = "bar" | "line" | "pie" | "candle" | "balance"

export class ReportPage extends React.Component<any, any> {
  render() {
    const viewType = this.props.match?.params?.type as ReportPageViewType
    return (
      <div className={styles.ReportPage}>
        <div>
          <div className={styles.Header}>
            <h1>{"Reports"}</h1>
            {this.getViewTypeLinks(viewType)}
          </div>
          <div className={styles.Options}></div>
          <div className={styles.Filters}></div>
          <div className={styles.Content}>
            {viewType === "balance" ? <BalanceReportView /> : null}
          </div>
        </div>
      </div>
    )
  }

  getViewTypeLinks(viewType: ReportPageViewType) {
    return (
      <div className={styles.ViewTypeLinks}>
        <div
          className={CssClass.classIf(
            styles.SelectedView,
            viewType === "bar"
          ).get()}
          onClick={e => {
            e.preventDefault()
            window.location.hash = "/report/bar"
          }}>
          <span>Bar</span>
          <img src={png_menu_chart} alt={"bar"} />
        </div>
        <div
          className={CssClass.classIf(
            styles.SelectedView,
            viewType === "pie"
          ).get()}
          onClick={e => {
            e.preventDefault()
            window.location.hash = "/report/pie"
          }}>
          <span>Pie</span>
          <img src={png_chart_pie} alt={"pie"} />
        </div>
        <div
          className={CssClass.classIf(
            styles.SelectedView,
            viewType === "line"
          ).get()}
          onClick={e => {
            e.preventDefault()
            window.location.hash = "/report/line"
          }}>
          <span>Line</span>
          <img src={png_chart_line} alt={"line"} />
        </div>
        <div
          className={CssClass.classIf(
            styles.SelectedView,
            viewType === "balance"
          ).get()}
          onClick={e => {
            e.preventDefault()
            window.location.hash = "/report/balance"
          }}>
          <span>Balance</span>
          <img src={png_chart_line} alt={"balance"} />
        </div>
        <div
          className={CssClass.classIf(
            styles.SelectedView,
            viewType === "candle"
          ).get()}
          onClick={e => {
            e.preventDefault()
            window.location.hash = "/report/candle"
          }}>
          <span>Candle</span>
          <img src={png_chart_candle} alt={"candle"} />
        </div>
      </div>
    )
  }
}
