import { DBO } from "@damntools.fr/data";
import { DateTime } from "luxon";
import {TransactionFlag} from "../TransactionFlag";
import {TransactionStatus} from "../TransactionStatus";

export interface TransactionDbo extends DBO<number> {
  id: number | undefined;
  date: DateTime;
  description: string;
  flag?: TransactionFlag;
  cashFlow: number;
  status: TransactionStatus;
  categoryId?: number;
  peerId?: number;
  accountId?: number;
}
