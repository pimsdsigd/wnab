import React from "react"
import styles from "./ReportPage.module.scss"
import {TransactionConsumer} from "../../../service"
import {ReportUtils} from "../../../utils"
import {Dict, DictObjectEntry, DictUtils, toList} from "@damntools.fr/types"
import {Line} from "react-chartjs-2"
import {DateTime} from "luxon"

export class BalanceReportView extends React.Component<any, any> {
  render() {
    return (
      <TransactionConsumer>
        {({transactions}) => {
          const groupedTx = ReportUtils.groupTransactionsByMonths(
            transactions.copy().reverse()
          )
          const reduced = DictUtils.fromEntries(
            groupedTx
              .entries()
              .stream()
              .map(e => {
                const amount = e.value
                  .stream()
                  .reduce((o, c) => o + c.cashFlow, 0)
                return {key: e.key, value: amount}
              })
              .collect(toList)
          )
          let previous = 0
          reduced
            .entries()
            .sortWith("key")
            .forEach((e: DictObjectEntry<number, number>, i: number) => {
              if (i > 0) {
                const value = e.value + previous
                previous = value
                reduced.put(e.key, value)
              } else {
                previous = e.value
              }
            })
          console.log(groupedTx.collect())
          console.log(reduced.collect())
          return (
            <div className={styles.BalanceReportView}>
              {this.getPlot(reduced)}
            </div>
          )
        }}
      </TransactionConsumer>
    )
  }

  private getPlot(data: Dict<number, number>) {
    return (
      <Line
        width={"100%"}
        options={{
          maintainAspectRatio: false,
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
          labels: data
            .keys()
            .stream()
            .map(e => parseInt(e as any))
            .map(DateTime.fromMillis)
            .map(d => d.toFormat("yyyy/MM"))
            .collectArray(),
          datasets: [
            {
              pointRadius: 2,
              fill: "origin",
              borderJoinStyle: "bevel",
              backgroundColor: "rgba(129,197,34,0.5)",
              borderWidth: 2,
              data: data.values().getInner()
            }
          ]
        }}
        datasetIdKey="id"
      />
    )
  }
}
