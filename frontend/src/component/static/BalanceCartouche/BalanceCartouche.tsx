import React from "react"
import styles from "./BalanceCartouche.module.scss"
import {Transaction, TransactionStatus} from "@damntools.fr/wnab-data"
import {filterTodayAndBefore} from "../../../service"
import {PriceView} from "../PriceView"
import {
  ArrayList,
  containsProperty,
  KV,
  List,
  toList
} from "@damntools.fr/types"
import {Line} from "react-chartjs-2"
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LinearScale,
  LineElement,
  LogarithmicScale,
  PointElement,
  Tooltip
} from "chart.js"
import {DateTime} from "luxon"

export type BalanceCartoucheProps = {
  transactions: List<Transaction>
}

ChartJS.register(
  LogarithmicScale,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  // Title,
  Tooltip,
  Filler
  // Legend
)

export class BalanceCartouche extends React.Component<
  BalanceCartoucheProps,
  any
> {
  render() {
    const cleared = this.props.transactions
      .stream()
      .filter(
        (tx): tx is Transaction =>
          !TransactionStatus.UNCLEARED.equals(tx.status)
      )
      .filter(filterTodayAndBefore)
      .reduce((o, c) => o + c.cashFlow, 0)
    const uncleared = this.props.transactions
      .stream()
      .filter(filterTodayAndBefore)
      .filter((tx): tx is Transaction =>
        TransactionStatus.UNCLEARED.equals(tx.status)
      )
      .reduce((o, c) => o + c.cashFlow, 0)
    return (
      <div className={styles.BalanceInfo}>
        <div>
          <div className={styles.BalanceValue}>
            <div>
              <span>Cleared</span>
            </div>
            <PriceView value={cleared} />
          </div>
          <div className={styles.BalanceOperator}>
            <span>+</span>
          </div>
          <div className={styles.BalanceValue}>
            <div>
              <span>Uncleared</span>
            </div>
            <PriceView value={uncleared} />
          </div>
          <div className={styles.BalanceOperator}>
            <span></span>
            <span>=</span>
          </div>
          <div className={styles.BalanceValue}>
            <div>
              <span>Available</span>
            </div>
            <PriceView value={cleared + uncleared} />
          </div>
          <div>{this.getPlot()}</div>
        </div>
      </div>
    )
  }

  private getPlot() {
    const data = this.getChartData()
    return (
      <Line
        width={"100%"}
        options={{
          maintainAspectRatio: false,
          scales: {
            x: {
              display: false
            },
            y: {
              display: false,
              // type: "logarithmic"
            },
            yAxes: {
              display: false,
              type: "logarithmic"
            }
          },
          plugins: {
            legend: {
              display: false
            },
            title: {
              display: false
            }
          }
        }}
        data={{
          labels: data.keys().getInner(),
          datasets: [
            {
              fill: true,
              data: data.values().getInner()
            }
          ]
        }}
        datasetIdKey="id"
      />
    )
  }

  private getChartData() {
    const dates = this.generateDays()
    const obj = Object.fromEntries(
      dates
        .stream()
        .map(d => [d, 0])
        .collectArray()
    )
    const data = this.props.transactions.stream().reduce((o, tx) => {
      const day = tx.date.toFormat("yyyyMMdd")
      const found = dates.stream().find(d => d === day)
      if (found) {
        const fmt = found
        if (containsProperty(o, fmt)) o[fmt] += tx.cashFlow
        else o[fmt] = tx.cashFlow
      }
      return o
    }, obj)
    return KV.from(data)
  }

  private generateDays() {
    const end = DateTime.now().set({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0
    })
    const start = DateTime.now()
      .set({hour: 0, minute: 0, second: 0, millisecond: 0})
      .minus({month: 1})
    const list = new ArrayList<DateTime>()
    let current = start
    while (current.toMillis() <= end.toMillis()) {
      list.push(current)
      current = current.plus({day: 1})
    }
    return list
      .stream()
      .map(d => d.toFormat("yyyyMMdd"))
      .collect(toList)
  }
}
