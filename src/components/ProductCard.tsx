import React, { useState } from 'react';
import { Star, Check, AlertTriangle, ExternalLink, Scale, CheckCircle, Sparkles, ChevronRight, ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { formatINR, formatCompactNumber } from '../utils/formatters';

interface ProductCardProps {
  product: Product;
  rank?: number;
  isCompared: boolean;
  isDemoMode?: boolean;
  onToggleCompare: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  rank,
  isCompared,
  isDemoMode,
  onToggleCompare,
  onViewDetails,
}) => {
  const [imageError, setImageError] = useState(false);

  // Score color helper
  const getScoreBadgeClass = (score: number) => {
    if (score >= 9.0) return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    if (score >= 8.0) return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
    return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
  };

  const fallbackImage = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80';

  const rankBadgeText = rank === 1 ? '#1 Top Pick' : rank === 2 ? '#2 Alternative' : rank === 3 ? '#3 Value Option' : null;

  return (
    <div
      id={`product-card-${product.id}`}
      className={`group bg-slate-900 rounded-2xl border transition-all duration-200 flex flex-col overflow-hidden shadow-lg relative ${
        isCompared
          ? 'border-indigo-500 ring-2 ring-indigo-500/40 shadow-indigo-500/10'
          : 'border-slate-800 hover:border-slate-700 hover:shadow-xl'
      }`}
    >
      {/* Top Media & Tags Header */}
      <div className="relative bg-slate-950/80 p-4 flex items-center justify-center border-b border-slate-800/80 overflow-hidden">
        {/* Rank Badge */}
        {rankBadgeText && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="px-2.5 py-1 rounded-lg text-xs font-black tracking-wide bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md">
              {rankBadgeText}
            </span>
          </div>
        )}

        {/* Product Image with Fallback */}
        <div className="w-full h-48 sm:h-52 flex items-center justify-center overflow-hidden rounded-xl bg-slate-900 relative">
          <img
            src={imageError ? fallbackImage : product.image || fallbackImage}
            alt={product.name}
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Value For Money Score Badge */}
          <div className="absolute top-2.5 right-2.5 z-10">
            <div className={`px-2.5 py-1 rounded-lg text-xs font-extrabold border backdrop-blur-md flex items-center space-x-1 shadow-md ${getScoreBadgeClass(product.valueForMoneyScore)}`}>
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>{product.valueForMoneyScore.toFixed(1)}/10</span>
              <span className="text-[10px] uppercase font-medium opacity-80">Value</span>
            </div>
          </div>

          {/* Best For Tag / Category */}
          {product.bestFor && (
            <div className="absolute bottom-2.5 left-2.5 z-10">
              <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-950/90 text-amber-300 border border-amber-500/30 backdrop-blur-md shadow-md">
                {product.bestFor}
              </span>
            </div>
          )}

          {/* Demo Product Data Badge */}
          {isDemoMode && (
            <div className="absolute bottom-2.5 right-2.5 z-10">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/90 text-amber-300 border border-amber-500/40 backdrop-blur-md">
                Demo product data
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Rating Row */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
              {product.brand}
            </span>

            <div className="flex items-center space-x-1 text-xs text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-slate-400 font-normal">
                ({formatCompactNumber(product.reviewCount)})
              </span>
            </div>
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onViewDetails(product)}
            className="text-base sm:text-lg font-bold text-white mb-2.5 line-clamp-2 hover:text-orange-400 cursor-pointer transition-colors"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Pricing Row in INR (₹) */}
          <div className="flex items-center flex-wrap gap-2 mb-3">
            <span className="text-xl sm:text-2xl font-extrabold text-white">
              {formatINR(product.price)}
            </span>
            {isDemoMode ? (
              <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Illustrative Demo Price
              </span>
            ) : product.originalPrice && product.originalPrice > product.price ? (
              <>
                <span className="text-xs text-slate-500 line-through">
                  {formatINR(product.originalPrice)}
                </span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  {product.discountPercent || Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                </span>
              </>
            ) : null}
          </div>

          {/* "Why AI Recommends This" Highlight Box */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 mb-4">
            <div className="text-[11px] uppercase font-bold text-orange-400 flex items-center space-x-1 mb-1">
              <Sparkles className="w-3 h-3 text-orange-400" />
              <span>AI Recommendation Reason:</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
              {product.recommendationReason}
            </p>
          </div>

          {/* Key Specs / Features */}
          <div className="space-y-1.5 mb-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Key Specifications:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {product.mainFeatures.slice(0, 3).map((feat, i) => (
                <span
                  key={i}
                  className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700/60"
                >
                  {feat}
                </span>
              ))}
            </div>
          </div>

          {/* Pros & Cons Snapshot */}
          <div className="grid grid-cols-1 gap-2 mb-4 text-xs bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
            {/* Pros */}
            {product.pros.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center space-x-1 text-emerald-400 font-bold text-[11px]">
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>Pros:</span>
                </div>
                <p className="text-slate-300 text-xs pl-4 line-clamp-1">
                  {product.pros[0]}
                </p>
              </div>
            )}

            {/* Cons */}
            {product.cons.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center space-x-1 text-amber-400 font-bold text-[11px]">
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  <span>Cons:</span>
                </div>
                <p className="text-slate-400 text-xs pl-4 line-clamp-1">
                  {product.cons[0]}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="pt-3 border-t border-slate-800 space-y-2 mt-auto">
          <div className="flex items-center gap-2">
            {/* Compare Toggle Button */}
            <button
              onClick={() => onToggleCompare(product)}
              id={`compare-btn-${product.id}`}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center space-x-1.5 transition-all ${
                isCompared
                  ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500 hover:bg-indigo-600/30'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>{isCompared ? 'Comparing ✓' : 'Compare'}</span>
            </button>

            {/* Quick Specs Modal Button */}
            <button
              onClick={() => onViewDetails(product)}
              id={`details-btn-${product.id}`}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors"
              title="View full specs & Indian market details"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Store / Buying Link handling */}
          {isDemoMode ? (
            <button
              type="button"
              onClick={() => onViewDetails(product)}
              id={`buy-btn-${product.id}`}
              className="w-full py-2 px-3 bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-700 font-medium text-xs rounded-xl border border-slate-700 flex items-center justify-center space-x-1.5 transition-colors"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-amber-400" />
              <span>Live store link unavailable in Demo Mode (View Specs)</span>
            </button>
          ) : (
            <a
              href={product.buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              id={`buy-btn-${product.id}`}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-bold text-xs sm:text-sm rounded-xl hover:opacity-95 shadow-md shadow-orange-500/20 flex items-center justify-center space-x-1.5 transition-all active:scale-[0.98]"
            >
              <ShoppingCart className="w-4 h-4 text-slate-950" />
              <span>Search Price on {product.store || 'Amazon.in'}</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-950 opacity-80" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
