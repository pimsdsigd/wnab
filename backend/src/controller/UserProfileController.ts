import {
  UserProfile,
  UserProfileDto,
  UserProfileDtoMapper,
} from "@damntools.fr/wnab-data";
import {
  AuthenticatedDataController,
  EnhancedRequest,
  Http400Error,
  Http403Error,
  withBody,
  withBodyParam,
  withURIParam,
} from "@damntools.fr/express-utils";
import { AuthenticationIdHook } from "~/service/CustomAuthenticationProvider";
import { UserProfileDataService } from "~/service/UserProfileDataService";
import { containsProperty } from "@damntools.fr/types";

export class UserProfileController extends AuthenticatedDataController<
  number,
  UserProfile,
  UserProfileDto
> {
  constructor() {
    super(
      "/user",
      UserProfileDataService.get(),
      UserProfileDtoMapper.get(),
      "id",
      AuthenticationIdHook,
      true,
    );
    this.builder = this.builder.authenticated();
  }

  setRoutes() {
    this.get(
      "",
      this.do((r) => this.getAuthenticatedUser(r)),
    );
    this.delete(
      "",
      this.do((r) => this.deleteAuthenticatedUser(r)),
    );
    this.put(
      "",
      this.do((r) => this.updateAuthenticatedUser(r)),
    );
  }

  private getAuthenticatedUser(r: EnhancedRequest): Promise<UserProfileDto> {
    const authenticatedId = AuthenticationIdHook(r.auth);
    return this.service()
      .getById(authenticatedId)
      .then((account) => this.mapper().mapFrom(account));
  }

  private updateAuthenticatedUser(r: EnhancedRequest): Promise<UserProfileDto> {
    const authenticatedId = AuthenticationIdHook(r.auth);
    return withBody<UserProfileDto>(r)
      .then(() => withBodyParam(r, "id"))
      .then(() => withURIParam(r, "id"))
      .then(() => this.mapper().mapTo(r.body))
      .then((body: any) => {
        if (!containsProperty(body as any, "id"))
          throw new Http400Error("Id should be provided");
        if (body["id"] !== authenticatedId)
          throw new Http403Error(
            "userProfileId does not match authenticated user",
          );
        return body;
      })
      .then((data) => this.service().update(data))
      .then((b) => this.mapper().mapFrom(b));
  }

  private deleteAuthenticatedUser(r: EnhancedRequest): Promise<void> {
    const authenticatedId = AuthenticationIdHook(r.auth);
    return this.service().deleteById(authenticatedId);
  }
}
