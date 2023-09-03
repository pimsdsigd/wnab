import {Enum} from "@damntools.fr/types";

export class AccountType extends Enum<string> {
  static DAILY_USAGE = new AccountType("daily")
  static CASH = new AccountType("cash")
  static SAVINGS = new AccountType("savings")
  static INVESTMENT = new AccountType("investment")
}
