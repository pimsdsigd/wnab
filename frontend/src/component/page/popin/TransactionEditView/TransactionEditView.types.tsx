import {Optionable} from "@damntools.fr/types"
import {DateTime} from "luxon"
import {
  Account,
  Category,
  Peer,
  Transaction,
  TransactionFlag,
  TransactionStatus
} from "@damntools.fr/wnab-data"

export type TransactionEditViewProps = {
  popinId: string
  onSave?: (tx: Transaction) => Promise<any>
  onUpdate?: (tx: Transaction) => Promise<any>
  tx: Optionable<Transaction>
  account: Optionable<Account>
}
export type TransactionEditViewState = {
  date: Optionable<DateTime>
  description: Optionable<string>
  flag: Optionable<TransactionFlag>
  cashFlow: Optionable<number>
  status: Optionable<TransactionStatus>
  category: Optionable<Category>
  peer: Optionable<Peer>
  account: Optionable<Account>
}
