import express, { Application } from "express";
import dotenv from "dotenv";
import { db } from "./database";
import { subscribeToken } from "./background/subscribe-token-price";
import { aggregateTokenPrice } from "./background/aggregate-token-price";
import router from "./routers";

dotenv.config();

async function main() {
  const app: Application = express();

  await db.initDatabase(false);

  subscribeToken([]);
  aggregateTokenPrice();

  app.use("/api", router);

  app.get("/", (req, res) => {
    res.send("Hello World");
  });

  app.get("/health-check", (req, res) => {
    res.send("Server is Running.");
  });

  app.listen(Number(process.env.PORT), () => {
    return console.log(
      `Express is listening at http://localhost:${process.env.PORT}`
    );
  });
}

main().catch((e) => {
  console.log(e);
});
