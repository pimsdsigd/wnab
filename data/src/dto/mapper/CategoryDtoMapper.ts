import {DtoMapper} from "@damntools.fr/data"
import {Category, CategoryDto} from "../Category"

export class CategoryDtoMapper extends DtoMapper<Category, CategoryDto> {
  private static readonly INSTANCE: CategoryDtoMapper = new CategoryDtoMapper()

  constructor() {
    super(Category)
    this.addMapping({from: "parentCategory", mapper: this})
  }

  static get(): CategoryDtoMapper {
    return this.INSTANCE
  }
}
