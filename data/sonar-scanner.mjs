/* eslint-disable no-undef */
import scanner from "sonarqube-scanner"

scanner(
  {
    serverUrl: "https://sonar.dev.damntools.fr",
    token: process.env.SONAR_TOKEN,
    options: {
      "sonar.projectName": "fr.damntools.npm.sqlite",
      "sonar.projectKey": "fr.damntools.npm.sqlite",
      "sonar.sources": "./src",
      "sonar.tests": "./test",
      "sonar.javascript.lcov.reportPaths": "coverage/lcov.info"
    }
  },
  () => process.exit()
)
