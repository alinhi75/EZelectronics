import fs from "fs";
import path from "path";
import db from "../src/db/db";

/**
 * This function is called once after all test suites.
 * It is used to tear down the test database.
 */
export const tearDownTestDatabase = async () => {
  console.log("called GLOBAL TEARDOWN");
  await new Promise<void>((resolve, reject) => {
    db.close((err: any) => {
      if (err) {
        console.log(err);
      } else {
        resolve();
      }
    });
  });

  const dbPath = path.join(__dirname, "../src/db/testdb.db");

  // Check if the file exists before trying to delete it
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }
};
