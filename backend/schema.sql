CREATE TABLE userProfile
(
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    login    TEXT            NOT NULL,
    email    TEXT            NOT NULL,
    password TEXT            NOT NULL,
    roles    TEXT DEFAULT "" NOT NULL,
    UNIQUE (login),
    UNIQUE (email)
);


CREATE TABLE flag
(
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT              NOT NULL,
    type          TEXT              NOT NULL,
    hidden        INTEGER DEFAULT 0 NOT NULL,
    categoryId    INTEGER,
    userProfileId INTEGER,
    UNIQUE (name),
    FOREIGN KEY (categoryId) REFERENCES category (id),
    FOREIGN KEY (userProfileId) REFERENCES userProfile (id)
);

CREATE TABLE peer
(
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT              NOT NULL,
    type          TEXT              NOT NULL,
    hidden        INTEGER DEFAULT 0 NOT NULL,
    categoryId    INTEGER,
    userProfileId INTEGER,
    UNIQUE (name),
    FOREIGN KEY (categoryId) REFERENCES category (id),
    FOREIGN KEY (userProfileId) REFERENCES userProfile (id)
);

CREATE TABLE category
(
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT              NOT NULL,
    hidden        INTEGER DEFAULT 0 NOT NULL,
    parentId      INTEGER,
    userProfileId INTEGER,
    UNIQUE (name),
    FOREIGN KEY (parentId) REFERENCES category (id),
    FOREIGN KEY (userProfileId) REFERENCES userProfile (id)
);

CREATE TABLE transactionFlag
(
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT              NOT NULL,
    color         TEXT              NOT NULL,
    hidden        INTEGER DEFAULT 0 NOT NULL,
    userProfileId INTEGER,
    UNIQUE (name),
    FOREIGN KEY (userProfileId) REFERENCES userProfile (id)
);

CREATE TABLE account
(
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT              NOT NULL,
    type          TEXT              NOT NULL,
    closed        INTEGER DEFAULT 0 NOT NULL,
    userProfileId INTEGER,
    UNIQUE (name),
    FOREIGN KEY (userProfileId) REFERENCES userProfile (id)
);

CREATE TABLE transactionEvent
(
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    date          INTEGER                  NOT NULL,
    description   TEXT                     NOT NULL,
    cashFlow      REAL DEFAULT 0.0         NOT NULL,
    status        TEXT DEFAULT 'uncleared' NOT NULL,
    categoryId    INTEGER,
    peerId        INTEGER,
    accountId     INTEGER,
    flagId        INTEGER,
    repeat        TEXT,
    repeated      INTEGER,
    userProfileId INTEGER,
    FOREIGN KEY (accountId) REFERENCES account (id),
    FOREIGN KEY (categoryId) REFERENCES category (id),
    FOREIGN KEY (peerId) REFERENCES peer (id),
    FOREIGN KEY (flagId) REFERENCES transactionFlag (id),
    FOREIGN KEY (userProfileId) REFERENCES userProfile (id)
);

CREATE TABLE budget
(
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    month         INTEGER          NOT NULL,
    budgeted      REAL DEFAULT 0.0 NOT NULL,
    activity      REAL DEFAULT 0.0 NOT NULL,
    available     REAL DEFAULT 0.0 NOT NULL,
    categoryId    INTEGER,
    userProfileId INTEGER,
    FOREIGN KEY (categoryId) REFERENCES category (id),
    FOREIGN KEY (userProfileId) REFERENCES userProfile (id)
);