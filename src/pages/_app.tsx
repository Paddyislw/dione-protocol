import type { AppProps } from "next/app";
import { Provider as ReduxProvider } from "react-redux";
import "@rainbow-me/rainbowkit/styles.css";
import { WagmiProvider } from "wagmi";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { mainnet, polygon } from "wagmi/chains";
import { store } from "@/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "../../global.css";
import Layout from "@/components/Layout";
import { Toaster } from "react-hot-toast";

export const wagmiConfig = getDefaultConfig({
  appName: "dione-protocol",
  projectId: "84ff4887b4379061c27ab8c3bce7a26e",
  chains: [mainnet, polygon],
  appIcon:
    "https://framerusercontent.com/images/gDMi7BZPVixqZAjVMq5AjARmSM.png",
  ssr: false,
});

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ReduxProvider store={store}>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider modalSize="compact">
              <Toaster position="top-right" />
              <Layout>
                <Component {...pageProps} />
              </Layout>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ReduxProvider>
  );
}

export default MyApp;
