"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import contractABI from "@/abi/Bridge.json";
import { ChevronDown, ChevronUp } from "lucide-react";

interface DecodedEvent {
  type: string;
  transactionHash: string;
  blockNumber: number;
  args: any;
  timestamp: Date | null;
  rawEvent: any;
}

const ContractEvents: React.FC = () => {
  const [events, setEvents] = useState<DecodedEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [startBlock, setStartBlock] = useState<number>(0);
  const [endBlock, setEndBlock] = useState<number>(0);
  const [expandedEvents, setExpandedEvents] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const rpcUrl = process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL;
        if (!rpcUrl) {
          throw new Error("Missing RPC URL");
        }

        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const contractAddress = "0xaa9Ac8eEfC41986F81a1f24BBaF4427C05Bded6B";
        const contract = new ethers.Contract(contractAddress, contractABI, provider);

        const deploymentTxHash =
          "0xf24df3f94a4ef0db84d6ccc73cc444825a7203fbece7a3a1effdc60747f6731f";
        const txResponse = await provider.getTransaction(deploymentTxHash);
        const initialBlock: number = txResponse?.blockNumber ?? 0;
        setStartBlock(initialBlock);

        const latestBlock = await provider.getBlockNumber();
        setEndBlock(latestBlock);

        console.log("Fetching logs from block", initialBlock, "to", latestBlock);

        const filter = { address: contractAddress, fromBlock: initialBlock, toBlock: latestBlock };
        const logs = await provider.getLogs(filter);
        const decodedEventsArray = logs.map((log): DecodedEvent | null => {
          try {
            const parsed = contract.interface.parseLog(log)!;
            return {
              type: parsed.name,
              transactionHash: log.transactionHash,
              blockNumber: log.blockNumber,
              args: parsed.args,
              timestamp: null as Date | null,
              rawEvent: log,
            };
          } catch (error) {
            console.log("Error in decodedEventsArray", error);
            return null;
          }
        });
        
        const decodedEvents = decodedEventsArray.filter(
          (event): event is DecodedEvent => event !== null
        );

        const eventsWithTimestamps = await Promise.all(
          decodedEvents.map(async (event) => {
            const block = await provider.getBlock(event.blockNumber);
            return {
              ...event,
              timestamp: block ? new Date(Number(block.timestamp) * 1000) : null,
            };
          })
        );

        eventsWithTimestamps.sort((a, b) => a.blockNumber - b.blockNumber);

        setEvents(eventsWithTimestamps);
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching events:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const formatDate = (date: Date | null): string => (date ? date.toLocaleString() : "Unknown");
  const formatAddress = (address: string): string =>
    address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Unknown";

  const toggleExpand = (key: string): void => {
    setExpandedEvents((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-[#211131] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Contract Events</h2>
          {!loading && (
            <div className="px-4 py-2 bg-[#231c31] rounded-lg text-sm text-gray-400">
              Blocks {startBlock} to {endBlock}
            </div>
          )}
        </div>

        {loading ? (
          <div className="bg-[#231c31] rounded-xl p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-[#6d28d9] border-r-2 border-b-2 border-transparent mb-4"></div>
            <p className="text-gray-400">Loading events...</p>
          </div>
        ) : error ? (
          <div className="bg-[#231c31] rounded-xl p-8">
            <div className="text-red-400 font-semibold">Error: {error}</div>
            <div className="mt-2 text-sm text-gray-400">
              Please check your RPC URL and network connection.
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-[#231c31] rounded-xl p-8 text-gray-400">
            No events found for this contract
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event, index) => {
              const key = `${event.transactionHash}-${index}`;
              return (
                <div
                  key={key}
                  className="bg-[#29153d] rounded-xl p-6 hover:bg-[#2d2440] transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <span className="px-3 py-1 rounded-lg text-sm bg-[#6d28d9] text-white font-medium">
                      {event.type}
                    </span>
                    <button
                      onClick={() => toggleExpand(key)}
                      className="text-sm text-[#a78bfa] hover:text-[#c4b5fd] transition-colors"
                    >
                      {expandedEvents[key] ? <ChevronUp /> : <ChevronDown />}
                    </button>
                  </div>

                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-gray-400">
                      <span className="text-gray-500">Block:</span> {event.blockNumber}
                    </p>
                    <p className="text-sm text-gray-400">
                      <span className="text-gray-500">Tx:</span>{" "}
                      <a
                        href={`https://etherscan.io/tx/${event.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#a78bfa] hover:text-[#c4b5fd] transition-colors"
                      >
                        {formatAddress(event.transactionHash)}
                      </a>
                    </p>
                    <p className="text-sm text-gray-400">
                      <span className="text-gray-500">Timestamp:</span>{" "}
                      {formatDate(event.timestamp)}
                    </p>
                    <div className="text-sm space-y-1 mt-4">
                      {event.args &&
                        Object.keys(event.args)
                          .filter((key) => isNaN(Number(key)))
                          .map((argKey, idx) => (
                            <p key={idx} className="flex items-start">
                              <span className="text-gray-500 min-w-[100px]">{argKey}:</span>
                              <span className="text-gray-300 break-all">
                                {event.args[argKey].toString()}
                              </span>
                            </p>
                          ))}
                    </div>
                  </div>

                  {expandedEvents[key] && (
                    <div className="mt-6 p-4 bg-[#2d2440] rounded-lg">
                      <h4 className="text-sm font-medium mb-2 text-gray-300">Full Event Data:</h4>
                      <pre className="text-xs overflow-auto text-gray-400 p-4 bg-[#1a1424] rounded-lg">
                        {JSON.stringify(event.rawEvent, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractEvents;
