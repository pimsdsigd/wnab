import React from "react"
import {List, Lists, Optionable, toList} from "@damntools.fr/types"
import {Category} from "@damntools.fr/wnab-data"
import {CategoryApiService} from "../CategoryApiService"

export type CategoryProviderState = {
  categories: List<Category>
  parentCategories: List<Category>
  subCategories: List<Category>
  getCategoryByName: (name: string) => Optionable<Category>
  refresh: () => void
}

export const CategoryContext = React.createContext({} as CategoryProviderState)

export const CategoryConsumer = CategoryContext.Consumer

export class CategoryProvider extends React.Component<
  any,
  CategoryProviderState
> {
  private static INSTANCE: CategoryProvider | null = null

  state: CategoryProviderState = {
    getCategoryByName: this.getCategoryByName.bind(this),
    categories: Lists.empty(),
    subCategories: Lists.empty(),
    parentCategories: Lists.empty(),
    refresh: () => {
      void this.prepareData()
    }
  }

  constructor(props: any) {
    super(props)
    CategoryProvider.INSTANCE = this
  }

  static refresh() {
    if (this.INSTANCE) this.INSTANCE.state.refresh()
  }

  componentDidMount() {
    void this.prepareData()
  }

  prepareData() {
    return CategoryApiService.get()
      .getAll()
      .then(
        categories =>
          new Promise<List<Category>>(resolve => {
            const sub = categories
              .stream()
              .filter(c => !!c.parentCategory)
              .collect(toList)
            const parent = categories
              .stream()
              .filter(c => !c.parentCategory)
              .collect(toList)
            this.setState(
              {
                categories: categories,
                parentCategories: parent,
                subCategories: sub
              },
              () => resolve(categories)
            )
          })
      )
  }

  render() {
    return (
      <CategoryContext.Provider value={this.state}>
        {this.props.children}
      </CategoryContext.Provider>
    )
  }

  private getCategoryByName(name: string): Optionable<Category> {
    return this.state.categories.stream().findOptional(a => a.name === name)
  }
}
