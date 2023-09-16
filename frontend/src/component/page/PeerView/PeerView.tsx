import React from "react"
import styles from "./PeerView.module.scss"
import {PeerConsumer} from "../../../service"
import {png_add_account} from "../../../assets"
import {PeerEntry} from "./PeerEntry"
import {openPeerViewPopup} from "../popin";

export class PeerView extends React.Component<any, any> {
  render() {
    return (
      <PeerConsumer>
        {({peers}) => {
          return (
            <div className={styles.PeerView}>
              <div>
                <div>
                  <div>
                    <h1>Peer administration</h1>
                  </div>
                  <div className={styles.Toolbar}>
                    <div className={styles.Add}>
                      <div onClick={() => openPeerViewPopup()}>
                        <span></span>
                        <img src={png_add_account} alt={"add"} title={"add"} />
                        <span>Add</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.List}>
                    <div className={styles.ListWrapper}>
                      {peers
                        .copy()
                        .sortWith("name")
                        .stream()
                        .map(p => <PeerEntry peer={p} key={p.id} />)
                        .collectArray()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        }}
      </PeerConsumer>
    )
  }
}
