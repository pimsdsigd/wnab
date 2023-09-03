import {CategoryDtoMapper} from "./CategoryDtoMapper"
import {DateTimeTimestampMapper, DtoMapper} from "@damntools.fr/data"
import {Budget, BudgetDto} from "../Budget"

export class BudgetDtoMapper extends DtoMapper<Budget, BudgetDto> {
  static INSTANCE: BudgetDtoMapper | null = null

  constructor() {
    super(Budget)
    this.addMapping({from: "month", mapper: new DateTimeTimestampMapper()})
    this.addMapping({from: "category", mapper: CategoryDtoMapper.get()})
  }

  static get(): BudgetDtoMapper {
    if (this.INSTANCE === null) {
      this.INSTANCE = new BudgetDtoMapper()
    }
    return this.INSTANCE
  }
}
