CREATE TABLE flag
(
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT              NOT NULL,
    type       TEXT              NOT NULL,
    hidden     INTEGER DEFAULT 0 NOT NULL,
    categoryId INTEGER,
    UNIQUE (name),
    FOREIGN KEY (categoryId) REFERENCES category (id)
);

CREATE TABLE peer
(
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT              NOT NULL,
    type       TEXT              NOT NULL,
    hidden     INTEGER DEFAULT 0 NOT NULL,
    categoryId INTEGER,
    UNIQUE (name),
    FOREIGN KEY (categoryId) REFERENCES category (id)
);

CREATE TABLE category
(
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    name     TEXT              NOT NULL,
    hidden   INTEGER DEFAULT 0 NOT NULL,
    parentId INTEGER,
    UNIQUE (name),
    FOREIGN KEY (parentId) REFERENCES category (id)
);

CREATE TABLE transactionFlag
(
    id     INTEGER PRIMARY KEY AUTOINCREMENT,
    name   TEXT              NOT NULL,
    color  TEXT              NOT NULL,
    hidden INTEGER DEFAULT 0 NOT NULL,
    UNIQUE (name)
);

CREATE TABLE account
(
    id     INTEGER PRIMARY KEY AUTOINCREMENT,
    name   TEXT              NOT NULL,
    type   TEXT              NOT NULL,
    closed INTEGER DEFAULT 0 NOT NULL,
    UNIQUE (name)
);

CREATE TABLE transactionEvent
(
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    date        INTEGER                  NOT NULL,
    description TEXT                     NOT NULL,
    cashFlow    REAL DEFAULT 0.0         NOT NULL,
    status      TEXT DEFAULT 'uncleared' NOT NULL,
    categoryId  INTEGER,
    peerId      INTEGER,
    accountId   INTEGER,
    flagId      INTEGER,
    repeat      TEXT,
    repeated    INTEGER,
    FOREIGN KEY (accountId) REFERENCES account (id),
    FOREIGN KEY (categoryId) REFERENCES category (id),
    FOREIGN KEY (peerId) REFERENCES peer (id)
    FOREIGN KEY (flagId) REFERENCES transactionFlag (id)
);

CREATE TABLE budget
(
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    month      INTEGER          NOT NULL,
    budgeted   REAL DEFAULT 0.0 NOT NULL,
    activity   REAL DEFAULT 0.0 NOT NULL,
    available  REAL DEFAULT 0.0 NOT NULL,
    categoryId INTEGER,
    FOREIGN KEY (categoryId) REFERENCES category (id)
);