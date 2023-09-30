import React from "react"
import {List, Lists, Optionable} from "@damntools.fr/types"
import {Peer} from "@damntools.fr/wnab-data"
import {PeerApiService} from "../PeerApiService"

export type PeerProviderState = {
  peers: List<Peer>
  getPeerByName: (name: string) => Optionable<Peer>
  refresh: () => void
}

export const PeerContext = React.createContext({} as PeerProviderState)

export const PeerConsumer = PeerContext.Consumer

export class PeerProvider extends React.Component<any, PeerProviderState> {
  private static INSTANCE: PeerProvider | null = null

  state: PeerProviderState = {
    getPeerByName: this.getPeerByName.bind(this),
    peers: Lists.empty(),
    refresh: () => {
      void this.prepareData()
    }
  }

  constructor(props: any) {
    super(props)
    PeerProvider.INSTANCE = this
  }

  static refresh() {
    if (this.INSTANCE) this.INSTANCE.state.refresh()
  }

  componentDidMount() {
    void this.prepareData()
  }

  prepareData() {
    return PeerApiService.get()
      .getPeers()
      .then(
        accounts =>
          new Promise<List<Peer>>(resolve =>
            this.setState({peers: accounts}, () =>
              resolve(accounts)
            )
          )
      )
  }

  render() {
    return (
      <PeerContext.Provider value={this.state}>
        {this.props.children}
      </PeerContext.Provider>
    )
  }

  private getPeerByName(name: string): Optionable<Peer> {
    return this.state.peers.stream().findOptional(a => a.name === name)
  }
}
