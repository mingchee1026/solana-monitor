import { WebSocket } from "ws";
import dotenv from "dotenv";

dotenv.config();

export const subscribeAccount = async (accounts: string[]) => {
  let ws = new WebSocket(process.env.RPC_WEBSOCKET_ENDPOINT);

  //   cron.schedule("*/10 * * * * *", async () => {
  //     console.log("Running a task every 5 seconds --- updating tokens");
  //   });

  //   solPrice = await readSolPrice();

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

      /*
      if (message.result !== undefined) {
        const matchingAccount = this._accountsMeta.find(
          (a) => a.reqId === message.id
        );
        if (matchingAccount !== undefined) {
          this._wsSubsMeta.set(message.result, matchingAccount.name);
        }

        return;
      }
        */

      if (message.method === "accountNotification") {
        console.log(JSON.stringify(message, null, 4));

        const subId = message.params.subscription;

        const accountData = Buffer.from(
          message.params.result.value.data[0],
          "base64"
        );
        const slot = message.params.result.context.slot;
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

function subscribeToAccountsNotifications(ws: WebSocket, accounts: any) {
  let idx = 1;
  for (const account of accounts) {
    if (ws.readyState !== ws.OPEN) {
      console.log("warn", "Failed to subscribe to accounts notifications", {
        account,
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
        account,
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
  console.log(message);
  ws.send(JSON.stringify(message), (err) => {
    if (err != null) {
      console.log("warn", `WS send error: ${err}`);
      ws.terminate();
    }
  });
}
