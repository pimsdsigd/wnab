import {ArrayList, List, toList} from "@damntools.fr/types"
import {Peer, PeerDto, PeerDtoMapper} from "@damntools.fr/wnab-data"
import axios from "axios"

export class PeerApiService {
  static INSTANCE: PeerApiService | null = null

  getPeers(): Promise<List<Peer>> {
    return axios
      .get("http://localhost:8000/api/peer")
      .then(res => new ArrayList<PeerDto>(res.data))
      .then(res =>
        res
          .stream()
          .map(a => PeerDtoMapper.get().mapTo(a))
          .collect(toList)
      )
  }

  static get(): PeerApiService {
    if (this.INSTANCE === null) {
      this.INSTANCE = new PeerApiService()
    }
    return this.INSTANCE
  }
}
