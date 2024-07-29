const sqlite3 = require("sqlite3");
const path = require("path");
const { initDb } = require("../src/db/db");

/**
 * This function is called once before each test suites.
 * It is used to setup the test database.
 */
export const initializeTestDatabase = async () => {
  const dbPath = path.join(__dirname, "../src/db/testdb.db");
  console.log(dbPath);

  const db = new sqlite3.Database(dbPath);

  await new Promise<void>((resolve, reject) => {
    console.log("Initializing TEST database..");
    initDb(db);
    db.close((err: any) => {
      if (err) {
        console.log(err);
      } else {
        resolve();
      }
    });
  });
};

