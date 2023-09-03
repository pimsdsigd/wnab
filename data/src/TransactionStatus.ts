import {Enum, notDefined} from "@damntools.fr/types"

export class TransactionStatus extends Enum<string> {
  static UNCLEARED = new TransactionStatus("uncleared", "Uncleared")
  static CLEARED = new TransactionStatus("cleared", "Cleared")
  static RECONCILED = new TransactionStatus("reconciled", "Reconciled")
  private readonly ynabKey: string

  private constructor(key: string, ynabKey: string) {
    super(key)
    this.ynabKey = ynabKey
  }

  ynab(): string {
    return this.ynabKey
  }

  static fromYnabValue(value: string): TransactionStatus {
    if (notDefined(value)) throw new Error(`Invalid key ${value}`)
    return this.all<TransactionStatus>()
      .stream()
      .findOrThrow(
        e => e.ynab() === value,
        () => new Error(`Invalid key ${value}`)
      )
  }
}
