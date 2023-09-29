import {
  Budget,
  BudgetDto,
  BudgetDtoMapper,
  Category,
} from "@damntools.fr/wnab-data";
import { BudgetDataService, CategoryDataService } from "~/service";
import {
  AuthenticatedDataController,
  EnhancedRequest,
  Http400Error,
  withURIParam,
} from "@damntools.fr/express-utils";
import { DateTime } from "luxon";
import { toList } from "@damntools.fr/types";
import { AuthenticationIdHook } from "~/service/CustomAuthenticationProvider";

export class BudgetController extends AuthenticatedDataController<
  number,
  Budget,
  BudgetDto
> {
  constructor() {
    super(
      "/budget",
      BudgetDataService.get(),
      BudgetDtoMapper.get(),
      "userProfileId",
      AuthenticationIdHook,
      true,
    );
    this.builder = this.builder.authenticated();
  }

  setRoutes() {
    this.post(
      "/month/:month",
      this.do((r) => this.createBudgetForMonth(r)),
    );
    this.post(
      "/month/:month/category/:category",
      this.do((r) => this.createBudgetForMonthAndCategory(r)),
    );
    super.setRoutes();
  }

  private createBudgetForMonth(r: EnhancedRequest) {
    const userId = AuthenticationIdHook(r.auth);
    return withURIParam(r, "month")
      .then((month) => DateTime.fromFormat(month, "yyyyMM"))
      .then((date) => {
        return this.findBudgetsForMonth(date, userId)
          .then((budgets) => {
            if (budgets.hasElements())
              throw new Http400Error("Budget for month already exists");
            else {
              return CategoryDataService.get().getAllSubCategories();
            }
          })
          .then((categories) =>
            categories
              .stream()
              .map((c) =>
                this.generateBudgetForCategoryAndMonth(c, date, userId),
              )
              .collect(toList),
          );
      })
      .then((budgets) => this.service().insertAll(budgets));
  }

  private createBudgetForMonthAndCategory(r: EnhancedRequest) {
    const userId = AuthenticationIdHook(r.auth);
    return withURIParam(r, "month")
      .then((month) => DateTime.fromFormat(month, "yyyyMM"))
      .then((date) => {
        return withURIParam(r, "category")
          .then((c) => CategoryDataService.get().getById(parseInt(c)))
          .then((category) => {
            return this.findBudgetsForMonthAndCategory(
              date,
              category,
              userId,
            ).then((budgets) => {
              if (budgets.hasElements())
                throw new Http400Error(
                  "Budget for month and category already exists",
                );
              else {
                return this.generateBudgetForCategoryAndMonth(
                  category,
                  date,
                  userId,
                );
              }
            });
          });
      })
      .then((budget) => this.service().insert(budget));
  }

  private findBudgetsForMonth(month: DateTime, userId: number) {
    const rangeStart = month.toMillis();
    const rangeEnd = month.plus({ month: 1 }).toMillis();
    return this.service()
      .getAll()
      .then((budgets) =>
        budgets
          .stream()
          .filter((b) => {
            return (
              b.month.toMillis() >= rangeStart &&
              b.month.toMillis() < rangeEnd &&
              b.userProfileId === userId
            );
          })
          .collect(toList),
      );
  }

  private findBudgetsForMonthAndCategory(
    month: DateTime,
    category: Category,
    userId: number,
  ) {
    const rangeStart = month.toMillis();
    const rangeEnd = month.plus({ month: 1 }).toMillis();
    return this.service()
      .getAll()
      .then((budgets) =>
        budgets
          .stream()
          .filter((b) => {
            return (
              b.month.toMillis() >= rangeStart &&
              b.month.toMillis() < rangeEnd &&
              b.categoryId === category.id &&
              b.userProfileId === userId
            );
          })
          .collect(toList),
      );
  }

  private generateBudgetForCategoryAndMonth(
    category: Category,
    month: DateTime,
    userId: number,
  ) {
    return new Budget({
      userProfileId: userId,
      activity: 0,
      available: 0,
      budgeted: 0,
      category,
      month,
    });
  }
}
