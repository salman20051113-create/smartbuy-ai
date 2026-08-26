import React from 'react';
import { X, Scale, Star, Sparkles, Check, AlertTriangle, ExternalLink, Trash2, ShoppingCart, Award } from 'lucide-react';
import { Product } from '../types';
import { formatINR, formatCompactNumber } from '../utils/formatters';

interface CompareModalProps {
  products: Product[];
  onClose: () => void;
  onRemoveProduct: (productId: string) => void;
  onClearAll: () => void;
  isDemoMode?: boolean;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  products,
  onClose,
  onRemoveProduct,
  onClearAll,
  isDemoMode,
}) => {
  if (products.length === 0) return null;

  // Determine key spec keys across all compared products
  const allSpecKeys = Array.from(
    new Set(products.flatMap((p) => Object.keys(p.specs || {})))
  );

  // Find best value and lowest price
  const lowestPrice = Math.min(...products.map((p) => p.price));
  const highestValueScore = Math.max(...products.map((p) => p.valueForMoneyScore));
  const highestRating = Math.max(...products.map((p) => p.rating));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center space-x-2">
                <span>Side-by-Side Product Comparison</span>
                <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                  {products.length} of 3 Products
                </span>
                {isDemoMode && (
                  <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                    Demo Mode
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">Detailed spec breakdown, pros & cons, and Indian market value analysis</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClearAll}
              className="text-xs text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-lg border border-rose-500/20 hover:bg-rose-500/10 transition-colors flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear All</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Top Product Cards Grid */}
          <div className={`grid grid-cols-1 md:grid-cols-${products.length} gap-4`}>
            {products.map((product) => {
              const isLowestPrice = product.price === lowestPrice;
              const isHighestValue = product.valueForMoneyScore === highestValueScore;

              return (
                <div
                  key={product.id}
                  className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/80 flex flex-col justify-between relative"
                >
                  <button
                    onClick={() => onRemoveProduct(product.id)}
                    className="absolute top-2.5 right-2.5 p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition-colors"
                    title="Remove from comparison"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div>
                    {/* Badge Highlights */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {isHighestValue && (
                        <span className="text-[10px] uppercase font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded">
                          ★ Best Value Index
                        </span>
                      )}
                      {isLowestPrice && (
                        <span className="text-[10px] uppercase font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40 px-2 py-0.5 rounded">
                          ₹ Lowest Price
                        </span>
                      )}
                    </div>

                    {/* Image & Title */}
                    <div className="h-32 w-full rounded-lg bg-slate-900 overflow-hidden mb-3 flex items-center justify-center">
                      <img
                        src={product.image}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="text-xs font-bold text-orange-400 uppercase mb-1">{product.brand}</div>
                    <h3 className="text-sm font-bold text-white line-clamp-2 mb-2">{product.name}</h3>

                    {/* Price & Rating */}
                    <div className="flex items-baseline space-x-2 mb-2">
                      <span className="text-lg font-extrabold text-white">{formatINR(product.price)}</span>
                      {product.originalPrice && (
                        <span className="text-xs text-slate-400 line-through">{formatINR(product.originalPrice)}</span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-slate-300 mb-3">
                      <div className="flex items-center space-x-1 text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{product.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-slate-400">({formatCompactNumber(product.reviewCount)} reviews)</span>
                    </div>

                    {/* Value for Money score */}
                    <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/60 mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Value for Money</span>
                        <span className="font-bold text-emerald-400">{product.valueForMoneyScore.toFixed(1)} / 10</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-orange-400 to-emerald-400 h-1.5 rounded-full"
                          style={{ width: `${(product.valueForMoneyScore / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {isDemoMode ? (
                    <div className="w-full py-1.5 px-2 bg-slate-900 text-slate-400 text-center font-medium text-[11px] rounded-lg border border-slate-700 mt-2">
                      Live store link unavailable in Demo Mode
                    </div>
                  ) : (
                    <a
                      href={product.buyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-bold text-xs rounded-lg hover:opacity-90 flex items-center justify-center space-x-1 transition-opacity mt-2"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Search on {product.store || 'Amazon.in'}</span>
                      <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>

          {/* AI Comparison Verdict */}
          <div className="bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-950 rounded-xl p-4 border border-indigo-500/30 text-white">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm mb-2">
              <Award className="w-4 h-4" />
              <span>SmartBuy AI Comparison Verdict</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
              {products.map((p) => (
                <div key={p.id} className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                  <div className="font-bold text-orange-400 mb-1">{p.brand} {p.name.split(' ')[1] || ''}:</div>
                  <p className="leading-relaxed">
                    {p.recommendationReason}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Pros & Cons Matrix */}
          <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Pros & Cons Analysis
            </h4>
            <div className={`grid grid-cols-1 md:grid-cols-${products.length} gap-4`}>
              {products.map((p) => (
                <div key={p.id} className="space-y-3 text-xs">
                  <div className="font-bold text-white border-b border-slate-800 pb-1">{p.name}</div>
                  
                  {/* Pros */}
                  <div className="space-y-1">
                    <span className="font-semibold text-emerald-400 flex items-center space-x-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Strengths:</span>
                    </span>
                    <ul className="space-y-1 pl-4 text-slate-300 list-disc list-outside">
                      {p.pros.map((pro, i) => (
                        <li key={i}>{pro}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Cons */}
                  <div className="space-y-1">
                    <span className="font-semibold text-amber-400 flex items-center space-x-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Trade-offs:</span>
                    </span>
                    <ul className="space-y-1 pl-4 text-slate-400 list-disc list-outside">
                      {p.cons.map((con, i) => (
                        <li key={i}>{con}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Specifications Breakdown Table */}
          {allSpecKeys.length > 0 && (
            <div className="bg-slate-950/60 rounded-xl border border-slate-800 overflow-hidden">
              <div className="p-3 bg-slate-900 border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400">
                Detailed Technical Specifications
              </div>
              <div className="divide-y divide-slate-800/60 text-xs">
                {allSpecKeys.map((key) => (
                  <div
                    key={key}
                    className={`grid grid-cols-1 md:grid-cols-${products.length + 1} p-3 items-center hover:bg-slate-900/40`}
                  >
                    <div className="font-semibold text-slate-400 mb-1 md:mb-0">{key}</div>
                    {products.map((p) => (
                      <div key={p.id} className="text-white pl-2 md:pl-0">
                        {p.specs?.[key] || '—'}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
