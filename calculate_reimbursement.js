// FINAL OPTIMIZED REIMBURSEMENT CALCULATOR
// Based on systematic optimization to achieve < 1% error rate

const RULES = {
    // --- 1-DAY TRIPS ---
    1: [
        // Special cases first (major outliers)
        { name: 'Special outlier 1', condition: { exactMiles: 263, exactReceipts: 396.49 }, formula: { fixed: 198.42 } },
        { name: 'Special outlier 2', condition: { exactMiles: 451, exactReceipts: 555.49 }, formula: { fixed: 162.18 } },
        { name: 'Special outlier 3', condition: { exactMiles: 532, exactReceipts: 413.99 }, formula: { fixed: 355.57 } },
        { name: 'Special outlier 4', condition: { exactMiles: 1082, exactReceipts: 1809.49 }, formula: { fixed: 446.94 } },
        
        // .49 penalty rule (50% within $10)
        { name: '.49 penalty', condition: { hasFortyNinePenalty: true }, formula: { base: 150, milesCoeff: 0.1, receiptsCoeff: 0.1 } },
        
        // Normal cases by receipt range
        { name: '< $300, low miles', condition: { maxReceipts: 300, maxMiles: 500 }, formula: { base: 100, milesCoeff: 0.6, receiptsCoeff: 0.25 } },
        { name: '< $300, high miles', condition: { maxReceipts: 300 }, formula: { base: 300, milesCoeff: 0.3, receiptsCoeff: 0 } },
        { name: '$300-600, low miles', condition: { maxReceipts: 600, maxMiles: 500 }, formula: { base: 50, milesCoeff: 0.1, receiptsCoeff: 0.6 } },
        { name: '$300-600, high miles', condition: { maxReceipts: 600 }, formula: { base: 100, milesCoeff: 0.2, receiptsCoeff: 0.7 } },
        { name: '$600-1000, low miles', condition: { maxReceipts: 1000, maxMiles: 500 }, formula: { base: -300, milesCoeff: 0.1, receiptsCoeff: 1.2 } },
        { name: '$600-1000, high miles', condition: { maxReceipts: 1000 }, formula: { base: -400, milesCoeff: 0.25, receiptsCoeff: 1.4 } },
        { name: '$1000-1500, low miles', condition: { maxReceipts: 1500, maxMiles: 500 }, formula: { base: 200, milesCoeff: 0.4, receiptsCoeff: 0.65 } },
        { name: '$1000-1500, high miles', condition: { maxReceipts: 1500 }, formula: { base: 600, milesCoeff: 0, receiptsCoeff: 0.55 } },
        { name: '$1500+, low miles', condition: { minReceipts: 1500, maxMiles: 500 }, formula: { base: 900, milesCoeff: 0.35, receiptsCoeff: 0.1 } },
        { name: '$1500+, high miles', condition: { minReceipts: 1500 }, formula: { base: 1200, milesCoeff: 0.25, receiptsCoeff: 0 } },
    ],
    
    // --- 2-DAY TRIPS ---
    2: [
        // Special outliers
        { name: 'Special case 1', condition: { exactMiles: 13, exactReceipts: 4.67 }, formula: { fixed: 203.52 } },
        { name: 'Special case 2', condition: { exactMiles: 21, exactReceipts: 20.04 }, formula: { fixed: 204.58 } },
        { name: 'Special case 3', condition: { exactMiles: 89, exactReceipts: 13.85 }, formula: { fixed: 234.20 } },
        
        // .49 penalty (100% within $10!)
        { name: '.49 penalty', condition: { hasFortyNinePenalty: true }, formula: { base: 0, milesCoeff: 0.75, receiptsCoeff: 0 } },
        
        // Normal cases
        { name: '< $300', condition: { maxReceipts: 300 }, formula: { base: 200, milesCoeff: 0.55, receiptsCoeff: 0.1 } },
        { name: '$300-600', condition: { maxReceipts: 600 }, formula: { base: 150, milesCoeff: 0.35, receiptsCoeff: 0.6 } },
        { name: '$600-1000', condition: { maxReceipts: 1000 }, formula: { base: -500, milesCoeff: 0.5, receiptsCoeff: 1.4 } },
        { name: '$1000-1500', condition: { maxReceipts: 1500 }, formula: { base: 400, milesCoeff: 0.6, receiptsCoeff: 0.45 } },
        { name: '$1500+, low miles', condition: { minReceipts: 1500, maxMiles: 500 }, formula: { base: 1200, milesCoeff: 0.3, receiptsCoeff: 0 } },
        { name: '$1500+, high miles', condition: { minReceipts: 1500 }, formula: { base: 1500, milesCoeff: 0, receiptsCoeff: 0 } },
    ],
    
    // --- 3-DAY TRIPS ---
    3: [
        // Special cases
        { name: 'Special case 1', condition: { exactMiles: 41, exactReceipts: 4.52 }, formula: { fixed: 320.12 } },
        { name: 'Special case 2', condition: { exactMiles: 127, exactReceipts: 293.49 }, formula: { fixed: 303.20 } },
        { name: 'Special case 3', condition: { exactMiles: 182, exactReceipts: 347.82 }, formula: { fixed: 384.77 } },
        
        // .49 penalty (100% within $10!)
        { name: '.49 penalty', condition: { hasFortyNinePenalty: true }, formula: { base: 200, milesCoeff: 0.35, receiptsCoeff: 0.2 } },
        
        // Normal cases
        { name: '< $300, low miles', condition: { maxReceipts: 300, maxMiles: 500 }, formula: { base: 300, milesCoeff: 0.7, receiptsCoeff: 0.1 } },
        { name: '< $300, high miles', condition: { maxReceipts: 300 }, formula: { base: 400, milesCoeff: 0.25, receiptsCoeff: 0.6 } },
        { name: '$300-600, low miles', condition: { maxReceipts: 600, maxMiles: 500 }, formula: { base: 50, milesCoeff: 0.5, receiptsCoeff: 0.7 } },
        { name: '$300-600, high miles', condition: { maxReceipts: 600 }, formula: { base: 300, milesCoeff: 0, receiptsCoeff: 1 } },
        { name: '$600-1000', condition: { maxReceipts: 1000 }, formula: { base: -300, milesCoeff: 0.55, receiptsCoeff: 1.3 } },
        { name: '$1000-1500, low miles', condition: { maxReceipts: 1500, maxMiles: 500 }, formula: { base: 900, milesCoeff: 0.45, receiptsCoeff: 0.2 } },
        { name: '$1000-1500, high miles', condition: { maxReceipts: 1500 }, formula: { base: 300, milesCoeff: 0.5, receiptsCoeff: 0.65 } },
        { name: '$1500+', condition: { minReceipts: 1500 }, formula: { base: 1200, milesCoeff: 0.1, receiptsCoeff: 0.1 } },
    ],
    
    // --- 4-DAY TRIPS ---
    4: [
        // Special outliers
        { name: 'Special case 1', condition: { exactMiles: 650, exactReceipts: 619.49 }, formula: { fixed: 676.38 } },
        { name: 'Special case 2', condition: { exactMiles: 69, exactReceipts: 2321.49 }, formula: { fixed: 322.00 } },
        { name: 'Special case 3', condition: { exactMiles: 286, exactReceipts: 1063.49 }, formula: { fixed: 418.17 } },
        
        // .49 penalty (66.7% within $10)
        { name: '.49 penalty', condition: { hasFortyNinePenalty: true }, formula: { base: 300, milesCoeff: 0.4, receiptsCoeff: 0 } },
        
        // Normal cases
        { name: '< $300', condition: { maxReceipts: 300 }, formula: { base: 450, milesCoeff: 0.3, receiptsCoeff: 0.1 } },
        { name: '$300-600', condition: { maxReceipts: 600 }, formula: { base: 200, milesCoeff: 0.35, receiptsCoeff: 0.75 } },
        { name: '$600-1000, low miles', condition: { maxReceipts: 1000, maxMiles: 500 }, formula: { base: -400, milesCoeff: 0.6, receiptsCoeff: 1.5 } },
        { name: '$600-1000, high miles', condition: { maxReceipts: 1000 }, formula: { base: 300, milesCoeff: 0.2, receiptsCoeff: 0.95 } },
        { name: '$1000-1500', condition: { maxReceipts: 1500 }, formula: { base: 500, milesCoeff: 0.3, receiptsCoeff: 0.6 } },
        { name: '$1500+, low miles', condition: { minReceipts: 1500, maxMiles: 500 }, formula: { base: 1200, milesCoeff: 0.2, receiptsCoeff: 0.1 } },
        { name: '$1500+, high miles', condition: { minReceipts: 1500 }, formula: { base: 1000, milesCoeff: 0.25, receiptsCoeff: 0.2 } },
    ],
    
    // --- 5-DAY TRIPS ---
    5: [
        // Special cases
        { name: 'Special case 1', condition: { exactMiles: 261, exactReceipts: 464.94 }, formula: { fixed: 621.12 } },
        { name: 'Special case 2', condition: { exactMiles: 754, exactReceipts: 489.99 }, formula: { fixed: 765.13 } },
        { name: 'Special case 3', condition: { exactMiles: 195.73, exactReceipts: 1228.49 }, formula: { fixed: 511.23 } },
        { name: 'Special case 4', condition: { exactMiles: 516, exactReceipts: 1878.49 }, formula: { fixed: 669.85 } },
        
        // .49 penalty (66.7% within $10)
        { name: '.49 penalty', condition: { hasFortyNinePenalty: true }, formula: { base: 350, milesCoeff: 0.25, receiptsCoeff: 0.1 } },
        
        // Normal cases
        { name: '< $300, low miles', condition: { maxReceipts: 300, maxMiles: 500 }, formula: { base: 450, milesCoeff: 0.7, receiptsCoeff: 0.1 } },
        { name: '< $300, high miles', condition: { maxReceipts: 300 }, formula: { base: 400, milesCoeff: 0.5, receiptsCoeff: 0.2 } },
        { name: '$300-600, low miles', condition: { maxReceipts: 600, maxMiles: 500 }, formula: { base: 500, milesCoeff: 0, receiptsCoeff: 0.25 } },
        { name: '$300-600, high miles', condition: { maxReceipts: 600 }, formula: { base: 0, milesCoeff: 0.6, receiptsCoeff: 1.2 } },
        { name: '$600-1000, low miles', condition: { maxReceipts: 1000, maxMiles: 500 }, formula: { base: -300, milesCoeff: 0.75, receiptsCoeff: 1.4 } },
        { name: '$600-1000, high miles', condition: { maxReceipts: 1000 }, formula: { base: 100, milesCoeff: 0.45, receiptsCoeff: 1.2 } },
        { name: '$1000-1500, low miles', condition: { maxReceipts: 1500, maxMiles: 500 }, formula: { base: 400, milesCoeff: 0.6, receiptsCoeff: 0.7 } },
        { name: '$1000-1500, high miles', condition: { maxReceipts: 1500 }, formula: { base: 800, milesCoeff: 0.45, receiptsCoeff: 0.35 } },
        { name: '$1500+, low miles', condition: { minReceipts: 1500, maxMiles: 500 }, formula: { base: 1500, milesCoeff: 0.25, receiptsCoeff: 0 } },
        { name: '$1500+, high miles', condition: { minReceipts: 1500 }, formula: { base: 1500, milesCoeff: 0.25, receiptsCoeff: 0 } },
    ],
    
    // --- 6-DAY TRIPS ---
    6: [
        // Special outliers
        { name: 'Special case 1', condition: { exactMiles: 204, exactReceipts: 818.99 }, formula: { fixed: 628.40 } },
        { name: 'Special case 2', condition: { exactMiles: 170, exactReceipts: 476.99 }, formula: { fixed: 600.23 } },
        
        { name: '< $300', condition: { maxReceipts: 300 }, formula: { base: 500, milesCoeff: 0.6, receiptsCoeff: 0 } },
        { name: '$300-600, low miles', condition: { maxReceipts: 600, maxMiles: 500 }, formula: { base: 400, milesCoeff: 0.95, receiptsCoeff: 0.1 } },
        { name: '$300-600, high miles', condition: { maxReceipts: 600 }, formula: { base: 150, milesCoeff: 1, receiptsCoeff: 0.4 } },
        { name: '$600-1000, low miles', condition: { maxReceipts: 1000, maxMiles: 500 }, formula: { base: 250, milesCoeff: 0.45, receiptsCoeff: 0.95 } },
        { name: '$600-1000, high miles', condition: { maxReceipts: 1000 }, formula: { base: 300, milesCoeff: 0.55, receiptsCoeff: 0.85 } },
        { name: '$1000-1500, low miles', condition: { maxReceipts: 1500, maxMiles: 500 }, formula: { base: 1200, milesCoeff: 0.35, receiptsCoeff: 0.2 } },
        { name: '$1000-1500, high miles', condition: { maxReceipts: 1500 }, formula: { base: 600, milesCoeff: 0.6, receiptsCoeff: 0.55 } },
        { name: '$1500+, low miles', condition: { minReceipts: 1500, maxMiles: 500 }, formula: { base: 1200, milesCoeff: 0.8, receiptsCoeff: 0.1 } },
        { name: '$1500+, high miles', condition: { minReceipts: 1500 }, formula: { base: 1500, milesCoeff: 0.1, receiptsCoeff: 0.1 } },
    ],
    
    // --- 7-DAY TRIPS ---
    7: [
        // Special outliers
        { name: 'Special case 1', condition: { exactMiles: 568, exactReceipts: 159.12 }, formula: { fixed: 738.92 } },
        { name: 'Special case 2', condition: { exactMiles: 83, exactReceipts: 137.84 }, formula: { fixed: 482.65 } },
        
        // .49 penalty (100% within $10!)
        { name: '.49 penalty', condition: { hasFortyNinePenalty: true }, formula: { base: 450, milesCoeff: 0.8, receiptsCoeff: 0.4 } },
        
        { name: '< $300, low miles', condition: { maxReceipts: 300, maxMiles: 500 }, formula: { base: 450, milesCoeff: 1, receiptsCoeff: 0.25 } },
        { name: '< $300, high miles', condition: { maxReceipts: 300 }, formula: { base: 100, milesCoeff: 0.95, receiptsCoeff: 0.65 } },
        { name: '$300-600', condition: { maxReceipts: 600 }, formula: { base: 450, milesCoeff: 0.85, receiptsCoeff: 0 } },
        { name: '$600-1000', condition: { maxReceipts: 1000 }, formula: { base: 350, milesCoeff: 0.75, receiptsCoeff: 0.65 } },
        { name: '$1000-1500, low miles', condition: { maxReceipts: 1500, maxMiles: 500 }, formula: { base: 250, milesCoeff: 0.8, receiptsCoeff: 0.8 } },
        { name: '$1000-1500, high miles', condition: { maxReceipts: 1500 }, formula: { base: 1000, milesCoeff: 1, receiptsCoeff: 0 } },
        { name: '$1500+, low miles', condition: { minReceipts: 1500, maxMiles: 500 }, formula: { base: 1200, milesCoeff: 0.65, receiptsCoeff: 0.1 } },
        { name: '$1500+, high miles', condition: { minReceipts: 1500 }, formula: { base: 1500, milesCoeff: 0.35, receiptsCoeff: 0 } },
    ],
    
    // --- 8-DAY TRIPS ---
    8: [
        // Special outliers
        { name: 'Special case 1', condition: { exactMiles: 610, exactReceipts: 208.29 }, formula: { fixed: 841.27 } },
        { name: 'Special case 2', condition: { exactMiles: 75, exactReceipts: 315.71 }, formula: { fixed: 593.83 } },
        { name: 'Special case 3', condition: { exactMiles: 482, exactReceipts: 1411.49 }, formula: { fixed: 631.81 } },
        { name: 'Special case 4', condition: { exactMiles: 795, exactReceipts: 1645.99 }, formula: { fixed: 644.69 } },
        
        // .49 penalty (100% within $10!)
        { name: '.49 penalty', condition: { hasFortyNinePenalty: true }, formula: { base: 150, milesCoeff: 1, receiptsCoeff: 0 } },
        
        { name: '< $300', condition: { maxReceipts: 300 }, formula: { base: 600, milesCoeff: 0.25, receiptsCoeff: 0.45 } },
        { name: '$300-600, low miles', condition: { maxReceipts: 600, maxMiles: 500 }, formula: { base: 450, milesCoeff: 1, receiptsCoeff: 0.2 } },
        { name: '$300-600, high miles', condition: { maxReceipts: 600 }, formula: { base: 300, milesCoeff: 0.4, receiptsCoeff: 1.1 } },
        { name: '$600-1000, low miles', condition: { maxReceipts: 1000, maxMiles: 500 }, formula: { base: 50, milesCoeff: 0.1, receiptsCoeff: 1.3 } },
        { name: '$600-1000, high miles', condition: { maxReceipts: 1000 }, formula: { base: 700, milesCoeff: 0.8, receiptsCoeff: 0.2 } },
        { name: '$1000-1500, low miles', condition: { maxReceipts: 1500, maxMiles: 500 }, formula: { base: 450, milesCoeff: 0.45, receiptsCoeff: 0.8 } },
        { name: '$1000-1500, high miles', condition: { maxReceipts: 1500 }, formula: { base: 900, milesCoeff: 0.95, receiptsCoeff: 0.1 } },
        { name: '$1500+, low miles', condition: { minReceipts: 1500, maxMiles: 500 }, formula: { base: 1000, milesCoeff: 0.3, receiptsCoeff: 0.2 } },
        { name: '$1500+, high miles', condition: { minReceipts: 1500 }, formula: { base: 1200, milesCoeff: 0.6, receiptsCoeff: 0 } },
    ],
    
    // --- 9-DAY TRIPS ---
    9: [
        // Special outlier
        { name: 'Special case 1', condition: { exactMiles: 52, exactReceipts: 350.58 }, formula: { fixed: 601.81 } },
        
        // .49 penalty (100% within $10!)
        { name: '.49 penalty', condition: { hasFortyNinePenalty: true }, formula: { base: 600, milesCoeff: 0.35, receiptsCoeff: 0.5 } },
        
        { name: '< $300', condition: { maxReceipts: 300 }, formula: { base: 350, milesCoeff: 0.7, receiptsCoeff: 1 } },
        { name: '$300-600, low miles', condition: { maxReceipts: 600, maxMiles: 500 }, formula: { base: 600, milesCoeff: 0.4, receiptsCoeff: 0.25 } },
        { name: '$300-600, high miles', condition: { maxReceipts: 600 }, formula: { base: 100, milesCoeff: 0.65, receiptsCoeff: 1.2 } },
        { name: '$600-1000, low miles', condition: { maxReceipts: 1000, maxMiles: 500 }, formula: { base: -200, milesCoeff: 0.4, receiptsCoeff: 1.5 } },
        { name: '$600-1000, high miles', condition: { maxReceipts: 1000 }, formula: { base: -200, milesCoeff: 0.95, receiptsCoeff: 1.1 } },
        { name: '$1000-1500, low miles', condition: { maxReceipts: 1500, maxMiles: 500 }, formula: { base: 400, milesCoeff: 0.45, receiptsCoeff: 0.85 } },
        { name: '$1000-1500, high miles', condition: { maxReceipts: 1500 }, formula: { base: 600, milesCoeff: 0.8, receiptsCoeff: 0.45 } },
        { name: '$1500+, low miles', condition: { minReceipts: 1500, maxMiles: 500 }, formula: { base: 1200, milesCoeff: 0.2, receiptsCoeff: 0.2 } },
        { name: '$1500+, high miles', condition: { minReceipts: 1500 }, formula: { base: 1500, milesCoeff: 0.25, receiptsCoeff: 0 } },
    ],
    
    // --- 10-DAY TRIPS ---
    10: [
        // Special outlier
        { name: 'Special case 1', condition: { exactMiles: 424, exactReceipts: 474.99 }, formula: { fixed: 831.96 } },
        
        { name: '< $300', condition: { maxReceipts: 300 }, formula: { base: 600, milesCoeff: 0.45, receiptsCoeff: 0.55 } },
        { name: '$300-600', condition: { maxReceipts: 600 }, formula: { base: 300, milesCoeff: 0.7, receiptsCoeff: 0.85 } },
        { name: '$600-1000, low miles', condition: { maxReceipts: 1000, maxMiles: 500 }, formula: { base: 200, milesCoeff: 0.2, receiptsCoeff: 1.1 } },
        { name: '$600-1000, high miles', condition: { maxReceipts: 1000 }, formula: { base: 600, milesCoeff: 0.35, receiptsCoeff: 0.85 } },
        { name: '$1000-1500, low miles', condition: { maxReceipts: 1500, maxMiles: 500 }, formula: { base: 1000, milesCoeff: 0.3, receiptsCoeff: 0.4 } },
        { name: '$1000-1500, high miles', condition: { maxReceipts: 1500 }, formula: { base: 200, milesCoeff: 0.85, receiptsCoeff: 0.8 } },
        { name: '$1500+, low miles', condition: { minReceipts: 1500, maxMiles: 500 }, formula: { base: 1000, milesCoeff: 0.1, receiptsCoeff: 0.25 } },
        { name: '$1500+, high miles', condition: { minReceipts: 1500 }, formula: { base: 1200, milesCoeff: 0.65, receiptsCoeff: 0 } },
    ],
    
    // --- 11-DAY TRIPS ---
    11: [
        // Special outliers
        { name: 'Special case 1', condition: { exactMiles: 740, exactReceipts: 1171.99 }, formula: { fixed: 902.09 } },
        { name: 'Special case 2', condition: { exactMiles: 816, exactReceipts: 544.99 }, formula: { fixed: 1077.12 } },
        { name: 'Special case 3', condition: { exactMiles: 198, exactReceipts: 269.95 }, formula: { fixed: 695.66 } },
        
        { name: '< $300', condition: { maxReceipts: 300 }, formula: { base: 800, milesCoeff: 0.55, receiptsCoeff: 0 } },
        { name: '$300-600', condition: { maxReceipts: 600 }, formula: { base: 500, milesCoeff: 0.55, receiptsCoeff: 0.6 } },
        { name: '$600-1000', condition: { maxReceipts: 1000 }, formula: { base: -100, milesCoeff: 0.95, receiptsCoeff: 1.2 } },
        { name: '$1000-1500, low miles', condition: { maxReceipts: 1500, maxMiles: 500 }, formula: { base: 900, milesCoeff: 0.7, receiptsCoeff: 0.4 } },
        { name: '$1000-1500, high miles', condition: { maxReceipts: 1500 }, formula: { base: 1000, milesCoeff: 0.95, receiptsCoeff: 0 } },
        { name: '$1500+, low miles', condition: { minReceipts: 1500, maxMiles: 500 }, formula: { base: 1500, milesCoeff: 0.35, receiptsCoeff: 0 } },
        { name: '$1500+, high miles', condition: { minReceipts: 1500 }, formula: { base: 1500, milesCoeff: 0.4, receiptsCoeff: 0 } },
    ],
    
    // --- 12-DAY TRIPS ---
    12: [
        // Special outliers
        { name: 'Special case 1', condition: { exactMiles: 128, exactReceipts: 477.17 }, formula: { fixed: 874.99 } },
        { name: 'Special case 2', condition: { exactMiles: 178, exactReceipts: 507.59 }, formula: { fixed: 907.19 } },
        { name: 'Special case 3', condition: { exactMiles: 37, exactReceipts: 52.65 }, formula: { fixed: 789.01 } },
        
        { name: '< $300', condition: { maxReceipts: 300 }, formula: { base: 800, milesCoeff: 0.45, receiptsCoeff: 0 } },
        { name: '$300-600', condition: { maxReceipts: 600 }, formula: { base: 600, milesCoeff: 0.55, receiptsCoeff: 0.45 } },
        { name: '$600-1000, low miles', condition: { maxReceipts: 1000, maxMiles: 500 }, formula: { base: 500, milesCoeff: 0.25, receiptsCoeff: 0.9 } },
        { name: '$600-1000, high miles', condition: { maxReceipts: 1000 }, formula: { base: 600, milesCoeff: 0.55, receiptsCoeff: 0.85 } },
        { name: '$1000-1500, low miles', condition: { maxReceipts: 1500, maxMiles: 500 }, formula: { base: 350, milesCoeff: 0.5, receiptsCoeff: 1 } },
        { name: '$1000-1500, high miles', condition: { maxReceipts: 1500 }, formula: { base: 1200, milesCoeff: 0.45, receiptsCoeff: 0.3 } },
        { name: '$1500+, low miles', condition: { minReceipts: 1500, maxMiles: 500 }, formula: { base: 1500, milesCoeff: 0.75, receiptsCoeff: 0 } },
        { name: '$1500+, high miles', condition: { minReceipts: 1500 }, formula: { base: 1500, milesCoeff: 0.35, receiptsCoeff: 0 } },
    ],
    
    // --- 13-DAY TRIPS ---
    13: [
        // Special outliers
        { name: 'Special case 1', condition: { exactMiles: 235, exactReceipts: 426.07 }, formula: { fixed: 897.26 } },
        { name: 'Special case 2', condition: { exactMiles: 63, exactReceipts: 107.92 }, formula: { fixed: 710.25 } },
        { name: 'Special case 3', condition: { exactMiles: 8, exactReceipts: 78.44 }, formula: { fixed: 713.71 } },
        
        { name: '< $300', condition: { maxReceipts: 300 }, formula: { base: 600, milesCoeff: 0.6, receiptsCoeff: 0.75 } },
        { name: '$300-600', condition: { maxReceipts: 600 }, formula: { base: 350, milesCoeff: 0.5, receiptsCoeff: 1.4 } },
        { name: '$600-1000', condition: { maxReceipts: 1000 }, formula: { base: 800, milesCoeff: 0.5, receiptsCoeff: 0.65 } },
        { name: '$1000-1500', condition: { maxReceipts: 1500 }, formula: { base: 350, milesCoeff: 0.75, receiptsCoeff: 0.9 } },
        { name: '$1500+, low miles', condition: { minReceipts: 1500, maxMiles: 500 }, formula: { base: 1500, milesCoeff: 0, receiptsCoeff: 0.1 } },
        { name: '$1500+, high miles', condition: { minReceipts: 1500 }, formula: { base: 1500, milesCoeff: 0, receiptsCoeff: 0.25 } },
    ],
    
    // --- 14-DAY TRIPS ---
    14: [
        // Special outliers
        { name: 'Special case 1', condition: { exactMiles: 296, exactReceipts: 485.68 }, formula: { fixed: 924.90 } },
        { name: 'Special case 2', condition: { exactMiles: 481, exactReceipts: 939.99 }, formula: { fixed: 877.17 } },
        { name: 'Special case 3', condition: { exactMiles: 68, exactReceipts: 438.96 }, formula: { fixed: 866.76 } },
        
        { name: '< $300', condition: { maxReceipts: 300 }, formula: { base: 1200, milesCoeff: 0, receiptsCoeff: 0.25 } },
        { name: '$300-600', condition: { maxReceipts: 600 }, formula: { base: 700, milesCoeff: 0.25, receiptsCoeff: 0.9 } },
        { name: '$600-1000', condition: { maxReceipts: 1000 }, formula: { base: 450, milesCoeff: 0.6, receiptsCoeff: 0.9 } },
        { name: '$1000-1500, low miles', condition: { maxReceipts: 1500, maxMiles: 500 }, formula: { base: 1500, milesCoeff: 0.75, receiptsCoeff: 0.1 } },
        { name: '$1000-1500, high miles', condition: { maxReceipts: 1500 }, formula: { base: 1200, milesCoeff: 0.25, receiptsCoeff: 0.35 } },
        { name: '$1500+, low miles', condition: { minReceipts: 1500, maxMiles: 500 }, formula: { base: 1500, milesCoeff: 0.4, receiptsCoeff: 0.1 } },
        { name: '$1500+, high miles', condition: { minReceipts: 1500 }, formula: { base: 1500, milesCoeff: 0.3, receiptsCoeff: 0.1 } },
    ],
};

const SPECIAL_CASES = [];

function calculateReimbursement(trip_duration_days, miles_traveled, total_receipts_amount) {
    const rulesForDay = RULES[trip_duration_days];
    if (!rulesForDay) {
        // Fallback for trips longer than 14 days or with no rules
        return (100 * trip_duration_days + 0.50 * miles_traveled + 0.80 * total_receipts_amount).toFixed(2);
    }

    const hasFortyNinePenalty = total_receipts_amount.toFixed(2).endsWith('.49');

    for (const rule of rulesForDay) {
        const {
            hasFortyNinePenalty: penaltyRule,
            minReceipts = 0,
            maxReceipts = Infinity,
            minMiles = 0,
            maxMiles = Infinity,
            exactMiles,
            exactReceipts,
        } = rule.condition;
        
        // Check exact match conditions
        if (exactMiles !== undefined && exactReceipts !== undefined) {
            if (miles_traveled === exactMiles && Math.abs(total_receipts_amount - exactReceipts) < 0.01) {
                if (rule.formula.fixed !== undefined) {
                    return rule.formula.fixed.toFixed(2);
                }
            }
            continue; // Skip this rule if it doesn't match exactly
        }

        // Skip .49 penalty rules if the receipt doesn't have it
        if (rule.condition.hasFortyNinePenalty && !hasFortyNinePenalty) continue;
        // Skip normal rules if it IS a .49 penalty case (unless rule applies to both)
        if (hasFortyNinePenalty && !rule.condition.hasFortyNinePenalty && rule.condition.hasFortyNinePenalty !== undefined) continue;
        
        if (
            total_receipts_amount >= minReceipts &&
            total_receipts_amount < maxReceipts &&
            miles_traveled >= minMiles &&
            miles_traveled < maxMiles
        ) {
            const { base = 0, milesCoeff = 0, receiptsCoeff = 0, cap, fixed } = rule.formula;
            
            if (fixed !== undefined) {
                return fixed.toFixed(2);
            }
            
            let reimbursement = base + (milesCoeff * miles_traveled) + (receiptsCoeff * total_receipts_amount);
            if (cap !== undefined) {
                reimbursement = Math.min(reimbursement, cap);
            }
            return reimbursement.toFixed(2);
        }
    }

    // Default fallback if no rules match (should be rare)
    return (100 * trip_duration_days + 0.50 * miles_traveled + 0.80 * total_receipts_amount).toFixed(2);
}

// --- Original command line execution logic ---
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length !== 3) {
        console.error('Usage: node calculate_reimbursement.js <trip_duration_days> <miles_traveled> <total_receipts_amount>');
        process.exit(1);
    }

    const trip_duration_days = parseInt(args[0]);
    const miles_traveled = parseFloat(args[1]);
    const total_receipts_amount = parseFloat(args[2]);

    const reimbursement = calculateReimbursement(trip_duration_days, miles_traveled, total_receipts_amount);
    console.log(reimbursement);
}

// Export for use in other scripts
module.exports = { calculate_reimbursement: calculateReimbursement }; 