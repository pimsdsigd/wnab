import React from "react"
import {AxiosService, LocalStorageManager} from "../AxiosService"
import {Optionable, Optional} from "@damntools.fr/types"
import {
  UserProfile,
  UserProfileDto,
  UserProfileDtoMapper
} from "@damntools.fr/wnab-data"

export const AuthenticationContext = React.createContext(
  {} as AuthenticationProviderState
)

export const AuthenticationConsumer = AuthenticationContext.Consumer

export type AuthenticationProviderState = {
  authentication: Optionable<UserProfile>
  isAuthenticated: boolean
  logout: () => void
}

export class AuthenticationProvider extends React.Component<
  any,
  AuthenticationProviderState
> {
  private static INSTANCE: AuthenticationProvider | null = null

  state: AuthenticationProviderState = {
    authentication: Optional.empty(),
    isAuthenticated: false,
    logout: () => {
      LocalStorageManager.removeAuthentication().then(() =>
        window.location.reload()
      )
    }
  }

  constructor(props: any) {
    super(props)
    AuthenticationProvider.INSTANCE = this
  }

  componentDidMount() {
    void this.prepareData()
  }

  prepareData() {
    LocalStorageManager.isAuthenticated()
      .then(authenticated => {
        if (!authenticated) throw Error()
        return this.retrieveUser().then(user => {
          this.setState({
            isAuthenticated: authenticated,
            authentication: Optional.of(user)
          })
        })
      })
      .catch(() => {
        this.setState({
          isAuthenticated: false,
          authentication: Optional.empty()
        })
      })
  }

  retrieveUser(): Promise<UserProfile> {
    return AxiosService.getAuthenticatedInstance()
      .get("/user")
      .then(res => res.data as UserProfileDto)
      .then(dto => UserProfileDtoMapper.get().mapTo(dto))
  }

  static get() {
    return this.INSTANCE
  }

  render() {
    return (
      <AuthenticationContext.Provider value={this.state}>
        {this.props.children}
      </AuthenticationContext.Provider>
    )
  }
}
