import {CssClass} from "@damntools.fr/utils-simple"
import styles from "./MenuEntry.module.scss"
import {Link} from "react-router-dom"
import React from "react"

const isMenuSelected = (link: string): boolean => {
  const pattern = new RegExp("^#" + link + ".*")
  return pattern.test(window.location.hash)
}

export type MenuEntryProps = {
  name: string
  link: string
  icon: string
}
export const MenuEntry = ({name, link, icon}: MenuEntryProps) => (
  <div
    className={CssClass.from(styles.MenuEntry)
      .classIf(() => styles.CurrentMenu, isMenuSelected(link))
      .get()}>
    <Link
      to={link}
      onClick={e => {
        e.preventDefault()
        window.location.hash = link
        // window.location.reload()
      }}>
      <div>
        <span></span>
        <img src={icon} alt="link" />
      </div>
      <div>
        <span>{name}</span>
      </div>
    </Link>
  </div>
)
