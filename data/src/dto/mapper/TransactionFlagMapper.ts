import {DataMapper} from "@damntools.fr/data"
import {TransactionFlag} from "../../TransactionFlag"

export class TransactionFlagMapper implements DataMapper<TransactionFlag, string> {
  static INSTANCE: TransactionFlagMapper | null = null

  mapFrom(data: TransactionFlag): string {
    return data.toString()
  }

  mapTo(data: string): TransactionFlag {
    return TransactionFlag.fromString(data) as TransactionFlag
  }

  static get(): TransactionFlagMapper {
    if (this.INSTANCE === null) {
      this.INSTANCE = new TransactionFlagMapper()
    }
    return this.INSTANCE
  }
}
