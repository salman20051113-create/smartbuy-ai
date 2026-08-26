import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, ShoppingBag, CheckCircle2 } from 'lucide-react';

const LOADING_STEPS = [
  'Searching Indian marketplace pricing (Amazon.in, Flipkart)...',
  'Evaluating specs, driver sizes, battery endurance & warranties...',
  'Analyzing verified buyer reviews & customer ratings...',
  'Calculating SmartBuy Value-for-Money index...',
  'Formulating custom Indian buying recommendations...',
];

export const LoadingSkeleton: React.FC = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-8">
      {/* Loading Status Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center max-w-xl mx-auto shadow-xl">
        <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center mx-auto mb-4 animate-bounce">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">SmartBuy AI is Evaluating Options</h3>
        <p className="text-sm text-orange-400 font-medium mb-4 flex items-center justify-center space-x-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>{LOADING_STEPS[currentStepIndex]}</span>
        </p>

        {/* Step indicators */}
        <div className="flex items-center justify-center space-x-1.5 max-w-xs mx-auto">
          {LOADING_STEPS.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx <= currentStepIndex ? 'w-6 bg-orange-500' : 'w-2 bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Product Skeleton Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4 animate-pulse"
          >
            <div className="w-full h-48 bg-slate-800 rounded-xl" />
            <div className="flex justify-between items-center">
              <div className="w-20 h-4 bg-slate-800 rounded" />
              <div className="w-16 h-4 bg-slate-800 rounded" />
            </div>
            <div className="w-full h-6 bg-slate-800 rounded" />
            <div className="w-2/3 h-5 bg-slate-800 rounded" />
            <div className="w-full h-20 bg-slate-950 rounded-xl" />
            <div className="w-full h-10 bg-slate-800 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
};
