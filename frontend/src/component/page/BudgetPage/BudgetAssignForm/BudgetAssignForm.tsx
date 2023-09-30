import React from "react"
import styles from "./BudgetAssignForm.module.scss"
import {
  AssignFormParam,
  BudgetEntry,
  BudgetViewConsumer,
  CategoryConsumer,
  FormType
} from "../../../../service"
import {
  DropDownSelector,
  SimpleCalculatorInput,
  ValueDesc,
  VD
} from "@damntools.fr/react-inputs"
import {List, Optionable, Optional, toList} from "@damntools.fr/types"
import {Category} from "@damntools.fr/wnab-data"
import {StringUtils} from "@damntools.fr/utils-simple"

export type BudgetAssignFormProps = {}
export type BudgetAssignFormState = {
  category: Optionable<Category>
  amount: Optionable<number>
}

export class BudgetAssignForm extends React.Component<
  BudgetAssignFormProps,
  BudgetAssignFormState
> {
  constructor(props: Readonly<BudgetAssignFormProps> | BudgetAssignFormProps) {
    super(props)
    this.state = {
      amount: Optional.empty(),
      category: Optional.empty()
    }
  }

  render() {
    return (
      <CategoryConsumer>
        {({subCategories}) => (
          <BudgetViewConsumer>
            {({assignFormParam, assignForm}) => {
              if (assignFormParam.isEmpty()) return null
              const param = assignFormParam.get()
              const categories = this.getCategoriesValues(subCategories)
              const selectedCategory = this.state.category.isPresent()
                ? categories
                    .stream()
                    .log("", e => e.returnValue.name)
                    .filter(
                      vd => vd.returnValue.id === this.state.category.get().id
                    )
                    .collect(toList)
                : categories
                    .stream()
                    .log("", e => e.returnValue.name)
                    .filter(vd =>
                      StringUtils.equalsIgnoreCase(
                        "Ready to assign",
                        vd.returnValue.name
                      )
                    )
                    .collect(toList)
              const value = param.budget.budget[param.type]
              return (
                <div className={styles.BudgetAssignForm}>
                  <div>
                    <div>
                      <div className={styles.AssignFormTitle}>
                        {param.type === "available"
                          ? "Assign available to"
                          : "Assign from"}
                      </div>
                      <div className={styles.AssignFormCategories}>
                        <DropDownSelector
                          maxHeight={"150px"}
                          showSelection
                          showSearch
                          dark
                          onChange={v => this.onChangeCategory(v)}
                          values={categories}
                          multiple={false}
                          showValuesOnFocus
                          dontShowValuesIfSearchEmpty
                          selectedValues={selectedCategory}
                        />
                      </div>
                      <div className={styles.AssignFormAmount}>
                        <SimpleCalculatorInput
                          precision={2}
                          value={this.state.amount
                            .map(VD)
                            .mapEmpty(() => VD(value))}
                          dark
                          rightAlign
                          focus
                          unit={"€"}
                          hideFormat
                          onChange={v => this.onChangeAmount(v)}
                        />
                      </div>
                      <div className={styles.AssignFormButtons}>
                        <div>
                          <span
                            onClick={() =>
                              this.onValidate(assignForm, assignFormParam)
                            }>
                            Send
                          </span>
                          <div></div>
                          <span
                            onClick={() =>
                              this.onClear(assignForm, assignFormParam)
                            }>
                            Clear
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            }}
          </BudgetViewConsumer>
        )}
      </CategoryConsumer>
    )
  }

  private onChangeCategory(value: Optionable<ValueDesc<Category>>) {
    this.setState({category: value.map(v => v.returnValue)})
  }

  private getCategoriesValues(categories: List<Category>) {
    return categories
      .copy()
      .stream()
      .map(p => VD(p).Compare(p.id).Display(p.pretty()).Sort(p.pretty()))
      .collect(toList)
  }

  private onChangeAmount(value: Optionable<number>) {
    this.setState({amount: value})
  }

  private onClear(
    assignForm: (budget: BudgetEntry, type: FormType) => void,
    assignFormParam: Optionable<AssignFormParam>
  ) {
    assignFormParam.ifPresentDo(p => {
      assignForm(p.budget, p.type)
    })
  }

  private onValidate(
    assignForm: (budget: BudgetEntry, type: FormType) => void,
    assignFormParam: Optionable<AssignFormParam>
  ) {
    assignFormParam.ifPresentDo(p => {
      if(p.type === "available"){
      }

      assignForm(p.budget, p.type)
    })
  }
}
