import React, {JSX} from "react"
import styles from "./PeerEditView.module.scss"
import {
  CheckboxInput,
  ChoiceSelector,
  TextInput,
  VD
} from "@damntools.fr/react-inputs"
import {Lists, Optionable, Optional} from "@damntools.fr/types"
import {Peer, PeerType} from "@damntools.fr/wnab-data"
import {
  AlertProvider,
  Notification,
  Popin,
  PopinButton,
  PopinButtonRow
} from "@damntools.fr/react-alert"
import {PeerApiService, PeerProvider} from "../../../../service"

export type PeerEditViewProps = {
  popinId: string
  onSave?: (peer: Peer) => Promise<any>
  onUpdate?: (peer: Peer) => Promise<any>
  peer: Optionable<Peer>
}

export type PeerEditViewState = {
  hidden: Optionable<boolean>
  name: Optionable<string>
  type: Optionable<PeerType>
}

export const openPeerViewPopup = (peer?: Peer) => {
  AlertProvider.submitPopin(
    Popin.title(peer ? "Peer configuration" : "Peer creation")
      .DisableActions()
      .Content(id => (
        <PeerEditView popinId={id} peer={Optional.nullable(peer)} />
      ))
  )
}

export class PeerEditView extends React.Component<
  PeerEditViewProps,
  PeerEditViewState
> {
  constructor(props: PeerEditViewProps) {
    super(props)
    if (this.props.peer.isPresent()) {
      const peer = this.props.peer.get()
      this.state = {
        hidden: Optional.of(peer.hidden),
        name: Optional.of(peer.name),
        type: Optional.of(peer.type)
      }
    } else {
      this.state = {
        hidden: Optional.of(false),
        name: Optional.empty(),
        type: Optional.empty()
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
            "Type",
            <ChoiceSelector
              dark={true}
              onChange={v => this.onChangeType(v)}
              values={this.getTypeValues()}
              selectedValue={this.state.type.map(VD)}
            />
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
    if (this.state.type.isEmpty()) {
      AlertProvider.submitNotification(
        Notification.error("Validation issue").Subtitle("Type should be set")
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
      const peer = new Peer({
        userProfileId: 0,
        hidden: this.state.hidden.orElseReturn(false),
        name: this.state.name.get(),
        type: this.state.type.get()
      })
      if (this.props.peer.isPresent()) {
        peer.id = this.props.peer.get().id
        void PeerApiService.get()
          .update(peer)
          .then(() => PeerProvider.refresh())
          .catch(err => {
            console.error(err)
            AlertProvider.submitNotification(
              Notification.error("Could not update peer !").Subtitle(
                err?.response?.data?.reason || ""
              )
            )
          })
          .then(() => AlertProvider.removeAlert(this.props.popinId))
      } else {
        void PeerApiService.get()
          .create(peer)
          .then(() => PeerProvider.refresh())
          .catch(err => {
            console.error("err", err)
            AlertProvider.submitNotification(
              Notification.error("Could not create peer !").Subtitle(
                err?.response?.data?.reason || ""
              )
            )
          })
          .then(() => AlertProvider.removeAlert(this.props.popinId))
      }
    }
  }

  private getTypeValues() {
    return [
      VD(PeerType.PERSON).Display("Person"),
      VD(PeerType.ENTITY).Display("Entity")
    ]
  }

  private onCancel() {
    AlertProvider.removeAlert(this.props.popinId)
  }

  private onChangeName(value: Optionable<string>) {
    this.setState({name: value.map(s => s.toLowerCase())})
  }

  private onChangeType(value: Optionable<PeerType>) {
    this.setState({type: value})
  }

  private onChangeHidden(value: Optionable<boolean>) {
    this.setState({hidden: value})
  }
}
