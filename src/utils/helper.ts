// Helper to map chainId to the required chain name.
export function getChainName(chainId: number): string {
    switch (chainId) {
      case 1:
        return "eth-mainnet";
      case 137:
        return "137";
      default:
        return "eth-mainnet";
    }
  }