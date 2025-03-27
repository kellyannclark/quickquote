type BaseRates = {
    XS: number;
    SM: number;
    MD: number;
    LG: number;
    XL: number;
  };
  
  type DirtLevels = {
    level1: number;
    level2: number;
    level3: number;
  };
  
  type Rates = {
    baseRates: BaseRates;
    interiorPercentage: number;
    dirtLevelAdjustments: DirtLevels;
    accessibilityCharge: number;
    contractDiscount: number;
    extraCharge: number;
  };
  
  type WindowCounts = {
    XS: number;
    SM: number;
    MD: number;
    LG: number;
    XL: number;
  };
  
  type QuoteDetails = {
    interior: boolean;
    dirtLevel: 1 | 2 | 3;
    isAccessible: boolean;
    hasContract: boolean;
    extraCharge?: number;
  };
  
  export function calculateQuoteTotal(
    rates: Rates,
    windowCounts: WindowCounts,
    quoteDetails: QuoteDetails
  ): number {
    const baseTotal =
      (windowCounts.XS * rates.baseRates.XS) +
      (windowCounts.SM * rates.baseRates.SM) +
      (windowCounts.MD * rates.baseRates.MD) +
      (windowCounts.LG * rates.baseRates.LG) +
      (windowCounts.XL * rates.baseRates.XL);
  
    let total = baseTotal;
  
    if (quoteDetails.interior) {
      total *= 1 + rates.interiorPercentage / 100;
    }
  
    const dirtLevelKey = `level${quoteDetails.dirtLevel}` as keyof DirtLevels;
    total *= 1 + (rates.dirtLevelAdjustments[dirtLevelKey] || 0) / 100;
  
    if (quoteDetails.isAccessible) {
      total *= 1 + rates.accessibilityCharge / 100;
    }
  
    if (quoteDetails.hasContract) {
      total *= 1 - rates.contractDiscount / 100;
    }
  
    total += quoteDetails.extraCharge ?? rates.extraCharge;
  
    return parseFloat(total.toFixed(2));
  }
  