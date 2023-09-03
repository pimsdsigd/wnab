import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import {App} from "./App"
import reportWebVitals from "./reportWebVitals"
import {
  consoleTransport,
  Logging,
  nativeConsoleInterceptor
} from "@damntools.fr/logger-simple"

Logging.configure({
  level: "DEBUG",
  useCache: false,
  printEmptyMessage: true,
  transports: [
    consoleTransport({
      pattern: "[%V] %L{-15} %red>%Cend %m"
    })
  ],
  collectLocationInfo: true,
  nativeConsoleInterceptor
})

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement)
root.render(<App />)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
