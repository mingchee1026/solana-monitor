import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import { Price, PriceModel } from "./models/price.model";
import { OHLCV, OHLCVModel } from "./models/ohlcv.model";

dotenv.config();

class Database {
  public sequelize: Sequelize;

  constructor(database: string) {
    // Dynamically determine dialect options based on DB_PGSSLMODE environment variable
    const sslMode = String(process.env.DB_PGSSLMODE);
    const dialectOptions =
      sslMode === "require"
        ? {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          }
        : undefined;

    // Initialize Sequelize with the configuration
    this.sequelize = new Sequelize(
      database,
      String(process.env.DB_PGUSER),
      String(process.env.DB_PGPASSWORD),
      {
        host: String(process.env.DB_PGHOST),
        port: Number(process.env.DB_PGPORT),
        logging: false,
        dialect: "postgres",
        protocol: "postgres",
        dialectOptions,
        pool: {
          max: 5,
          min: 0,
          idle: 10000,
        },
      }
    );
  }

  public async init(force: boolean): Promise<void> {
    await this.checkConnection().catch(console.log);

    this.initModels();

    await this.sequelize.sync({ force }).catch(console.log);
  }

  public async initDatabase(force: boolean): Promise<void> {
    await this.init(force);
  }

  private async checkConnection() {
    await this.sequelize.authenticate();
    console.log("Database connection has been established successfully.");
  }

  private initModels() {
    PriceModel.init(this.sequelize);
    OHLCVModel.init(this.sequelize);
  }
}

const db = new Database(String(process.env.DB_PGDATABASE));

export { db, Database };
