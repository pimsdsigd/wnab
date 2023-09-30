import {ArrayListMapper, DtoMapper, reverseMapper} from "@damntools.fr/data"
import {UserProfile, UserProfileDto} from "../UserProfile"

export class UserProfileDtoMapper extends DtoMapper<UserProfile, UserProfileDto> {
  static INSTANCE: UserProfileDtoMapper | null = null

  constructor() {
    super(UserProfile)
    this.addMapping({from: "roles", mapper: reverseMapper(new ArrayListMapper())})
  }

  static get(): UserProfileDtoMapper {
    if (this.INSTANCE === null) {
      this.INSTANCE = new UserProfileDtoMapper()
    }
    return this.INSTANCE
  }
}
