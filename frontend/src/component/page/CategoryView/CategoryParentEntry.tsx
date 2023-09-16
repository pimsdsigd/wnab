import React from "react"
import styles from "./CategoryView.module.scss"
import {Category} from "@damntools.fr/wnab-data"
import {List} from "@damntools.fr/types"
import {CategorySubEntry} from "./CategorySubEntry"
import {png_add_account, png_menu_edit} from "../../../assets"
import {openCategoryViewPopup} from "../popin"

export type CategoryParentEntryProps = {
  category: Category
  subCategories: List<Category>
}

export class CategoryParentEntry extends React.Component<
  CategoryParentEntryProps,
  any
> {
  render() {
    const category = this.props.category
    return (
      <div className={styles.CategoryParentEntry}>
        <div>
          <div>{category.name}</div>
          <div className={styles.AddSub}>
            <div onClick={() => openCategoryViewPopup(undefined, category)}>
              <span></span>
              <img src={png_add_account} alt={"add"} title={"add"} />
            </div>
          </div>
          <div className={styles.AddSub}>
            <div onClick={() => openCategoryViewPopup(category)}>
              <span></span>
              <img src={png_menu_edit} alt={"edit"} title={"Edit"} />
            </div>
          </div>
        </div>
        <div>
          <div className={styles.SubCategories}>
            {this.props.subCategories
              .copy()
              .sortWith("name")
              .stream()
              .map(cat => <CategorySubEntry key={cat.id} category={cat} />)
              .collectArray()}
          </div>
        </div>
      </div>
    )
  }
}
