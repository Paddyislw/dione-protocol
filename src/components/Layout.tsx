import React from "react";
import Head from "next/head";
import Sidebar from "@/components/Sidebar";
import WalletConnect from "./WalletConnect";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#1a1424] text-white flex">
      <Head>
        <title>Dione protocol</title>
      </Head>
      <Sidebar />
      <main className="flex-1">
        <div className="flex justify-end bg-[#29153d] h-[100px] items-center px-4">
          <WalletConnect />
        </div>
        <div>{children}</div>
      </main>
    </div>
  );
};

export default Layout;
