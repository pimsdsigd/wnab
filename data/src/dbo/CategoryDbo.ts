import {DBO} from "@damntools.fr/data";

export interface CategoryDbo extends DBO<number> {
  id: number | undefined
  name: string
  hidden: boolean
  parentId?: number
}
