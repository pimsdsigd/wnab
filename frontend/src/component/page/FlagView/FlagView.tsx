import React from "react"
import styles from "./FlagView.module.scss"
import {TransactionConsumer} from "../../../service"
import {FlagViewEntry} from "./FlagViewEntry"
import {openTxFlagViewPopup} from "../popin"
import {png_add_account} from "../../../assets"
import {Transaction, TransactionFlag} from "@damntools.fr/wnab-data"
import {List} from "@damntools.fr/types"

export class FlagView extends React.Component<any, any> {
  render() {
    return (
      <TransactionConsumer>
        {({flags, transactions}) => {
          return (
            <div className={styles.FlagView}>
              <div>
                <div>
                  <h1>Flag administration</h1>
                </div>
                <div className={styles.Toolbar}>
                  <div className={styles.Add}>
                    <div onClick={() => openTxFlagViewPopup()}>
                      <span></span>
                      <img src={png_add_account} alt={"add"} title={"add"} />
                      <span>Add</span>
                    </div>
                  </div>
                </div>
                <div className={styles.List}>
                  {flags
                    .copy()
                    .sortWith("name")
                    .stream()
                    .map(f => (
                      <FlagViewEntry
                        transactionCount={this.getTransactionCount(
                          f,
                          transactions
                        )}
                        flag={f}
                        key={f.id}
                      />
                    ))
                    .collectArray()}
                </div>
              </div>
            </div>
          )
        }}
      </TransactionConsumer>
    )
  }

  private getTransactionCount(
    flag: TransactionFlag,
    transactions: List<Transaction>
  ) {
    return transactions
      .stream()
      .filter(tx => !!tx.flag && tx.flag.id === flag.id)
      .count()
  }
}
