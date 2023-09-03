import {DBO} from "@damntools.fr/data";
import {PeerType} from "../PeerType";

export interface PeerDbo extends DBO<number> {
  id: number | undefined
  name: string
  type: PeerType
  hidden: boolean
  categoryId?: number
}
