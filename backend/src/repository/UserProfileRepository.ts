import { UserProfileDbo } from "@damntools.fr/wnab-data";
import { CachedDataAccessor } from "@damntools.fr/sqlite";

export class UserProfileRepository extends CachedDataAccessor<
  number,
  UserProfileDbo
> {
  static INSTANCE: UserProfileRepository | null = null;

  constructor() {
    super("userProfile");
  }

  static get(): UserProfileRepository {
    if (this.INSTANCE === null) {
      this.INSTANCE = new UserProfileRepository();
    }
    return this.INSTANCE;
  }
}
