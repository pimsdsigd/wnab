import {DTO} from "@damntools.fr/data"
import {PeerType} from "../PeerType"
import {Category, CategoryDto} from "./Category"

export type PeerDto = DTO & {
  id?: number
  name: string
  type: string
  hidden: boolean
  category?: CategoryDto
}

export interface PeerCtor {
  id?: number
  name: string
  type: PeerType
  hidden: boolean
  category?: Category
  categoryId?: number
}

export class Peer {
  id?: number
  name: string
  type: PeerType
  hidden: boolean
  category?: Category
  categoryId?: number

  constructor(ctor: PeerCtor) {
    this.id = ctor.id
    this.name = ctor.name
    this.type = ctor.type
    this.hidden = ctor.hidden
    this.category = ctor.category
    this.categoryId = ctor.categoryId
  }

  toString(): string {
    return (
      `id=${this.id} ,` +
      `name=${this.name} ,` +
      `type=${this.type.key()} ,` +
      `hidden=${this.hidden} ,` +
      `parent=${this.category?.parentCategory?.name}` +
      `category=${this.category?.name}`
    )
  }
}
