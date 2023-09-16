import React from "react"
import {HashRouter, Route, Switch} from "react-router-dom"
import styles from "./App.module.scss"
import {AlertProvider} from "@damntools.fr/react-alert"
import {Globals} from "@damntools.fr/react-globals"
import {
  AccountView,
  AppContent,
  CategoryView,
  FlagView,
  LoaderDiv,
  PeerView,
  TransactionOverview
} from "./component"
import {
  AccountProvider,
  CategoryProvider,
  PeerProvider,
  TransactionProvider
} from "./service"

export class App extends React.Component {
  render() {
    const title = Globals.get<string>("description.title").orElseReturn("WNAB?")
    return (
      <HashRouter>
        <AccountProvider>
          <TransactionProvider>
            <CategoryProvider>
              <PeerProvider>
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
              </PeerProvider>
            </CategoryProvider>
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
            <div style={{padding: "10px 30px"}}>
              <p>
                Welcome on <span style={{color: "#71a114"}}>WNAB</span>
              </p>
            </div>
          </AppContent>
        </Route>
        <Route exact path="/budget">
          <AppContent>
            <LoaderDiv />
          </AppContent>
        </Route>
        <Route exact path="/account">
          <AppContent>
            <LoaderDiv />
          </AppContent>
        </Route>
        <Route exact path="/options">
          <AppContent>
            <LoaderDiv />
          </AppContent>
        </Route>
        <Route exact path="/bugreport">
          <AppContent>
            <LoaderDiv />
          </AppContent>
        </Route>
        <Route exact path="/donate">
          <AppContent>
            <LoaderDiv />
          </AppContent>
        </Route>
        <Route exact path="/flag">
          <AppContent>
            <FlagView />
          </AppContent>
        </Route>
        <Route exact path="/peer">
          <AppContent>
            <PeerView />
          </AppContent>
        </Route>
        <Route exact path="/category">
          <AppContent>
            <CategoryView />
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
            exact
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
