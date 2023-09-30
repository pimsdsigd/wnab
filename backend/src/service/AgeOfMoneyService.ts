import {KV, List, Lists} from "@damntools.fr/types";
import { Transaction } from "@damntools.fr/wnab-data";
import { DateTime } from "luxon";

const compareTxDate = (a: Transaction, b: Transaction): number =>
  a.date.toMillis() - b.date.toMillis();

const compareTxPeer = (a: Transaction, b: Transaction): number => {
  if (a.peer && b.peer) return a.peer.name.localeCompare(b.peer.name);
  if (a.peer) return 1;
  if (b.peer) return -1;
  return 0;
};

const compareTxFlow = (a: Transaction, b: Transaction) =>
  a.cashFlow - b.cashFlow;

export class AgeOfMoneyService {
  static INSTANCE: AgeOfMoneyService | null = null;

  static get(): AgeOfMoneyService {
    if (this.INSTANCE === null) {
      this.INSTANCE = new AgeOfMoneyService();
    }
    return this.INSTANCE;
  }

  getAgeOfMoneyForTransactions(txs: List<Transaction>) {
    const sorted = txs.stream().sort(compareTxDate);
    const first = sorted.findFirst().get();
    const last = sorted.findLast().get();
    let current: DateTime = first.date;
    const days = KV.empty<string, number>();
    while (current.toMillis() <= last.date.toMillis()) {
      days.put(current.toFormat("yyyyMMdd"), 0);
      current = current.plus({ day: 1 });
    }
    sorted
      // .filter((v) => !v.status.equals(TransactionStatus.UNCLEARED))
      .peek((c) => {
        const date = c.date.toFormat("yyyyMMdd");
        days.put(date, days.get(date) + c.cashFlow);
      });
    const age = days
      .keys()
      .stream()
      .reduce((o: number, c: string, i: number, a: Array<string>) => {
        const inflowStartIndex = Math.max(0, i - o - 2);
        const inflowEndIndex = Math.max(1, i);
        if (i > 0) {
          const subArray = Lists.from(a).sub(inflowStartIndex, inflowEndIndex);
          const sub = subArray
            .stream()
            .reduce((oo, cc) => oo + days.get(cc), 0);
          const currentDay = days.get(c);
          return sub + currentDay > 0 ? o + 1 : 0;
        }
        return days.get(c) > 0 ? o + 1 : o;
      }, 0);
    return age;
  }
}
