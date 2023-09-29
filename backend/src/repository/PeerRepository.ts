import { CachedDataAccessor } from "@damntools.fr/sqlite";

import { PeerDbo, PeerType } from "@damntools.fr/wnab-data";
import { BooleanNumberMapper, EnumMapper } from "@damntools.fr/data";

export class PeerRepository extends CachedDataAccessor<number, PeerDbo> {
  static INSTANCE: PeerRepository | null = null;

  constructor() {
    super("peer");
    this.addMapping({ from: "hidden", mapper: new BooleanNumberMapper() });
    this.addMapping({ from: "type", mapper: new EnumMapper(PeerType) });
  }

  static get(): PeerRepository {
    if (this.INSTANCE === null) {
      this.INSTANCE = new PeerRepository();
    }
    return this.INSTANCE;
  }
}
