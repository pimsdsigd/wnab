import {DTO} from "@damntools.fr/data"
import {AccountType} from "../AccountType"

export type AccountDto = DTO & {
  id?: number
  name: string
  type: string
  closed: boolean
  balance?: number
}

export interface AccountCtor {
  id?: number
  name: string
  type: AccountType
  closed: boolean
  balance?: number
}

export class Account {
  id?: number
  name: string
  type: AccountType
  closed: boolean

  constructor(ctor: AccountCtor) {
    this.id = ctor.id
    this.name = ctor.name
    this.type = ctor.type
    this.closed = ctor.closed
  }

  toString(): string {
    return (
      `id=${this.id} ,` +
      `name=${this.name} ,` +
      `type=${this.type.key()} ,` +
      `closed=${this.closed} ,`
    )
  }
}
