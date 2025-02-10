"use client"

import { useState } from "react"

import BalanceDisplay from "../components/BalanceDisplay"
import ERC20Tokens from "../components/ERC20Tokens"
import NFTDisplay from "../components/NFTDisplay"
import TransferModal from "../components/TransferModal"

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false)
  const [transferData, setTransferData] = useState<{
    tokenType: "ERC20" | "NFT"
    tokenAddress: string
    tokenId?: string
  } | null>(null)

  const handleTransferClick = (data: {
    tokenType: "ERC20" | "NFT"
    tokenAddress: string
    tokenId?: string
  }) => {
    setTransferData(data)
    setModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-[#211131] text-white">
      <div className="flex">
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col gap-6">
              <div className="bg-[#29153d] p-6 rounded-xl">
                <BalanceDisplay />
              </div>
              <div className="rounded-xl">
                <ERC20Tokens onTransferClick={handleTransferClick} />
              </div>
            </div>
            <div className="p-6 rounded-xl">
              <NFTDisplay onTransferClick={handleTransferClick} />
            </div>
          </div>
        </div>
      </div>

      {modalOpen && transferData && (
        <TransferModal
          tokenType={transferData.tokenType}
          tokenAddress={transferData.tokenAddress}
          tokenId={transferData.tokenId}
          onClose={() => {
            setModalOpen(false)
            setTransferData(null)
          }}
        />
      )}
    </div>
  )
}

