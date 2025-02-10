"use client";

import { useBalance, useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setAddress, setBalance } from "../store/slices/walletSlice";
import { formatEther } from "ethers";

export default function BalanceDisplay() {
  const { address } = useAccount();
  const { data, isError, isLoading } = useBalance({
    address: address ?? undefined,
  });
  const dispatch = useDispatch();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!address) return;
    if (mounted && data?.value) {
      try {
        const formattedBalance = formatEther(data.value);
        dispatch(setBalance(formattedBalance));
        dispatch(setAddress(address))
      } catch (error) {
        console.error("Error formatting balance:", error);
      }
    }
  }, [mounted, data, dispatch, address]);

  if (!mounted) return null;
  if (!address)
    return <div className="text-gray-400">Please connect your wallet.</div>;

  if (isLoading) return <BalanceDisplayLoading />;

  if (isError)
    return <div className="text-red-400">Error fetching balance</div>;

  let balanceDisplay = "0";
  try {
    balanceDisplay = data?.value ? formatEther(data.value) : "0";
  } catch (error) {
    console.error("Error formatting balance for display:", error);
  }

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-medium text-gray-300">Native Balance</h2>
      <div className="flex items-baseline space-x-2">
        <span className="text-3xl font-bold">{balanceDisplay}</span>
        <span className="text-gray-400">{data?.symbol || ""}</span>
      </div>
    </div>
  );
}

const BalanceDisplayLoading = () => {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="h-6 w-32 bg-gray-400 rounded"></div>
      <div className="flex items-baseline space-x-2">
        <div className="h-8 w-24 bg-gray-400 rounded"></div>
        <div className="h-6 w-12 bg-gray-400 rounded"></div>
      </div>
    </div>
  );
};
