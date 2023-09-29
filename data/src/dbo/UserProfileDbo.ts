import {DBO} from "@damntools.fr/data"

export interface UserProfileDbo extends DBO<number> {
  id: number | undefined
  email: string
  login: string
  password: string
  roles: string
}
