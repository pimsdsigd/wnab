import React from "react"
import styles from "./AccountView.module.scss"
import {AccountConsumer, TransactionConsumer} from "../../../service"
import {TransactionTable} from "../../transaction"
import {AccountInfoCartouche, BalanceCartouche, LoaderDiv} from "../../static"
import {UUID} from "@damntools.fr/identifiers"

export type AccountViewState = {
  configure: boolean
}

export class AccountView extends React.Component<any, AccountViewState> {
  constructor(props: any) {
    super(props)
    this.state = {
      configure: false
    }
  }

  render() {
    return (
      <AccountConsumer>
        {({getAccountByName}) => {
          if (!this.props.match?.params?.id) return <div>Bad call !</div>
          const viewedAccount = getAccountByName(this.props.match.params.id)
          if (viewedAccount.isEmpty()) return <LoaderDiv />
          const account = viewedAccount.get()
          return (
            <div className={styles.AccountView}>
              <div>
                <AccountInfoCartouche account={account} showButtons={true}/>
                <TransactionConsumer>
                  {({txByAccount}) => {
                    const transactionList = txByAccount(account)
                    return (
                      <div>
                        <BalanceCartouche transactions={transactionList} />
                        <TransactionTable
                          transactions={transactionList}
                          showAccount={false}
                          key={UUID.random()}
                        />
                      </div>
                    )
                  }}
                </TransactionConsumer>
              </div>
            </div>
          )
        }}
      </AccountConsumer>
    )
  }
}
