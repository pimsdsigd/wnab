import React from "react"
import styles from "./AgeOfMoneyDisplay.module.scss"
import {Optionable, Optional} from "@damntools.fr/types"
import {AxiosService} from "../../../service/AxiosService"
import {AuthenticatedWrapper} from "@damntools.fr/http"

export type AgeOfMoneyDisplayProps = {
  accountId?: number
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
  private readonly axios: AuthenticatedWrapper

  constructor(props: AgeOfMoneyDisplayProps) {
    super(props)
    this.axios = AxiosService.getAuthenticatedInstance().child({
      baseURL: "/account"
    })
  }

  componentDidMount() {
    let promise = null
    if (this.props.accountId)
      promise = this.axios.get(`/${this.props.accountId}/aom`)
    else promise = this.axios.get(`/aom`)
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
