import React from 'react';
import { Sparkles, TrendingUp, Wallet, CheckCircle, Database, Tag, Target, SlidersHorizontal, Layers, IndianRupee } from 'lucide-react';
import { RecommendationResponse } from '../types';

interface AIBannerProps {
  data: RecommendationResponse;
}

export const AIBanner: React.FC<AIBannerProps> = ({ data }) => {
  const intent = data.extractedIntent;

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 rounded-2xl border border-indigo-500/30 p-5 sm:p-6 mb-8 text-white shadow-xl space-y-5">
      {/* Header with Title & Engine Mode */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
            <Sparkles className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center space-x-2">
              <span>SmartBuy AI Natural Language Analysis</span>
            </h2>
            <p className="text-xs text-slate-400">Deep intent extraction & personalized Indian market recommendations</p>
          </div>
        </div>

        {data.isDemoMode ? (
          <div className="inline-flex items-center space-x-1.5 text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-lg">
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span>Demo Mode — Demo product data</span>
          </div>
        ) : (
          <div className="inline-flex items-center space-x-1.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-lg">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Gemini AI Live Analysis</span>
          </div>
        )}
      </div>

      {/* Extracted Intent Grid */}
      {intent && (
        <div className="bg-slate-950/70 rounded-xl p-4 border border-slate-800 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center space-x-1.5">
            <Target className="w-3.5 h-3.5 text-orange-400" />
            <span>Extracted Intent & Requirements from Your Prompt:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            {/* 1. Category */}
            <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 font-medium flex items-center space-x-1 mb-1 text-[11px] uppercase tracking-wider">
                <Layers className="w-3 h-3 text-indigo-400" />
                <span>Product / Category</span>
              </span>
              <p className="font-bold text-white truncate" title={intent.productOrCategory}>
                {intent.productOrCategory || 'General Tech'}
              </p>
            </div>

            {/* 2. Maximum Budget */}
            <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 font-medium flex items-center space-x-1 mb-1 text-[11px] uppercase tracking-wider">
                <IndianRupee className="w-3 h-3 text-emerald-400" />
                <span>Max Budget</span>
              </span>
              <p className="font-bold text-emerald-400">
                {intent.maxBudget || 'Flexible / Open'}
              </p>
            </div>

            {/* 3. Preferred Brand */}
            <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 font-medium flex items-center space-x-1 mb-1 text-[11px] uppercase tracking-wider">
                <Tag className="w-3 h-3 text-sky-400" />
                <span>Preferred Brand</span>
              </span>
              <p className="font-bold text-sky-300 truncate" title={intent.preferredBrand || 'Any trusted brand'}>
                {intent.preferredBrand || 'Any trusted brand'}
              </p>
            </div>

            {/* 4. Important Requirements */}
            <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 sm:col-span-2 lg:col-span-1">
              <span className="text-slate-400 font-medium flex items-center space-x-1 mb-1 text-[11px] uppercase tracking-wider">
                <SlidersHorizontal className="w-3 h-3 text-amber-400" />
                <span>Key Requirements</span>
              </span>
              <ul className="text-slate-300 space-y-0.5 list-disc list-inside">
                {(intent.importantRequirements || ['Reliable specs', 'Official warranty']).slice(0, 2).map((req, i) => (
                  <li key={i} className="truncate" title={req}>
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            {/* 5. Priorities */}
            <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 sm:col-span-2 lg:col-span-1">
              <span className="text-slate-400 font-medium flex items-center space-x-1 mb-1 text-[11px] uppercase tracking-wider">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                <span>Top Priorities</span>
              </span>
              <div className="flex flex-wrap gap-1">
                {(intent.priorities || ['Value for Money', 'Reliability']).map((prio, i) => (
                  <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 text-[10px] border border-slate-700">
                    {prio}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Market Summary & Insights */}
      <div className="space-y-3">
        <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
          {data.summary}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-start space-x-2.5 text-xs text-slate-300 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <TrendingUp className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-sky-300 block mb-0.5">Market Analysis:</span>
              <span className="leading-relaxed">{data.marketAnalysis}</span>
            </div>
          </div>

          <div className="flex items-start space-x-2.5 text-xs text-slate-300 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <Wallet className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-emerald-300 block mb-0.5">Budget Fit:</span>
              <span className="leading-relaxed">{data.budgetInsight}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

