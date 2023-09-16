import { Peer, PeerDto, PeerDtoMapper } from "@damntools.fr/wnab-data";
import { PeerDataService } from "~/service";
import { DataController } from "@damntools.fr/express-utils";

export class PeerController extends DataController<number, Peer, PeerDto> {
  constructor() {
    super("/peer", PeerDataService.get(), PeerDtoMapper.get(), true);
  }

  setRoutes() {
    super.setRoutes();
  }
}
