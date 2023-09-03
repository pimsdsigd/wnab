import {DtoMapper, EnumMapper} from "@damntools.fr/data"
import {CategoryDtoMapper} from "./CategoryDtoMapper"
import {Peer, PeerDto} from "../Peer"
import {PeerType} from "../../PeerType"

export class PeerDtoMapper extends DtoMapper<Peer, PeerDto> {
  static INSTANCE: PeerDtoMapper | null = null

  constructor() {
    super(Peer)
    this.addMapping({from: "category", mapper: CategoryDtoMapper.get()})
    this.addMapping({from: "type", mapper: new EnumMapper(PeerType)})
  }

  static get(): PeerDtoMapper {
    if (this.INSTANCE === null) {
      this.INSTANCE = new PeerDtoMapper()
    }
    return this.INSTANCE
  }
}
