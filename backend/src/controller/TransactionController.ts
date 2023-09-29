import {
  Transaction,
  TransactionDto,
  TransactionDtoMapper,
} from "@damntools.fr/wnab-data";
import { PeerDataService, TransactionDataService } from "~/service";
import {
  AuthenticatedDataController,
  Http400Error,
  withBody,
  withBodyParam,
  withQueryParam,
  withURIParam,
} from "@damntools.fr/express-utils";
import { Request } from "express";
import { DTO, ValueListMapper } from "@damntools.fr/data";
import { containsProperty, List, toList } from "@damntools.fr/types";
import { AuthenticationIdHook } from "~/service/CustomAuthenticationProvider";

export class TransactionController extends AuthenticatedDataController<
  number,
  Transaction,
  TransactionDto
> {
  constructor() {
    super(
      "/transaction",
      TransactionDataService.get(),
      TransactionDtoMapper.get(),
      "userProfileId",
      AuthenticationIdHook,
      true,
    );
    this.builder = this.builder.authenticated();
  }

  setRoutes() {
    this.get(
      "/clear",
      this.do((r) => this.clearTransactions(r)),
    );
    super.setRoutes();
  }

  protected create(r: Request) {
    return withBody<TransactionDto>(r)
      .then((body) => {
        if (containsProperty(body as any, "id"))
          throw new Http400Error("Id should not be provided");
        return body;
      })
      .then((b) => this.mapper().mapTo(b))
      .then((data) => this.processNewPeer(data))
      .then((data) => this.service().insert(data))
      .then((b) => this.mapper().mapFrom(b));
  }

  protected update(r: Request) {
    return withBody<DTO>(r)
      .then(() => withBodyParam(r, "id"))
      .then(() => withURIParam(r, "id"))
      .then(() => this.mapper().mapTo(r.body))
      .then((data) => this.processNewPeer(data))
      .then((data) => this.service().update(data))
      .then((b) => this.mapper().mapFrom(b));
  }

  private clearTransactions(r: Request): Promise<List<Transaction>> {
    return withQueryParam<string>(r, "ids")
      .then((ids) => ValueListMapper.stringArray().mapFrom(ids))
      .then((ids) =>
        ids
          .stream()
          .map((id) => this.idMapper().mapFrom(id))
          .collect(toList),
      )
      .then((ids) =>
        this.service<TransactionDataService>().clearTransactions(ids),
      );
  }

  private processNewPeer(data: Transaction): Promise<Transaction> {
    if (data.peer && !data.peer.id) {
      return PeerDataService.get()
        .insert(data.peer)
        .then((peer) => {
          data.peer = peer;
          return data;
        });
    }
    return Promise.resolve(data);
  }
}
