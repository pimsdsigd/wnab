import {DBO} from "@damntools.fr/data"

export interface TransactionFlagDbo extends DBO<number> {
  id: number | undefined
  name: string
  color: string
  hidden: boolean
  userProfileId: number
}
