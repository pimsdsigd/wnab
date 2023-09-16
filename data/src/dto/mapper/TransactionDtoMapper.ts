import {CategoryDtoMapper} from "./CategoryDtoMapper"
import {PeerDtoMapper} from "./PeerDtoMapper"
import {AccountDtoMapper} from "./AccountDtoMapper"
import {DateTimeTimestampMapper, DtoMapper, EnumMapper} from "@damntools.fr/data"
import {Transaction, TransactionDto} from "../Transaction"
import {TransactionStatus} from "../../TransactionStatus"
import {RecurringTransactionStep} from "../../RecurringTransactionStep"
import {TransactionFlagDtoMapper} from "./TransactionFlagDtoMapper"

export class TransactionDtoMapper extends DtoMapper<Transaction, TransactionDto> {
  static INSTANCE: TransactionDtoMapper | null = null

  constructor() {
    super(Transaction)
    this.addMapping({from: "category", mapper: CategoryDtoMapper.get()})
    this.addMapping({from: "account", mapper: AccountDtoMapper.get()})
    this.addMapping({from: "peer", mapper: PeerDtoMapper.get()})
    this.addMapping({from: "flag", mapper: TransactionFlagDtoMapper.get()})
    this.addMapping({from: "date", mapper: DateTimeTimestampMapper.get()})
    this.addMapping({from: "status", mapper: new EnumMapper(TransactionStatus)})
    this.addMapping({from: "repeat", mapper: new EnumMapper(RecurringTransactionStep)})
  }

  static get(): TransactionDtoMapper {
    if (this.INSTANCE === null) {
      this.INSTANCE = new TransactionDtoMapper()
    }
    return this.INSTANCE
  }
}
