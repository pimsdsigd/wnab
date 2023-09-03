import { SimpleDataAccessor } from "@damntools.fr/sqlite";
import { CategoryDbo } from "@damntools.fr/wnab-data";
import { BooleanNumberMapper } from "@damntools.fr/data";

export class CategoryRepository extends SimpleDataAccessor<
  number,
  CategoryDbo
> {
  static INSTANCE: CategoryRepository | null = null;

  constructor() {
    super("category");
    this.addMapping({ from: "hidden", mapper: new BooleanNumberMapper() });
  }

  static get(): CategoryRepository {
    if (this.INSTANCE === null) {
      this.INSTANCE = new CategoryRepository();
    }
    return this.INSTANCE;
  }
}
