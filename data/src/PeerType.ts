import {Enum} from "@damntools.fr/types";

export class PeerType extends Enum<string> {
  static ENTITY = new PeerType("entity")
  static PERSON = new PeerType("person")
}
