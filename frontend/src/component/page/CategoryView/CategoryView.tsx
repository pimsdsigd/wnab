import React from "react"
import styles from "./CategoryView.module.scss"
import {CategoryConsumer} from "../../../service"
import {png_add_account} from "../../../assets"
import {CategoryParentEntry} from "./CategoryParentEntry"
import {List, toList} from "@damntools.fr/types"
import {Category} from "@damntools.fr/wnab-data"
import {openCategoryViewPopup} from "../popin"

export class CategoryView extends React.Component<any, any> {
  render() {
    return (
      <CategoryConsumer>
        {({parentCategories, subCategories}) => {
          return (
            <div className={styles.CategoryView}>
              <div>
                <div>
                  <h1>Category administration</h1>
                </div>
                <div className={styles.Toolbar}>
                  <div className={styles.Add}>
                    <div
                      onClick={() =>
                        openCategoryViewPopup(undefined)
                      }>
                      <span></span>
                      <img src={png_add_account} alt={"add"} title={"add"} />
                      <span>Add</span>
                    </div>
                  </div>
                </div>
                <div className={styles.List}>
                  {parentCategories
                    .copy()
                    .sortWith("name")
                    .stream()
                    .map(cat => (
                      <CategoryParentEntry
                          key={cat.id}
                        category={cat}
                        subCategories={this.getSub(cat, subCategories)}
                      />
                    ))
                    .collectArray()}
                </div>
              </div>
            </div>
          )
        }}
      </CategoryConsumer>
    )
  }

  private getSub(cat: Category, subCategories: List<Category>): List<Category> {
    return subCategories
      .stream()
      .filter(c => c.parentId === cat.id)
      .collect(toList)
  }
}
