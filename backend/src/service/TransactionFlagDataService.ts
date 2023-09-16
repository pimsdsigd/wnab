import { AbstractDataService } from "./AbstractDataService";
import {
  TransactionFlag,
  TransactionFlagDbo,
  TransactionFlagDboMapper,
} from "@damntools.fr/wnab-data";
import { TransactionFlagRepository } from "~/repository";

export class TransactionFlagDataService extends AbstractDataService<
  TransactionFlag,
  TransactionFlagDbo
> {
  static INSTANCE: TransactionFlagDataService | null = null;

  protected constructor() {
    super(TransactionFlagRepository.get(), TransactionFlagDboMapper.get());
  }

  static get(): TransactionFlagDataService {
    if (this.INSTANCE === null) {
      this.INSTANCE = new TransactionFlagDataService();
    }
    return this.INSTANCE;
  }
}
