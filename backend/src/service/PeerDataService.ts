import { AbstractDataService } from "./AbstractDataService";
import { Peer, PeerDbo, PeerDboMapper } from "@damntools.fr/wnab-data";
import { PeerRepository } from "~/repository";
import { eq } from "@damntools.fr/sqlite";

export class PeerDataService extends AbstractDataService<Peer, PeerDbo> {
  static INSTANCE: PeerDataService | null = null;

  protected constructor() {
    super(PeerRepository.get(), PeerDboMapper.get());
  }

  getReconciliationPeer(): Promise<Peer> {
    return this.repository
      .findOne(eq("name", "Reconciliation Balance Adjustment"))
      .then((peer) => this.mapper.mapTo(peer));
  }

  static get(): PeerDataService {
    if (this.INSTANCE === null) {
      this.INSTANCE = new PeerDataService();
    }
    return this.INSTANCE;
  }
}
