import {Peer, PeerDto} from "./Peer"
import {Category, CategoryDto} from "./Category"
import {Account, AccountDto} from "./Account"
import {DateTime} from "luxon"
import {TransactionStatus} from "../TransactionStatus";
import {TransactionFlag} from "../TransactionFlag"
import { DTO } from "@damntools.fr/data";

export type TransactionDto = DTO &  {
  id?: number
  date: string
  description: string
  flag?: string
  cashFlow: number
  status: string
  category?: CategoryDto
  categoryId?: number
  peer?: PeerDto
  peerId?: number
  account?: AccountDto
  accountId?: number
}

export type TransactionCtor = {
  id?: number
  date: DateTime
  description: string
  flag?: TransactionFlag
  cashFlow: number
  status: TransactionStatus
  category?: Category
  categoryId?: number
  peer?: Peer
  peerId?: number
  account?: Account
  accountId?: number
}

export class Transaction{
  id?: number
  date: DateTime
  description: string
  flag?: TransactionFlag
  cashFlow: number
  status: TransactionStatus
  category?: Category
  categoryId?: number
  peer?: Peer
  peerId?: number
  account?: Account
  accountId?: number

  constructor(ctor: TransactionCtor) {
    this.id = ctor.id
    this.date = ctor.date
    this.description = ctor.description
    this.flag = ctor.flag
    this.cashFlow = ctor.cashFlow
    this.status = ctor.status
    this.category = ctor.category
    this.peer = ctor.peer
    this.account = ctor.account
    this.categoryId = ctor.categoryId
    this.peerId = ctor.peerId
    this.accountId = ctor.accountId
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
      `status=${this.status.key}, ` +
      `parent=${this.category?.parentCategory?.name}, ` +
      `category=${this.category?.name}`
    )
  }
}
