import {ArrayList, List, toList} from "@damntools.fr/types"
import {Peer, PeerDto, PeerDtoMapper} from "@damntools.fr/wnab-data"
import {AxiosWrapper} from "@damntools.fr/http"
import {AxiosService} from "./AxiosService"

export class PeerApiService {
  static INSTANCE: PeerApiService | null = null
  private readonly axios: AxiosWrapper

  constructor() {
    this.axios = AxiosService.getAuthenticatedInstance().child({
      baseURL: "/peer"
    })
  }

  getPeers(): Promise<List<Peer>> {
    return this.axios
      .get("")
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
    return this.axios
      .post("", PeerDtoMapper.get().mapFrom(peer))
      .then(res => res.data as PeerDto)
      .then(res => PeerDtoMapper.get().mapTo(res))
  }

  update(peer: Peer) {
    if (!peer.id) return Promise.reject("Peer should contains id ! ")
    return this.axios.put(`/${peer.id}`, PeerDtoMapper.get().mapFrom(peer))
  }

  delete(flags: List<number>) {
    return this.axios.delete(`?ids=${flags.stream().join(",")}`).then(() => {})
  }

  static get(): PeerApiService {
    if (this.INSTANCE === null) {
      this.INSTANCE = new PeerApiService()
    }
    return this.INSTANCE
  }
}
