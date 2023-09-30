import React from "react"
import {
  ArrayList,
  List,
  Optionable,
  Optional,
  toList
} from "@damntools.fr/types"
import {Budget, Category, Transaction} from "@damntools.fr/wnab-data"

export type BudgetSelection = {
  categoryId: number
  selected: boolean
}

export type BudgetEntry = {
  transactions: List<Transaction>
  pendingTransactions: List<Transaction>
  currentTransactions: List<Transaction>
  budget: Budget
  month: string
  lastMonth?: BudgetEntry
  selected?: boolean
}

export type AssignFormParam = {
  budget: BudgetEntry
  type: FormType
}

export type BudgetViewProviderState = {
  isCategorySelected: (categoryId: number) => boolean
  selectedCategories: List<BudgetSelection>
  assignForm: (budget: BudgetEntry, type: FormType) => void
  assignFormParam: Optionable<AssignFormParam>
  select: (category: Category, categories: List<Category>) => void
}

export type FormType = "available" | "activity"

export const BudgetViewContext = React.createContext(
  {} as BudgetViewProviderState
)

export const BudgetViewConsumer = BudgetViewContext.Consumer

export class BudgetViewProvider extends React.Component<
  any,
  BudgetViewProviderState
> {
  state: BudgetViewProviderState = {
    selectedCategories: new ArrayList(),
    assignFormParam: Optional.empty(),
    isCategorySelected: (categoryId: number) =>
      this.isCategorySelected(categoryId),
    select: (category: Category, categories: List<Category>) =>
      this.select(category, categories),
    assignForm: (budget: BudgetEntry, type: FormType) =>
      this.assignForm(budget, type)
  }

  private assignForm(budget: BudgetEntry, type: FormType) {
    console.log(type, budget)
    if (this.state.assignFormParam.isEmpty()) {
      this.setState({assignFormParam: Optional.of({budget, type})})
    } else {
      const get = this.state.assignFormParam.get()
      if (
        get.type === type &&
        get.budget.budget.categoryId === budget.budget.categoryId
      ) {
        this.setState({assignFormParam: Optional.empty()})
      } else this.setState({assignFormParam: Optional.of({budget, type})})
    }
  }

  isCategorySelected(categoryId: number) {
    return this.state.selectedCategories
      .stream()
      .some(s => s.categoryId === categoryId && s.selected)
  }

  select(category: Category, categories: List<Category>) {
    const selected = this.state.selectedCategories.copy()
    const list = new ArrayList<Category>([category])
    if (!category.parentId) {
      list.concat(
        categories
          .stream()
          .filter(c => c.parentId === category.id)
          .collect(toList)
      )
    }
    list.forEach(c => {
      const index = selected.stream().findIndex(e => e.categoryId === c.id)
      if (index > -1) {
        const found = selected.get(index) as BudgetSelection
        found.selected = !found.selected
      } else {
        selected.push({
          categoryId: c.id as number,
          selected: true
        })
      }
    })
    this.setState({selectedCategories: selected})
  }

  render() {
    return (
      <BudgetViewContext.Provider value={this.state}>
        {this.props.children}
      </BudgetViewContext.Provider>
    )
  }
}
