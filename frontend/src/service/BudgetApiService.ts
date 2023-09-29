import {ArrayList, List, toList} from "@damntools.fr/types"
import {Budget, BudgetDto, BudgetDtoMapper, Category} from "@damntools.fr/wnab-data"
import {AxiosWrapper} from "@damntools.fr/http"
import {AxiosService} from "./AxiosService"
import {DateTime} from "luxon";

export class BudgetApiService {
  static INSTANCE: BudgetApiService | null = null
  private readonly axios: AxiosWrapper

  constructor() {
    this.axios = AxiosService.getAuthenticatedInstance().child({
      baseURL: "/budget"
    })
  }

  getBudgets(): Promise<List<Budget>> {
    return this.axios
      .get("")
      .then(res => new ArrayList<BudgetDto>(res.data))
      .then(res =>
        res
          .stream()
          .map(a => BudgetDtoMapper.get().mapTo(a))
          .collect(toList)
      )
  }

  createBudgetForMonth(month: DateTime) {
    return this.axios
        .post(`/month/${month.toFormat("yyyyMM")}`)
        .then(() => true)
  }

  createBudgetForMonthAndCategory(month: DateTime, category: Category) {
    return this.axios
        .post(`/month/${month.toFormat("yyyyMM")}/category/${category.id}`)
        .then(() => true)
  }

  create(budget: Budget) {
    if (budget.id) return Promise.reject("Budget should not contains id ! ")
    return this.axios
      .post("", BudgetDtoMapper.get().mapFrom(budget))
      .then(res => res.data as BudgetDto)
      .then(res => BudgetDtoMapper.get().mapTo(res))
  }

  update(budget: Budget) {
    if (!budget.id) return Promise.reject("Budget should contains id ! ")
    return this.axios.put(
      `/${budget.id}`,
      BudgetDtoMapper.get().mapFrom(budget)
    )
  }

  delete(flags: List<number>) {
    return this.axios.delete(`?ids=${flags.stream().join(",")}`).then(() => {})
  }

  static get(): BudgetApiService {
    if (this.INSTANCE === null) {
      this.INSTANCE = new BudgetApiService()
    }
    return this.INSTANCE
  }
}
