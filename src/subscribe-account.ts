import { WebSocket } from "ws";
import dotenv from "dotenv";
import { AccountMeta } from "./utils/types";

dotenv.config();

const wsSubsMeta: Map<number, string> = new Map();

export const subscribeAccount = async (accounts: AccountMeta[]) => {
  let ws = new WebSocket(process.env.RPC_WEBSOCKET_ENDPOINT);

  ws.on("open", function open() {
    console.log("WebSocket is open");

    // Send a request once the WebSocket is open
    subscribeToAccountsNotifications(ws, accounts);
  });

  ws.on("message", async function incoming(event) {
    try {
      const data = Buffer.from(event, "base64").toString("binary");
      const message = JSON.parse(data);

      if (message.error !== undefined) {
        console.log(
          "warn",
          `Received RPC WebSocket error message: ${event.data}`
        );
        ws.terminate();

        return;
      }

      // console.log({ message: message.result });

      if (message.result !== undefined) {
        const matchingAccount = accounts.find(
          (account) => account.reqId === message.id
        );
        if (matchingAccount !== undefined) {
          wsSubsMeta.set(message.result, matchingAccount.address);
        }

        return;
      }

      if (message.method === "accountNotification") {
        // console.log(JSON.stringify(message, null, 4));

        const subId = message.params.subscription;

        const matchingSubMeta = wsSubsMeta.get(subId);

        if (matchingSubMeta !== undefined) {
          const accountData = Buffer.from(
            message.params.result.value.data[0],
            "base64"
          );
          const slot = message.params.result.context.slot;
          const lamports = message.params.result.value.lamports;

          const notification = {
            address: matchingSubMeta,
            balance: lamports,
            txSlot: slot,
          };

          console.table(notification);
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
    setTimeout(() => subscribeAccount(accounts), 5000);
  });
};

function subscribeToAccountsNotifications(
  ws: WebSocket,
  accounts: AccountMeta[]
) {
  let idx = 1;
  for (const account of accounts) {
    if (ws.readyState !== ws.OPEN) {
      console.log("warn", "Failed to subscribe to accounts notifications", {
        account: account.address,
        wsState: ws.readyState,
      });

      ws.close(1000, "Failed to subscribe to accounts notification");

      return;
    }

    const message = {
      jsonrpc: "2.0",
      id: idx * 1000,
      method: "accountSubscribe",
      params: [
        account.address,
        {
          encoding: "base64",
          commitment: "confirmed",
        },
      ],
    };

    sendRequest(ws, message);

    idx++;
    break;
  }
}

function sendRequest(ws: WebSocket, message: any) {
  if (ws.readyState !== ws.OPEN) {
    return;
  }

  ws.send(JSON.stringify(message), (err) => {
    if (err != null) {
      console.error("warn", `WS send error: ${err}`);
      ws.terminate();
    }
  });
}
