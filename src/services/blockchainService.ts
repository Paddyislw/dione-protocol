import { Chain, GoldRushClient } from "@covalenthq/client-sdk";
import { ethers, BrowserProvider, parseUnits, formatUnits } from "ethers";
import { erc20Abi, erc721Abi } from "viem";

const apiKey = process.env.NEXT_PUBLIC_GOLDRUSH_API_KEY;
if (!apiKey) {
  throw new Error("GoldRush API key is missing");
}

const client = new GoldRushClient(apiKey);

/**
 * Fetch ERC20 token balances for a given wallet address using the GoldRush SDK.
 */
export async function getERC20Tokens(
  walletAddress: string,
  chainName: string
): Promise<any[]> {
  try {
    const resp = await client.BalanceService.getTokenBalancesForWalletAddress(
      chainName as unknown as Chain,
      walletAddress
    );
    console.log("Token balances response:", resp.data);

    if (!resp.data) {
      console.warn("No data received from the API.");
      return []; 
    }

    const items = resp.data.items || [];

    const tokens = items
      .filter(
        (item: any) =>
          Array.isArray(item.supports_erc) &&
          item.supports_erc.includes("erc20")
      )
      .map((token: any) => {
        try {
          token.human_balance = formatUnits(
            token.balance,
            token.contract_decimals
          );
        } catch (e) {
          console.error("Error formatting token balance:", e);
          token.human_balance = token.balance;
        }
        return token;
      });

    return tokens;
  } catch (error) {
    console.error("Error fetching ERC20 tokens:", error);
    throw error;
  }
}
/**
 * Fetch NFT holdings for a given wallet address using the GoldRush SDK.
 */
export async function getNFTs(
  walletAddress: string,
  chainName: string
): Promise<any[]> {
  try {
    const resp = await client.NftService.getNftsForAddress(
      chainName as unknown as Chain,
      walletAddress
    );
    console.log("NFTs response:", resp.data);
    if (!resp.data) {
      console.warn("No data received for NFTs.");
      return [];
    }
    return resp.data.items || [];
  } catch (error) {
    console.error("Error fetching NFTs:", error);
    throw error;
  }
}


/**
 * Transfer ERC20 tokens.
 */
export async function transferERC20Token(
  provider: BrowserProvider,
  tokenAddress: string,
  to: string,
  amount: string
): Promise<any> {
  const signer = await provider.getSigner();
  const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, signer);

  const decimals: number = await tokenContract.decimals();

  const parsedAmount: bigint = parseUnits(amount, decimals);
  const senderAddress = await signer.getAddress();
  const balance: bigint = await tokenContract.balanceOf(senderAddress);

  console.log("Sender balance:", balance.toString());
  console.log("Transfer amount (base units):", parsedAmount.toString());

  if (parsedAmount > balance) {
    throw new Error("Insufficient token balance for transfer");
  }

  const tx = await tokenContract.transfer(to, parsedAmount);
  await tx.wait();
  return tx;
}

/**
 * Transfer an NFT (ERC721).
 */
export async function transferNFT(
  provider: BrowserProvider,
  nftAddress: string,
  to: string,
  tokenId: string
): Promise<any> {
  const signer = await provider.getSigner();
  const nftContract = new ethers.Contract(nftAddress, erc721Abi, signer);
  const fromAddress = await signer.getAddress();
  
  const tx = await nftContract["safeTransferFrom(address,address,uint256)"](
    fromAddress,
    to,
    tokenId
  );
  await tx.wait();
  return tx;
}

