import React from "react"
import {HashRouter, Route, Switch} from "react-router-dom"
import styles from "./App.module.scss"
import {AlertProvider} from "@damntools.fr/react-alert"
import {Globals} from "@damntools.fr/react-globals"
import {AccountView, LoaderDiv} from "./component"
import {AccountProvider, TransactionProvider} from "./service"
import {AppContent} from "./component/page/AppContent"
import {TransactionOverview} from "./component/page/TransactionOverview"

export class App extends React.Component {
  render() {
    const title = Globals.get<string>("description.title").orElseReturn("WNAB?")
    return (
      <HashRouter>
        <AccountProvider>
          <TransactionProvider>
            <AlertProvider theme={"dark"}>
              <div className={styles.HomeMainFrame}>
                <div className={styles.MainAppBlock}>
                  <div className={styles.Header}>
                    <div className={styles.HeaderContent}>
                      Welcome on <span>{title}</span>
                    </div>
                  </div>
                  <div className={styles.MainPanel}>
                    {this.getSwitchRoutes()}
                  </div>
                </div>
              </div>
            </AlertProvider>
          </TransactionProvider>
        </AccountProvider>
      </HashRouter>
    )
  }

  private getSwitchRoutes() {
    return (
      <Switch>
        <Route exact path="/">
          <AppContent>
            <LoaderDiv />
          </AppContent>
        </Route>
        <Route exact path="/budget">
          <AppContent>
            <LoaderDiv />
          </AppContent>
        </Route>
        <Route exact path="/report">
          <AppContent>
            <LoaderDiv />
          </AppContent>
        </Route>
        <Route exact path="/overview">
          <AppContent>
            <TransactionOverview />
          </AppContent>
        </Route>
        <Route
          path="/account/:id"
          render={props => (
            <AppContent>
              <AccountView {...props} />
            </AppContent>
          )}
        />
      </Switch>
    )
  }
}
