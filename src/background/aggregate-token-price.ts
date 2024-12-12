import cron from "node-cron";
import { Sequelize, Transaction } from "sequelize";
import { db } from "../database";
import { OHLCV } from "../database/models/ohlcv.model";

export function aggregateTokenPrice() {
  cron.schedule("*/1 * * * * *", async () => {
    try {
      const m5OHLCVData = await calculatePeriodPrice("5 minutes");
      const h1OHLCVData = await calculatePeriodPrice("1 hour");
      const h6OHLCVData = await calculatePeriodPrice("6 hours");
      const h24OHLCVData = await calculatePeriodPrice("a day");

      for (const m5OHLCV of m5OHLCVData) {
        await OHLCV.create({
          tokenAddress: m5OHLCV.token_address,
          m5: [m5OHLCV.open, m5OHLCV.high, m5OHLCV.low, m5OHLCV.close],
          h1: getOHLCVDataByAddress(m5OHLCV.token_address, h1OHLCVData),
          h6: getOHLCVDataByAddress(m5OHLCV.token_address, h6OHLCVData),
          h24: getOHLCVDataByAddress(m5OHLCV.token_address, h24OHLCVData),
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      console.log(error);
    }
  });
}

async function calculatePeriodPrice(period: string) {
  const sql = `SELECT
                        token_address,
                        FIRST(price, timestamp) AS "open",
                        MAX(price) AS high,
                        MIN(price) AS low,
                        LAST(price, timestamp) AS "close"
                    FROM prices
                    WHERE timestamp > NOW() - INTERVAL '${period}'
                    GROUP BY token_address;`;
  const ohlcvData: any = await db.sequelize.query(sql);

  return ohlcvData;
}

function getOHLCVDataByAddress(tokenAddress: string, ohlcvData: any) {
  const ohlc = ohlcvData.find((ohlcv) => ohlcv.token_address === tokenAddress);
  if (ohlc) {
    return [ohlc.open, ohlc.high, ohlc.low, ohlc.close];
  }
  return [];
}

/**

const sql = `SELECT * FROM prices WHERE 
                token_address = '${tokenAddress}' AND 
                timestamp > NOW() - INTERVAL '${period}' ORDER BY 1;`;

 */
