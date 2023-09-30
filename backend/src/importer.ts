import {consoleTransport, Logging, LogLevel, nativeConsoleInterceptor,} from "@damntools.fr/logger-simple";
import {SqliteDb} from "@damntools.fr/sqlite";
import * as process from "process";
import * as path from "path";
import * as fs from "fs";
import {Collectors, defined, List} from "@damntools.fr/types";
import {DateTime} from "luxon";
import {StringUtils} from "@damntools.fr/utils-simple";
import {
    Account,
    AccountType,
    Budget,
    Category,
    Peer,
    PeerType,
    Transaction,
    TransactionStatus,
} from "@damntools.fr/wnab-data";
import {
    AccountDataService,
    BudgetDataService,
    CategoryDataService,
    PeerDataService,
    TransactionDataService,
} from "~/service";


export type LoadedTx = {
  cashFlow: number;
  category: {
    parent: string;
    sub: string;
  };
  status: string;
  date: DateTime;
  description: string;
  flag: string;
  peer: string;
  account: string;
};

export type LoadedBudget = {
  category: {
    parent: string;
    sub: string;
  };
  month: DateTime;
  budgeted: number;
  activity: number;
  available: number;
};

Logging.configure({
  transports: [consoleTransport()],
  nativeConsoleInterceptor,
  level: LogLevel.DEBUG,
});

const USER_PROFILE_ID = 1;

const TRANSACTION_FILE_PATH =
  process.env["TRANSACTION_FILE_PATH"] || path.join(".", "export.tx.csv");
const BUDGET_FILE_PATH =
  process.env["BUDGET_FILE_PATH"] || path.join(".", "export.budget.csv");

const loadTxFile = () => {
  if (fs.existsSync(TRANSACTION_FILE_PATH)) {
    const file = fs.readFileSync(TRANSACTION_FILE_PATH, { encoding: "utf-8" });
    return loadCsv(file)
      .stream()
      .map(loadCsvTransaction)
      .collect(Collectors.toList);
  } else
    throw Error(
      `Transaction export file not found at ${TRANSACTION_FILE_PATH}`,
    );
};

const loadBudgetFile = () => {
  if (fs.existsSync(BUDGET_FILE_PATH)) {
    const file = fs.readFileSync(BUDGET_FILE_PATH, { encoding: "utf-8" });
    return loadCsv(file).stream().map(loadCsvBudget).collect(Collectors.toList);
  } else
    throw Error(`Transaction export file not found at ${BUDGET_FILE_PATH}`);
};

const loadCsvValue = (value: string) => {
  if (value.startsWith('"')) return value.replace(/"/g, "");
  if (value.includes("$") || value.includes("€") || value.includes("£"))
    return parseFloat(value.replace(/[$€\s]/g, ""));
  return value;
};

const loadCsv = (file: string) => {
  return file
    .split(/\r?\n+/)
    .map((l) => l.split(","))
    .map((l) => l.map(loadCsvValue).toList())
    .toList()
    .sub(1);
};

const loadCsvTransaction = (values: List<string | number>): LoadedTx => {
  const outflow = values.get(8) as number;
  const inflow = values.get(9) as number;
  const categories = (values.get(4) as string).split(/:\s+/);
  return {
    account: values.get(0) as string,
    cashFlow: inflow - outflow,
    category: {
      parent: categories[0],
      sub: categories[1],
    },
    status: values.get(10) as string,
    date: DateTime.fromFormat(values.get(2) as string, "dd.MM.yyyy"),
    description: values.get(7) as string,
    flag: values.get(1) as string,
    peer: values.get(3) as string,
  };
};

const loadCsvBudget = (values: List<string | number>): LoadedBudget => {
  const categories = (values.get(1) as string).split(/:\s+/);
  return {
    activity: values.get(6) as number,
    available: values.get(5) as number,
    budgeted: values.get(4) as number,
    category: {
      parent: categories[0],
      sub: categories[1],
    },
    month: DateTime.fromFormat(values.get(0) as string, "LLL yyyy"),
  };
};

function getParentCategories<T>(txFile: List<LoadedTx>) {
  return txFile
    .stream()
    .map((tx) => tx.category.parent)
    .filter(StringUtils.notEmpty)
    .unique()
    .sort()
    .map(
      (p) =>
        new Category({
          hidden: false,
          name: p,
          userProfileId: USER_PROFILE_ID,
        }),
    )
    .collect(Collectors.toList);
}

function getSubCategories<T>(txFile: List<LoadedTx>) {
  return txFile
    .stream()
    .map((tx) => tx.category)
    .filter(
      (tx) => StringUtils.notEmpty(tx.sub) && StringUtils.notEmpty(tx.parent),
    )
    .map(
      (p) =>
        new Category({
          hidden: false,
          name: p.sub,
          parentCategory: new Category({
            name: p.parent,
            hidden: false,
            userProfileId: USER_PROFILE_ID,
          }),
          userProfileId: USER_PROFILE_ID,
        }),
    )
    .unique((a, b) => a.name.localeCompare(b.name) === 0)
    .sort()
    .collect(Collectors.toList);
}

function getPeers<T>(txFile: List<LoadedTx>): List<Peer> {
  return txFile
    .stream()
    .map((tx) => tx.peer)
    .filter(StringUtils.notEmpty)
    .unique()
    .sort()
    .map(
      (p) =>
        new Peer({
          hidden: false,
          name: p,
          type: PeerType.ENTITY,
          userProfileId: USER_PROFILE_ID,
        }),
    )
    .collect(Collectors.toList);
}

function getAccounts<T>(txFile: List<LoadedTx>) {
  return txFile
    .stream()
    .map((tx) => tx.account)
    .filter(StringUtils.notEmpty)
    .unique()
    .sort()
    .map(
      (p) =>
        new Account({
          closed: false,
          name: p,
          type: AccountType.DAILY_USAGE,
          userProfileId: USER_PROFILE_ID,
        }),
    )
    .collect(Collectors.toList);
}

const completeSubCategories = (
  categories: List<Category>,
  parentCategories: List<Category>,
): List<Category> => {
  return categories
    .stream()
    .peek((c) => {
      if (defined(c.parentCategory?.name)) {
        c.parentCategory = parentCategories
          .stream()
          .find((p) => p.name === c.parentCategory?.name);
      }
    })
    .collect(Collectors.toList);
};

const completeTransactions = (
  txFile: List<LoadedTx>,
  subDbos: List<Category>,
  peerDbos: List<Peer>,
  accountDbos: List<Account>,
): List<Transaction> => {
  return txFile
    .stream()
    .map((c) => {
      const tx = new Transaction({
        cashFlow: c.cashFlow,
        status: TransactionStatus.fromYnabValue(c.status),
        date: c.date,
        description: c.description,
        flag: undefined,
        userProfileId: USER_PROFILE_ID,
      });
      if (defined(c.category)) {
        tx.category = subDbos.stream().find((p) => p.name === c.category.sub);
      }
      if (defined(c.peer)) {
        tx.peer = peerDbos.stream().find((p) => p.name === c.peer);
      }
      if (defined(c.account)) {
        tx.account = accountDbos.stream().find((p) => p.name === c.account);
      }
      return tx;
    })
    .collect(Collectors.toList);
};

function completeBudgetWithCategories(
  budgetFile: List<LoadedBudget>,
  categories: List<Category>,
) {
  return budgetFile
    .stream()
    .map((b) => {
      const data = new Budget({
        activity: b.activity,
        available: b.available,
        budgeted: b.budgeted,
        month: b.month,
        userProfileId: USER_PROFILE_ID,
      });
      if (b.category && b.category.parent && b.category.sub) {
        data.category = categories
          .stream()
          .find((c) => c.name === b.category.sub);
        if (!data.category) debugger;
      }
      return data;
    })
    .collect(Collectors.toList);
}

SqliteDb.init()
  .then((db) => {
    const txFile = loadTxFile();
    const parentCategories = getParentCategories(txFile);
    const subCategories = getSubCategories(txFile);
    const peers = getPeers(txFile);
    const accounts = getAccounts(txFile);
    return AccountDataService.get()
      .insertAll(accounts)
      .then(() => AccountDataService.get().getAll())
      .then((accountDbos) => {
        return PeerDataService.get()
          .insertAll(peers)
          .then(() => PeerDataService.get().getAll())
          .then((peerDbos) => {
            return CategoryDataService.get()
              .insertAll(parentCategories)
              .then(() => CategoryDataService.get().getAll())
              .then((parentDbos) => {
                const sub = completeSubCategories(subCategories, parentDbos);
                return CategoryDataService.get()
                  .insertBatch(sub)
                  .then(() => CategoryDataService.get().getAllSubCategories())
                  .then((subDbos) => {
                    const txs = completeTransactions(
                      txFile,
                      subDbos,
                      peerDbos,
                      accountDbos,
                    );
                    return TransactionDataService.get()
                      .insertBatch(txs)
                      .then(() => TransactionDataService.get().getAll());
                  });
              });
          });
      });
  })
  .then(() => CategoryDataService.get().getAll())
  .then((categories) => {
    const budgetFile = loadBudgetFile();
    const budgets = completeBudgetWithCategories(budgetFile, categories);
    return BudgetDataService.get().insertBatch(budgets);
  })
  .then(() => {
    return SqliteDb.get().closeDb();
  })
  .catch((err) => {
    console.error(err);
    return SqliteDb.get().closeDb();
  });
