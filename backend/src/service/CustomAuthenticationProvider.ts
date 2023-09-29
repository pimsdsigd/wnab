import {
  AuthenticatedAuthentication,
  Authentication,
  AuthenticationProvider,
  AuthenticationRole,
  JWTAuthentication,
} from "@damntools.fr/express-utils";
import { containsProperty, List } from "@damntools.fr/types";

export class DbAuthentication implements Authentication<number> {
  credentials: number;
  identifier: string;
  roles: List<AuthenticationRole>;

  constructor(
    identifier: string,
    credentials: number,
    roles: List<AuthenticationRole>,
  ) {
    this.credentials = credentials;
    this.identifier = identifier;
    this.roles = roles;
  }
}

export class CustomAuthenticationProvider
  implements AuthenticationProvider<any, any>
{
  provide(authentication: Authentication<any>): Promise<Authentication<any>> {
    let userId: number = 0;
    if (
      authentication instanceof JWTAuthentication &&
      containsProperty(authentication.credentials, "id")
    ) {
      // @ts-ignore
      userId = authentication.credentials.id;
    }
    if (userId > 0) {
      return Promise.resolve(
        new DbAuthentication(
          authentication.identifier,
          userId,
          authentication.roles,
        ),
      );
    }
    return Promise.resolve(authentication);
  }
}

export const AuthenticationIdHook = (auth?: Authentication<any>): number => {
  if (auth instanceof AuthenticatedAuthentication)
    return AuthenticationIdHook(auth.credentials);
  if (auth instanceof DbAuthentication) {
    return auth.credentials;
  }
  return -1;
};
