"use client";

import { useEffect, useState } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { getERC20Tokens } from "../services/blockchainService";
import { getChainName } from "@/utils/helper";

interface ERC20TokensProps {
  onTransferClick: (data: {
    tokenType: "ERC20";
    tokenAddress: string;
    tokenId?: string;
  }) => void;
}

export default function ERC20Tokens({ onTransferClick }: ERC20TokensProps) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [chainName, setChainName] = useState("eth-mainnet");
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (publicClient) {
      publicClient
        .getChainId()
        .then((chainId: number) => {
          const name = getChainName(chainId);
          setChainName(name);
          console.log("Detected chain ID:", chainId, "=>", name);
        })
        .catch((err) => {
          console.error("Error getting chain ID:", err);
        });
    }
  }, [publicClient]);

  useEffect(() => {
    if (address && chainName) {
      setLoading(true);
      getERC20Tokens(address, chainName)
        .then((tokenData) => {
          setTokens(tokenData);
          setError("");
        })
        .catch((err) => {
          console.error("Error fetching ERC20 tokens:", err);
          setError("Failed to fetch tokens.");
        })
        .finally(() => setLoading(false));
    }
  }, [address, chainName]);

  const filteredTokens = tokens.filter((token) =>
    token.contract_ticker_symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!mounted) return null;
  if (!address) {
    return (
      <div className="text-gray-300 p-4 rounded-lg bg-[#1a1425]">
        Please connect your wallet to see token balances.
      </div>
    );
  }

  if (loading){
    return <TableLoading />
  }
   

  if (error) return <div className="text-red-400">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-200 ml-2">ERC20 Tokens</h2>
        <div className="flex gap-2">
          <input
            type="search"
            placeholder="Search tokens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 bg-[#371d52] border-[#3d3450] text-gray-200 placeholder:text-gray-400 py-2 px-6 rounded-full"
          />
        </div>
      </div>

      <div className="rounded-lg overflow-hidden">
        <div className="grid grid-cols-4 gap-4 p-4 text-xl font-semibold text-gray-100">
          <div>Token</div>
          <div>Balance</div>
          <div>Address</div>
          <div className="text-right">Actions</div>
        </div>

        {filteredTokens.length === 0 ? (
          <div className="p-4 text-center text-gray-400">No ERC20 tokens found.</div>
        ) : (
          <div>
            {filteredTokens.map((token, index) => (
              <div
                key={index}
                className="grid grid-cols-4 gap-4 p-4 items-center hover:bg-[#2d2440] transition-colors border-2 border-[#371d52] my-2 rounded-full"
              >
                <div className="font-medium text-gray-200">{token.contract_ticker_symbol}</div>
                <div className="text-gray-300">{token.human_balance}</div>
                <div className="text-gray-400 text-sm truncate">{token.contract_address}</div>
                <div className="text-right">
                  <button
                    onClick={() =>
                      onTransferClick({
                        tokenType: "ERC20",
                        tokenAddress: token.contract_address,
                      })
                    }
                    className="bg-[#371d52] hover:bg-[#7c3aed] text-white rounded-full px-6 py-2"
                  >
                    Transfer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


const TableLoading = () => {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-gray-400 rounded"></div>
        <div className="h-8 w-32 bg-gray-400 rounded"></div>
      </div>
      <div className="rounded-lg overflow-hidden">
        <div className="grid grid-cols-4 gap-4 p-4">
          <div className="h-6 bg-gray-400 rounded"></div>
          <div className="h-6 bg-gray-400 rounded"></div>
          <div className="h-6 bg-gray-400 rounded"></div>
          <div className="h-6 bg-gray-400 rounded"></div>
        </div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-4 gap-4 p-4 items-center border-2 border-[#371d52] rounded-full"
            >
              <div className="h-6 w-24 bg-gray-400 rounded"></div>
              <div className="h-6 w-16 bg-gray-400 rounded"></div>
              <div className="h-6 w-full bg-gray-400 rounded"></div>
              <div className="h-6 w-20 bg-gray-400 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}