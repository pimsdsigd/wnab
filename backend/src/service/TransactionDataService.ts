import { AbstractDataService } from "./AbstractDataService";
import {
  Collectors,
  defined,
  List,
  toList,
  UniqueList,
} from "@damntools.fr/types";
import { PeerDataService } from "./PeerDataService";
import { CategoryDataService } from "./CategoryDataService";
import { AccountDataService } from "./AccountDataService";
import {
  Account,
  Category,
  Peer,
  Transaction,
  TransactionDbo,
  TransactionDboMapper, TransactionFlag,
  TransactionStatus,
} from "@damntools.fr/wnab-data";
import { TransactionRepository } from "~/repository";
import { Caches, KvCache } from "@damntools.fr/cached";
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
  private readonly cache: KvCache<number, Transaction>;
  private containsAll: boolean;

  protected constructor() {
    super(TransactionRepository.get(), TransactionDboMapper.get());
    this.peerService = PeerDataService.get();
    this.categoryService = CategoryDataService.get();
    this.accountService = AccountDataService.get();
    this.transactionFlagService = TransactionFlagDataService.get();
    this.cache = Caches.get();
    this.containsAll = false;
  }

  getAll(limit?: number): Promise<List<Transaction>> {
    if (this.containsAll) {
      this.logger.debug("Extracting all from cache");
      return Promise.resolve(
        this.cache.values().sub(0, limit || Number.MAX_VALUE),
      );
    }
    return this.repository
      .getAll(limit)
      .then((transactions) => this.completeTransactions(transactions));
  }

  getById(id: number): Promise<Transaction> {
    if (this.cache.hasKey(id)) return Promise.resolve(this.cache.get(id));
    return this.repository
      .getById(id)
      .then((tx) => this.mapper.mapTo(tx))
      .then((tx) => this.completeTransaction(tx));
  }

  protected completeTransaction(data: Transaction) {
    const promises = [];
    promises.push(
      defined(data.peerId)
        ? this.peerService.getById(data.peerId as number)
        : Promise.resolve(),
    );
    promises.push(
      defined(data.categoryId)
        ? this.categoryService.getById(data.categoryId as number)
        : Promise.resolve(),
    );
    promises.push(
      defined(data.accountId)
        ? this.accountService.getById(data.accountId as number)
        : Promise.resolve(),
    );
    promises.push(
      defined(data.flagId)
        ? this.transactionFlagService.getById(data.flagId as number)
        : Promise.resolve(),
    );
    return Promise.allSettled(promises).then((res) => {
      if (res[0].status === "fulfilled") data.peer = res[0].value as Peer;
      if (res[1].status === "fulfilled")
        data.category = res[1].value as Category;
      if (res[2].status === "fulfilled") data.account = res[2].value as Account;
      if (res[3].status === "fulfilled") data.flag = res[3].value as TransactionFlag;
      return data;
    });
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
              this.cache.put(data.id as number, data);
              this.containsAll = true;
              return data;
            })
            .collect(Collectors.toList),
        ),
      ),
      ),
    );
  }

  insert(data: Transaction): Promise<Transaction> {
    return super.insert(data).then((d) => {
      this.cache.put(data.id as number, data);
      return data;
    });
  }

  insertAll(data: List<Transaction>): Promise<List<number>> {
    return super.insertAll(data).then((d) => {
      this.containsAll = false;
      this.cache.clear();
      return d;
    });
  }

  insertBatch(data: List<Transaction>): Promise<void> {
    return super.insertBatch(data).then((d) => {
      this.containsAll = false;
      this.cache.clear();
      return d;
    });
  }

  update(data: Transaction): Promise<Transaction> {
    return super.update(data).then((data) => {
      this.cache.put(data.id as number, data);
      return data;
    });
  }

  updateAll(data: List<Transaction>): Promise<List<Transaction>> {
    return super.updateAll(data).then((up) => {
      data.forEach((d) => this.cache.put(d.id as number, d));
      return data;
    });
  }

  updateBatch(data: List<Transaction>): Promise<List<Transaction>> {
    return super.updateBatch(data).then((data) => {
      data.forEach((d) => this.cache.put(d.id as number, d));
      return data;
    });
  }

  deleteByIds(ids: List<number>): Promise<void> {
    return super.deleteByIds(ids).then(() => {
      ids.forEach((id) => this.cache.remove(id));
    });
  }

  deleteById(id: number): Promise<void> {
    return super.deleteById(id).then(() => {
      this.cache.remove(id);
    });
  }

  getByIds(ids: List<number>): Promise<List<Transaction>> {
    if (this.containsAll) {
      return Promise.resolve(
        this.cache
          .keys()
          .stream()
          .filter((k) => ids.includes(k))
          .map((k) => this.cache.get(k))
          .collect(toList),
      );
    }
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
