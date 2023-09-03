import React from "react"
import styles from "./LoaderDiv.module.scss"
import {CssClass} from "@damntools.fr/utils-simple"

export class LoaderDiv extends React.Component<any, any> {
  render() {
    return <div className={CssClass.from(styles.LoaderDiv).get()}>
      <div>
        <div>
          <span className={styles.loader}></span>
        </div>
      </div>
    </div>
  }
}
