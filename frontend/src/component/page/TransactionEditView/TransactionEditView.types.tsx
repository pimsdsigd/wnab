import {Optionable} from "@damntools.fr/types"
import {DateTime} from "luxon"
import {TransactionFlag, TransactionStatus} from "@damntools.fr/wnab-data"

export type TransactionEditViewState = {
  date: Optionable<DateTime>
  description: Optionable<string>
  flag: Optionable<TransactionFlag>
  cashFlow: Optionable<number>
  status: Optionable<TransactionStatus>
  categoryId: Optionable<number>
  peerId: Optionable<number>
  accountId: Optionable<number>
}