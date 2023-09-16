import React from "react"
import styles from "./FlagSelector.module.scss"
import {CssClass, StringUtils} from "@damntools.fr/utils-simple"
import {TransactionConsumer} from "../../../service"
import {TransactionFlag} from "@damntools.fr/wnab-data"
import {Optionable, Optional} from "@damntools.fr/types"

export type FlagSelectorProps = {
  selected: Optionable<TransactionFlag>
  onChange: (v: Optionable<TransactionFlag>) => void
}

export type FlagSelectorState = {
  hovered: Optionable<number>
}

export class FlagSelector extends React.Component<
  FlagSelectorProps,
  FlagSelectorState
> {
  constructor(props: Readonly<FlagSelectorProps> | FlagSelectorProps) {
    super(props)
    this.state = {hovered: Optional.empty()}
  }

  render() {
    return (
      <TransactionConsumer>
        {({flags}) => {
          return (
            <div className={CssClass.from(styles.FlagSelector).get()}>
              <div>
                <div>
                  {flags
                    .copy()
                    .sortWith("name")
                    .stream()
                    .map(f =>
                      this.getFlag(
                        f,
                        this.props.selected
                          .filter(o => o.id === f.id)
                          .isPresent()
                      )
                    )
                    .collectArray()}
                </div>
              </div>
            </div>
          )
        }}
      </TransactionConsumer>
    )
  }

  private getFlag(flag: TransactionFlag, selected: boolean) {
    const name = flag ? StringUtils.firstToUpper(flag.name) : "Unset"
    const hovered = this.state.hovered.filter(h => h === flag.id).isPresent()
    return (
      <div className={styles.FlagEntry}>
        <div>
          <div
            title={name}
            onMouseEnter={() => this.handleMouseEnter(flag)}
            onMouseLeave={() => this.handleMouseLeave()}
            style={{
              backgroundColor:
                selected || hovered ? "#1f1f1f" : flag?.color || "white",
              borderColor: hovered || selected ? flag.color : "transparent"
            }}
            onClick={() => this.onClick(selected ? undefined : flag)}
            className={CssClass.from(styles.Flag)
              .classIf(styles.Selected, selected)
              .get()}>
            {
              <span
                style={{
                  color: selected ? flag.color : "white"
                }}>
                &#9873;
              </span>
            }
          </div>
        </div>
      </div>
    )
  }

  handleMouseEnter(flag: TransactionFlag) {
    this.setState({
      hovered: Optional.of(flag.id as number)
    })
  }

  handleMouseLeave() {
    this.setState({hovered: Optional.empty()})
  }

  private onClick(flag?: TransactionFlag) {
    this.props.onChange(Optional.nullable(flag))
  }
}
