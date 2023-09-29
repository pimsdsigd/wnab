import {DTO} from "@damntools.fr/data"

export type TransactionFlagDto = DTO & {
  id?: number
  name: string
  color: string
  hidden: boolean
  userProfileId: number
}

export interface TransactionFlagCtor {
  id?: number
  name: string
  color: string
  hidden: boolean
  userProfileId: number
}

export class TransactionFlag {
  id?: number
  name: string
  color: string
  hidden: boolean
  userProfileId: number

  constructor(ctor: TransactionFlagCtor) {
    this.id = ctor.id
    this.name = ctor.name
    this.color = ctor.color
    this.hidden = ctor.hidden
    this.userProfileId = ctor.userProfileId
  }

  toString(): string {
    return (
      `id=${this.id} ,` +
      `name=${this.name} ,` +
      `color=${this.color} ,` +
      `hidden=${this.hidden}`
    )
  }
}
