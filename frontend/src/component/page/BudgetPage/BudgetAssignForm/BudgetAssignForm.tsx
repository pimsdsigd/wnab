import React from "react"
import styles from "./BudgetAssignForm.module.scss"
import {AssignFormParam, BudgetEntry, BudgetViewConsumer, CategoryConsumer, FormType} from "../../../../service"
import {
  DropDownSelector,
  SimpleCalculatorInput,
  ValueDesc,
  VD
} from "@damntools.fr/react-inputs"
import {List, Optionable, Optional, toList} from "@damntools.fr/types"
import {Category} from "@damntools.fr/wnab-data"

export type BudgetAssignFormProps = {}

export class BudgetAssignForm extends React.Component<BudgetAssignFormProps, any> {
  render() {
    return (
      <CategoryConsumer>
        {({subCategories}) => (
          <BudgetViewConsumer>
            {({assignFormParam, assignForm}) => {
              if (assignFormParam.isEmpty()) return null
              const param = assignFormParam.get()
              const categories = this.getCategoriesValues(subCategories)
              const selectedCategory = categories
                .stream()
                .filter(
                  vd => param.budget.budget.categoryId === vd.returnValue.id
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
                          value={Optional.nullable(value).map(VD)}
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
                          <span>Send</span>
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

  private onChangeCategory(v: Optionable<ValueDesc<Category>>) {
    console.log(v)
  }

  private getCategoriesValues(categories: List<Category>) {
    return categories
      .copy()
      .stream()
      .map(p => VD(p).Compare(p.id).Display(p.pretty()).Sort(p.pretty()))
      .collect(toList)
  }

  private onChangeAmount(v: Optionable<number>) {
    console.log(v)
  }

  private onClear(
    assignForm: (budget: BudgetEntry, type: FormType) => void,
    assignFormParam: Optionable<AssignFormParam>
  ) {
    assignFormParam.ifPresentDo(p => {
      assignForm(p.budget, p.type)
    })
  }
}
