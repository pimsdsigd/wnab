import {DTO} from "@damntools.fr/data"
import {DateTime} from "luxon"
import {Category, CategoryDto} from "./Category"

export type BudgetDto = DTO & {
  id?: number
  month: string
  budgeted: number
  activity: number
  available: number
  category?: CategoryDto
  userProfileId: number
}

export interface BudgetCtor {
  id?: number
  month: DateTime
  budgeted: number
  activity: number
  available: number
  category?: Category
  categoryId?: number
  userProfileId: number
}

export class Budget {
  id?: number
  month: DateTime
  budgeted: number
  activity: number
  available: number
  category?: Category
  categoryId?: number
  userProfileId: number

  constructor(ctor: BudgetCtor) {
    this.id = ctor.id
    this.month = ctor.month
    this.budgeted = ctor.budgeted
    this.activity = ctor.activity
    this.available = ctor.available
    this.category = ctor.category
    this.categoryId = ctor.categoryId
    this.userProfileId = ctor.userProfileId
  }
  toString(): string {
    return (
      `id=${this.id} ,` +
      `month=${this.month} ,` +
      `budgeted=${this.budgeted} ,` +
      `activity=${this.activity} ,` +
      `available=${this.available} ,` +
      `parent=${this.category?.parentCategory?.name}` +
      `category=${this.category?.name}`
    )
  }
}
