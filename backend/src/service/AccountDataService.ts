import { AbstractDataService } from "./AbstractDataService";
import { AccountRepository } from "~/repository";
import {
  Account,
  AccountDbo,
  AccountDboMapper,
  Transaction,
  TransactionStatus,
} from "@damntools.fr/wnab-data";
import { List, toList } from "@damntools.fr/types";
import { TransactionDataService } from "~/service/TransactionDataService";
import { filterTodayAndBefore } from "~/controller";
import { DateTime } from "luxon";
import { PeerDataService } from "~/service/PeerDataService";
import { CategoryDataService } from "~/service/CategoryDataService";

export class AccountDataService extends AbstractDataService<
  Account,
  AccountDbo
> {
  static INSTANCE: AccountDataService | null = null;

  protected constructor() {
    super(AccountRepository.get(), AccountDboMapper.get());
  }

  clearAll(accountId: number): Promise<void> {
    return this.getTransactionsForAccount(accountId)
      .then((txs) =>
        txs
          .stream()
          .filter((tx) => TransactionStatus.UNCLEARED.equals(tx.status))
          .peek((tx) => (tx.status = TransactionStatus.CLEARED))
          .collect(toList),
      )
      .then((txs) => TransactionDataService.get().updateAll(txs))
      .then(() => {});
  }

  reconcileAllTransactions(accountId: number): Promise<void> {
    return this.getTransactionsForAccount(accountId)
      .then((txs) =>
        txs
          .stream()
          .filter((tx) => TransactionStatus.CLEARED.equals(tx.status))
          .peek((tx) => (tx.status = TransactionStatus.RECONCILED))
          .collect(toList),
      )
      .then((txs) => TransactionDataService.get().updateAll(txs))
      .then(() => {});
  }

  reconcile(accountId: number, amount: number, userProfileId: number): Promise<void> {
    return this.clearAll(accountId)
      .then(() => this.getAccountBalance(accountId))
      .then((balance) => amount - balance)
      .then((balance) => parseFloat(balance.toFixed(2)))
      .then((diff) => {
        return PeerDataService.get()
          .getReconciliationPeer()
          .then((peer) =>
            CategoryDataService.get()
              .getReconciliationCategory()
              .then((cat) =>
                AccountDataService.get()
                  .getById(accountId)
                  .then((acc) => {
                    return new Transaction({
                      userProfileId,
                      account: acc,
                      cashFlow: diff,
                      category: cat,
                      date: DateTime.now(),
                      description: "Entered automatically by WNAB?",
                      peer: peer,
                      status: TransactionStatus.CLEARED,
                    });
                  }),
              ),
          );
      })
      .then((tx) => TransactionDataService.get().insert(tx))
      .then(() => this.reconcileAllTransactions(accountId))
      .then(() => {});
  }

  getTransactionsForAccount(accountId: number): Promise<List<Transaction>> {
    return TransactionDataService.get()
      .getAll()
      .then((txs) =>
        txs
          .stream()
          .filter((tx): tx is Transaction => tx.account?.id === accountId)
          .collect(toList),
      );
  }

  getAccountBalance(accountId: number): Promise<number> {
    const tomorrow = DateTime.now()
      .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
      .plus({ day: 1 });
    return TransactionDataService.get()
      .getAll()
      .then((txs) =>
        txs
          .stream()
          .filter(
            (tx): tx is Transaction =>
              tx.account?.id === accountId &&
              filterTodayAndBefore(tomorrow)(tx),
          )
          .map((tx) => tx.cashFlow)
          .reduce((o, c) => o + c, 0),
      )
      .then((balance) => parseFloat(balance.toFixed(2)));
  }

  static get(): AccountDataService {
    if (this.INSTANCE === null) {
      this.INSTANCE = new AccountDataService();
    }
    return this.INSTANCE;
  }
}
