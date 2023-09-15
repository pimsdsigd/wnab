import {Peer, PeerDto} from "./Peer"
import {Category, CategoryDto} from "./Category"
import {Account, AccountDto} from "./Account"
import {DateTime} from "luxon"
import {TransactionStatus} from "../TransactionStatus"
import {DTO} from "@damntools.fr/data"
import {RecurringTransactionStep} from "../RecurringTransactionStep"
import {TransactionFlag, TransactionFlagDto} from "./TransactionFlag";

export type TransactionDto = DTO & {
  id?: number
  date: string
  description: string
  cashFlow: number
  status: string
  repeat?: string
  repeated: boolean
  category?: CategoryDto
  categoryId?: number
  peer?: PeerDto
  peerId?: number
  account?: AccountDto
  accountId?: number
  flag?: TransactionFlagDto
  flagId?: number
}

export type TransactionCtor = {
  id?: number
  date: DateTime
  description: string
  cashFlow: number
  status: TransactionStatus
  repeat?: RecurringTransactionStep
  repeated?: boolean
  category?: Category
  categoryId?: number
  peer?: Peer
  peerId?: number
  account?: Account
  accountId?: number
  flag?: TransactionFlag
  flagId?: number
}

export class Transaction {
  id?: number
  date: DateTime
  description: string
  cashFlow: number
  status: TransactionStatus
  repeat?: RecurringTransactionStep
  repeated: boolean
  category?: Category
  categoryId?: number
  peer?: Peer
  peerId?: number
  account?: Account
  accountId?: number
  flag?: TransactionFlag
  flagId?: number

  constructor(ctor: TransactionCtor) {
    this.id = ctor.id
    this.date = ctor.date
    this.description = ctor.description
    this.cashFlow = ctor.cashFlow
    this.status = ctor.status
    this.repeat = ctor.repeat
    this.repeated = !!ctor.repeated
    this.category = ctor.category
    this.peer = ctor.peer
    this.account = ctor.account
    this.categoryId = ctor.categoryId
    this.peerId = ctor.peerId
    this.accountId = ctor.accountId
    this.flag = ctor.flag
    this.flagId = ctor.flagId
  }

  toString(): string {
    return (
      `id=${this.id}, ` +
      `date=${this.date}, ` +
      `account=${this.account?.name}, ` +
      `peer=${this.peer?.name}, ` +
      `description=${this.description}, ` +
      `flag=${this.flag?.toString()}, ` +
      `cashFlow=${this.cashFlow}, ` +
      `status=${this.status.key()}, ` +
      `repeat=${this.repeat?.key()}, ` +
      `repeated=${this.repeated}, ` +
      `parent=${this.category?.parentCategory?.name}, ` +
      `category=${this.category?.name}`
    )
  }
}
