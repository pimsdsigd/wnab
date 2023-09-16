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

  create(peer: Peer) {
    if (peer.id) return Promise.reject("Peer should not contains id ! ")
    return axios.post(
      "http://localhost:8000/api/peer",
      PeerDtoMapper.get().mapFrom(peer)
    )
        .then(res =>res.data as PeerDto)
        .then(res =>PeerDtoMapper.get().mapTo(res))
  }

  update(peer: Peer) {
    if (!peer.id) return Promise.reject("Peer should contains id ! ")
    return axios.put(
      `http://localhost:8000/api/peer/${peer.id}`,
      PeerDtoMapper.get().mapFrom(peer)
    )
  }

  delete(flags: List<number>) {
    return axios
      .delete(`http://localhost:8000/api/peer?ids=${flags.stream().join(",")}`)
      .then(() => {})
  }

  static get(): PeerApiService {
    if (this.INSTANCE === null) {
      this.INSTANCE = new PeerApiService()
    }
    return this.INSTANCE
  }
}
