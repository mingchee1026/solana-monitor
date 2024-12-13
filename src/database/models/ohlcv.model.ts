import {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
  DataTypes,
} from "sequelize";
import { Sequelize } from "sequelize";

class OHLCV extends Model<
  InferAttributes<OHLCV>,
  InferCreationAttributes<OHLCV>
> {
  declare tokenAddress: string;
  declare m5: number[];
  declare h1: number[];
  declare h6: number[];
  declare h24: number[];

  //   declare m5O: number;
  //   declare m5H: number;
  //   declare m5L: number;
  //   declare m5C: number;
  //   declare m5V: number;

  //   declare h1O: number;
  //   declare h1H: number;
  //   declare h1L: number;
  //   declare h1C: number;
  //   declare h1V: number;

  //   declare h6O: number;
  //   declare h6H: number;
  //   declare h6L: number;
  //   declare h6C: number;
  //   declare h6V: number;

  //   declare h24O: number;
  //   declare h24H: number;
  //   declare h24L: number;
  //   declare h24C: number;
  //   declare h24V: number;

  timestamp: number;
}
class OHLCVModel {
  public static init(sequelize: Sequelize) {
    OHLCV.init(
      {
        tokenAddress: {
          type: DataTypes.STRING,
          primaryKey: true,
        },
        m5: {
          type: DataTypes.ARRAY(DataTypes.DOUBLE),
        },
        h1: {
          type: DataTypes.ARRAY(DataTypes.DOUBLE),
        },
        h6: {
          type: DataTypes.ARRAY(DataTypes.DOUBLE),
        },
        h24: {
          type: DataTypes.ARRAY(DataTypes.DOUBLE),
        },
        timestamp: {
          type: DataTypes.DATE,
          primaryKey: true,
        },
      },
      {
        sequelize,
        tableName: "ohlcvs",
        modelName: "OHLCV",
        underscored: true,
        indexes: [
          { name: "ohlcv_hist", fields: ["token_address"] }, // for getting history by tokenAddress
        ],
      }
    );
  }
}

export { OHLCV, OHLCVModel };
