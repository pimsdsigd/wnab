import {DTO} from "@damntools.fr/data"
import {ArrayList, List} from "@damntools.fr/types";

export type UserProfileDto = DTO & {
  id?: number
  email: string
  login: string
  password: string
  roles: Array<string>
}

export interface UserProfileCtor {
  id?: number
  email: string
  login: string
  password: string
  roles: List<string>
}

export class UserProfile {
  id?: number
  email: string
  login: string
  password: string
  roles: List<string>

  constructor(ctor: UserProfileCtor) {
    this.id = ctor.id
    this.email = ctor.email
    this.login = ctor.login
    this.password = ctor.password
    this.roles = ctor.roles || new ArrayList()
  }

  toString(): string {
    return `id=${this.id} ,` + `name=${this.login} ,` + `type=${this.email} ,` + `roles=${this.roles.getInner()}`
  }
}
