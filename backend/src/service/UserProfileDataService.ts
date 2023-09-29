import { AbstractDataService } from "./AbstractDataService";
import { UserProfileRepository } from "~/repository";
import { compareSync } from "bcrypt";
import {
  UserProfile,
  UserProfileDbo,
  UserProfileDboMapper,
} from "@damntools.fr/wnab-data";
import {
  AuthenticatedAuthentication,
  AuthenticationRole,
  AuthUser,
  UserManagerService,
} from "@damntools.fr/express-utils";
import { List, toList } from "@damntools.fr/types";
import { eq, or } from "@damntools.fr/sqlite";

export type DbAuthUser = AuthUser & {
  id: number;
};


export class UserProfileDataService
  extends AbstractDataService<UserProfile, UserProfileDbo>
  implements UserManagerService<DbAuthUser>
{
  static INSTANCE: UserProfileDataService | null = null;

  protected constructor() {
    super(UserProfileRepository.get(), UserProfileDboMapper.get());
  }

  static get(): UserProfileDataService {
    if (this.INSTANCE === null) {
      this.INSTANCE = new UserProfileDataService();
    }
    return this.INSTANCE;
  }

  matchByLogin(login: string): Promise<DbAuthUser> {
    return this.repository
      .findOne(or(eq("login", login), eq("email", login)))
      .then((user) => this.mapper.mapTo(user))
      .then((user) => {
        return {
          email: user.email,
          password: user.password,
          username: user.login,
          id: user.id as number,
          roles: user.roles
            .stream()
            .map((r) => ({ name: r }))
            .collect(toList),
        };
      });
  }

  matchByLoginAndPassword(
    login: string,
    password: string,
  ): Promise<DbAuthUser> {
    return this.matchByLogin(login).then((user) => {
      if (compareSync(password, user.password)) return user;
      throw new Error("Password not matching");
    });
  }

  register(
    username: string,
    encryptedPassword: string,
    email: string,
    roles?: List<AuthenticationRole>,
  ): Promise<DbAuthUser> {
    return Promise.resolve(undefined as any);
  }
}
