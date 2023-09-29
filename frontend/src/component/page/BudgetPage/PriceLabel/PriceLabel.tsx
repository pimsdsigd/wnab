import React from "react"
import styles from "./PriceLabel.module.scss"
import {CssClass, NumberUtils, StringUtils} from "@damntools.fr/utils-simple"

export type PriceLabelStatus = "available" | "pending" | "default"

export type PriceLabelProps = {
  value: number
  status: PriceLabelStatus
  withBackground: boolean
  onClick?: () => void
}

export class PriceLabel extends React.Component<PriceLabelProps, any> {
  render() {
    const value = this.props.value || 0
    return (
      <span
        onClick={() => this.onClick()}
        className={CssClass.from(
          styles.PriceLabel,
          styles["Status" + StringUtils.firstToUpper(this.props.status)]
        )
          .classIf(styles.WithBackground, this.props.withBackground)
          .classIf(styles.Clickable, !!this.props.onClick)
          .classIf(styles.LabelPositive, value > 0)
          .classIf(styles.LabelNegative, value < 0)
          .get()}>
        <span>{NumberUtils.formatNumber(value, 2)}</span>
        <span>€</span>
      </span>
    )
  }

  private onClick() {
    if (this.props.onClick) this.props.onClick()
  }
}
