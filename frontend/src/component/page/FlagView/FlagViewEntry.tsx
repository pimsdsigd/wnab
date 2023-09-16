import React from "react"
import {TransactionFlag} from "@damntools.fr/wnab-data"
import styles from "./FlagView.module.scss"
import {openTxFlagViewPopup} from "../popin"
import {StringUtils} from "@damntools.fr/utils-simple"

export type FlagViewEntryProps = {
  flag: TransactionFlag
  transactionCount: number
}
export type FlagViewEntryState = {
  hovered: boolean
}

export class FlagViewEntry extends React.Component<
  FlagViewEntryProps,
  FlagViewEntryState
> {
  constructor(props: Readonly<FlagViewEntryProps> | FlagViewEntryProps) {
    super(props)
    this.state = {hovered: false}
  }

  render() {
    const flag = this.props.flag
    return (
      <div
        className={styles.FlagViewEntry}
        onMouseEnter={() => this.handleMouseEnter()}
        onMouseLeave={() => this.handleMouseLeave()}
        style={{borderColor: this.state.hovered ? flag.color : "transparent"}}
        onClick={() => this.onClick()}>
        <div>
          <div className={styles.EntryIcon}>
            <span style={{color: flag.color}} title={flag.name}>
              &#9873;
            </span>
          </div>
          <div className={styles.EntryName}>
            <span
              style={{
                color: this.state.hovered ? flag.color : "inherit"
              }}>
              {StringUtils.firstToUpper(flag.name) +
                " (" +
                this.props.transactionCount +
                ")"}
            </span>
          </div>
        </div>
      </div>
    )
  }

  handleMouseEnter() {
    this.setState({hovered: true})
  }

  handleMouseLeave() {
    this.setState({hovered: false})
  }

  private onClick() {
    openTxFlagViewPopup(this.props.flag)
  }
}
