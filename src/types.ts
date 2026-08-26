export interface ExtractedIntent {
  productOrCategory: string;
  maxBudget: string | null;
  preferredBrand: string | null;
  importantRequirements: string[];
  priorities: string[];
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  rating: number;
  reviewCount: number;
  image: string;
  mainFeatures: string[];
  pros: string[];
  cons: string[];
  valueForMoneyScore: number; // 0 - 10
  recommendationReason: string;
  bestFor?: string;
  store: string;
  buyUrl: string;
  availability: 'In Stock' | 'Limited Stock' | 'Check Online' | 'Estimated Online Price';
  isRealData: boolean;
  specs: Record<string, string>;
}

export interface SearchCriteria {
  query: string;
  budgetMax?: number;
  budgetMin?: number;
  category?: string;
  brandPreference?: string;
  requirements?: string;
}

export interface RecommendationResponse {
  products: Product[];
  extractedIntent?: ExtractedIntent;
  summary: string;
  marketAnalysis: string;
  budgetInsight: string;
  isDemoMode: boolean;
  source: 'gemini' | 'sample_data' | 'hybrid';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedQuestions?: string[];
  recommendedProductIds?: string[];
}

export type SortOption = 'best_value' | 'price_low' | 'price_high' | 'rating' | 'popular';

