"use client";

import { useState } from "react";
import { useWalletClient } from "wagmi";
import { BrowserProvider } from "ethers";
import { transferERC20Token, transferNFT } from "../services/blockchainService";
import toast from "react-hot-toast";

interface TransferModalProps {
  tokenType: "ERC20" | "NFT";
  tokenAddress: string;
  tokenId?: string;
  onClose: () => void;
}

export default function TransferModal({
  tokenType,
  tokenAddress,
  tokenId,
  onClose,
}: TransferModalProps) {
  const { data: walletClient } = useWalletClient();
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!walletClient) {
    return <div>Please connect your wallet to initiate a transfer.</div>;
  }

  const provider = new BrowserProvider(window.ethereum);

  const handleTransfer = async () => {
    setLoading(true);
    setError("");
    try {
      if (tokenType === "ERC20") {
        await transferERC20Token(provider, tokenAddress, toAddress, amount);
      } else if (tokenType === "NFT" && tokenId) {
        await transferNFT(provider, tokenAddress, toAddress, tokenId);
      }
      toast.success("Transfer successful!");
      onClose();
    } catch (err: any) {
      console.error("Transfer error caught:", err);

      const isUserRejected =
        err?.code === 4001 ||
        err?.code === "ACTION_REJECTED" ||
        (err?.info && err?.info?.error?.code === 4001);

      let rawMessage = err?.message || "Unknown error";

      if (rawMessage.toLowerCase().includes("invalid ens name")) {
        rawMessage = "Invalid ENS name provided.";
      }

      if (rawMessage.length > 150) {
        rawMessage = rawMessage.substring(0, 150) + "...";
      }

      const errorMessage = isUserRejected
        ? "Transaction cancelled by user."
        : `Transfer failed: ${rawMessage}`;

      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-[#231c31] rounded-xl p-6 w-full max-w-md space-y-4">
        <h3 className="text-xl font-bold">Transfer {tokenType}</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Recipient Address
            </label>
            <input
              type="text"
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              className="w-full px-4 py-2 bg-[#2d2440] rounded-lg border border-[#3d3450] focus:outline-none focus:border-[#6d28d9]"
            />
          </div>

          {tokenType === "ERC20" && (
            <div>
              <label className="block text-sm text-gray-400 mb-1">Amount</label>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2 bg-[#2d2440] rounded-lg border border-[#3d3450] focus:outline-none focus:border-[#6d28d9]"
              />
            </div>
          )}
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex space-x-3">
          <button
            onClick={handleTransfer}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-[#6d28d9] hover:bg-[#7c3aed] rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Transferring..." : "Transfer"}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#2d2440] hover:bg-[#3d3450] rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
