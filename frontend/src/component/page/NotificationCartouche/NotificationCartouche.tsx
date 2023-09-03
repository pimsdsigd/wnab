import React from "react"
import styles from "./NotificationCartouche.module.scss"
import {png_info} from "../../../assets"

export class NotificationCartouche extends React.Component<any, any> {
  render() {
    return (
      <div className={styles.NotificationCartouche}>
        <span>
          <span></span>
          <img src={png_info} alt={"Info"} title={"Info"} />
          <span>Notification message</span>
        </span>
      </div>
    )
  }
}
