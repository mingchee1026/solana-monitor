import { WebSocket } from "ws";
import axios from "axios";
import cron from "node-cron";
import dotenv from "dotenv";
import { Price } from "../database/models/price.model";

let veryLastData = new Map<string, any>();

export const subscribeToken = async (address: string[]) => {
  const response = await axios.get("https://dd.dexscreener.com/ds-data/dexes", {
    headers: {
      "User-Agent":
        "DEX Screener/2.0.852004 Mozilla/5.0 (Linux; Android 11; sdk_gphone_x86 Build/RSR1.201013.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/125.0.6422.165 Mobile Safari/537.36",
      "Accept-Encoding": "gzip, deflate, br",
      Connection: "keep-alive",
    },
  });

  const cookies = response.headers["set-cookie"];

  console.log({ cookies });

  const url =
    "wss://io.dexscreener.com/dex/screener/pairs/h24/1?rankBy[key]=priceChangeH24&rankBy[order]=desc&filters[liquidity][min]=25000&filters[txns][h24][min]=50&filters[volume][h24][min]=10000";

  const headers = {
    Host: "io.dexscreener.com",
    Origin: "https://dexscreener.com",
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:123.0) Gecko/20100101 Firefox/123.0",
  };

  const ws = new WebSocket(url, { headers });

  ws.on("open", function open() {
    console.log("WebSocket connection established");
    setInterval(() => {
      ws.send("ping");
    }, 60000);
  });

  ws.on("message", async (data) => {
    const parsedData = JSON.parse(data.toString());
    if (parsedData.pairs) {
      for (const pair of parsedData.pairs) {
        if (pair.chainId !== "solana") {
          continue;
        }

        await saveTokenData(pair);
      }
    }
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed. Reconnecting...");
    setTimeout(() => subscribeToken(address), 5000);
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
};

async function saveTokenData(token: any) {
  const lastData = veryLastData.get(token.pairAddress);

  if (
    lastData &&
    lastData.price === token.price &&
    lastData.priceUsd === token.priceUsd
  ) {
    return;
  }

  const tokenInfo = {
    tokenAddress: token.baseToken.address,
    pairAddress: token.pairAddress,
    // price: token.price,
    price: token.priceUsd,
    timestamp: Date.now(),
  };

  // Save token price info to database
  await Price.create(tokenInfo);

  veryLastData.set(token.pairAddress, tokenInfo);
}

async function fetchPoolInfoByTokenAddress(tokenAddress: string) {
  const response = await fetch(
    `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`,
    {
      method: "GET",
      headers: {},
    }
  );

  const parsedData: any = await response.json();

  if (parsedData.pairs) {
    for (const pair of parsedData.pairs) {
      if (pair.chainId !== "solana") {
        continue;
      }

      await saveTokenData(pair);
    }
  }

  throw new Error("couldn't fetch token address info or it is not supported.");
}
