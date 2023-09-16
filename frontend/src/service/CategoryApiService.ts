import {ArrayList, List, toList} from "@damntools.fr/types"
import {Category, CategoryDto, CategoryDtoMapper} from "@damntools.fr/wnab-data"
import axios from "axios"

export class CategoryApiService {
  static INSTANCE: CategoryApiService | null = null

  getAll(): Promise<List<Category>> {
    return axios
      .get("http://localhost:8000/api/category")
      .then(res => new ArrayList<CategoryDto>(res.data))
      .then(res =>
        res
          .stream()
          .map(a => CategoryDtoMapper.get().mapTo(a))
          .collect(toList)
      )
  }

  create(category: Category) {
    if (category.id) return Promise.reject("Category should not contains id ! ")
    return axios.post(
      "http://localhost:8000/api/category",
      CategoryDtoMapper.get().mapFrom(category)
    )
  }

  update(category: Category) {
    if (!category.id) return Promise.reject("Category should contains id ! ")
    return axios.put(
      `http://localhost:8000/api/category/${category.id}`,
      CategoryDtoMapper.get().mapFrom(category)
    )
  }

  delete(flags: List<number>) {
    return axios
      .delete(
        `http://localhost:8000/api/category?ids=${flags.stream().join(",")}`
      )
      .then(() => {})
  }

  static get(): CategoryApiService {
    if (this.INSTANCE === null) {
      this.INSTANCE = new CategoryApiService()
    }
    return this.INSTANCE
  }
}
