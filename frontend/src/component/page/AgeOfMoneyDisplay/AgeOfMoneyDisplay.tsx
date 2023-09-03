import React from "react"
import styles from "./AgeOfMoneyDisplay.module.scss"
import {Optionable, Optional} from "@damntools.fr/types"
import axios from "axios"

export type AgeOfMoneyDisplayProps = {
  accountId: number | undefined
}

export type AgeOfMoneyDisplayState = {
  aom: Optionable<number>
}

export class AgeOfMoneyDisplay extends React.Component<
  AgeOfMoneyDisplayProps,
  AgeOfMoneyDisplayState
> {
  state: AgeOfMoneyDisplayState = {
    aom: Optional.empty()
  }

  componentDidMount() {
    let promise = null
    if (this.props.accountId)
      promise = axios.get(
        `http://localhost:8000/api/account/${this.props.accountId}/aom`
      )
    else promise = axios.get(`http://localhost:8000/api/account/aom`)
    promise
      .then(res => res.data as number)
      .then(aom => this.setState({aom: Optional.of(aom)}))
  }

  componentDidUpdate(prevProps: Readonly<AgeOfMoneyDisplayProps>) {
    if (this.props.accountId !== prevProps.accountId) this.componentDidMount()
  }

  render() {
    return (
      <div className={styles.AgeOfMoneyDisplay}>
        <div className={styles.Title}>Age of money</div>
        <div className={styles.Value}>
          {this.state.aom.map(aom => aom.toLocaleString()).orElseReturn("N/C")}
        </div>
      </div>
    )
  }
}
