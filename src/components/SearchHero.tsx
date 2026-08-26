import React, { useState, useEffect } from 'react';
import { Search, Sparkles, SlidersHorizontal, Tag, IndianRupee, Layers, CheckCircle2, ChevronDown, RefreshCw, Database } from 'lucide-react';
import { SAMPLE_CATEGORIES, POPULAR_INDIAN_BRANDS, SAMPLE_SEARCH_PROMPTS } from '../data/sampleProducts';
import { SearchCriteria } from '../types';
import { parseBudgetFromText, parseCategoryFromText, parseBrandFromText } from '../utils/nlpParser';

interface SearchHeroProps {
  onSearch: (criteria: SearchCriteria) => void;
  isLoading: boolean;
  activeCriteria: SearchCriteria;
  isDemoMode?: boolean;
}

const BUDGET_PRESETS = [
  { label: 'Under ₹2,000', value: 2000 },
  { label: 'Under ₹5,000', value: 5000 },
  { label: 'Under ₹15,000', value: 15000 },
  { label: 'Under ₹30,000', value: 30000 },
  { label: 'Under ₹55,000', value: 55000 },
  { label: 'Under ₹75,000', value: 75000 },
  { label: 'Any Budget', value: 0 },
];

export const SearchHero: React.FC<SearchHeroProps> = ({
  onSearch,
  isLoading,
  activeCriteria,
  isDemoMode,
}) => {
  const [query, setQuery] = useState(activeCriteria.query || '');
  const [budgetMax, setBudgetMax] = useState<number | undefined>(activeCriteria.budgetMax || 2000);
  const [category, setCategory] = useState(activeCriteria.category || 'Wireless Earbuds & Audio');
  const [brandPreference, setBrandPreference] = useState(activeCriteria.brandPreference || '');
  const [requirements, setRequirements] = useState(activeCriteria.requirements || '');
  const [inputError, setInputError] = useState<string | null>(null);

  // Sync state with activeCriteria when changed externally
  useEffect(() => {
    if (activeCriteria.query !== undefined) setQuery(activeCriteria.query);
    if (activeCriteria.budgetMax !== undefined) setBudgetMax(activeCriteria.budgetMax);
    if (activeCriteria.category !== undefined) setCategory(activeCriteria.category);
    if (activeCriteria.brandPreference !== undefined) setBrandPreference(activeCriteria.brandPreference);
  }, [activeCriteria]);

  const triggerSearch = (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setInputError('Please enter what you are looking for (e.g. "laptop under ₹55,000 for coding" or "earbuds under ₹2000")');
      return;
    }
    setInputError(null);

    // Natural-language budget extraction overrides conflicting default values
    const detectedBudget = parseBudgetFromText(trimmed);
    const effectiveBudget = detectedBudget !== null ? detectedBudget : (budgetMax && budgetMax > 0 ? budgetMax : undefined);

    const detectedCategory = parseCategoryFromText(trimmed);
    const effectiveCategory = detectedCategory || (category === 'All Categories' ? undefined : category);

    const detectedBrand = parseBrandFromText(trimmed);
    const effectiveBrand = detectedBrand || brandPreference.trim() || undefined;

    // Update local state if NLP extracted something
    if (detectedBudget !== null) {
      setBudgetMax(detectedBudget);
    }
    if (detectedCategory) {
      setCategory(detectedCategory);
    }
    if (detectedBrand && !brandPreference) {
      setBrandPreference(detectedBrand);
    }

    onSearch({
      query: trimmed,
      budgetMax: effectiveBudget,
      category: effectiveCategory,
      brandPreference: effectiveBrand,
      requirements: requirements.trim() || undefined,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerSearch(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      triggerSearch(query);
    }
  };

  const handlePromptClick = (prompt: string) => {
    setQuery(prompt);
    setInputError(null);
    triggerSearch(prompt);
  };

  const handleBrandClick = (brandName: string) => {
    if (brandPreference.toLowerCase().includes(brandName.toLowerCase())) {
      setBrandPreference('');
    } else {
      setBrandPreference(brandName);
    }
  };

  return (
    <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white border-b border-slate-800/80 pt-8 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Main Title & Subtitle */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI-Powered Indian Market Shopping Intelligence</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3">
            Find the <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">Best Tech & Gadgets</span> in India
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Tell SmartBuy AI what you need in plain English. Analyze Indian market specifications, estimated pricing (₹), and honest pros & cons.
          </p>
        </div>

        {/* Search & Customization Card */}
        <form
          onSubmit={handleSubmit}
          id="main-shopping-search-form"
          className="bg-slate-800/90 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-slate-700 shadow-2xl shadow-black/40 transition-all"
        >
          {/* Main Natural Language Search Input */}
          <div className="mb-4">
            <label htmlFor="search-query-input" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>What are you looking for? (Natural Language)</span>
              <span className="text-[11px] text-amber-400 font-normal hidden sm:inline">Type and press Enter ↵ to search with AI</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-5 h-5 text-orange-400" />
              </div>
              <input
                id="search-query-input"
                type="search"
                enterKeyHint="search"
                autoComplete="off"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (inputError) setInputError(null);
                }}
                onKeyDown={handleKeyDown}
                placeholder="e.g. I need a laptop under ₹55,000 for coding with 16GB RAM and SSD"
                className={`w-full pl-11 pr-24 py-3.5 bg-slate-900 border rounded-xl text-white placeholder-slate-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                  inputError ? 'border-rose-500 ring-1 ring-rose-500/50' : 'border-slate-700'
                }`}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                  Enter ↵
                </span>
              </div>
            </div>
            {inputError && (
              <p className="mt-1.5 text-xs text-rose-400 font-medium flex items-center space-x-1">
                <span>⚠️ {inputError}</span>
              </p>
            )}
          </div>

          {/* Quick Category Selector */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Select Category</span>
              </label>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {SAMPLE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    category === cat
                      ? 'bg-orange-500 text-slate-950 font-bold shadow-md shadow-orange-500/20 scale-[1.02]'
                      : 'bg-slate-900/80 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Budget & Brand Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Budget Selector */}
            <div>
              <label htmlFor="budget-input" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                <span>Max Budget (₹ INR)</span>
              </label>
              <div className="flex items-center space-x-2 mb-2">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold">₹</span>
                  <input
                    id="budget-input"
                    type="number"
                    min={0}
                    step={500}
                    value={budgetMax || ''}
                    onChange={(e) => setBudgetMax(e.target.value ? Number(e.target.value) : undefined)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter maximum budget"
                    className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {BUDGET_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setBudgetMax(preset.value || undefined)}
                    className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                      (preset.value === 0 && !budgetMax) || budgetMax === preset.value
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-slate-900/60 text-slate-400 border border-slate-700/60 hover:text-white'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Preference */}
            <div>
              <label htmlFor="brand-input" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <Tag className="w-3.5 h-3.5 text-sky-400" />
                <span>Brand Preference (Optional)</span>
              </label>
              <input
                id="brand-input"
                type="text"
                value={brandPreference}
                onChange={(e) => setBrandPreference(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. boAt, Sony, OnePlus, Lenovo, Acer"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 mb-2"
              />
              <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto">
                {POPULAR_INDIAN_BRANDS.slice(0, 8).map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => handleBrandClick(b)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                      brandPreference.toLowerCase().includes(b.toLowerCase())
                        ? 'bg-sky-500 text-slate-950 font-bold border-sky-400'
                        : 'bg-slate-900/60 text-slate-400 border-slate-700/50 hover:text-white'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Specific Requirements Field */}
          <div className="mb-5">
            <label htmlFor="requirements-input" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span>Specific Requirements / Priorities</span>
            </label>
            <input
              id="requirements-input"
              type="text"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. 16GB RAM, SSD, coding performance, long battery life, ANC"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Search Button & Integrity Notice */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-700/70">
            <div className="text-xs text-slate-400 flex items-center space-x-1.5">
              {isDemoMode ? (
                <div className="flex items-center space-x-1.5 text-amber-300 font-medium">
                  <Database className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Demo Mode — Demo product data (illustrative prices & specs)</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5 text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>AI extracts requirements, respects strict budget, and prioritizes top value</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              id="search-products-submit-btn"
              disabled={isLoading}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-slate-950 font-bold text-sm sm:text-base rounded-xl hover:opacity-95 shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin text-slate-950" />
                  <span>Analyzing with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-slate-950" />
                  <span>Get AI Recommendations</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Sample Prompts to click and test immediately */}
        <div className="mt-6">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>Try these popular Indian shopping queries:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_SEARCH_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handlePromptClick(prompt)}
                className="text-xs bg-slate-800/80 hover:bg-slate-700/90 text-slate-300 hover:text-white px-3 py-1.5 rounded-full border border-slate-700 transition-all text-left truncate max-w-full sm:max-w-md hover:border-orange-500/50"
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

