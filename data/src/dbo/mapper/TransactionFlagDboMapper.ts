import {DboMapper} from "@damntools.fr/data"
import {TransactionFlag} from "../../dto"
import {TransactionFlagDbo} from "../TransactionFlagDbo"

export class TransactionFlagDboMapper extends DboMapper<
  TransactionFlag,
  number,
  TransactionFlagDbo
> {
  static INSTANCE: TransactionFlagDboMapper | null = null

  constructor() {
    super(TransactionFlag)
  }

  static get(): TransactionFlagDboMapper {
    if (this.INSTANCE === null) {
      this.INSTANCE = new TransactionFlagDboMapper()
    }
    return this.INSTANCE
  }
}
