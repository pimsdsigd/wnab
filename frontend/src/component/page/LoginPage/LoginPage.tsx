import React from "react"
import styles from "./LoginPage.module.scss"
import {PasswordInput, TextInput, VD} from "@damntools.fr/react-inputs"
import {Optionable, Optional} from "@damntools.fr/types"
import {AxiosService, LocalStorageManager} from "../../../service/AxiosService"
import {AlertProvider, Notification} from "@damntools.fr/react-alert"

export type LoginPageState = {
  login: Optionable<string>
  password: Optionable<string>
  errorMessage: Optionable<string>
}

export class LoginPage extends React.Component<any, LoginPageState> {
  constructor(props: any) {
    super(props)
    this.state = {
      login: Optional.empty(),
      password: Optional.empty(),
      errorMessage: Optional.empty()
    }
  }

  render() {
    return (
      <AlertProvider theme={"dark"}>
        <div className={styles.LoginPage}>
          <div className={styles.LoginForm}>
            <div>
              <div className={styles.FormLogo}>
                <div>
                  <img src={"logo192.png"} alt={"Logo"} />
                </div>
              </div>
              <div className={styles.FormTitle}>
                <h1>Welcome on WNAB?</h1>
              </div>
              <div className={styles.FormLogin}>
                <div>
                  <TextInput
                    value={this.state.login.map(VD)}
                    placeholder={"Login"}
                    hideFormat
                    required
                    dark
                    onChange={value => this.onChangeLogin(value)}
                  />
                </div>
              </div>
              <div className={styles.FormPassword}>
                <div>
                  <PasswordInput
                    value={this.state.password.map(VD)}
                    placeholder={"Password"}
                    hideFormat
                    required
                    dark
                    onChange={value => this.onChangePassword(value)}
                  />
                </div>
              </div>
              <div className={styles.FormButton}>
                <div onClick={() => this.onClickLogin()}>Login</div>
              </div>
              <div className={styles.FormActions}>
                <div>
                  <div onClick={() => this.onClickRegister()}>Register</div>
                </div>
                <div>
                  <div onClick={() => this.onClickForgotPassword()}>
                    Forgot the password ?
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div></div>
          </div>
        </div>
      </AlertProvider>
    )
  }

  private onChangeLogin(value: Optionable<string>) {
    this.setState({login: value})
  }

  private onChangePassword(value: Optionable<string>) {
    this.setState({password: value})
  }

  private clear() {
    this.setState({
      login: Optional.empty(),
      password: Optional.empty(),
      errorMessage: Optional.empty()
    })
  }

  private onClickLogin() {
    if (this.state.login.isEmpty()) {
      AlertProvider.submitNotification(
        Notification.error("Invalid login").Subtitle(
          "Login should be provided !"
        )
      )
      return
    }
    if (this.state.password.isEmpty()) {
      AlertProvider.submitNotification(
        Notification.error("Invalid password").Subtitle(
          "Password should be provided !"
        )
      )
      return
    }
    AxiosService.getInstance()
      .post(
        "/auth/login",
        {
          login: this.state.login.get(),
          password: this.state.password.get()
        },
        {withCredentials: true}
      )
      .then(response => response.data)
      .then(token => LocalStorageManager.setAuthentication(token as string))
      .then(() => window.location.reload())
      .catch(err => {
        console.error(err)
        AlertProvider.submitNotification(
          Notification.error("Invalid login").Subtitle(
            "Could not authenticate !"
          )
        )
        this.clear()
      })
  }

  private onClickForgotPassword() {}

  private onClickRegister() {}
}
