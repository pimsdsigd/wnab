import React, {JSX} from "react"
import styles from "./CategoryEditView.module.scss"
import {
  CheckboxInput,
  DropDownSelector,
  TextInput,
  ValueDesc,
  VD
} from "@damntools.fr/react-inputs"
import {
  ArrayList,
  List,
  Lists,
  Optionable,
  Optional,
  toList
} from "@damntools.fr/types"
import {Category} from "@damntools.fr/wnab-data"
import {
  AlertProvider,
  Notification,
  Popin,
  PopinButton,
  PopinButtonRow
} from "@damntools.fr/react-alert"
import {
  CategoryApiService,
  CategoryConsumer,
  CategoryProvider
} from "../../../../service"

export type CategoryEditViewProps = {
  popinId: string
  onSave?: (category: Category) => Promise<any>
  onUpdate?: (category: Category) => Promise<any>
  category: Optionable<Category>
  parent: Optionable<Category>
}

export type CategoryEditViewState = {
  hidden: Optionable<boolean>
  name: Optionable<string>
  parent: Optionable<Category>
}

export const openCategoryViewPopup = (
  category?: Category,
  parent?: Category
) => {
  AlertProvider.submitPopin(
    Popin.title(category ? "Category configuration" : "Category creation")
      .DisableActions()
      .Content(id => (
        <CategoryEditView
          popinId={id}
          category={Optional.nullable(category)}
          parent={Optional.nullable(parent)}
        />
      ))
  )
}

export class CategoryEditView extends React.Component<
  CategoryEditViewProps,
  CategoryEditViewState
> {
  constructor(props: CategoryEditViewProps) {
    super(props)
    if (this.props.category.isPresent()) {
      const category = this.props.category.get()
      this.state = {
        hidden: Optional.of(category.hidden),
        name: Optional.of(category.name),
        parent: this.props.parent
      }
    } else {
      this.state = {
        hidden: Optional.of(false),
        name: Optional.empty(),
        parent: this.props.parent
      }
    }
  }

  render() {
    return (
      <CategoryConsumer>
        {({parentCategories}) => {
          const parentValues = this.getParentValues(parentCategories)
          const selectedValue = this.getSelectedParent(parentValues)
          return (
            <div className={styles.Form}>
              <div className={styles.Rows}>
                {this.props.parent.isPresent()
                  ? this.getRow(
                      "Parent",
                      <DropDownSelector
                        maxHeight={"100px"}
                        showSelection
                        showSearch
                        dark
                        onChange={v => this.onChangeParent(v)}
                        values={parentValues}
                        multiple={false}
                        showValuesOnFocus
                        dontShowValuesIfSearchEmpty
                        selectedValues={selectedValue
                          .map(v => new ArrayList([v]))
                          .orElseReturn(new ArrayList<ValueDesc<Category>>())}
                      />
                    )
                  : null}
                {this.getRow(
                  "Name",
                  <TextInput
                    dark={true}
                    onChange={v => this.onChangeName(v)}
                    hideFormat={true}
                    value={this.state.name.map(VD)}
                  />
                )}
                {this.getRow(
                  "Hidden",
                  <div>
                    <CheckboxInput
                      size={"25px"}
                      dark={true}
                      onChange={v => this.onChangeHidden(v)}
                      checked={this.state.hidden.orElseReturn(false)}
                    />
                  </div>
                )}
              </div>
              <div className={styles.Buttons}>
                <PopinButtonRow
                  buttons={Lists.of(
                    <PopinButton
                      key={this.props.popinId + "ok"}
                      popinId={this.props.popinId}
                      action={{
                        callback: () => this.onSuccess(),
                        type: "success",
                        title: "Save"
                      }}
                      theme={"dark"}
                    />,
                    <PopinButton
                      key={this.props.popinId + "cancel"}
                      popinId={this.props.popinId}
                      action={{
                        callback: () => this.onCancel(),
                        type: "cancel",
                        title: "Cancel"
                      }}
                      theme={"dark"}
                    />
                  )}
                />
              </div>
            </div>
          )
        }}
      </CategoryConsumer>
    )
  }

  private getRow(label: string, input: JSX.Element): JSX.Element {
    return (
      <div className={styles.FormRow}>
        <div className={styles.RowLabel}>
          <span>{label}</span>
        </div>
        <div className={styles.RowInput}>{input}</div>
      </div>
    )
  }

  private onSuccess() {
    let errored = false
    if (this.state.name.isEmpty()) {
      AlertProvider.submitNotification(
        Notification.error("Validation issue").Subtitle("Name should be set")
      )
      errored = true
    }
    if (this.props.parent.isPresent() && this.state.parent.isEmpty()) {
      AlertProvider.submitNotification(
        Notification.error("Validation issue").Subtitle(
          "Parent should be set for a sub category"
        )
      )
      errored = true
    }
    if (!errored) {
      const category = new Category({
        hidden: this.state.hidden.orElseReturn(false),
        name: this.state.name.get(),
        parentCategory: this.state.parent.orElseUndefined()
      })
      if (this.props.category.isPresent()) {
        category.id = this.props.category.get().id
        void CategoryApiService.get()
          .update(category)
          .then(() => CategoryProvider.refresh())
          .catch(err => {
            console.error(err)
            AlertProvider.submitNotification(
              Notification.error("Could not update category !").Subtitle(
                err?.response?.data?.reason || ""
              )
            )
          })
          .then(() => AlertProvider.removeAlert(this.props.popinId))
      } else {
        void CategoryApiService.get()
          .create(category)
          .then(() => CategoryProvider.refresh())
          .catch(err => {
            console.error("err", err)
            AlertProvider.submitNotification(
              Notification.error("Could not create category !").Subtitle(
                err?.response?.data?.reason || ""
              )
            )
          })
          .then(() => AlertProvider.removeAlert(this.props.popinId))
      }
    }
  }

  private onCancel() {
    AlertProvider.removeAlert(this.props.popinId)
  }

  private onChangeName(value: Optionable<string>) {
    this.setState({name: value.map(s => s.toLowerCase())})
  }

  private onChangeHidden(value: Optionable<boolean>) {
    this.setState({hidden: value})
  }

  private onChangeParent(value: Optionable<ValueDesc<Category>>) {
    this.setState({parent: value.map(v => v.returnValue)})
  }

  private getParentValues(
    categories: List<Category>
  ): List<ValueDesc<Category>> {
    return categories
      .copy()
      .stream()
      .map(p => VD(p).Compare(p.id).Display(p.pretty()).Sort(p.pretty()))
      .collect(toList)
  }

  private getSelectedParent(
    parentValues: List<ValueDesc<Category>>
  ): Optionable<ValueDesc<Category>> {
    return parentValues
      .stream()
      .findOptional(v =>
        this.props.parent.filter(p => p.id === v.returnValue.id).isPresent()
      )
  }
}
