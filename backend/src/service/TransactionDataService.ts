import { AbstractDataService } from "./AbstractDataService";
import {
  Collectors,
  List, Lists,
  toList,
} from "@damntools.fr/types";
import { PeerDataService } from "./PeerDataService";
import { CategoryDataService } from "./CategoryDataService";
import { AccountDataService } from "./AccountDataService";
import {
  Transaction,
  TransactionDbo,
  TransactionDboMapper,
  TransactionStatus,
} from "@damntools.fr/wnab-data";
import { TransactionRepository } from "~/repository";
import {TransactionFlagDataService} from "./TransactionFlagDataService";

export class TransactionDataService extends AbstractDataService<
  Transaction,
  TransactionDbo
> {
  static INSTANCE: TransactionDataService | null = null;
  private readonly peerService: PeerDataService;
  private readonly categoryService: CategoryDataService;
  private readonly accountService: AccountDataService;
  private readonly transactionFlagService: TransactionFlagDataService;

  protected constructor() {
    super(TransactionRepository.get(), TransactionDboMapper.get());
    this.peerService = PeerDataService.get();
    this.categoryService = CategoryDataService.get();
    this.accountService = AccountDataService.get();
    this.transactionFlagService = TransactionFlagDataService.get();
  }

  getAll(limit?: number): Promise<List<Transaction>> {
    return this.repository
      .getAll(limit)
      .then((transactions) => this.completeTransactions(transactions));
  }

  getById(id: number): Promise<Transaction> {
    return this.repository
      .getById(id)
      .then((tx) => this.completeTransactions(Lists.of(tx)))
      .then((list) => list.get(0) as Transaction);
  }

  protected completeTransactions(transactions: List<TransactionDbo>) {
    return this.peerService.getAll().then((peers) =>
      this.categoryService.getAll().then((categories) =>
      this.transactionFlagService.getAll().then((flags) =>
        this.accountService.getAll().then((accounts) =>
          transactions
            .stream()
            .map((tx) => {
              const data = this.mapper.mapTo(tx);
              if (tx.peerId)
                data.peer = peers.stream().find((p) => p.id === tx.peerId);
              if (tx.categoryId)
                data.category = categories
                  .stream()
                  .find((p) => p.id === tx.categoryId);
              if (tx.accountId)
                data.account = accounts
                  .stream()
                  .find((p) => p.id === tx.accountId);
              if (tx.flagId)
                data.flag = flags
                  .stream()
                  .find((p) => p.id === tx.flagId);
              return data;
            })
            .collect(Collectors.toList),
        ),
      ),
      ),
    );
  }

  insert(data: Transaction): Promise<Transaction> {
    return super.insert(data)
  }

  insertAll(data: List<Transaction>): Promise<List<number>> {
    return super.insertAll(data)
  }

  insertBatch(data: List<Transaction>): Promise<void> {
    return super.insertBatch(data)
  }

  update(data: Transaction): Promise<Transaction> {
    return super.update(data)
  }

  updateAll(data: List<Transaction>): Promise<List<Transaction>> {
    return super.updateAll(data)
  }

  updateBatch(data: List<Transaction>): Promise<List<Transaction>> {
    return super.updateBatch(data)
  }

  deleteByIds(ids: List<number>): Promise<void> {
    return super.deleteByIds(ids)
  }

  deleteById(id: number): Promise<void> {
    return super.deleteById(id)
  }

  getByIds(ids: List<number>): Promise<List<Transaction>> {
    return this.repository
      .getByIds(ids)
      .then((transactions) => this.completeTransactions(transactions));
  }

  clearTransactions(ids: List<number>) {
    return this.getByIds(ids)
      .then((txs) =>
        txs
          .stream()
          .filter((tx) => TransactionStatus.UNCLEARED.equals(tx.status))
          .peek((tx) => (tx.status = TransactionStatus.CLEARED))
          .collect(toList),
      )
      .then((txs) => this.updateAll(txs));
  }

  static get(): TransactionDataService {
    if (this.INSTANCE === null) {
      this.INSTANCE = new TransactionDataService();
    }
    return this.INSTANCE;
  }
}
