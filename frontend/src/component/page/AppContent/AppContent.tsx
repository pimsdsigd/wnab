import React, {JSX} from "react"
import styles from "./AppContent.module.scss"
import {MenuPanel} from "../../menu"
import {NotificationCartouche} from "../NotificationCartouche"

export type AppContentProps = {
  children: JSX.Element
}

export class AppContent extends React.Component<AppContentProps, any> {
  render() {
    return (
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
    )
  }
}
