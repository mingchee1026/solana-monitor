import { Router } from "express";
import * as priceHandler from "../controllers/price.controller";
import * as ohlcvHandler from "../controllers/ohlcv.controller";

const router = Router();

// Price apis
router.get(
  "/getLastPrice",
  priceHandler.getLastPriceValidator,
  priceHandler.getLastPrice
);

router.get(
  "/getInterevalPrices",
  priceHandler.getPricesByIntervalValidator,
  priceHandler.getPricesByInterval
);

router.get(
  "/getTimeRangePrices",
  priceHandler.getPricesByTimeRangeValidator,
  priceHandler.getPricesByTimeRange
);

// OHLCV apis
router.get(
  "/getInterevalOHLCV",
  ohlcvHandler.getOHLCVByIntervalValidator,
  ohlcvHandler.getOHLCVByInterval
);

router.get(
  "/getTimeRangeOHLCV",
  ohlcvHandler.getOHLCVByTimeRangeValidator,
  ohlcvHandler.getOHLCVByTimeRange
);

export default router;
