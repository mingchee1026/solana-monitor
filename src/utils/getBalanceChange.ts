import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import axios from "axios";

export async function getBalanceChange(
  signature: string,
  connection: Connection,
  transactionResponse: any
) {
  const solBalancesChange = await getSolBalanceChange(transactionResponse);
  const tokenBalancesChange = await getTokenBalanceChange(transactionResponse);
  const balancesChange = [...solBalancesChange, ...tokenBalancesChange];

  // console.table(balancesChange);

  axios
    .post(`${process.env.SNIPER_API_URL}/api/v1/wallet/update`, {
      balancesChange,
    })
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });
}

export async function getSolBalanceChange(transactionResponse: any) {
  const solBalancesChange = [];

  const accountKeys = transactionResponse.transaction.message.accountKeys;
  const preBalances = transactionResponse.meta.preBalances;
  const postBalances = transactionResponse.meta.postBalances;

  let index = 0;
  for (const account of accountKeys) {
    const preBalance = preBalances[index];
    const postBalance = postBalances[index];
    const changed = postBalances[index] - preBalances[index];

    solBalancesChange.push({
      ownerAddress: account.pubkey,
      tokenAccountAddress: account.pubkey,
      contractAddress: "So11111111111111111111111111111111111111112",
      balance: postBalance,
      // balanceBefore: (Number(preBalance) / LAMPORTS_PER_SOL).toFixed(9),
      // balanceAfter: (Number(postBalance) / LAMPORTS_PER_SOL).toFixed(9),
      // changedSOL: (Number(changed) / LAMPORTS_PER_SOL).toFixed(9),
    });

    index++;
  }

  return solBalancesChange;
}

export async function getTokenBalanceChange(transactionResponse: any) {
  const tokenBalancesChange = [];

  const accountKeys = transactionResponse.transaction.message.accountKeys;
  const preTokenBalances = transactionResponse.meta.preTokenBalances;
  const postTokenBalances = transactionResponse.meta.postTokenBalances;

  let index = 0;
  let accountIndex, account;
  for (const postTokenBalance of postTokenBalances) {
    accountIndex = postTokenBalance.accountIndex;
    account = accountKeys[accountIndex].pubkey;

    tokenBalancesChange.push({
      ownerAddress: postTokenBalance.owner,
      tokenAccountAddress: account,
      contractAddress: postTokenBalance.mint,
      balance: postTokenBalance.uiTokenAmount.uiAmount,
    });

    index++;
  }

  return tokenBalancesChange;
}
