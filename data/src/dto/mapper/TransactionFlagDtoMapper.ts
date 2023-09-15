import {DtoMapper} from "@damntools.fr/data"
import {TransactionFlag, TransactionFlagDto} from "../TransactionFlag"

export class TransactionFlagDtoMapper extends DtoMapper<
  TransactionFlag,
  TransactionFlagDto
> {
  static INSTANCE: TransactionFlagDtoMapper | null = null

  constructor() {
    super(TransactionFlag)
  }

  static get(): TransactionFlagDtoMapper {
    if (this.INSTANCE === null) {
      this.INSTANCE = new TransactionFlagDtoMapper()
    }
    return this.INSTANCE
  }
}
