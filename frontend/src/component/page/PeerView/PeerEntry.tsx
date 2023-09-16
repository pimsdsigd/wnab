import React from "react"
import styles from "./PeerView.module.scss"
import {Peer} from "@damntools.fr/wnab-data"
import {CheckboxInput} from "@damntools.fr/react-inputs"
import {png_delete, png_menu_edit} from "../../../assets"
import {Optionable} from "@damntools.fr/types"
import {PeerApiService, PeerProvider} from "../../../service"
import {AlertProvider, Notification} from "@damntools.fr/react-alert"
import {openPeerViewPopup} from "../popin"

export type PeerEntryProps = {
  peer: Peer
}

export class PeerEntry extends React.Component<PeerEntryProps, any> {
  render() {
    const peer = this.props.peer
    return (
      <div className={styles.PeerEntry}>
        <div>
          <div>{peer.name}</div>
          <div title={"Hidden"}>
            <CheckboxInput
              checked={peer.hidden}
              onChange={value => this.onChangeHidden(value)}
              size={"16px"}
              dark
              color={"#4a7200"}
            />
          </div>
          <div>
            <div onClick={() => openPeerViewPopup(peer)}>
              <span></span>
              <img src={png_menu_edit} alt={"edit"} title={"Edit"} />
            </div>
          </div>
          <div>
            <div onClick={() => []}>
              <span></span>
              <img src={png_delete} alt={"delete"} title={"Delete"} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  onChangeHidden(value: Optionable<boolean>) {
    const peer = new Peer(this.props.peer)
    peer.hidden = value.orElseReturn(false)
    PeerApiService.get()
      .update(peer)
      .then(() => PeerProvider.refresh())
      .catch(err => {
        console.error("err", err)
        AlertProvider.submitNotification(
          Notification.error("Could not update hidden value !").Subtitle(
            err?.response?.data?.reason || ""
          )
        )
      })
  }
}
