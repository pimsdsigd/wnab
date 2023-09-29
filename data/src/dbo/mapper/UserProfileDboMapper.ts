import {DboMapper, ValueListMapper} from "@damntools.fr/data"
import {UserProfileDbo} from "../UserProfileDbo"
import {UserProfile} from "../../dto"

export class UserProfileDboMapper extends DboMapper<UserProfile, number, UserProfileDbo> {
  static INSTANCE: UserProfileDboMapper | null = null

  constructor() {
    super(UserProfile)
    this.addMapping({from: "roles", mapper: ValueListMapper.stringArray().reverse()})
  }

  static get(): UserProfileDboMapper {
    if (this.INSTANCE === null) {
      this.INSTANCE = new UserProfileDboMapper()
    }
    return this.INSTANCE
  }
}
