import {DTO} from "@damntools.fr/data"
import {AccountType} from "../AccountType"

export type AccountDto = DTO & {
  id?: number
  name: string
  type: string
  closed: boolean
  balance?: number
  userProfileId: number
}

export interface AccountCtor {
  id?: number
  name: string
  type: AccountType
  closed: boolean
  balance?: number
  userProfileId: number
}

export class Account {
  id?: number
  name: string
  type: AccountType
  closed: boolean
  userProfileId: number

  constructor(ctor: AccountCtor) {
    this.id = ctor.id
    this.name = ctor.name
    this.type = ctor.type
    this.closed = ctor.closed
    this.userProfileId = ctor.userProfileId
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
