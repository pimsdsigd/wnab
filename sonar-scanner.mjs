import scanner from "sonarqube-scanner"

scanner(
  {
    serverUrl: "https://sonar.dev.damntools.fr",
    token: process.env.SONAR_TOKEN,
    options: {
      "sonar.projectName": "fr.damntools.wnab",
      "sonar.projectKey": "fr.damntools.wnab",
      "sonar.sources": "./backend/src,./frontend/src,./data/src",
      "sonar.test.inclusions": "**/*.test.ts",
      "sonar.javascript.lcov.reportPaths": "coverage/lcov.info"
    }
  },
  () => process.exit(0)
)
