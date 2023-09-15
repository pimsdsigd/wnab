import {DboMapper, DboRelationMapper} from "@damntools.fr/data"
import {TransactionDbo} from "../TransactionDbo"
import {Transaction} from "../../dto"

export class TransactionDboMapper extends DboMapper<Transaction, number, TransactionDbo> {
  static INSTANCE: TransactionDboMapper | null = null

  constructor() {
    super(Transaction)
    this.addMapping({from: "category", to: "categoryId", mapper: new DboRelationMapper()})
    this.addMapping({from: "categoryId", ignore: true})
    this.addMapping({from: "peer", to: "peerId", mapper: new DboRelationMapper()})
    this.addMapping({from: "peerId", ignore: true})
    this.addMapping({from: "account", to: "accountId", mapper: new DboRelationMapper()})
    this.addMapping({from: "accountId", ignore: true})
    this.addMapping({from: "flag", to: "flagId", mapper: new DboRelationMapper()})
    this.addMapping({from: "flagId", ignore: true})
  }

  static get(): TransactionDboMapper {
    if (this.INSTANCE === null) {
      this.INSTANCE = new TransactionDboMapper()
    }
    return this.INSTANCE
  }
}
