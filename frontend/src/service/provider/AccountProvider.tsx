import React from "react"
import {List, Lists, Optionable} from "@damntools.fr/types"
import {Account} from "@damntools.fr/wnab-data"
import {AccountApiService, EnrichedAccount} from "../AccountApiService"

export type AccountProviderState = {
    accounts: List<EnrichedAccount>
    getAccountByName: (name: string) => Optionable<EnrichedAccount>
    refresh: () => void
}

export const AccountContext = React.createContext({} as AccountProviderState)

export const AccountConsumer = AccountContext.Consumer

export class AccountProvider extends React.Component<
    any,
    AccountProviderState
> {
    private static INSTANCE: AccountProvider | null = null

    state: AccountProviderState = {
        getAccountByName: this.getAccountByName.bind(this),
        accounts: Lists.empty(),
        refresh: () => {
            void this.prepareData()
        }
    }

    constructor(props: any) {
        super(props)
        AccountProvider.INSTANCE = this
    }

    static refresh() {
        if (this.INSTANCE) this.INSTANCE.state.refresh()
    }

    componentDidMount() {
        void this.prepareData()
    }

    prepareData() {
        return AccountApiService.get()
            .getAccounts()
            .then(
                accounts =>
                    new Promise<List<Account>>(resolve =>
                        this.setState({accounts: accounts as List<EnrichedAccount>}, () => resolve(accounts))
                    )
            )
            .then(accounts => AccountApiService.get().getSplitBalances(accounts))
            .then(accounts => this.setState({accounts}))
    }

    render() {
        return (
            <AccountContext.Provider value={this.state}>
                {this.props.children}
            </AccountContext.Provider>
        )
    }

    private getAccountByName(name: string): Optionable<EnrichedAccount> {
        return this.state.accounts.stream().findOptional(a => a.name === name)
    }
}
