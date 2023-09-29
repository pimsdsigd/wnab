import React, {JSX} from "react"
import styles from "./AppContent.module.scss"
import {MenuPanel} from "../../menu"
import {NotificationCartouche} from "../NotificationCartouche"
import {
  AccountProvider,
  BudgetProvider,
  CategoryProvider,
  PeerProvider,
  TransactionProvider
} from "../../../service"
import {AlertProvider} from "@damntools.fr/react-alert"

export type AppContentProps = {
  children: JSX.Element
}

export class AppContent extends React.Component<AppContentProps, any> {
  render() {
    return (
      <AccountProvider>
        <TransactionProvider>
          <CategoryProvider>
            <PeerProvider>
              <BudgetProvider>
                <AlertProvider theme={"dark"}>
                  <div className={styles.AppContent}>
                    <div className={styles.Menu}>
                      <MenuPanel />
                    </div>
                    <div className={styles.Content}>
                      <div>
                        <NotificationCartouche />
                        {this.props.children}
                      </div>
                    </div>
                  </div>
                </AlertProvider>
              </BudgetProvider>
            </PeerProvider>
          </CategoryProvider>
        </TransactionProvider>
      </AccountProvider>
    )
  }
}
