import React from "react"
import styles from "./MenuPanel.module.scss"
import {MenuEntry} from "../MenuEntry"
import {
  png_add_account,
  png_menu_budget,
  png_menu_chart,
  png_menu_overview
} from "../../../assets"
import {MenuAccounts} from "../MenuAccounts"
import {openAccountViewPopup} from "../../page";
import {ToolbarOptions} from "../../static";

export class MenuPanel extends React.Component<any, any> {

  render() {
    return (
      <div className={styles.MenuPanel}>
        <ToolbarOptions/>
        <div className={styles.Menus}>
          <div>
            <MenuEntry
              name={"Budget"}
              icon={png_menu_budget}
              link={"/budget"}
            />
            <MenuEntry
              name={"Reports"}
              icon={png_menu_chart}
              link={"/report"}
            />
            <MenuEntry
              name={"Overview"}
              icon={png_menu_overview}
              link={"/overview"}
            />
          </div>
        </div>
        <div className={styles.Accounts}>
          <MenuAccounts />
        </div>
        <div className={styles.AddAccount}>
          <div onClick={() => openAccountViewPopup()}>
            <span></span>
            <img src={png_add_account} alt={"add"} title={"add"} />
            <span>Add account</span>
          </div>
        </div>
      </div>
    )
  }
}
