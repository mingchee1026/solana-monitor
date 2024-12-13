import { Request, Response, NextFunction } from "express";
import { Joi } from "express-validation";
import { db } from "../database";
import { Price } from "../database/models/price.model";

export const getLastPrice = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { tokenAddress } = req.body;

  try {
    const price = await Price.findOne({
      where: { tokenAddress },
      order: ["timestamp", "DESC"],
    });

    return res.json({
      success: true,
      result: price,
    });
  } catch (e) {
    console.log(e);
    next(e);
  }
};

export const getPricesByInterval = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { tokenAddress, from, to } = req.body;

  try {
    const sql = `SELECT *
                    FROM prices
                    WHERE token_address = '${tokenAddress}' AND timestamp >= '${from}' AND timestamp <= '${to}'`;

    const prices = await db.sequelize.query(sql);
    return res.json({
      success: true,
      result: prices,
    });
  } catch (e) {
    console.log(e);
    next(e);
  }
};

export const getPricesByTimeRange = async (
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
                    FROM prices
                    WHERE token_address = '${tokenAddress}' AND timestamp > NOW() - INTERVAL '${timeRange}'`;

    const prices = await db.sequelize.query(sql);

    return res.json({
      success: true,
      result: prices,
    });
  } catch (e) {
    console.log(e);
    next(e);
  }
};

export const getLastPriceValidator = {
  body: Joi.object({
    tokenAddress: Joi.string().required(),
  }),
};

export const getPricesByIntervalValidator = {
  body: Joi.object({
    tokenAddress: Joi.string().required(),
    from: Joi.string().required(),
    to: Joi.string().required(),
  }),
};

export const getPricesByTimeRangeValidator = {
  body: Joi.object({
    tokenAddress: Joi.string().required(),
    range: Joi.string().required(),
  }),
};
