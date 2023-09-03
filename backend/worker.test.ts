
import {
  consoleTransport,
  Logging,
  LogLevel,
  nativeConsoleInterceptor
} from "@damntools.fr/logger-simple"
import {Enum} from "@damntools.fr/types"
import {NumberUtils, TimeUtils} from "@damntools.fr/utils-simple"
import {CachedDataAccessor, contains, DBO, EnumMapper, eq, SqliteDb, ThreadedSqliteDb} from "@damntools.fr/sqlite";
import w from "why-is-node-running";

Logging.configure({
  level: LogLevel.DEBUG,
  transports: [consoleTransport()],
  nativeConsoleInterceptor
})

process.env["CLEAN_AT_EXIT"] = "true"

class TestEnum extends Enum<string> {
  static KEY1 = new TestEnum("key1")
  static KEY2 = new TestEnum("ke'y2")
}

class TestDbo implements DBO<number> {
  id?: number
  value: TestEnum

  constructor(id: number, value: TestEnum) {
    this.id = id
    this.value = value
  }
}

let count = 1
const logTimed = (start: number) => {
  console.log(
    `${count}st took ${NumberUtils.formatNumber(
      (TimeUtils.getNanoTime() - start) / 1_000_000
    )}ms`
  )
  count++
  return TimeUtils.getNanoTime()
}

class TestRepo extends CachedDataAccessor<number, TestDbo> {
  constructor() {
    super("Test", {
      value: new EnumMapper(TestEnum)
    })
  }
}

const repo = new TestRepo()
ThreadedSqliteDb.init()
  .then(() => {
    let startTime = TimeUtils.getNanoTime()
    return repo
      .find(eq("id", 15648))
      .then(res => {
        startTime = logTimed(startTime)
        console.log(res.size())
      })
      .then(() => repo.find(contains("id", 15648)))
      .then(res => {
        startTime = logTimed(startTime)
        console.log(res.size())
      })
      .then(() => repo.getAll())
      .then(res => {
        startTime = logTimed(startTime)
        console.log(res.size())
      })
      .then(() => repo.getAll())
      .then(res => {
        startTime = logTimed(startTime)
        console.log(res.size())
      })
  })
  .catch(err => {
    console.error("Received error", err)
  })
  .then(() => SqliteDb.get().closeDb())

setInterval(function () {
  logProcess()
}, 5000)
