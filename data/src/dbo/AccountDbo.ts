import {DBO} from "@damntools.fr/data";
import {AccountType} from "../AccountType";

export interface AccountDbo extends DBO<number> {
  id: number | undefined
  name: string
  type: AccountType
  closed: boolean
  userProfileId: number
}
