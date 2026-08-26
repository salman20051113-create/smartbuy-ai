import React from 'react';
import { X, Star, Sparkles, Check, AlertTriangle, ExternalLink, ShoppingCart, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { Product } from '../types';
import { formatINR, formatCompactNumber } from '../utils/formatters';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onToggleCompare: (product: Product) => void;
  isCompared: boolean;
  isDemoMode?: boolean;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onToggleCompare,
  isCompared,
  isDemoMode,
}) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/90">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider bg-orange-500/10 px-2.5 py-0.5 rounded border border-orange-500/20">
              {product.brand} • {product.category}
            </span>
            {isDemoMode && (
              <span className="text-xs font-bold text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/30">
                Demo Mode
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Top section: Image + Main details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image */}
            <div className="h-64 rounded-xl bg-slate-950 overflow-hidden flex items-center justify-center border border-slate-800">
              <img
                src={product.image}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Title, Price, Rating */}
            <div className="flex flex-col justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white mb-2 leading-snug">
                  {product.name}
                </h2>

                <div className="flex items-center flex-wrap gap-2 mb-3">
                  <span className="text-2xl sm:text-3xl font-extrabold text-white">
                    {formatINR(product.price)}
                  </span>
                  {isDemoMode ? (
                    <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      Illustrative Demo Price
                    </span>
                  ) : product.originalPrice && product.originalPrice > product.price ? (
                    <>
                      <span className="text-sm text-slate-400 line-through">
                        {formatINR(product.originalPrice)}
                      </span>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        {product.discountPercent || 25}% OFF
                      </span>
                    </>
                  ) : null}
                </div>

                <div className="flex items-center space-x-2 text-xs mb-4">
                  <div className="flex items-center space-x-1 text-amber-400 font-semibold bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span>{product.rating.toFixed(1)} / 5.0</span>
                  </div>
                  <span className="text-slate-400">
                    ({formatCompactNumber(product.reviewCount)} reviews)
                  </span>
                </div>

                {/* Value for Money score */}
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 mb-4">
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-300">Value for Money Score</span>
                    <span className="text-emerald-400 font-bold">{product.valueForMoneyScore.toFixed(1)} / 10</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-orange-400 to-emerald-400 h-2 rounded-full"
                      style={{ width: `${(product.valueForMoneyScore / 10) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onToggleCompare(product)}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all ${
                    isCompared
                      ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {isCompared ? 'Remove from Compare' : 'Add to Compare (+)'}
                </button>

                {isDemoMode ? (
                  <div className="flex-1 py-2.5 px-3 bg-slate-800 text-slate-400 text-center font-medium text-xs rounded-xl border border-slate-700">
                    Live store link unavailable in Demo Mode
                  </div>
                ) : (
                  <a
                    href={product.buyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 px-4 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-bold text-xs sm:text-sm rounded-xl hover:opacity-95 shadow-md shadow-orange-500/20 flex items-center justify-center space-x-1.5"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Search on {product.store || 'Amazon.in'}</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Why SmartBuy Recommends */}
          <div className="bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-950 rounded-xl p-4 border border-indigo-500/30">
            <div className="flex items-center space-x-2 text-orange-400 font-bold text-sm mb-1.5">
              <Sparkles className="w-4 h-4" />
              <span>SmartBuy AI Buying Rationale</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {product.recommendationReason}
            </p>
          </div>

          {/* Pros & Cons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pros */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-1.5 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2.5">
                <Check className="w-4 h-4" />
                <span>Key Strengths</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {product.pros.map((p, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cons */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-1.5 text-amber-400 font-bold text-xs uppercase tracking-wider mb-2.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Known Considerations</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-400">
                {product.cons.map((c, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Technical Specs Table */}
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="bg-slate-950/60 rounded-xl border border-slate-800 overflow-hidden">
              <div className="p-3.5 bg-slate-950 border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400">
                Technical Specifications & Indian Market Details
              </div>
              <div className="divide-y divide-slate-800/60 text-xs">
                {Object.entries(product.specs).map(([key, val]) => (
                  <div key={key} className="grid grid-cols-3 p-3 items-center hover:bg-slate-900/40">
                    <span className="font-medium text-slate-400">{key}</span>
                    <span className="col-span-2 text-white font-semibold">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Indian Buyer Guarantees Note */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-400 border-t border-slate-800 pt-4">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Official Indian Brand Warranty</span>
            </div>
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Pan-India Doorstep Delivery</span>
            </div>
            <div className="flex items-center space-x-2">
              <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />
              <span>7-Day Replacement Policy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
