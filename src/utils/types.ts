import { ParsedInstruction, PublicKey } from "@solana/web3.js";

// Define an enum for transaction types
export enum TransactionType {
  Jupiter = "Jupiter",
  Raydium = "Raydium",
  PumpFun = "Pump.fun",
  MoonShot = "Moonshot",
  Unknown = "Unknown",
}

export interface TransactionWithMeta {
  // meta: {
  //   logMessages?: string[] | null;
  //   innerInstructions?:
  //     | {
  //         index: number;
  //         instructions: (ParsedInstruction | PartialInstruction)[];
  //       }[]
  //     | null;
  // } | null;
  // transaction: {
  //   signatures: string[];
  //   message: {
  //     accountKeys: { pubkey: PublicKey }[];
  //     instructions: (ParsedInstruction | PartialInstruction)[];
  //   };
  // };
}

export interface TokenMetadata {
  address: string;
  name: string;
  symbol: string;
  description: string | null;
  decimals: number;
}

export type TokenHolderResult = {
  owner: string;
  amount: number;
};

export type ApiResponse = {
  result: {
    token_accounts: TokenHolderResult[];
  };
};

export interface AccountMeta {
  telId: string;
  reqId: number;
  address: string;
}
