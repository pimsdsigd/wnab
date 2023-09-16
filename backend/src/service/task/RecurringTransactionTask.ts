import { DateTime } from "luxon";
import { Logger, Logging } from "@damntools.fr/logger-simple";
import { TransactionDataService } from "~/service";
import { ArrayList, List, toList } from "@damntools.fr/types";
import { RecurringTransactionStep, Transaction } from "@damntools.fr/wnab-data";

export class RecurringTransactionTask {
  static INSTANCE: RecurringTransactionTask | null = null;
  private firstDayTimeout: NodeJS.Timeout | null;
  private computationInterval: NodeJS.Timeout | null;
  private logger: Logger;
  private transactionService: TransactionDataService;

  constructor() {
    this.firstDayTimeout = null;
    this.computationInterval = null;
    this.logger = Logging.getLogger("RecurringTransactionTask");
    this.transactionService = TransactionDataService.get();
  }

  private getTimeUntilNextDay(): number {
    const now = DateTime.now();
    const nextDay = DateTime.now()
      .set({ hour: 0, minute: 0, second: 0, millisecond: 1 })
      .plus({ day: 1 });
    return nextDay.diff(now, "millisecond").toMillis();
  }

  private compute(): Promise<any> {
    this.logger.info("Computing repeating transactions to create");
    return this.transactionService
      .getAll()
      .then((txs) =>
        txs
          .stream()
          .filter(
            (tx) =>
              !tx.repeated &&
              !!tx.repeat &&
              this.getNextMonth().toMillis() - tx.date.toMillis() > 0,
          )
          .flatMap((tx) => this.processTransaction(tx, true))
          .collect(toList),
      )
      .then((txs) =>
        console.log(
          txs.size(),
          txs
            .stream()
            .map((tx) => tx.date.toISODate())
            .collectArray(),
        ),
      );
    // .then((txs) => this.transactionService.insertAll(txs));
  }

  private getNextMonth() {
    return DateTime.now()
      .set({ hour: 0, minute: 0, second: 0, millisecond: 1, day: 0 })
      .plus({ month: 1 });
  }

  private processTransaction(
    tx: Transaction,
    first?: boolean,
  ): List<Transaction> {
    const nextDate = this.getDurationFromStep(
      tx.repeat as RecurringTransactionStep,
      tx.date,
    );
    const nextMonth = this.getNextMonth();
    const newTx = new Transaction({
      account: tx.account,
      accountId: tx.accountId,
      cashFlow: tx.cashFlow,
      category: tx.category,
      categoryId: tx.categoryId,
      date: nextDate,
      description: tx.description,
      flag: tx.flag,
      peer: tx.peer,
      peerId: tx.peerId,
      repeat: tx.repeat,
      status: tx.status,
    });
    const txs = new ArrayList<Transaction>();
    const nextStr = nextDate.toISODate();
    if (nextMonth.toMillis() - nextDate.toMillis() > 0) {
      txs.push(newTx);
      const propagated = this.processTransaction(newTx);
      propagated.forEach((p) => txs.push(p));
    } else if (first) {
      txs.push(newTx);
    }
    return txs;
  }

  private getDurationFromStep(
    step: RecurringTransactionStep,
    date: DateTime,
  ): DateTime {
    if (RecurringTransactionStep.DAILY.equals(step)) {
      return date.plus({ day: 1 });
    } else if (RecurringTransactionStep.WEEKLY.equals(step)) {
      return date.plus({ week: 1 });
    } else if (RecurringTransactionStep.EVERY_MONDAY.equals(step)) {
      const days = 8 - date.get("weekday");
      return date.plus({ day: days });
    } else if (RecurringTransactionStep.EVERY_SATURDAY.equals(step)) {
      const days = 7 - date.get("weekday");
      return date.plus({ day: days === 0 ? 7 : days });
    } else if (RecurringTransactionStep.MONTHLY.equals(step)) {
      return date.plus({ month: 1 });
    } else if (RecurringTransactionStep.EVERY_FIRST_OF_MONTH.equals(step)) {
      const days = 32 - date.get("day");
      return date.plus({ day: days });
    } else if (RecurringTransactionStep.ONCE_EVERY_TWO_MONTH.equals(step)) {
      return date.plus({ month: 2 });
    } else if (RecurringTransactionStep.ONCE_EVERY_THREE_MONTH.equals(step)) {
      return date.plus({ month: 3 });
    } else if (RecurringTransactionStep.ONCE_EVERY_SIX_MONTH.equals(step)) {
      return date.plus({ month: 6 });
    } else if (RecurringTransactionStep.ANNUALLY.equals(step)) {
      return date.plus({ year: 1 });
    }
    throw Error("Invalid step");
  }

  public init() {
    const timeout = this.getTimeUntilNextDay();
    void this.compute();
    this.logger.info(`Adding ${timeout}ms timeout for next computation `);
    this.firstDayTimeout = setTimeout(() => {
      void this.compute();
      this.logger.info("Adding daily interval for next computation");
      this.computationInterval = setInterval(() => {
        void this.compute();
      }, 86_400_000);
    }, timeout);
  }

  public close() {
    this.logger.info("Removing timeout and interval");
    if (this.computationInterval) clearInterval(this.computationInterval);
    if (this.firstDayTimeout) clearTimeout(this.firstDayTimeout);
  }

  static get(): RecurringTransactionTask {
    if (this.INSTANCE === null) {
      this.INSTANCE = new RecurringTransactionTask();
    }
    return this.INSTANCE;
  }
}
