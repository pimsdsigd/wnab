import { DBO } from "@damntools.fr/data";
import { DateTime } from "luxon";
import {TransactionStatus} from "../TransactionStatus";
import {RecurringTransactionStep} from "../RecurringTransactionStep";

export interface TransactionDbo extends DBO<number> {
  id: number | undefined;
  date: DateTime;
  description: string;
  cashFlow: number;
  status: TransactionStatus;
  repeat?: RecurringTransactionStep;
  repeated?: boolean;
  categoryId?: number;
  peerId?: number;
  accountId?: number;
  flagId?: number;
  userProfileId: number
}
