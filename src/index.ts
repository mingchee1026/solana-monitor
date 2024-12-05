import { subscribeTransaction } from "./subscribe-transaction";
import { subscribeAccount } from "./subscribe-account";
import {
  JUPITER_PROGRAM_ID,
  RAYDIUM_PROGRAM_ID,
  PUMP_FUN_MINT_AUTHORITY,
  PUMP_FUN_PROGRAM_ID,
  MOONSHOT_MINT_AUTHORITY,
  MOONSHOT_PROGRAM_ID,
} from "./config";

subscribeTransaction([
  // RAYDIUM_PROGRAM_ID,
  // JUPITER_PROGRAM_ID,
  // PUMP_FUN_MINT_AUTHORITY,
  // PUMP_FUN_PROGRAM_ID,
  MOONSHOT_MINT_AUTHORITY,
  // MOONSHOT_PROGRAM_ID,
  //  "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1",
  //  "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc",
  //  "LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo",
  //  "FLUXubRmkEi2q6K3Y9kBPg9248ggaZVsoSFhtJHSrm1X",
  //  "DSwpgjMvXhtGn6BsbqmacdBZyfLj6jSWf3HJpdJtmg6N",
  //  "GpMZbSM2GgvTKHJirzeGfMFoaZ8UR2X7F4v8vHTvxFbL",
]);
