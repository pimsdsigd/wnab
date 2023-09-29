import { Peer, PeerDto, PeerDtoMapper } from "@damntools.fr/wnab-data";
import { PeerDataService } from "~/service";
import { AuthenticatedDataController } from "@damntools.fr/express-utils";
import { AuthenticationIdHook } from "~/service/CustomAuthenticationProvider";

export class PeerController extends AuthenticatedDataController<
  number,
  Peer,
  PeerDto
> {
  constructor() {
    super(
      "/peer",
      PeerDataService.get(),
      PeerDtoMapper.get(),
      "userProfileId",
      AuthenticationIdHook,
      true,
    );
    this.builder = this.builder.authenticated();
  }

  setRoutes() {
    super.setRoutes();
  }
}
