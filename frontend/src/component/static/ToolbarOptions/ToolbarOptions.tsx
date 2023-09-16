import React from "react"
import styles from "./ToolbarOptions.module.scss"
import {CssClass} from "@damntools.fr/utils-simple"
import {
  png_bank,
  png_category,
  png_flag,
  png_peer_logo,
  png_settings
} from "../../../assets"
import {MaskedImage, RGBA} from "@damntools.fr/react-utils"

export type MenuPanelState = {
  expandToolbar: boolean
}

export class ToolbarOptions extends React.Component<any, MenuPanelState> {
  constructor(props: any) {
    super(props)
    this.state = {
      expandToolbar: false
    }
  }

  render() {
    return (
      <div className={styles.ToolbarOptions}>
        <div className={styles.ToolbarTitle}>
          <div>
            <span>Hello</span>
          </div>
          <div>
            <span
              title={"Click to expand/hide"}
              onClick={() =>
                this.setState({expandToolbar: !this.state.expandToolbar})
              }>
              {!this.state.expandToolbar ? "▼" : "▲"}
            </span>
          </div>
        </div>
        <div className={styles.ToolbarExpand}>
          {this.state.expandToolbar ? this.getToolbar() : null}
        </div>
      </div>
    )
  }

  getToolbar() {
    const tileWidth = "24px"
    return (
      <div>
        <div
          className={CssClass.from(
            styles.EntityManagement,
            styles.ToolbarPart
          ).get()}>
          <div>Manage</div>
          <div className={styles.ManageTiles}>
            <div>
              <div
                  onClick={e => {
                    e.preventDefault()
                    window.location.hash = "/category"
                    // window.location.reload()
                  }}>
                <MaskedImage
                  icon={png_category}
                  color={RGBA(144, 180, 33)}
                  width={tileWidth}
                  title={"Categories"}
                />
              </div>
            </div>
            <div>
              <div
                  onClick={e => {
                    e.preventDefault()
                    window.location.hash = "/peer"
                    // window.location.reload()
                  }}>
                <MaskedImage
                  icon={png_peer_logo}
                  color={RGBA(196, 165, 45)}
                  width={tileWidth}
                  title={"Peers"}
                />
              </div>
            </div>
            <div>
              <div
                  onClick={e => {
                    e.preventDefault()
                    window.location.hash = "/account"
                    // window.location.reload()
                  }}>
                <MaskedImage
                  icon={png_bank}
                  color={RGBA(211, 55, 49)}
                  width={tileWidth}
                  title={"Accounts"}
                />
              </div>
            </div>
            <div>
              <div
                onClick={e => {
                  e.preventDefault()
                  window.location.hash = "/flag"
                  // window.location.reload()
                }}>
                <MaskedImage
                  color={RGBA(183, 100, 33)}
                  icon={png_flag}
                  width={tileWidth}
                  title={"Flags"}
                />
              </div>
            </div>
            <div>
              <div
                  onClick={e => {
                    e.preventDefault()
                    window.location.hash = "/options"
                    // window.location.reload()
                  }}>
                <MaskedImage
                  color={RGBA(36, 133, 175)}
                  icon={png_settings}
                  width={tileWidth}
                  title={"Options"}
                />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.ToolbarPart}>
          <p>
            <strong>WNAB?</strong> stands for{" "}
            <strong>Why Need a Budget?</strong>
          </p>
          <p>
            I'm sure you have plenty of reasons to have one and you will
            probably discover new ones all along the journey. No need to
            be assertive in the name ;)
          </p>
        </div>
        <div className={CssClass.from(styles.ToolbarPart, styles.Links).get()}>
          <span onClick={e => {
            e.preventDefault()
            window.location.hash = "/bugreport"
            // window.location.reload()
          }}  className={styles.Report}>Report a bug</span>
          <span
              onClick={e => {
                e.preventDefault()
                window.location.hash = "/donate"
                // window.location.reload()
              }} className={styles.Donate}>Donate</span>
        </div>
      </div>
    )
  }
}
