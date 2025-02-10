"use client";

import React, { useState } from "react";
import { Home, Link2, ExternalLink, Menu, X } from "lucide-react";

const NavItem = ({
  icon: Icon,
  label,
  href = "#",
  external = false,
}: {
  icon: React.ElementType;
  label: string;
  href?: string;
  external?: boolean;
}) => (
  <a
    href={href}
    className="flex items-center space-x-3 p-3 rounded-lg text-white/90 hover:bg-[#2d2440] transition-colors group"
  >
    <Icon className="h-4 w-4" />
    <span className="text-sm">{label}</span>
    {external && (
      <ExternalLink className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
    )}
  </a>
);

const NavSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1">
    <h2 className="text-xs font-medium text-white/50 px-3 uppercase tracking-wider">
      {title}
    </h2>
    <nav className="space-y-1">{children}</nav>
  </div>
);

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  // Toggle sidebar open/closed on mobile
  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Hamburger menu button: visible only on mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[#371c51] "
        onClick={toggleSidebar}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <Menu className="h-6 w-6 text-white" />
        )}
      </button>

      {/* Mobile overlay: appears when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar container */}
      <div
        className={`
          h-full fixed inset-y-0 left-0 z-50 w-64 
          transform transition-transform duration-200 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:sticky md:top-0
        `}
      >
        <div className="w-64 min-h-screen bg-[#29153d] flex flex-col overflow-y-auto">
          <div className="px-6 mb-10 bg-[#371c51] py-8 text-center">
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold text-white">Dione Portal</p>
            </div>
          </div>

          <div className="px-3 space-y-6 flex-1 py-6">
            <NavSection title="Main">
              <NavItem icon={Home} label="Dashboard" href="/" />
            </NavSection>

            <NavSection title="Odyssey Dapps">
              <NavItem icon={Link2} label="Bridge Contract" href="/bridge" />
            </NavSection>
          </div>
        </div>
      </div>
    </>
  );
}
