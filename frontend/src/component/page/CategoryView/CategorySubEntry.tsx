import React from "react"
import styles from "./CategoryView.module.scss"
import {Category} from "@damntools.fr/wnab-data"
import {CheckboxInput} from "@damntools.fr/react-inputs"
import {Optionable} from "@damntools.fr/types"
import {CategoryApiService, CategoryProvider} from "../../../service"
import {AlertProvider, Notification} from "@damntools.fr/react-alert"
import {png_menu_edit} from "../../../assets"
import {openCategoryViewPopup} from "../popin";

export type CategoryParentEntryProps = {
  category: Category
}

export class CategorySubEntry extends React.Component<
  CategoryParentEntryProps,
  any
> {
  render() {
    const category = this.props.category
    return (
      <div className={styles.CategorySubEntry}>
        <div>
          <div>{category.name}</div>
          <div title={"Hidden"}>
            <CheckboxInput
              checked={category.hidden}
              onChange={value => this.onChangeHidden(value)}
              size={"16px"}
              dark
              color={"#4a7200"}
            />
          </div>
          <div>
            <div onClick={() => openCategoryViewPopup(category, category.parentCategory)}>
              <span></span>
              <img src={png_menu_edit} alt={"edit"} title={"Edit"} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  onChangeHidden(value: Optionable<boolean>) {
    const category = new Category(this.props.category)
    category.hidden = value.orElseReturn(false)
    CategoryApiService.get()
      .update(category)
      .then(() => CategoryProvider.refresh())
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
