import { Connection, PublicKey } from "@solana/web3.js";
import { TokenHolderResult, ApiResponse } from "./types";
import { Metadata, PROGRAM_ID as MPL_ID } from '@metaplex-foundation/mpl-token-metadata';
import { utf8 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { MintLayout } from "@solana/spl-token";
import { TokenMetadata } from "./types";

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function calcNonDecimalValue(value: number, decimals: number): number {
  return Math.trunc(value * Math.pow(10, decimals));
}

export function calcDecimalValue(value: number, decimals: number): number {
  return value / Math.pow(10, decimals);
}

export async function getTokenHolders(tokenAddress: string) {
    // Pagination logic
    let page = 1;
       // allOwners will store all the addresses that hold the token
    const allOwners: TokenHolderResult[] = [];
  
    await sleep(1000);
    while (true) {
      const response = await fetch(process.env.RPC_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "getTokenAccounts",
          id: "helius-test",
          params: {
            page: page,
            limit: 1000,
            displayOptions: {},
                      //mint address for the token we are interested in
            mint: tokenAddress,
          },
        }),
      });
      const data = await response.json() as ApiResponse;
        // Pagination logic. 
      if (!data.result || data.result.token_accounts.length === 0) {
        // console.log(`No more results. Total pages: ${page - 1}`);
        break;
      }
      // console.log(`Processing results from page ${page}`);
           // Adding unique owners to a list of token owners. 
      data.result.token_accounts.forEach((account) => {
        // console.log({account});
        const info: TokenHolderResult = {
          owner: account.owner,
          amount: account.amount,
        };
        allOwners.push(info);
      });
      page++;
    }
    // console.log(allOwners);
    return allOwners;
    
  };

function getMetadataAccount(tokenAddress: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [utf8.encode('metadata'), MPL_ID.toBuffer(), tokenAddress.toBuffer()],
    MPL_ID
  )[0];
}

async function getSPLInfo(connection: Connection, mint: PublicKey | string) {
  try {
    if (typeof mint == 'string') mint = new PublicKey(mint);
    const metadataAccount = getMetadataAccount(mint);
    let accountInfoes = await connection.getMultipleAccountsInfo([
      mint,
      metadataAccount,
    ]);
    for (let i = 0; i < 10; i++) {
      if (accountInfoes[0]) break;
      await sleep(1000);
      accountInfoes = await connection.getMultipleAccountsInfo([
        mint,
        metadataAccount,
      ]);
    }
    if (!accountInfoes[0]) throw 'token not found';
    const tokenInfo = MintLayout.decode(
      Uint8Array.from(accountInfoes[0].data)
    );
    let metadata: Metadata | null = null;
    if (accountInfoes[1])
      metadata = Metadata.deserialize(accountInfoes[1].data)[0];
    const name = metadata?.data.name.split('\0')[0] ?? '';
    const symbol = metadata?.data.symbol.split('\0')[0] ?? '';
    const uri = metadata?.data.uri.split('\0')[0] ?? '';
    return {
      address: mint,
      mintInfo: tokenInfo,
      name,
      symbol,
      uri,
      metadata,
    };
  } catch (mplGetTokenInfoError) {
    console.log({ mplGetTokenInfoError });
    return null;
  }
}

export async function getTokenInfo(
  connection: Connection,
  mint: string | PublicKey
) : Promise<TokenMetadata | null> {
  try {
    const info = await getSPLInfo(connection, mint)
                      .catch((innerGetTokenInfoError) => {
                        console.log({ innerGetTokenInfoError });
                        return null;
                      });
    if (!info) return null;
    const { address, mintInfo, name, symbol, uri, metadata } = info;
    const decimals = mintInfo.decimals;
    let description = '';
    let jsonMetadata = null;
    try {
      jsonMetadata = await (await fetch(uri).catch(() => null))
        ?.json()
        .catch(() => null);
      description = jsonMetadata?.description;
      return {
        address,
        name,
        symbol,
        description,
        decimals,
      }
    } catch (fetchJsonMetadataError) {
      console.log({ fetchJsonMetadataError });
      return null;
    }
  } catch(fetchTokenMetadataError) {
    console.log({fetchTokenMetadataError});
    return null;
  }
}