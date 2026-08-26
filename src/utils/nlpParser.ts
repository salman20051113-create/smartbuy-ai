// Natural language query parser for SmartBuy AI

export interface ExtractedQueryInfo {
  budgetMax?: number;
  category?: string;
  brand?: string;
  requirements?: string[];
  priorities?: string[];
}

export function parseBudgetFromText(text: string): number | null {
  if (!text) return null;
  const q = text.toLowerCase();

  // Match '55k', '20k', '2.5k', '55 k' with prefix like under, below, budget, etc.
  const kMatch =
    q.match(/(?:under|below|around|budget|within|max|upto|up to|less than|for|price of|price|at)\s*₹?\s*(\d+(?:\.\d+)?)\s*k\b/i) ||
    q.match(/₹\s*(\d+(?:\.\d+)?)\s*k\b/i) ||
    q.match(/\b(\d+(?:\.\d+)?)\s*k\s*(?:inr|rupees|budget)?\b/i);

  if (kMatch) {
    const val = parseFloat(kMatch[1]) * 1000;
    if (!isNaN(val) && val > 0) return Math.round(val);
  }

  // Match '₹55,000', '₹2,000', 'under 55000', 'under ₹55,000', 'budget 50000', etc.
  const numMatch =
    q.match(/(?:under|below|around|budget|within|max|upto|up to|less than|for|price of|price|at)\s*₹?\s*(\d{1,3}(?:,\d{3})+|\d{3,7})\b/i) ||
    q.match(/₹\s*(\d{1,3}(?:,\d{3})+|\d{3,7})\b/i);

  if (numMatch) {
    const cleanNum = numMatch[1].replace(/,/g, '');
    const val = parseInt(cleanNum, 10);
    if (!isNaN(val) && val > 0) return val;
  }

  return null;
}

export function parseCategoryFromText(text: string): string | null {
  if (!text) return null;
  const q = text.toLowerCase();

  if (q.includes('laptop') || q.includes('notebook') || q.includes('macbook') || q.includes('computer') || q.includes('pc') || q.includes('coding') || q.includes('programming') || q.includes('ideapad') || q.includes('vivobook')) {
    return 'Laptops & Computers';
  }
  if (q.includes('earbud') || q.includes('headphone') || q.includes('audio') || q.includes('tws') || q.includes('earphone') || q.includes('airpod') || q.includes('neckband') || q.includes('airdopes')) {
    return 'Wireless Earbuds & Audio';
  }
  if (q.includes('phone') || q.includes('mobile') || q.includes('5g') || q.includes('smartphone') || q.includes('galaxy') || q.includes('iphone') || q.includes('redmi') || q.includes('realme')) {
    return 'Smartphones & Mobiles';
  }
  if (q.includes('watch') || q.includes('fitness') || q.includes('smartwatch') || q.includes('band') || q.includes('tracker')) {
    return 'Smartwatches & Fitness';
  }
  if (q.includes('air fryer') || q.includes('fryer') || q.includes('purifier') || q.includes('mixer') || q.includes('grinder') || q.includes('kitchen') || q.includes('appliance') || q.includes('blender') || q.includes('kettle')) {
    return 'Home & Kitchen Appliances';
  }
  if (q.includes('tablet') || q.includes('ipad') || q.includes('pad')) {
    return 'Tablets & iPads';
  }
  return null;
}

export function parseBrandFromText(text: string): string | null {
  if (!text) return null;
  const q = text.toLowerCase();
  const knownBrands = [
    'Apple', 'Samsung', 'Sony', 'OnePlus', 'boAt', 'Noise', 'Realme',
    'Xiaomi', 'ASUS', 'HP', 'Lenovo', 'Acer', 'Dell', 'Philips',
    'Pigeon', 'Prestige', 'Poco', 'Fire-Boltt', 'JBL', 'Nothing', 'Motorola'
  ];

  for (const brand of knownBrands) {
    if (q.includes(brand.toLowerCase())) {
      return brand;
    }
  }
  return null;
}
