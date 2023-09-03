import {DTO} from "@damntools.fr/data"

export type CategoryDto = DTO & {
  id?: number
  name: string
  hidden: boolean
  parentCategory?: CategoryDto
}

export interface CategoryCtor {
  id?: number
  name: string
  hidden: boolean
  parentCategory?: Category
  parentId?: Category
}

export class Category {
  id?: number
  name: string
  hidden: boolean
  parentCategory?: Category
  parentId?: Category

  constructor(ctor: CategoryCtor) {
    this.id = ctor.id
    this.name = ctor.name
    this.hidden = ctor.hidden
    this.parentCategory = ctor.parentCategory
    this.parentId = ctor.parentId
  }

  toString(): string {
    return (
      `id=${this.id} ,` +
      `name=${this.name} ,` +
      `hidden=${this.hidden} ,` +
      `parentCategory=${this.parentCategory?.toString()}`
    )
  }

  pretty(): string {
    return this.parentCategory
      ? `${this.parentCategory.pretty()}: ${this.name}`
      : this.name
  }
}
