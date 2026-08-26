import React from 'react';
import { ArrowUpDown, SlidersHorizontal, Check, Tag } from 'lucide-react';
import { SortOption } from '../types';

interface FilterToolbarProps {
  totalCount: number;
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  availableBrands: string[];
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
  minRating: number;
  onMinRatingChange: (rating: number) => void;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  totalCount,
  currentSort,
  onSortChange,
  availableBrands,
  selectedBrand,
  onSelectBrand,
  minRating,
  onMinRatingChange,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 mb-6 text-white shadow-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Count & Active Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-white bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
            {totalCount} {totalCount === 1 ? 'Product' : 'Products'} Found
          </span>

          {/* Quick Brand Filter Pills */}
          {availableBrands.length > 1 && (
            <div className="flex flex-wrap items-center gap-1.5 ml-1">
              <span className="text-xs text-slate-400 font-medium">Brand:</span>
              <button
                onClick={() => onSelectBrand('')}
                className={`text-xs px-2 py-0.5 rounded-md transition-colors ${
                  !selectedBrand
                    ? 'bg-orange-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              {availableBrands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => onSelectBrand(selectedBrand === brand ? '' : brand)}
                  className={`text-xs px-2 py-0.5 rounded-md border transition-colors ${
                    selectedBrand === brand
                      ? 'bg-orange-500 text-slate-950 font-bold border-orange-400'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sort & Rating Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Rating filter */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-300">
            <span className="text-slate-400">Rating:</span>
            <select
              value={minRating}
              onChange={(e) => onMinRatingChange(Number(e.target.value))}
              id="filter-rating-select"
              className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
            >
              <option value={0}>All Ratings</option>
              <option value={4.0}>4.0★ & above</option>
              <option value={4.3}>4.3★ & above</option>
              <option value={4.5}>4.5★ Top Rated</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-slate-400">Sort by:</span>
            <select
              value={currentSort}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              id="sort-products-select"
              className="bg-slate-800 border border-slate-700 text-white text-xs font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
            >
              <option value="best_value">🔥 Best Value for Money</option>
              <option value="price_low">₹ Price: Low to High</option>
              <option value="price_high">₹ Price: High to Low</option>
              <option value="rating">★ Highest Customer Rating</option>
              <option value="popular">👥 Most Popular & Reviewed</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
