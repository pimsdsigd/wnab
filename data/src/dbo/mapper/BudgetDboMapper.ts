import {DboMapper, DboRelationMapper} from "@damntools.fr/data"
import {BudgetDbo} from "../BudgetDbo"
import {Budget} from "../../dto"

export class BudgetDboMapper extends DboMapper<Budget, number, BudgetDbo> {
  static INSTANCE: BudgetDboMapper | null = null

  constructor() {
    super(Budget)
    this.addMapping({from: "category", to: "categoryId", mapper: new DboRelationMapper()})
    this.addMapping({from: "categoryId", ignore: true})
  }

  static get(): BudgetDboMapper {
    if (this.INSTANCE === null) {
      this.INSTANCE = new BudgetDboMapper()
    }
    return this.INSTANCE
  }
}
