import React, { useEffect, useState } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { getNFTs } from "../services/blockchainService";
import { getChainName } from "@/utils/helper";

interface NFTDisplayProps {
  onTransferClick: (data: {
    tokenType: "NFT";
    tokenAddress: string;
    tokenId?: string;
  }) => void;
}

export default function NFTDisplay({ onTransferClick }: NFTDisplayProps) {
  const { address } = useAccount();
  const publicClient = usePublicClient();

  const [chainName, setChainName] = useState("eth-mainnet");
  const [nfts, setNfts] = useState<any[]>([]);
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
      getNFTs(address, chainName)
        .then((nftData) => {
          setNfts(nftData);
          setError("");
        })
        .catch((err) => {
          console.error("Error fetching NFTs:", err);
          setError("Failed to fetch NFTs.");
        })
        .finally(() => setLoading(false));
    }
  }, [address, chainName]);

  if (!mounted) return null;
  if (!address) {
    return <div>Please connect your wallet to see NFT holdings.</div>;
  }

  if (loading)
    return <NFTLoading />

  if (error) return <div>{error}</div>;
  if (nfts.length === 0) return <div>No NFTs found.</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-gray-300">NFT Holdings</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {nfts.map((nft, index) => {
          const tokenId =
            nft.nft_data && nft.nft_data[0]?.token_id
              ? nft.nft_data[0].token_id
              : "N/A";

          return (
            <div
              key={index}
              className="p-4 bg-[#29153d] rounded-xl space-y-3"
            >
              <div className="aspect-square bg-[#1a1424] rounded-lg"></div>
              <div>
                <h3 className="font-medium">
                  {nft.contract_name || "NFT"}
                </h3>
                <p className="text-sm text-gray-400">
                  Token ID: {tokenId}
                </p>
              </div>
              <button
                onClick={() =>
                  onTransferClick({
                    tokenType: "NFT",
                    tokenAddress: nft.contract_address,
                    tokenId: tokenId !== "N/A" ? tokenId : undefined,
                  })
                }
                className="w-full px-4 py-3 bg-[#371d52] hover:bg-[#7c3aed] transition-colors rounded-full"
              >
                Transfer NFT
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}


const NFTLoading  = () => {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-6 w-40 bg-gray-400 rounded"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="p-4 bg-[#29153d] rounded-xl space-y-3"
          >
            <div className="aspect-square bg-[#1a1424] rounded-lg"></div>
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-400 rounded"></div>
              <div className="h-4 w-24 bg-gray-400 rounded"></div>
            </div>
            <div className="h-10 w-full bg-[#371d52] rounded-full"></div>
          </div>
        ))}
      </div>
    </div>
  );
}