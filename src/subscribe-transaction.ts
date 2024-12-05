import { Connection, VersionedTransaction } from "@solana/web3.js";
import {
  AccountLayout,
  getAssociatedTokenAddressSync,
  transferCheckedInstructionData,
} from "@solana/spl-token";
import { WebSocket } from "ws";
import dotenv from "dotenv";
import { getBalanceChange } from "./utils/getBalanceChange";
import { extractJupiterTransaction } from "./jupiter";
import { extractRaydiumTransaction } from "./raydium";
import { extractPumpFunTransaction } from "./pumpfun";
import { extractMoonShotTransaction } from "./moonshot";
import { TransactionType } from "./utils/types";
import {
  JUPITER_PROGRAM_ID,
  RAYDIUM_PROGRAM_ID,
  PUMP_FUN_PROGRAM_ID,
  MOONSHOT_PROGRAM_ID,
} from "./config";

dotenv.config();

const connection = new Connection(process.env.RPC_ENDPOINT); // Use your own RPC endpoint here.

function sendRequest(ws: WebSocket, address: string[]) {
  const request = {
    jsonrpc: "2.0",
    id: 420,
    method: "transactionSubscribe",
    params: [
      {
        failed: false,
        accountInclude: address,
      },
      {
        commitment: "confirmed",
        encoding: "jsonParsed",
        transactionDetails: "full",
        showRewards: true,
        maxSupportedTransactionVersion: 0,
      },
    ],
  };
  ws.send(JSON.stringify(request));
}

export const subscribeTransaction = async (address: string[]) => {
  let ws = new WebSocket(process.env.RPC_WEBSOCKET_ENDPOINT);

  //   cron.schedule("*/10 * * * * *", async () => {
  //     console.log("Running a task every 5 seconds --- updating tokens");
  //   });

  //   solPrice = await readSolPrice();

  ws.on("open", function open() {
    console.log("WebSocket is open");

    // Send a request once the WebSocket is open
    sendRequest(ws, address);
  });

  ws.on("message", async function incoming(data) {
    // console.log("New txn received ...");
    const message = data.toString();
    try {
      const { method, params } = JSON.parse(message);

      if (params && method === "transactionNotification") {
        // console.log(JSON.stringify(params.result, null, 4));

        const { signature, transaction, slot } = params.result;

        let txnResult;
        const amm = getTradeAMM(transaction.meta.logMessages);

        // console.log({ amm });

        // Get balance change
        // console.log({ signature });
        await getBalanceChange(signature, connection, transaction);

        switch (amm) {
          case TransactionType.Jupiter:
            txnResult = await extractJupiterTransaction(
              signature,
              connection,
              transaction,
              new Date().getTime()
            );
            break;
          case TransactionType.Raydium:
            txnResult = await extractRaydiumTransaction(
              signature,
              connection,
              transaction,
              new Date().getTime()
            );
            break;
          case TransactionType.PumpFun:
            txnResult = await extractPumpFunTransaction(
              signature,
              connection,
              transaction,
              new Date().getTime()
            );
            break;
          case TransactionType.MoonShot:
            txnResult = await extractMoonShotTransaction(
              signature,
              connection,
              transaction,
              new Date().getTime()
            );
            break;
          default:
            break;
        }

        if (txnResult) {
          console.table(txnResult);
          // console.log(JSON.stringify(txnResult, null, 4));
        } else {
          console.log("Unknown transaction");
        }
      }
    } catch (e) {
      console.error(e);
    }
  });

  ws.on("error", function error(err) {
    console.error("WebSocket error:", err);
  });

  ws.on("close", function close() {
    console.log("WebSocket is closed");
    // connection closed, discard old websocket and create a new one in 5s
    ws = null;
    setTimeout(() => subscribeTransaction(address), 5000);
  });

  async function getTxn(signature: string) {
    const txn = await connection.getParsedTransaction(signature, {
      // maxSupportedTransactionVersion: 0,
    });

    return txn;
  }

  const getTradeAMM = (logMessages: string[]) => {
    // console.log({logMessages});
    const foundTypes: TransactionType[] = [];

    const dex = logMessages.some((message, index) => {
      if (
        index > 0 &&
        logMessages[index - 1].includes(`Program ${JUPITER_PROGRAM_ID} invoke`)
      ) {
        foundTypes.push(TransactionType.Jupiter);
        return;
      } else if (
        index > 0 &&
        logMessages[index - 1].includes(`Program ${RAYDIUM_PROGRAM_ID} invoke`)
      ) {
        foundTypes.push(TransactionType.Raydium);
        return;
      }
      if (
        index > 0 &&
        logMessages[index - 1].includes(`Program ${PUMP_FUN_PROGRAM_ID} invoke`)
      ) {
        foundTypes.push(TransactionType.PumpFun);
        return;
      }
      if (
        index > 0 &&
        logMessages[index - 1].includes(`Program ${MOONSHOT_PROGRAM_ID} invoke`)
      ) {
        foundTypes.push(TransactionType.MoonShot);
        return;
      }
    });

    // Return the first found type or Unknown if none found
    return foundTypes.length > 0 ? foundTypes[0] : TransactionType.Unknown;
  };
};
