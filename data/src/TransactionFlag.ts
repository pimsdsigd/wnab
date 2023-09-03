import {StringUtils} from "@damntools.fr/utils-simple"

export type TransactionFlagCtor = {
  color: string
  name: string
}

export class TransactionFlag {
  private static readonly SEPARATOR = ":||:"
  public name: string
  public color: string

  constructor(ctor: TransactionFlagCtor) {
    this.color = ctor.color
    this.name = ctor.name
  }

  toString() {
    return `${this.color}${TransactionFlag.SEPARATOR}${this.name}`
  }

  static fromString(value: string): TransactionFlag | undefined {
    if (!StringUtils.notEmpty(value)) return undefined
    const values = value.split(this.SEPARATOR)
    return new TransactionFlag({color: values[0], name: values[1]})
  }
}
