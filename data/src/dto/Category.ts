import {DTO} from "@damntools.fr/data"

export type CategoryDto = DTO & {
  id?: number
  name: string
  hidden: boolean
  parentCategory?: CategoryDto
  userProfileId: number
}

export interface CategoryCtor {
  id?: number
  name: string
  hidden: boolean
  parentCategory?: Category
  parentId?: Category
  userProfileId: number
}

export class Category {
  id?: number
  name: string
  hidden: boolean
  parentCategory?: Category
  parentId?: Category
  userProfileId: number

  constructor(ctor: CategoryCtor) {
    this.id = ctor.id
    this.name = ctor.name
    this.hidden = ctor.hidden
    this.parentCategory = ctor.parentCategory
    this.parentId = ctor.parentId
    this.userProfileId = ctor.userProfileId
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
