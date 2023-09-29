import {ArrayList, List, toList} from "@damntools.fr/types"
import {Category, CategoryDto, CategoryDtoMapper} from "@damntools.fr/wnab-data"
import {AxiosService} from "./AxiosService"
import {AxiosWrapper} from "@damntools.fr/http"

export class CategoryApiService {
  static INSTANCE: CategoryApiService | null = null
  private readonly axios: AxiosWrapper

  constructor() {
    this.axios = AxiosService.getAuthenticatedInstance().child({
      baseURL: "/category"
    })
  }

  getAll(): Promise<List<Category>> {
    return this.axios
      .get("")
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
    return this.axios.post("", CategoryDtoMapper.get().mapFrom(category))
  }

  update(category: Category) {
    if (!category.id) return Promise.reject("Category should contains id ! ")
    return this.axios.put(
      `/${category.id}`,
      CategoryDtoMapper.get().mapFrom(category)
    )
  }

  delete(flags: List<number>) {
    return this.axios.delete(`?ids=${flags.stream().join(",")}`).then(() => {})
  }

  static get(): CategoryApiService {
    if (this.INSTANCE === null) {
      this.INSTANCE = new CategoryApiService()
    }
    return this.INSTANCE
  }
}
