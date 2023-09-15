import {
  Category,
  CategoryDto,
  CategoryDtoMapper,
} from "@damntools.fr/wnab-data";
import { CategoryDataService } from "~/service";
import { DataController } from "@damntools.fr/express-utils";
import { Collectors, List } from "@damntools.fr/types";

export class CategoryController extends DataController<
  number,
  Category,
  CategoryDto
> {
  constructor() {
    super(
      "/transaction",
      CategoryDataService.get(),
      CategoryDtoMapper.get(),
      true,
    );
  }

  setRoutes() {
    super.setRoutes();
  }

  private getAllParentCategories(): Promise<List<CategoryDto>> {
    return this.service<CategoryDataService>()
      .getAllParentCategories()
      .then((categories) =>
        categories
          .stream()
          .map((c) => this.mapper().mapFrom(c))
          .collect(Collectors.toList),
      );
  }

  private getAllSubCategories(): Promise<List<CategoryDto>> {
    return this.service<CategoryDataService>()
      .getAllSubCategories()
      .then((categories) =>
        categories
          .stream()
          .map((c) => this.mapper().mapFrom(c))
          .collect(Collectors.toList),
      );
  }
}
