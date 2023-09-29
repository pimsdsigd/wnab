import {
  AuthenticatedDataController,
  DataController,
  switch404,
  withBody,
  withURIParam,
} from "@damntools.fr/express-utils";
import {
  Account,
  AccountDto,
  AccountDtoMapper,
  Transaction,
  TransactionDtoMapper,
} from "@damntools.fr/wnab-data";
import {
  AccountDataService,
  AgeOfMoneyService,
  TransactionDataService,
} from "~/service";
import { Request } from "express";
import { DateTime } from "luxon";
import { toList } from "@damntools.fr/types";
import {AuthenticationIdHook} from "~/service/CustomAuthenticationProvider";

export const filterTodayAndBefore =
  (t: DateTime) =>
  (v: Transaction): v is Transaction =>
    v.date.toMillis() < t.toMillis();

export type ReconcileBodyDto = {
  amount: number;
};

export class AccountController extends AuthenticatedDataController<
  number,
  Account,
  AccountDto
> {
  constructor() {
    super("/account", AccountDataService.get(), AccountDtoMapper.get(),
        "userProfileId",
        AuthenticationIdHook, true);
    this.builder = this.builder.authenticated()
  }

  setRoutes() {
    this.get(
      "/balance",
      this.do(() => this.getAllAccountsBalance()),
    );
    this.get(
      "/balance/split",
      this.do(() => this.getAllBalanceByAccount()),
    );
    this.get(
      "/aom",
      this.do(() => this.getAgeOfMoney()),
    );
    this.get(
      "/:id/aom",
      this.do((r) => this.getAccountAgeOfMoney(r)),
    );
    this.get(
      "/:id/balance",
      this.do((r) => this.getAccountBalance(r)),
    );
    this.get(
      "/:id/tx",
      this.do((r) => this.getTransactions(r)),
    );
    this.get(
      "/:id/clear",
      this.do((r) => this.clearAll(r)),
    );
    this.put(
      "/:id/reconcile",
      this.do((r) => this.reconcile(r)),
    );
    super.setRoutes();
  }

  private clearAll(r: Request): Promise<void> {
    return withURIParam(r, "id")
      .then((id) => this.idMapper().mapFrom(id))
      .then((accountId) =>
        this.service<AccountDataService>().clearAll(accountId),
      );
  }

  private reconcile(r: Request): Promise<void> {
    return withURIParam(r, "id")
      .then((id) => this.idMapper().mapFrom(id))
      .then((accountId) =>
        withBody<ReconcileBodyDto>(r).then((body) =>
          this.service<AccountDataService>().reconcile(accountId, body.amount, 1),
        ),
      );
  }

  getAccountBalance(request: Request) {
    return withURIParam(request, "id")
      .then((id) => this.idMapper().mapFrom(id))
      .then((id) => {
        return AccountDataService.get()
          .getById(id)
          .then<Account>(switch404)
          .then((account) =>
            this.service<AccountDataService>().getAccountBalance(
              account.id as number,
            ),
          );
      });
  }

  private getAllAccountsBalance(): Promise<number> {
    const tomorrow = DateTime.now()
      .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
      .plus({ day: 1 });
    return TransactionDataService.get()
      .getAll()
      .then((txs) =>
        txs
          .stream()
          .filter(filterTodayAndBefore(tomorrow))
          .map((tx) => tx.cashFlow)
          .reduce((o, c) => o + c, 0),
      );
  }

  private getAllBalanceByAccount() {
    const tomorrow = DateTime.now()
      .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
      .plus({ day: 1 });
    return TransactionDataService.get()
      .getAll()
      .then((txs) => {
        return txs
          .stream()
          .filter(filterTodayAndBefore(tomorrow))
          .reduce((o: any, t) => {
            if (t.account?.id && o[t.account.id])
              o[t.account.id] = o[t.account.id] + t.cashFlow;
            else if (t.account?.id) o[t.account.id] = t.cashFlow;
            return o;
          }, {});
      });
  }

  private getAccountAgeOfMoney(r: Request) {
    return withURIParam(r, "id").then((id) => {
      const tomorrow = DateTime.now()
        .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
        .plus({ day: 1 });
      return AccountDataService.get()
        .getById(parseInt(id as string))
        .then(switch404)
        .then((account) =>
          TransactionDataService.get()
            .getAll()
            .then((txs) =>
              txs
                .stream()
                .filter(
                  (tx): tx is Transaction => tx.account?.id === account.id,
                )
                .filter(filterTodayAndBefore(tomorrow))
                .collect(toList),
            )
            .then((txs) =>
              AgeOfMoneyService.get().getAgeOfMoneyForTransactions(txs),
            ),
        );
    });
  }

  private getAgeOfMoney() {
    const tomorrow = DateTime.now()
      .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
      .plus({ day: 1 });
    return TransactionDataService.get()
      .getAll()
      .then((txs) =>
        txs.stream().filter(filterTodayAndBefore(tomorrow)).collect(toList),
      )
      .then((txs) => AgeOfMoneyService.get().getAgeOfMoneyForTransactions(txs));
  }

  private getTransactions(r: Request) {
    return this.getById(r)
      .then<AccountDto>(switch404)
      .then((account) =>
        this.service<AccountDataService>().getTransactionsForAccount(
          account.id as number,
        ),
      )
      .then((txs) =>
        txs
          .stream()
          .map((tx) => TransactionDtoMapper.get().mapFrom(tx))
          .collect(toList),
      );
  }
}
