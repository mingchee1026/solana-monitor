import { Sequelize } from "sequelize";
import { db } from ".";
import { Price, PriceModel } from "./models/price.model";
import { OHLCV, OHLCVModel } from "./models/ohlcv.model";

const initializeDatabase = async () => {
  try {
    await db.initDatabase(false);

    console.log("Tables were created successfully.");

    db.sequelize
      .query("SELECT create_hypertable('prices', by_range('timestamp'));")
      .catch((error) => console.log(error.message));

    db.sequelize
      .query("SELECT create_hypertable('ohlcvs', by_range('timestamp'));")
      .catch((error) => console.log(error.message));
  } catch (error) {
    console.log(error);
  }
};

initializeDatabase();
