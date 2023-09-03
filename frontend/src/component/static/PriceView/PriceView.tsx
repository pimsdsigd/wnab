import React, {CSSProperties} from "react"
import styles from "./PriceView.module.scss"
import {CssClass} from "@damntools.fr/utils-simple"

export interface PriceViewProps {
  value: number
  currency?: "string"
  color?: boolean
  styles?: CSSProperties
  positiveColor?: string
  negativeColor?: string
}

export class PriceView extends React.Component<PriceViewProps, any> {
  public static defaultProps = {
    currency: "€",
    color: true,
    styles: {},
    positiveColor: "#8baf73",
    negativeColor: "#d36868"
  }

  render() {
    return (
      <div className={styles.PriceView}>
        <div
          style={{...this.props.styles, color: this.getColor()}}
          className={CssClass.classIf(() => styles.Colored, this.props.color)
            .classIf(styles.Positive, this.props.value > 0)
            .classIf(styles.Negative, this.props.value < 0)
            .get()}>
          <span className={styles.Balance} style={{}}>
            {this.formatBalance()}
          </span>
          <span className={styles.Unit}>{this.props.currency}</span>
        </div>
      </div>
    )
  }

  private formatBalance() {
    return this.props.value.toLocaleString(undefined, {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    })
  }

  private getColor(): string {
    if (this.props.color && this.props.value > 0)
      return this.props.positiveColor as string
    else if (this.props.color && this.props.value < 0)
      return this.props.negativeColor as string
    else return "inherit"
  }
}
