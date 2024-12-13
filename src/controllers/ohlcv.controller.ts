import { Request, Response, NextFunction } from "express";
import { Joi } from "express-validation";
import { db } from "../database";
import { OHLCV } from "../database/models/ohlcv.model";

export const getOHLCVByInterval = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { tokenAddress, from, to } = req.body;

  try {
    const sql = `SELECT *
                    FROM ohlcvs
                    WHERE token_address = '${tokenAddress}' AND timestamp >= '${from}' AND timestamp <= '${to}'`;

    const ohlcvData = await db.sequelize.query(sql);
    return res.json({
      success: true,
      result: ohlcvData,
    });
  } catch (e) {
    console.log(e);
    next(e);
  }
};

export const getOHLCVByTimeRange = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { tokenAddress, range } = req.body;
  let timeRange = "5 minutes";
  switch (range) {
    case "m5":
      timeRange = "5 minutes";
      break;
    case "h1":
      timeRange = "1 hour";
      break;
    case "h6":
      timeRange = "6 hours";
      break;
    case "h24":
      timeRange = "1 day";
      break;
    default:
      break;
  }

  try {
    const sql = `SELECT *
                    FROM ohlcvs
                    WHERE token_address = '${tokenAddress}' AND timestamp > NOW() - INTERVAL '${timeRange}'`;

    const ohlcvData = await db.sequelize.query(sql);

    return res.json({
      success: true,
      result: ohlcvData,
    });
  } catch (e) {
    console.log(e);
    next(e);
  }
};

export const getOHLCVByIntervalValidator = {
  body: Joi.object({
    tokenAddress: Joi.string().required(),
    from: Joi.string().required(),
    to: Joi.string().required(),
  }),
};

export const getOHLCVByTimeRangeValidator = {
  body: Joi.object({
    tokenAddress: Joi.string().required(),
    range: Joi.string().required(),
  }),
};
