import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { SearchHero } from './components/SearchHero';
import { AIBanner } from './components/AIBanner';
import { ProductCard } from './components/ProductCard';
import { FilterToolbar } from './components/FilterToolbar';
import { CompareModal } from './components/CompareModal';
import { ProductModal } from './components/ProductModal';
import { AIChatDrawer } from './components/AIChatDrawer';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { Product, SearchCriteria, RecommendationResponse, SortOption } from './types';
import { SAMPLE_PRODUCTS } from './data/sampleProducts';
import { parseBudgetFromText, parseCategoryFromText } from './utils/nlpParser';
import { Sparkles, Scale, ShoppingBag, AlertCircle, Info, Heart, ArrowRight } from 'lucide-react';

export default function App() {
  const [activeCriteria, setActiveCriteria] = useState<SearchCriteria>({
    query: 'I need wireless earbuds under ₹2000 with good battery life.',
    budgetMax: 2000,
    category: 'Wireless Earbuds & Audio',
  });

  const [recommendationData, setRecommendationData] = useState<RecommendationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Sorting and Filtering State
  const [currentSort, setCurrentSort] = useState<SortOption>('best_value');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [minRating, setMinRating] = useState<number>(0);

  // Modal and Drawer States
  const [compareProducts, setCompareProducts] = useState<Product[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Initial load
  useEffect(() => {
    fetchRecommendations(activeCriteria);
  }, []);

  const fetchRecommendations = async (criteria: SearchCriteria, forceDemo = isDemoMode) => {
    setIsLoading(true);
    setError(null);
    setActiveCriteria(criteria);

    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...criteria, forceDemo }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations from server');
      }

      const data: RecommendationResponse = await response.json();
      setRecommendationData(data);
      if (data.isDemoMode !== undefined) {
        setIsDemoMode(data.isDemoMode);
      }
    } catch (err: any) {
      console.warn('API call failed, switching to offline fallback catalog:', err);
      const query = criteria.query || '';
      const nlpBudget = parseBudgetFromText(query);
      const effectiveBudget = nlpBudget !== null ? nlpBudget : criteria.budgetMax;
      const nlpCategory = parseCategoryFromText(query);
      const effectiveCategory = nlpCategory || criteria.category || 'All Categories';

      let fallbackProducts = SAMPLE_PRODUCTS.filter((p) => {
        // Strict budget filter
        if (effectiveBudget && effectiveBudget > 0 && p.price > effectiveBudget) {
          return false;
        }
        if (effectiveCategory && effectiveCategory !== 'All Categories') {
          return p.category.toLowerCase().includes(effectiveCategory.toLowerCase());
        }
        return true;
      });

      if (fallbackProducts.length === 0 && effectiveBudget && effectiveBudget > 0) {
        // Filter purely by budget if category had 0 items
        fallbackProducts = SAMPLE_PRODUCTS.filter((p) => p.price <= effectiveBudget);
      }

      setRecommendationData({
        products: fallbackProducts.slice(0, 3),
        summary: fallbackProducts.length > 0 
          ? `Loaded ${Math.min(3, fallbackProducts.length)} products within budget from local catalog.`
          : `No products found strictly under ₹${effectiveBudget?.toLocaleString('en-IN')}.`,
        marketAnalysis: 'Demo product data — prices, ratings and availability are illustrative.',
        budgetInsight: effectiveBudget 
          ? `Budget limit set to ₹${effectiveBudget.toLocaleString('en-IN')}. All displayed products are strictly within budget.`
          : 'Highlighted sample options with optimal spec-to-price ratio in India.',
        isDemoMode: true,
        source: 'sample_data',
      });
      setIsDemoMode(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleDemoMode = () => {
    const nextMode = !isDemoMode;
    setIsDemoMode(nextMode);
    fetchRecommendations(activeCriteria, nextMode);
  };

  // Compare handlers
  const handleToggleCompare = (product: Product) => {
    setCompareProducts((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      }
      if (prev.length >= 3) {
        alert('You can compare up to 3 products at a time. Remove one first.');
        return prev;
      }
      const updated = [...prev, product];
      if (updated.length >= 2) {
        setIsCompareModalOpen(true);
      }
      return updated;
    });
  };

  const handleRemoveCompare = (productId: string) => {
    setCompareProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleClearCompare = () => {
    setCompareProducts([]);
    setIsCompareModalOpen(false);
  };

  // Filter & Sort logic
  const allProducts = recommendationData?.products || [];
  const availableBrands = Array.from(new Set(allProducts.map((p) => p.brand))).filter(Boolean);

  let displayedProducts = allProducts.filter((p) => {
    if (selectedBrand && p.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
      return false;
    }
    if (minRating > 0 && p.rating < minRating) {
      return false;
    }
    return true;
  });

  // Sorting
  displayedProducts.sort((a, b) => {
    switch (currentSort) {
      case 'price_low':
        return a.price - b.price;
      case 'price_high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'popular':
        return b.reviewCount - a.reviewCount;
      case 'best_value':
      default:
        return b.valueForMoneyScore - a.valueForMoneyScore;
    }
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar
        compareProducts={compareProducts}
        onOpenCompare={() => setIsCompareModalOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        isDemoMode={isDemoMode}
        onToggleDemoMode={handleToggleDemoMode}
      />

      {/* Main Search & Criteria Hero */}
      <SearchHero
        onSearch={(criteria) => fetchRecommendations(criteria, isDemoMode)}
        isLoading={isLoading}
        activeCriteria={activeCriteria}
        isDemoMode={isDemoMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Loading Skeleton */}
        {isLoading && <LoadingSkeleton />}

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-950/50 border border-rose-500/40 rounded-2xl p-5 mb-8 text-rose-200 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-white mb-1">Search Notice</h4>
              <p className="text-xs leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* Product Results */}
        {!isLoading && recommendationData && (
          <div>
            {/* AI Intelligence Summary & Intent Extraction Banner */}
            <AIBanner data={recommendationData} />

            {/* Results Title & Quick Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-white flex items-center space-x-2">
                  <span>Top 3 Recommended Products</span>
                  <span className="text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full font-bold">
                    Ranked by SmartBuy AI
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Carefully chosen based on your detected requirements, budget limit, and value-for-money score.
                </p>
              </div>

              {/* One-click Compare All Top 3 Button */}
              {displayedProducts.length > 1 && (
                <button
                  onClick={() => {
                    const top3 = displayedProducts.slice(0, 3);
                    setCompareProducts(top3);
                    setIsCompareModalOpen(true);
                  }}
                  id="compare-all-top-3-btn"
                  className="px-4 py-2 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 hover:text-white border border-indigo-500/50 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 self-start sm:self-auto"
                >
                  <Scale className="w-4 h-4 text-indigo-400" />
                  <span>Compare Top {Math.min(3, displayedProducts.length)} Side-by-Side</span>
                </button>
              )}
            </div>

            {/* Filter & Sort Toolbar */}
            <FilterToolbar
              totalCount={displayedProducts.length}
              currentSort={currentSort}
              onSortChange={setCurrentSort}
              availableBrands={availableBrands}
              selectedBrand={selectedBrand}
              onSelectBrand={setSelectedBrand}
              minRating={minRating}
              onMinRatingChange={setMinRating}
            />

            {/* Products Grid (Top 3 Recommendations) */}
            {allProducts.length === 0 ? (
              <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-10 text-center max-w-lg mx-auto">
                <ShoppingBag className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                <h3 className="font-bold text-lg text-white mb-2">
                  No suitable products found within your ₹{activeCriteria.budgetMax ? activeCriteria.budgetMax.toLocaleString('en-IN') : ''} budget.
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-5">
                  To ensure honest recommendations, SmartBuy AI does not inflate prices or substitute out-of-budget items. Consider increasing your maximum budget or modifying your search requirements.
                </p>
                <button
                  onClick={() => {
                    const nextCriteria = { ...activeCriteria, budgetMax: (activeCriteria.budgetMax || 0) + 10000 };
                    fetchRecommendations(nextCriteria, isDemoMode);
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:opacity-90 shadow-md shadow-orange-500/20"
                >
                  Search with Higher Budget (+₹10,000)
                </button>
              </div>
            ) : displayedProducts.length > 0 ? (
              <>
                {displayedProducts.length < 3 && (
                  <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      Displaying {displayedProducts.length} suitable option(s) for your active filters. To avoid misleading recommendations, SmartBuy AI only presents genuine matching products rather than fabricating unverified items.
                    </span>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {displayedProducts.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      rank={index + 1}
                      isCompared={compareProducts.some((p) => p.id === product.id)}
                      isDemoMode={isDemoMode}
                      onToggleCompare={handleToggleCompare}
                      onViewDetails={(p) => setSelectedProductDetails(p)}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center max-w-md mx-auto">
                <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="font-bold text-lg text-white mb-1">No products match this specific filter</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Try clearing the brand or rating filter to view all AI recommendations.
                </p>
                <button
                  onClick={() => {
                    setSelectedBrand('');
                    setMinRating(0);
                  }}
                  className="px-4 py-2 bg-orange-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-orange-400"
                >
                  Reset Filters
                </button>
              </div>
            )}

            {/* Quick Action Comparison Bar (floating when products are selected) */}
            {compareProducts.length > 0 && (
              <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 border border-indigo-500/50 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-2xl flex items-center space-x-3 sm:space-x-4 max-w-xl w-[92%]">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    {compareProducts.length}
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-xs font-bold text-white">Comparing Products</div>
                    <div className="text-[11px] text-slate-400">Up to 3 products side-by-side</div>
                  </div>
                </div>

                <div className="flex-1 flex items-center space-x-1.5 overflow-x-auto py-1">
                  {compareProducts.map((p) => (
                    <span
                      key={p.id}
                      className="text-xs bg-slate-800 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700 whitespace-nowrap truncate max-w-[120px]"
                    >
                      {p.name.split(' ')[0]} {p.name.split(' ')[1] || ''}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => setIsCompareModalOpen(true)}
                  id="floating-compare-trigger-btn"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 whitespace-nowrap flex items-center space-x-1"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Compare ({compareProducts.length})</span>
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Ask AI Button for quick access */}
      <button
        onClick={() => setIsChatOpen(true)}
        id="floating-ask-ai-button"
        className="fixed bottom-5 right-5 z-40 px-4 py-3 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-slate-950 font-extrabold text-xs sm:text-sm rounded-full shadow-xl shadow-orange-500/30 flex items-center space-x-2 hover:scale-105 transition-all active:scale-95"
      >
        <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950" />
        <span>Ask SmartBuy Assistant</span>
      </button>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-300">SmartBuy AI</span>
            <span>•</span>
            <span>Made for Indian Consumers 🇮🇳</span>
          </div>
          <p className="text-[11px]">
            Pricing in INR (₹). Demo product data — prices, ratings and availability are illustrative.
          </p>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsChatOpen(true)}
              className="text-orange-400 hover:underline flex items-center space-x-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>Ask AI Shopping Assistant</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      {isCompareModalOpen && (
        <CompareModal
          products={compareProducts}
          onClose={() => setIsCompareModalOpen(false)}
          onRemoveProduct={handleRemoveCompare}
          onClearAll={handleClearCompare}
          isDemoMode={isDemoMode}
        />
      )}

      {selectedProductDetails && (
        <ProductModal
          product={selectedProductDetails}
          onClose={() => setSelectedProductDetails(null)}
          onToggleCompare={handleToggleCompare}
          isCompared={compareProducts.some((p) => p.id === selectedProductDetails.id)}
          isDemoMode={isDemoMode}
        />
      )}

      <AIChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        contextProducts={recommendationData?.products || []}
        currentQuery={activeCriteria.query}
      />
    </div>
  );
}
