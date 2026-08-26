import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { SAMPLE_PRODUCTS, SAMPLE_CATEGORIES } from './src/data/sampleProducts.ts';
import { Product, SearchCriteria, RecommendationResponse } from './src/types.ts';
import { parseBudgetFromText, parseCategoryFromText, parseBrandFromText } from './src/utils/nlpParser.ts';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialize Gemini client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Resilient generation helper that tries stable Gemini models with fallback on 503/429/404 errors
async function generateContentWithFallback(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
    primaryModel?: string;
  }
) {
  const modelsToTry = [
    params.primaryModel || 'gemini-3.6-flash',
    'gemini-3.6-flash',
    'gemini-3.7-flash',
    'gemini-2.0-flash',
  ];

  // Deduplicate preserving order
  const uniqueModels = Array.from(new Set(modelsToTry));

  let lastError: any = null;
  for (const model of uniqueModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });
      if (response && response.text) {
        return response;
      }
    } catch (err: any) {
      lastError = err;
      const errMsg = String(err?.message || err);

      const isRecoverableWithNextModel =
        errMsg.includes('503') ||
        errMsg.includes('429') ||
        errMsg.includes('404') ||
        errMsg.includes('NOT_FOUND') ||
        errMsg.includes('no longer available') ||
        errMsg.includes('high demand') ||
        errMsg.includes('UNAVAILABLE') ||
        errMsg.includes('RESOURCE_EXHAUSTED') ||
        errMsg.includes('overloaded') ||
        errMsg.includes('fetch failed');

      if (!isRecoverableWithNextModel) {
        console.warn(`[SmartBuy AI] Model ${model} generation encountered non-recoverable error:`, errMsg);
        break;
      } else {
        console.warn(`[SmartBuy AI] Model ${model} unavailable (${errMsg.slice(0, 100)}...), trying next model in chain...`);
      }
      // Small pause before attempting fallback model
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }
  throw lastError || new Error('All candidate Gemini models are temporarily unavailable.');
}

// Fallback matching logic from sample catalog
function extractIntentFromCriteria(criteria: SearchCriteria) {
  const query = criteria.query || '';
  const queryLower = query.toLowerCase();
  
  // Extract category (NLP extracted overrides default if detected)
  const nlpCategory = parseCategoryFromText(query);
  let category = nlpCategory || criteria.category || 'All Categories';
  if (category === 'All Categories') {
    category = 'Electronics & Gadgets';
  }

  // Extract budget (NLP extracted overrides default if detected in query)
  const nlpBudget = parseBudgetFromText(query);
  const effectiveBudget = nlpBudget !== null ? nlpBudget : criteria.budgetMax;
  const budgetStr = effectiveBudget ? `₹${effectiveBudget.toLocaleString('en-IN')}` : 'Flexible / Open';

  // Extract brand
  const nlpBrand = parseBrandFromText(query);
  const brand = nlpBrand || criteria.brandPreference || null;

  // Extract requirements & priorities
  const requirements: string[] = [];
  const priorities: string[] = [];

  if (queryLower.includes('coding') || queryLower.includes('programming') || queryLower.includes('developer') || queryLower.includes('vscode')) {
    requirements.push('16GB RAM for multitasking & coding builds', 'Fast SSD for IDEs & project compiling');
    priorities.push('Performance & RAM capacity', 'Compilation speed');
  }
  if (queryLower.includes('16gb') || queryLower.includes('16 gb')) {
    if (!requirements.some(r => r.includes('16GB RAM'))) {
      requirements.push('16GB RAM capacity');
    }
  }
  if (queryLower.includes('ssd') || queryLower.includes('nvme')) {
    if (!requirements.some(r => r.includes('SSD'))) {
      requirements.push('High speed PCIe NVMe SSD');
    }
  }
  if (queryLower.includes('battery') || queryLower.includes('playback') || queryLower.includes('backup')) {
    requirements.push('Long battery life & fast charging');
    priorities.push('Battery endurance');
  }
  if (queryLower.includes('anc') || queryLower.includes('noise cancel') || queryLower.includes('noise-cancel')) {
    requirements.push('Active Noise Cancellation (ANC)');
    priorities.push('Noise isolation');
  }
  if (queryLower.includes('call') || queryLower.includes('mic') || queryLower.includes('zoom') || queryLower.includes('meeting')) {
    requirements.push('Clear microphone for calls');
    priorities.push('Voice call quality');
  }
  if (queryLower.includes('bass') || queryLower.includes('sound') || queryLower.includes('music') || queryLower.includes('audio quality')) {
    requirements.push('High fidelity sound & punchy bass');
    priorities.push('Acoustic clarity');
  }
  if (queryLower.includes('game') || queryLower.includes('gaming') || queryLower.includes('latency')) {
    requirements.push('Low latency gaming mode');
    priorities.push('Fast response time');
  }
  if (queryLower.includes('display') || queryLower.includes('amoled') || queryLower.includes('screen') || queryLower.includes('120hz')) {
    requirements.push('High refresh rate display');
    priorities.push('Visual clarity');
  }
  if (criteria.requirements) {
    requirements.push(criteria.requirements);
  }

  if (requirements.length === 0) {
    requirements.push('Reliable daily performance in India', 'Official warranty & service support');
  }
  if (priorities.length === 0) {
    priorities.push('Value for money', 'Reliability');
  }

  return {
    productOrCategory: category,
    maxBudget: budgetStr,
    effectiveBudgetNum: effectiveBudget,
    preferredBrand: brand || 'Any trusted Indian market brand',
    importantRequirements: requirements,
    priorities: priorities,
  };
}

function getFallbackRecommendations(criteria: SearchCriteria): RecommendationResponse {
  let filtered = [...SAMPLE_PRODUCTS];

  const queryLower = (criteria.query || '').toLowerCase();
  const extracted = extractIntentFromCriteria(criteria);
  const effectiveCategory = extracted.productOrCategory;
  const effectiveBudget = extracted.effectiveBudgetNum;
  const brand = (extracted.preferredBrand !== 'Any trusted Indian market brand' ? extracted.preferredBrand : criteria.brandPreference || '').toLowerCase();

  // 1. Strict Category filter
  if (effectiveCategory && effectiveCategory !== 'All Categories' && effectiveCategory !== 'Electronics & Gadgets') {
    const categoryMatches = filtered.filter((p) =>
      p.category.toLowerCase().includes(effectiveCategory.toLowerCase()) ||
      effectiveCategory.toLowerCase().includes(p.category.toLowerCase())
    );
    if (categoryMatches.length > 0) {
      filtered = categoryMatches;
    }
  }

  // 2. STRICT Budget filter: NEVER return a product whose price exceeds effectiveBudget
  if (effectiveBudget && effectiveBudget > 0) {
    filtered = filtered.filter((p) => p.price <= effectiveBudget);
    
    // If NO suitable products exist within the budget, return empty products array
    if (filtered.length === 0) {
      const budgetFormatted = `₹${effectiveBudget.toLocaleString('en-IN')}`;
      return {
        products: [],
        extractedIntent: {
          productOrCategory: extracted.productOrCategory,
          maxBudget: extracted.maxBudget,
          preferredBrand: extracted.preferredBrand,
          importantRequirements: extracted.importantRequirements,
          priorities: extracted.priorities,
        },
        summary: `No suitable products found within your ${budgetFormatted} budget.`,
        marketAnalysis: 'Demo product data — prices, ratings and availability are illustrative.',
        budgetInsight: `No matching models found under ${budgetFormatted} in this category. Entry-level options in the Indian market may require a higher budget.`,
        isDemoMode: true,
        source: 'sample_data',
      };
    }
  }

  // 3. Brand preference ranking
  if (brand) {
    const brandMatches = filtered.filter((p) => p.brand.toLowerCase().includes(brand));
    if (brandMatches.length > 0) {
      const nonBrandMatches = filtered.filter((p) => !p.brand.toLowerCase().includes(brand));
      filtered = [...brandMatches, ...nonBrandMatches];
    }
  }

  // 4. Query requirements relevance scoring
  if (queryLower) {
    const queryTokens = queryLower.split(/\s+/).filter((t) => t.length > 1);
    filtered.sort((a, b) => {
      let scoreA = a.valueForMoneyScore || 8.0;
      let scoreB = b.valueForMoneyScore || 8.0;
      const textA = `${a.name} ${a.brand} ${a.category} ${a.mainFeatures.join(' ')} ${a.bestFor || ''} ${JSON.stringify(a.specs || {})}`.toLowerCase();
      const textB = `${b.name} ${b.brand} ${b.category} ${b.mainFeatures.join(' ')} ${b.bestFor || ''} ${JSON.stringify(b.specs || {})}`.toLowerCase();
      
      // Coding / RAM / SSD boosts
      if (queryLower.includes('16gb') || queryLower.includes('16 gb')) {
        if (textA.includes('16gb')) scoreA += 5;
        if (textB.includes('16gb')) scoreB += 5;
      }
      if (queryLower.includes('ssd') || queryLower.includes('nvme')) {
        if (textA.includes('ssd')) scoreA += 3;
        if (textB.includes('ssd')) scoreB += 3;
      }
      if (queryLower.includes('coding') || queryLower.includes('programming')) {
        if (textA.includes('coding') || textA.includes('programming') || textA.includes('multitasking')) scoreA += 4;
        if (textB.includes('coding') || textB.includes('programming') || textB.includes('multitasking')) scoreB += 4;
      }

      for (const token of queryTokens) {
        if (textA.includes(token)) scoreA += 1.5;
        if (textB.includes(token)) scoreB += 1.5;
      }
      return scoreB - scoreA;
    });
  }

  // Take top 3 products (never exceeding budget)
  const topProducts = filtered.slice(0, 3);

  return {
    products: topProducts,
    extractedIntent: {
      productOrCategory: extracted.productOrCategory,
      maxBudget: extracted.maxBudget,
      preferredBrand: extracted.preferredBrand,
      importantRequirements: extracted.importantRequirements,
      priorities: extracted.priorities,
    },
    summary: `Selected top ${topProducts.length} recommended options for "${extracted.productOrCategory}" within ${extracted.maxBudget}.`,
    marketAnalysis: 'Demo product data — prices, ratings and availability are illustrative.',
    budgetInsight: effectiveBudget
      ? `Budget limit set to ₹${effectiveBudget.toLocaleString('en-IN')}. All displayed products are strictly within budget.`
      : 'Evaluated best value-for-money options in the segment.',
    isDemoMode: true,
    source: 'sample_data',
  };
}

// Category and meta endpoints
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/sample-categories', (req: Request, res: Response) => {
  res.json({ categories: SAMPLE_CATEGORIES });
});

// Main AI Recommendation Endpoint
app.post('/api/recommend', async (req: Request, res: Response) => {
  try {
    const criteria: SearchCriteria = req.body;
    const forceDemo = req.body.forceDemo === true;
    const ai = getGeminiClient();

    // Check query for explicit budget or category overrides
    const query = criteria.query || '';
    const nlpBudget = parseBudgetFromText(query);
    const effectiveBudget = nlpBudget !== null ? nlpBudget : criteria.budgetMax;
    const nlpCategory = parseCategoryFromText(query);
    const effectiveCategory = nlpCategory || criteria.category || 'All Categories';

    if (forceDemo || !ai) {
      const fallback = getFallbackRecommendations({
        ...criteria,
        budgetMax: effectiveBudget,
        category: effectiveCategory,
      });
      return res.json(fallback);
    }

    const budgetRule = effectiveBudget && effectiveBudget > 0
      ? `CRITICAL BUDGET MANDATE: The user's maximum budget is strictly ₹${effectiveBudget.toLocaleString('en-IN')}. You MUST ONLY recommend products whose price is AT OR BELOW ₹${effectiveBudget}. Under NO circumstances should any recommended product price exceed ₹${effectiveBudget}. If no suitable product exists in this category under ₹${effectiveBudget}, return an empty array [] in "products".`
      : 'Budget: Flexible / Open.';

    const prompt = `You are SmartBuy AI, an elite Indian e-commerce shopping advisor and product specialist.
Analyze the user's natural language shopping query carefully.

USER SEARCH DETAILS:
- Query / Natural Language Request: "${query || 'Best tech products'}"
- Detected Category: "${effectiveCategory}"
- Max Budget Limit: ${effectiveBudget ? `₹${effectiveBudget.toLocaleString('en-IN')} INR` : 'Flexible / detect from query'}
- Preferred Brand Specified: "${criteria.brandPreference || 'None / detect from query'}"
- Specific Requirements: "${criteria.requirements || 'None / detect from query'}"

${budgetRule}

YOUR TASKS:
1. Extract structured user intent:
   - "productOrCategory": The specific product type (e.g., "Wireless Earbuds", "5G Smartphone", "Gaming Laptop", "Laptops & Computers").
   - "maxBudget": The maximum budget detected in INR (e.g., "₹${effectiveBudget ? effectiveBudget.toLocaleString('en-IN') : '2,000'}") or "Flexible / Not specified".
   - "preferredBrand": Preferred brand detected (e.g., "boAt", "OnePlus", "Sony", "Lenovo", "ASUS") or "Any trusted brand".
   - "importantRequirements": List of 2 to 4 key technical/functional requirements parsed from their request (e.g. ["16GB RAM for multitasking", "512GB NVMe SSD", "Backlit keyboard"]).
   - "priorities": List of 2 to 3 user priority rankings (e.g. ["Coding build performance", "RAM capacity", "Value for money"]).

2. Provide EXACTLY 3 top recommended products available in the Indian market that fit STRICTLY within the user's budget. (Rank 1 = Top Pick / Best Value, Rank 2 = Top Feature / Alternative, Rank 3 = Budget Champion).
   If fewer than 3 suitable matching products exist within the budget in the Indian market, return ONLY the ones that fit. Never invent products or exceed the budget.

IMPORTANT RULES:
1. ONLY recommend real, well-known product models commonly sold in India.
2. Use realistic estimated Indian rupee prices (INR ₹) at or below the maximum budget limit.
3. Provide realistic ratings (e.g. 4.0 to 4.6), realistic review counts, genuine main features, real pros, and honest, balanced cons.
4. Give an accurate "valueForMoneyScore" (number between 7.0 and 9.9).
5. For "recommendationReason", write a clear, personalized 2-sentence rationale explicitly explaining why this product matches the user's specific extracted requirements and priorities.
6. For "store", specify "Amazon.in", "Flipkart", or "Official Store". For "buyUrl", generate a standard search query URL: "https://www.amazon.in/s?k=..." or "https://www.flipkart.com/search?q=...".
7. Include 3-5 key technical specifications in the "specs" object.
8. Provide summary, marketAnalysis, and budgetInsight tailored to Indian consumers.`;

    const response = await generateContentWithFallback(ai, {
      primaryModel: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            extractedIntent: {
              type: Type.OBJECT,
              properties: {
                productOrCategory: { type: Type.STRING, description: 'Extracted product type or category' },
                maxBudget: { type: Type.STRING, description: 'Extracted maximum budget string in INR' },
                preferredBrand: { type: Type.STRING, description: 'Extracted brand preference' },
                importantRequirements: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'List of specific requirements extracted from user query',
                },
                priorities: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'User priorities identified from query',
                },
              },
              required: ['productOrCategory', 'maxBudget', 'preferredBrand', 'importantRequirements', 'priorities'],
            },
            summary: { type: Type.STRING, description: 'Executive summary of recommendations' },
            marketAnalysis: { type: Type.STRING, description: 'Current Indian market trend analysis' },
            budgetInsight: { type: Type.STRING, description: 'Analysis of how well the budget fits the requirements' },
            products: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  brand: { type: Type.STRING },
                  category: { type: Type.STRING },
                  price: { type: Type.NUMBER, description: 'Estimated price in INR (₹)' },
                  originalPrice: { type: Type.NUMBER, description: 'MRP before discount' },
                  discountPercent: { type: Type.NUMBER },
                  rating: { type: Type.NUMBER, description: 'Rating out of 5 (e.g. 4.3)' },
                  reviewCount: { type: Type.NUMBER },
                  image: { type: Type.STRING, description: 'Unsplash or realistic product image URL' },
                  mainFeatures: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  pros: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  cons: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  valueForMoneyScore: { type: Type.NUMBER, description: 'Score between 1 and 10' },
                  recommendationReason: { type: Type.STRING, description: 'Why this is recommended' },
                  bestFor: { type: Type.STRING, description: 'Quick badge e.g. Best Battery Life' },
                  store: { type: Type.STRING },
                  buyUrl: { type: Type.STRING },
                  availability: { type: Type.STRING },
                  specs: {
                    type: Type.OBJECT,
                    description: 'Key specification key-value pairs',
                  },
                },
                required: ['id', 'name', 'brand', 'category', 'price', 'rating', 'mainFeatures', 'pros', 'cons', 'valueForMoneyScore', 'recommendationReason', 'store', 'buyUrl'],
              },
            },
          },
          required: ['extractedIntent', 'summary', 'marketAnalysis', 'budgetInsight', 'products'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    
    // Strict budget post-filter
    let rawProducts = Array.isArray(parsed.products) ? parsed.products : [];
    if (effectiveBudget && effectiveBudget > 0) {
      rawProducts = rawProducts.filter((p: any) => Number(p.price) <= effectiveBudget);
    }

    if (rawProducts.length === 0) {
      const budgetFormatted = `₹${(effectiveBudget || 0).toLocaleString('en-IN')}`;
      return res.json({
        products: [],
        extractedIntent: parsed.extractedIntent || extractIntentFromCriteria(criteria),
        summary: `No suitable products found within your ${budgetFormatted} budget.`,
        marketAnalysis: 'Evaluated against estimated Indian market pricing.',
        budgetInsight: `No models found under ${budgetFormatted} matching all your requirements. Try adjusting the budget or broadening criteria.`,
        isDemoMode: false,
        source: 'gemini',
      });
    }

    const products: Product[] = rawProducts.slice(0, 3).map((p: any, idx: number) => {
      let imgUrl = p.image;
      if (!imgUrl || !imgUrl.startsWith('http')) {
        const nameLower = (p.name || '').toLowerCase();
        if (nameLower.includes('earbud') || nameLower.includes('headphone') || nameLower.includes('audio') || nameLower.includes('tws') || nameLower.includes('buds')) {
          imgUrl = idx === 0
            ? 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80'
            : idx === 1
            ? 'https://images.unsplash.com/photo-1608156639585-b3a032ef9689?w=600&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=600&auto=format&fit=crop&q=80';
        } else if (nameLower.includes('phone') || nameLower.includes('mobile') || nameLower.includes('galaxy') || nameLower.includes('poco') || nameLower.includes('oneplus') || nameLower.includes('iphone') || nameLower.includes('5g')) {
          imgUrl = idx === 0
            ? 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80'
            : idx === 1
            ? 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80';
        } else if (nameLower.includes('watch') || nameLower.includes('fit')) {
          imgUrl = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
        } else if (nameLower.includes('laptop') || nameLower.includes('macbook') || nameLower.includes('vivobook') || nameLower.includes('computer') || nameLower.includes('ideapad')) {
          imgUrl = idx === 0
            ? 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80'
            : idx === 1
            ? 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=80';
        } else if (nameLower.includes('air fryer') || nameLower.includes('purifier') || nameLower.includes('kitchen') || nameLower.includes('appliance')) {
          imgUrl = 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&auto=format&fit=crop&q=80';
        } else {
          imgUrl = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80';
        }
      }

      const store = p.store || (idx % 2 === 0 ? 'Amazon.in' : 'Flipkart');
      const buyUrl = `https://www.${store === 'Flipkart' ? 'flipkart.com/search?q=' : 'amazon.in/s?k='}${encodeURIComponent(p.name)}`;

      return {
        id: p.id || `ai-prod-${idx}-${Date.now()}`,
        name: p.name || 'Recommended Product',
        brand: p.brand || 'Leading Brand',
        category: p.category || effectiveCategory,
        price: Number(p.price) || 2999,
        originalPrice: p.originalPrice ? Number(p.originalPrice) : Math.round(Number(p.price || 2999) * 1.25),
        discountPercent: p.discountPercent || 20,
        rating: Math.min(5, Math.max(3.5, Number(p.rating) || 4.2)),
        reviewCount: p.reviewCount ? Number(p.reviewCount) : Math.floor(Math.random() * 20000) + 1200,
        image: imgUrl,
        mainFeatures: Array.isArray(p.mainFeatures) && p.mainFeatures.length ? p.mainFeatures : ['Standard Warranty', 'Fast Shipping', 'High Performance'],
        pros: Array.isArray(p.pros) && p.pros.length ? p.pros : ['Great value in segment', 'Reliable performance'],
        cons: Array.isArray(p.cons) && p.cons.length ? p.cons : ['Competitive alternatives exist'],
        valueForMoneyScore: Math.min(10, Math.max(5, Number(p.valueForMoneyScore) || 9.1)),
        recommendationReason: p.recommendationReason || 'Optimal combination of features, build quality, and after-sales service in India.',
        bestFor: p.bestFor || (idx === 0 ? '#1 Top Value Pick' : idx === 1 ? '#2 Feature Leader' : '#3 Budget Alternative'),
        store,
        buyUrl,
        availability: 'Check Online',
        isRealData: false,
        specs: p.specs && typeof p.specs === 'object' ? p.specs : {
          'Brand': p.brand || 'Verified Brand',
          'Price': `₹${Number(p.price || 2999).toLocaleString('en-IN')}`,
          'Warranty': '1 Year Brand Warranty in India',
        },
      };
    });

    let finalProducts = [...products];
    // Only fill from fallback if strictly within budget
    if (finalProducts.length < 3) {
      const fallbackList = getFallbackRecommendations({
        ...criteria,
        budgetMax: effectiveBudget,
        category: effectiveCategory,
      }).products;
      for (const fp of fallbackList) {
        if (!finalProducts.some((p) => p.name.toLowerCase() === fp.name.toLowerCase()) && (effectiveBudget ? fp.price <= effectiveBudget : true)) {
          finalProducts.push(fp);
          if (finalProducts.length === 3) break;
        }
      }
    }

    const result: RecommendationResponse = {
      products: finalProducts.slice(0, 3),
      extractedIntent: parsed.extractedIntent || extractIntentFromCriteria({ ...criteria, budgetMax: effectiveBudget, category: effectiveCategory }),
      summary: parsed.summary || `SmartBuy AI analyzed top market options for your query.`,
      marketAnalysis: parsed.marketAnalysis || 'Comparative value analysis based on current Indian market trends.',
      budgetInsight: parsed.budgetInsight || 'Optimal price-to-feature ratio identified within budget.',
      isDemoMode: false,
      source: 'gemini',
    };

    return res.json(result);
  } catch (error: any) {
    console.error('Error in /api/recommend:', error);
    const criteria: SearchCriteria = req.body || {};
    const query = criteria.query || '';
    const nlpBudget = parseBudgetFromText(query);
    const effectiveBudget = nlpBudget !== null ? nlpBudget : criteria.budgetMax;
    const nlpCategory = parseCategoryFromText(query);
    const effectiveCategory = nlpCategory || criteria.category || 'All Categories';

    const fallback = getFallbackRecommendations({
      ...criteria,
      budgetMax: effectiveBudget,
      category: effectiveCategory,
    });
    return res.json(fallback);
  }
});

// Interactive Follow-up Chat Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages, contextProducts } = req.body;
    const ai = getGeminiClient();

    const lastMessage = messages?.[messages.length - 1]?.content || 'What do you recommend?';

    if (!ai) {
      return res.json({
        reply: `SmartBuy AI (Demo Assistant): Based on the current Indian market, if you are looking at products like ${contextProducts?.[0]?.name || 'the recommended items'}, consider battery life, brand service center accessibility in your city, and real user feedback. Feel free to ask about specific differences or compare any two models!`,
        suggestedQuestions: [
          'Which one has the best microphone for calls?',
          'How does the warranty service work in India?',
          'Is it worth paying extra for the higher model?',
        ],
      });
    }

    const productContextStr = (contextProducts || [])
      .map(
        (p: Product, i: number) =>
          `Product ${i + 1}: ${p.name} | Brand: ${p.brand} | Price: ₹${p.price} | Rating: ${p.rating}★ | Pros: ${p.pros.join(', ')} | Cons: ${p.cons.join(', ')} | Reason: ${p.recommendationReason}`
      )
      .join('\n');

    const chatPrompt = `You are SmartBuy AI, an objective, highly knowledgeable Indian shopping assistant.
A shopper is asking for advice regarding product recommendations.

CURRENT PRODUCTS BEING VIEWED BY USER:
${productContextStr || 'General Indian consumer electronics & lifestyle products'}

CONVERSATION HISTORY:
${(messages || []).map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}

USER'S LATEST QUESTION:
"${lastMessage}"

YOUR INSTRUCTIONS:
1. Answer clearly, concisely, and helpfully in markdown.
2. Directly answer their specific concern (e.g. microphone quality in traffic, battery endurance, service network in Indian tier-2/3 cities, durability, value for money).
3. Do not invent false claims or nonexistent specs.
4. Keep the tone friendly, expert, and practical.
5. Provide 3 relevant follow-up questions the user might want to ask next.

Return your response in JSON format with properties:
- "reply": string (markdown supported)
- "suggestedQuestions": array of 3 short questions`;

    const response = await generateContentWithFallback(ai, {
      primaryModel: 'gemini-3.6-flash',
      contents: chatPrompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING, description: 'Markdown formatted response' },
            suggestedQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['reply', 'suggestedQuestions'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      reply: parsed.reply || 'Here is what I suggest based on the product specs and real user reviews in India.',
      suggestedQuestions: parsed.suggestedQuestions || [
        'Which product offers the best battery life?',
        'Which has the better after-sales service in India?',
        'Are there any bank offers or card discounts to check?',
      ],
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    return res.json({
      reply: 'Based on current product specifications, we advise checking customer feedback on call quality and battery endurance. How else can SmartBuy AI assist your purchase decision?',
      suggestedQuestions: [
        'Compare the top 2 products side-by-side',
        'Which brand has better service centers in India?',
      ],
    });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SmartBuy AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
