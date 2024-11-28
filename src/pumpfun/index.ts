import {
    Connection,
    PublicKey,
    ParsedTransactionWithMeta,
    VersionedTransactionResponse,
    ParsedInstruction,
    PartiallyDecodedInstruction,
    TransactionInstruction,
  } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { PUMP_FUN_MINT_AUTHORITY, PUMP_FUN_PROGRAM_ID } from "../config";
import { TokenHolderResult, ApiResponse } from "../utils/types";
import { web3 } from "@coral-xyz/anchor";
import { getTokenHolders } from "../utils";

const TOTAL_SUPPLY = 1000_000_000 * (10 ** 6);

export async function extractPumpFunTransaction(
    signature: string,
    connection: Connection,
    tx: any,
    blockTime?: number
  ) {
    if(isTokenLaunch(tx)) {
        const {signer, token} = getMintToken(tx);
        // console.log({signer, token});
        const holders = await getTokenHolders(token);
        // console.log({ holders });
        const result = await pumpInfo(connection, signer, holders, token);
      return result;
    }  
  }

function isTokenLaunch(tx: any): boolean {
    const hasMintAuthority = tx.transaction.message.instructions.some(instruction =>
        instruction.accounts && instruction.accounts.includes(PUMP_FUN_MINT_AUTHORITY)
    )
    return hasMintAuthority;
}

function getMintToken(tx) {
    const data = tx.transaction.message.instructions.find(instruction =>
        instruction.program === "spl-associated-token-account" );
    
    const signer = data?.parsed?.info?.source;
    const token = data?.parsed?.info.mint;
    // console.log(data?.parsed?.info);
    return {
      signer,
      token,
    };
  }

const pumpInfo = async(connection: Connection, creator: string, allOwners: TokenHolderResult[], token: string) => {
  let firstBuying = 0;
  let devBuying = 0;
  let creatorSolBalance = 0;

	const [bondingCurve] = PublicKey.findProgramAddressSync([Buffer.from("bonding-curve"), new PublicKey(token).toBytes()], new PublicKey(PUMP_FUN_PROGRAM_ID));
	
  creatorSolBalance = await connection.getBalance(new PublicKey(creator));
  creatorSolBalance /= web3.LAMPORTS_PER_SOL;

  allOwners.forEach(async (owner) => {
    if (owner.owner !== bondingCurve.toBase58()){
      firstBuying += owner.amount/TOTAL_SUPPLY * 100;
    }
    if (owner.owner === creator) {
      devBuying = owner.amount/TOTAL_SUPPLY * 100;
    }
  });
  const transactionNumbers = (await connection.getSignaturesForAddress(new PublicKey(creator))).length;
  const FirstBuy = firstBuying.toFixed(2).toString() + ' %';
  const DevFirstBuy = devBuying.toFixed(2).toString() + ' %';
  const DevSolBalance = creatorSolBalance.toFixed(2).toString() + ' SOL';
  return { token, creator, FirstBuy, DevFirstBuy, DevSolBalance, transactionNumbers };
}