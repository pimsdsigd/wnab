import React from "react"
import {TransactionConsumer} from "../../../service"
import {TransactionTable} from "../../transaction"
import {BalanceCartouche} from "../../static"
import {UUID} from "@damntools.fr/identifiers";

export class TransactionOverview extends React.Component<any, any> {
  render() {
    return (
      <TransactionConsumer>
        {({transactions}) => {
          return (
            <div>
              <BalanceCartouche transactions={transactions} />
              <TransactionTable transactions={transactions} showAccount={true} key={UUID.random()} />
            </div>
          )
        }}
      </TransactionConsumer>
    )
  }
}
