import { AbstractDataService } from "./AbstractDataService";
import { Collectors, defined, List, notDefined } from "@damntools.fr/types";
import {
  Category,
  CategoryDbo,
  CategoryDboMapper,
} from "@damntools.fr/wnab-data";
import { CategoryRepository } from "~/repository";

export class CategoryDataService extends AbstractDataService<
  Category,
  CategoryDbo
> {
  static INSTANCE: CategoryDataService | null = null;

  constructor() {
    super(CategoryRepository.get(), CategoryDboMapper.get());
  }

  static get(): CategoryDataService {
    if (this.INSTANCE === null) {
      this.INSTANCE = new CategoryDataService();
    }
    return this.INSTANCE;
  }

  getReconciliationCategory(): Promise<Category> {
    return this.getAll().then((cat) =>
      cat
        .stream()
        .filter((cat) => cat.pretty() === "Inflow: Ready to Assign")
        .findFirst()
        .get(),
    );
  }

  getById(id: number): Promise<Category> {
    return this.repository.getById(id).then((dbo) => {
      const data = this.mapper.mapTo(dbo);
      if (defined(dbo.parentId))
        return this.getById(dbo.parentId as number).then((parent) => {
          data.parentCategory = parent;
          return data;
        });
      return data;
    });
  }

  getAll(): Promise<List<Category>> {
    return this.repository.getAll().then((all) => {
      return all
        .stream()
        .map((a) => {
          const data = this.mapper.mapTo(a);
          if (defined(a.parentId)) {
            data.parentCategory = all
              .stream()
              .filter((c): c is CategoryDbo => c.id === a.parentId)
              .map((p) => this.mapper.mapTo(p))
              .findFirst()
              .get();
          }
          return data;
        })
        .collect(Collectors.toList);
    });
  }

  getAllSubCategories() {
    return this.getAll().then((categories) =>
      categories
        .stream()
        .filter((c): c is Category => defined(c.parentCategory))
        .collect(Collectors.toList),
    );
  }

  getAllParentCategories() {
    return this.getAll().then((categories) =>
      categories
        .stream()
        .filter((c): c is Category => notDefined(c.parentCategory))
        .collect(Collectors.toList),
    );
  }
}
