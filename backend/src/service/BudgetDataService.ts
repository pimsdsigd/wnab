import { AbstractDataService } from "./AbstractDataService";
import { Collectors, defined, List } from "@damntools.fr/types";
import { CategoryDataService } from "./CategoryDataService";
import {
  Budget,
  BudgetDbo,
  BudgetDboMapper,
  Category,
} from "@damntools.fr/wnab-data";
import { BudgetRepository } from "~/repository";

export class BudgetDataService extends AbstractDataService<Budget, BudgetDbo> {
  static INSTANCE: BudgetDataService | null = null;
  private readonly categoryService: CategoryDataService;

  constructor() {
    super(BudgetRepository.get(), BudgetDboMapper.get());
    this.categoryService = CategoryDataService.get();
  }

  static get(): BudgetDataService {
    if (this.INSTANCE === null) {
      this.INSTANCE = new BudgetDataService();
    }
    return this.INSTANCE;
  }

  getById(id: number): Promise<Budget> {
    return this.repository.getById(id).then((dbo) => {
      const data = this.mapper.mapTo(dbo);
      if (defined(dbo.categoryId))
        return this.categoryService
          .getById(dbo.categoryId as number)
          .then((parent) => {
            data.category = parent;
            return data;
          });
      return data;
    });
  }

  getAll(): Promise<List<Budget>> {
    return this.categoryService.getAll().then((categories) => {
      return this.repository.getAll().then((all) => {
        return all
          .stream()
          .map((a) => {
            const data = this.mapper.mapTo(a);
            if (defined(a.categoryId)) {
              data.category = categories
                .stream()
                .filter((c): c is Category => c.id === a.categoryId)
                .findFirst()
                .get();
            }
            return data;
          })
          .collect(Collectors.toList);
      });
    });
  }
}
