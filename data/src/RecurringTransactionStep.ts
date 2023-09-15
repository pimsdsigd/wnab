import {Enum} from "@damntools.fr/types"

export class RecurringTransactionStep extends Enum<string> {
  static DAILY = new RecurringTransactionStep("DAILY", 0)
  static WEEKLY = new RecurringTransactionStep("WEEKLY", 5)
  static EVERY_MONDAY = new RecurringTransactionStep("EVERY_MONDAY", 10)
  static EVERY_SATURDAY = new RecurringTransactionStep("EVERY_SATURDAY", 15)
  static MONTHLY = new RecurringTransactionStep("MONTHLY", 25)
  static EVERY_FIRST_OF_MONTH = new RecurringTransactionStep("EVERY_FIRST_OF_MONTH", 28)
  static ONCE_EVERY_TWO_MONTH = new RecurringTransactionStep("ONCE_EVERY_TWO_MONTH", 30)
  static ONCE_EVERY_THREE_MONTH = new RecurringTransactionStep(
    "ONCE_EVERY_THREE_MONTH",
    35
  )
  static ONCE_EVERY_SIX_MONTH = new RecurringTransactionStep("ONCE_EVERY_SIX_MONTH", 40)
  static ANNUALLY = new RecurringTransactionStep("ANNUALLY", 45)
  private readonly _index: number

  constructor(key: string, index: number) {
    super(key)
    this._index = index
  }

  public index(){
    return this._index
  }

}
