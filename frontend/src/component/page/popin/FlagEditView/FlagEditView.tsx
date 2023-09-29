import React, {JSX} from "react"
import styles from "./FlagEditView.module.scss"
import {
  CheckboxInput,
  ColorPicker,
  TextInput,
  VD
} from "@damntools.fr/react-inputs"
import {Lists, Optionable, Optional} from "@damntools.fr/types"
import {TransactionFlag} from "@damntools.fr/wnab-data"
import {
  AlertProvider,
  Notification,
  Popin,
  PopinButton,
  PopinButtonRow
} from "@damntools.fr/react-alert"
import {
  TransactionFlagApiService,
  TransactionProvider
} from "../../../../service"
import {ColorResult} from "react-color"

export type FlagEditViewProps = {
  popinId: string
  onSave?: (flag: TransactionFlag) => Promise<any>
  onUpdate?: (flag: TransactionFlag) => Promise<any>
  flag: Optionable<TransactionFlag>
}

export type FlagEditViewState = {
  hidden: Optionable<boolean>
  name: Optionable<string>
  color: Optionable<string>
}

export const openTxFlagViewPopup = (flag?: TransactionFlag) => {
  AlertProvider.submitPopin(
    Popin.title(flag ? "Flag configuration" : "Flag creation")
      .DisableActions()
      .Content(id => (
        <FlagEditView popinId={id} flag={Optional.nullable(flag)} />
      ))
  )
}

export class FlagEditView extends React.Component<
  FlagEditViewProps,
  FlagEditViewState
> {
  constructor(props: FlagEditViewProps) {
    super(props)
    if (this.props.flag.isPresent()) {
      const flag = this.props.flag.get()
      this.state = {
        hidden: Optional.of(flag.hidden),
        name: Optional.of(flag.name),
        color: Optional.of(flag.color)
      }
    } else {
      this.state = {
        hidden: Optional.of(false),
        name: Optional.empty(),
        color: Optional.empty()
      }
    }
  }

  render() {
    return (
      <div className={styles.Form}>
        <div className={styles.Rows}>
          {this.getRow(
            "Name",
            <TextInput
              dark={true}
              onChange={v => this.onChangeName(v)}
              hideFormat={true}
              value={this.state.name.map(VD)}
            />
          )}
          {this.getRow(
            "Color",
            <div style={{height: "20px"}}>
              <ColorPicker
                dark
                value={this.state.color}
                onChange={(v: Optionable<ColorResult>) => this.onChangeColor(v)}
              />
            </div>
          )}
          {this.getRow(
            "Hidden",
            <div>
              <CheckboxInput
                size={"25px"}
                dark={true}
                onChange={v => this.onChangeHidden(v)}
                checked={this.state.hidden.orElseReturn(false)}
              />
            </div>
          )}
        </div>
        <div className={styles.Buttons}>
          <PopinButtonRow
            buttons={Lists.of(
              <PopinButton
                key={this.props.popinId + "ok"}
                popinId={this.props.popinId}
                action={{
                  callback: () => this.onSuccess(),
                  type: "success",
                  title: "Save"
                }}
                theme={"dark"}
              />,
              <PopinButton
                key={this.props.popinId + "cancel"}
                popinId={this.props.popinId}
                action={{
                  callback: () => this.onCancel(),
                  type: "cancel",
                  title: "Cancel"
                }}
                theme={"dark"}
              />
            )}
          />
        </div>
      </div>
    )
  }

  private getRow(label: string, input: JSX.Element): JSX.Element {
    return (
      <div className={styles.FormRow}>
        <div className={styles.RowLabel}>
          <span>{label}</span>
        </div>
        <div className={styles.RowInput}>{input}</div>
      </div>
    )
  }

  private onSuccess() {
    let errored = false
    console.log(this.state)
    if (this.state.color.isEmpty()) {
      AlertProvider.submitNotification(
        Notification.error("Validation issue").Subtitle("Color should be set")
      )
      errored = true
    }
    if (this.state.name.isEmpty()) {
      AlertProvider.submitNotification(
        Notification.error("Validation issue").Subtitle("Name should be set")
      )
      errored = true
    }
    if (!errored) {
      const flag = new TransactionFlag({
        userProfileId: 0, //TODO
        hidden: this.state.hidden.orElseReturn(false),
        name: this.state.name.get(),
        color: this.state.color.get()
      })
      if (this.props.flag.isPresent()) {
        flag.id = this.props.flag.get().id
        void TransactionFlagApiService.get()
          .update(flag)
          .then(() => TransactionProvider.refresh())
          .catch(err => {
            console.error(err)
            AlertProvider.submitNotification(
              Notification.error("Could not update flag !").Subtitle(
                err?.response?.data?.reason || ""
              )
            )
          })
          .then(() => AlertProvider.removeAlert(this.props.popinId))
      } else {
        void TransactionFlagApiService.get()
          .create(flag)
          .then(() => TransactionProvider.refresh())
          .catch(err => {
            console.error("err", err)
            AlertProvider.submitNotification(
              Notification.error("Could not create flag !").Subtitle(
                  err?.response?.data?.reason || "")
            )
          })
          .then(() => AlertProvider.removeAlert(this.props.popinId))
      }
    }
  }

  private onCancel() {
    AlertProvider.removeAlert(this.props.popinId)
  }

  private onChangeName(value: Optionable<string>) {
    this.setState({name: value.map(s => s.toLowerCase())})
  }

  private onChangeColor(value: Optionable<ColorResult>) {
    this.setState({color: value.map(v => v.hex)})
  }

  private onChangeHidden(value: Optionable<boolean>) {
    this.setState({hidden: value})
  }
}
