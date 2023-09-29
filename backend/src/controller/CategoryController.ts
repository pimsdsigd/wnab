import {
  Category,
  CategoryDto,
  CategoryDtoMapper,
} from "@damntools.fr/wnab-data";
import { CategoryDataService } from "~/service";
import {
  AuthenticatedDataController,
  Authentication,
  EnhancedRequest,
} from "@damntools.fr/express-utils";
import { Collectors, List } from "@damntools.fr/types";
import { AuthenticationIdHook } from "~/service/CustomAuthenticationProvider";

export class CategoryController extends AuthenticatedDataController<
  number,
  Category,
  CategoryDto
> {
  constructor() {
    super(
      "/category",
      CategoryDataService.get(),
      CategoryDtoMapper.get(),
      "userProfileId",
      AuthenticationIdHook,
      true,
    );
    this.builder = this.builder.authenticated();
  }

  setRoutes() {
    this.get(
      "/parent",
      this.do((request) => this.getAllParentCategories(request)),
    );
    this.get(
      "/sub",
      this.do((request) => this.getAllSubCategories(request)),
    );
    super.setRoutes();
  }

  private getAllParentCategories(
    request: EnhancedRequest,
  ): Promise<List<CategoryDto>> {
    return this.service<CategoryDataService>()
      .getAllParentCategories()
      .then((categories) =>
        categories
          .stream()
          .filter(
            (c) =>
              c.userProfileId ===
              AuthenticationIdHook(request.auth as Authentication<any>),
          )
          .map((c) => this.mapper().mapFrom(c))
          .collect(Collectors.toList),
      );
  }

  private getAllSubCategories(
    request: EnhancedRequest,
  ): Promise<List<CategoryDto>> {
    return this.service<CategoryDataService>()
      .getAllSubCategories()
      .then((categories) =>
        categories
          .stream()
          .filter(
            (c) =>
              c.userProfileId ===
              AuthenticationIdHook(request.auth as Authentication<any>),
          )
          .map((c) => this.mapper().mapFrom(c))
          .collect(Collectors.toList),
      );
  }
}
