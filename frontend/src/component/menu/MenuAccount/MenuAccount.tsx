import React from "react"
import styles from "./MenuAccount.module.scss"
import {CssClass} from "@damntools.fr/utils-simple"
import {png_menu_edit} from "../../../assets"
import {PriceView} from "../../static"
import {PRICE_POSITIVE_COLOR} from "../../../constants"
import {openAccountViewPopup} from "../../page"
import {EnrichedAccount} from "../../../service/AccountApiService"

export type MenuPanelProps = {
  account: EnrichedAccount
}

export class MenuAccount extends React.Component<MenuPanelProps, any> {
  render() {
    const account = this.props.account
    const link = `/account/${encodeURI(account.name)}`
    return (
      <div
        className={CssClass.from(styles.MenuAccount)
          .classIf(() => styles.Current, window.location.hash === `#${link}`)
          .get()}>
        <div className={styles.Wrapper}>
          <div
            className={styles.Name}
            onClick={() => {
              window.location.hash = link
              // window.location.reload()
            }}>
            <span>{account.name}</span>
          </div>
          <div className={styles.Price}>
            <PriceView
              value={account.balance || 0.0}
              positiveColor={PRICE_POSITIVE_COLOR}
            />
          </div>
          <div className={styles.Edit}>
            <span></span>
            <img
              src={png_menu_edit}
              alt={"Edit"}
              title={"Edit"}
              onClick={() => openAccountViewPopup(account)}
            />
          </div>
        </div>
      </div>
    )
  }
}
