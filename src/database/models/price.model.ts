import {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
  DataTypes,
} from "sequelize";
import { Sequelize } from "sequelize";

class Price extends Model<
  InferAttributes<Price>,
  InferCreationAttributes<Price>
> {
  declare tokenAddress: string;
  declare pairAddress: string;
  declare price: number;
  timestamp: number;
}
class PriceModel {
  public static init(sequelize: Sequelize) {
    Price.init(
      {
        tokenAddress: {
          type: DataTypes.STRING,
          primaryKey: true,
        },
        pairAddress: {
          type: DataTypes.STRING,
        },
        price: {
          type: DataTypes.DECIMAL(20, 7),
        },
        timestamp: {
          type: DataTypes.DATE,
          primaryKey: true,
        },
      },
      {
        sequelize,
        tableName: "prices",
        modelName: "Price",
        underscored: true,
        indexes: [
          { name: "price_hist", fields: ["token_address"] }, // for getting history by tokenAddress
        ],
      }
    );
  }
}

export { Price, PriceModel };
