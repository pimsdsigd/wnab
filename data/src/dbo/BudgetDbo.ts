import {DBO} from "@damntools.fr/data"
import {DateTime} from "luxon"

export interface BudgetDbo extends DBO<number> {
  id: number | undefined
  month: DateTime
  budgeted: number
  activity: number
  available: number
  categoryId?: number
  userProfileId: number
}
