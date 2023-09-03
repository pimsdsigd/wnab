import {CategoryDbo} from "../CategoryDbo"
import {DboMapper, DboRelationMapper} from "@damntools.fr/data"
import {Category} from "../../dto"

export class CategoryDboMapper extends DboMapper<Category, number, CategoryDbo> {
  static INSTANCE: CategoryDboMapper | null = null

  constructor() {
    super(Category)
    this.addMapping({
      from: "parentCategory",
      to: "parentId",
      mapper: new DboRelationMapper()
    })
    this.addMapping({from: "parentId", ignore: true})
  }

  static get(): CategoryDboMapper {
    if (this.INSTANCE === null) {
      this.INSTANCE = new CategoryDboMapper()
    }
    return this.INSTANCE
  }
}
