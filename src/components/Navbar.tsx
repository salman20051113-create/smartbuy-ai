import React from 'react';
import { ShoppingBag, Sparkles, Scale, ShieldCheck, Database } from 'lucide-react';
import { Product } from '../types';

interface NavbarProps {
  compareProducts: Product[];
  onOpenCompare: () => void;
  onOpenChat: () => void;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  compareProducts,
  onOpenCompare,
  onOpenChat,
  isDemoMode,
  onToggleDemoMode,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 via-amber-500 to-indigo-600 flex items-center justify-center shadow-md shadow-orange-500/20">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-white">SmartBuy AI</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                India 🇮🇳
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">AI Shopping Assistant & Price Intelligence</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Demo Mode Toggle Indicator */}
          <button
            onClick={onToggleDemoMode}
            id="toggle-demo-mode-btn"
            title="Toggle between Live Gemini AI and Verified Indian Sample Catalog"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isDemoMode
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
            }`}
          >
            {isDemoMode ? (
              <>
                <Database className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="hidden md:inline">Catalog Mode:</span>
                <span className="font-bold">Demo Data</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline">Engine:</span>
                <span className="font-bold">Gemini AI</span>
              </>
            )}
          </button>

          {/* Compare Button with counter */}
          <button
            onClick={onOpenCompare}
            id="navbar-compare-btn"
            className={`relative flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium border transition-all ${
              compareProducts.length > 0
                ? 'bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-500 shadow-md shadow-indigo-600/30'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span className="hidden sm:inline">Compare</span>
            {compareProducts.length > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-indigo-900 bg-amber-300 rounded-full">
                {compareProducts.length}/3
              </span>
            )}
          </button>

          {/* Ask AI Assistant Button */}
          <button
            onClick={onOpenChat}
            id="navbar-ai-assistant-btn"
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-semibold hover:opacity-95 shadow-md shadow-orange-500/20 transition-transform active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Ask AI</span>
          </button>
        </div>
      </div>
    </header>
  );
};
