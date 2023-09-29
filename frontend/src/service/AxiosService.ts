import {
  AuthenticatedWrapper,
  AxiosWrapper,
  LocalStorageAuthManager
} from "@damntools.fr/http"

export class CustomLocalStorageManager extends LocalStorageAuthManager {
  private static INSTANCE: CustomLocalStorageManager

  protected callTokenRefresh(): Promise<string> {
    return AxiosService.getInstance()
      .post(
        "/auth/refresh",
        {},
        {
          withCredentials: true
        }
      )
      .then(res => res.data as string)
  }

  static get() {
    if (!this.INSTANCE) this.INSTANCE = new CustomLocalStorageManager()
    return this.INSTANCE
  }

  protected validateAuthentication(): Promise<boolean> {
    return AxiosService.getAuthenticatedInstance()
      .get("/user")
      .then(() => true)
      .catch(() => false)
  }
}

export const LocalStorageManager = CustomLocalStorageManager.get()

export class AxiosService {
  static INSTANCE: AxiosService | null = null
  private readonly baseInstance: AxiosWrapper
  private readonly authenticatedInstance: AuthenticatedWrapper

  constructor() {
    this.baseInstance = new AxiosWrapper({
      baseURL: "http://localhost:8000/api"
    })
    this.authenticatedInstance = AuthenticatedWrapper.fromWrapper(
      this.baseInstance,
      LocalStorageManager
    )
    this.authenticatedInstance.setTokenExpiredHandler(() => {
      LocalStorageManager.removeAuthentication().then(() =>
        window.location.reload()
      )
    })
  }

  static getInstance(): AxiosWrapper {
    return this.get().baseInstance
  }

  static getAuthenticatedInstance(): AuthenticatedWrapper {
    return this.get().authenticatedInstance
  }

  private static get(): AxiosService {
    if (this.INSTANCE === null) {
      this.INSTANCE = new AxiosService()
    }
    return this.INSTANCE
  }
}
