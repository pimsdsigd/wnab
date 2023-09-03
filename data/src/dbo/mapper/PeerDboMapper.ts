import {DboMapper, DboRelationMapper} from "@damntools.fr/data"
import {PeerDbo} from "../PeerDbo"
import {Peer} from "../../dto"

export class PeerDboMapper extends DboMapper<Peer, number, PeerDbo> {
  static INSTANCE: PeerDboMapper | null = null

  constructor() {
    super(Peer)
    this.addMapping({from: "category", to: "categoryId", mapper: new DboRelationMapper()})
    this.addMapping({from: "categoryId", ignore: true})
  }

  static get(): PeerDboMapper {
    if (this.INSTANCE === null) {
      this.INSTANCE = new PeerDboMapper()
    }
    return this.INSTANCE
  }
}
