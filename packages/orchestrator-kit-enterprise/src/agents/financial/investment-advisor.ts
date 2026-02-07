/**
 * Investment Advisor Agent
 *
 * Provides personalized investment advice, portfolio analysis, and financial planning guidance.
 */

import { Logger, MetricsCollector, AppError, ValidationError } from '@info7/common';

/**
 * Risk tolerance levels
 */
export enum RiskTolerance {
  CONSERVATIVE = 'conservative',
  MODERATE = 'moderate',
  AGGRESSIVE = 'aggressive',
}

/**
 * Investment goal types
 */
export enum InvestmentGoal {
  RETIREMENT = 'retirement',
  WEALTH_BUILDING = 'wealth-building',
  INCOME_GENERATION = 'income-generation',
  EDUCATION = 'education',
  MAJOR_PURCHASE = 'major-purchase',
  EMERGENCY_FUND = 'emergency-fund',
}

/**
 * Asset classes
 */
export enum AssetClass {
  STOCKS = 'stocks',
  BONDS = 'bonds',
  REAL_ESTATE = 'real-estate',
  COMMODITIES = 'commodities',
  CASH = 'cash',
  CRYPTO = 'cryptocurrency',
  ALTERNATIVE = 'alternative',
}

/**
 * Investor profile
 */
export interface InvestorProfile {
  age: number;
  annualIncome: number;
  currentSavings: number;
  monthlyInvestmentCapacity: number;
  riskTolerance: RiskTolerance;
  investmentGoals: Array<{
    goal: InvestmentGoal;
    targetAmount: number;
    timeHorizon: number;  // years
    priority: 'high' | 'medium' | 'low';
  }>;
  existingInvestments?: Array<{
    assetClass: AssetClass;
    amount: number;
    returnRate?: number;
  }>;
  financialObligations?: {
    debts: number;
    monthlyExpenses: number;
    dependents: number;
  };
}

/**
 * Portfolio recommendation
 */
export interface PortfolioRecommendation {
  recommendationId: string;
  profile: InvestorProfile;
  allocation: Array<{
    assetClass: AssetClass;
    percentage: number;
    amount: number;
    reasoning: string;
    expectedReturn: number;  // annual %
    risk: 'low' | 'medium' | 'high';
  }>;
  projections: {
    conservative: { year: number; amount: number }[];
    expected: { year: number; amount: number }[];
    optimistic: { year: number; amount: number }[];
  };
  rebalancingStrategy: {
    frequency: 'monthly' | 'quarterly' | 'annually';
    triggers: string[];
  };
  taxConsiderations: string[];
  warnings: string[];
  nextSteps: string[];
  createdAt: number;
}

/**
 * Portfolio analysis
 */
export interface PortfolioAnalysis {
  analysisId: string;
  currentValue: number;
  performance: {
    returnYTD: number;
    return1Year: number;
    return5Year?: number;
    volatility: number;
  };
  allocation: {
    current: Map<AssetClass, number>;
    recommended: Map<AssetClass, number>;
    deviations: Array<{
      assetClass: AssetClass;
      currentPct: number;
      targetPct: number;
      deviation: number;
      action: 'buy' | 'sell' | 'hold';
    }>;
  };
  riskMetrics: {
    sharpeRatio?: number;
    maxDrawdown: number;
    beta?: number;
    diversificationScore: number;  // 0-100
  };
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    action: string;
    reasoning: string;
    expectedImpact: string;
  }>;
  analyzedAt: number;
}

/**
 * Investment strategy
 */
export interface InvestmentStrategy {
  name: string;
  description: string;
  suitableFor: {
    riskTolerance: RiskTolerance[];
    timeHorizon: string;
    goals: InvestmentGoal[];
  };
  allocation: Map<AssetClass, { min: number; max: number; target: number }>;
  rebalancingRules: string[];
  expectedReturn: { min: number; max: number; average: number };
  volatility: 'low' | 'medium' | 'high';
}

/**
 * Market insights
 */
export interface MarketInsights {
  timestamp: number;
  summary: string;
  assetClassOutlook: Array<{
    assetClass: AssetClass;
    outlook: 'bullish' | 'neutral' | 'bearish';
    factors: string[];
    recommendation: string;
  }>;
  economicIndicators: {
    gdpGrowth?: number;
    inflation?: number;
    unemployment?: number;
    interestRates?: number;
  };
  risks: string[];
  opportunities: string[];
}

/**
 * Investment Advisor Agent
 */
export class InvestmentAdvisorAgent {
  private logger: Logger;
  private metrics: MetricsCollector;

  // Investment strategies
  private strategies = new Map<string, InvestmentStrategy>();

  // Asset class historical returns (simplified)
  private historicalReturns = new Map<AssetClass, number>([
    [AssetClass.STOCKS, 0.10],      // 10% average
    [AssetClass.BONDS, 0.05],       // 5% average
    [AssetClass.REAL_ESTATE, 0.08], // 8% average
    [AssetClass.COMMODITIES, 0.04], // 4% average
    [AssetClass.CASH, 0.02],        // 2% average
    [AssetClass.CRYPTO, 0.15],      // 15% average (high volatility)
    [AssetClass.ALTERNATIVE, 0.07], // 7% average
  ]);

  constructor() {
    this.logger = new Logger('investment-advisor');
    this.metrics = new MetricsCollector('investment-advisor');

    this.initializeStrategies();

    this.logger.info('Investment Advisor Agent initialized');
  }

  /**
   * Generate personalized portfolio recommendation
   */
  async generateRecommendation(profile: InvestorProfile): Promise<PortfolioRecommendation> {
    const startTime = Date.now();

    try {
      this.logger.info('Generating investment recommendation', {
        age: profile.age,
        riskTolerance: profile.riskTolerance
      });

      // Validate profile
      this.validateProfile(profile);

      // Select appropriate strategy
      const strategy = this.selectStrategy(profile);

      // Calculate optimal allocation
      const allocation = this.calculateAllocation(profile, strategy);

      // Generate projections
      const projections = this.generateProjections(profile, allocation);

      // Rebalancing strategy
      const rebalancingStrategy = this.getRebalancingStrategy(profile.riskTolerance);

      // Tax considerations
      const taxConsiderations = this.getTaxConsiderations(profile);

      // Warnings
      const warnings = this.generateWarnings(profile, allocation);

      // Next steps
      const nextSteps = this.generateNextSteps(profile, allocation);

      const recommendation: PortfolioRecommendation = {
        recommendationId: `rec-${Date.now()}`,
        profile,
        allocation,
        projections,
        rebalancingStrategy,
        taxConsiderations,
        warnings,
        nextSteps,
        createdAt: Date.now(),
      };

      const duration = Date.now() - startTime;
      this.metrics.recordValue('recommendation_duration', duration);
      this.logger.info('Recommendation generated', {
        allocationCount: allocation.length,
        duration
      });

      return recommendation;
    } catch (error) {
      this.logger.error('Recommendation generation failed', error);
      throw new AppError('Investment recommendation failed', 'RECOMMENDATION_ERROR', error);
    }
  }

  /**
   * Analyze existing portfolio
   */
  async analyzePortfolio(
    currentPortfolio: Array<{ assetClass: AssetClass; amount: number; returnRate?: number }>,
    profile: InvestorProfile
  ): Promise<PortfolioAnalysis> {
    try {
      this.logger.info('Analyzing portfolio', {
        assetsCount: currentPortfolio.length
      });

      // Calculate current value
      const currentValue = currentPortfolio.reduce((sum, holding) => sum + holding.amount, 0);

      // Calculate performance metrics
      const performance = this.calculatePerformance(currentPortfolio);

      // Analyze allocation
      const currentAllocation = this.calculateCurrentAllocation(currentPortfolio);
      const recommendedStrategy = this.selectStrategy(profile);
      const recommendedAllocation = this.extractTargetAllocation(recommendedStrategy);

      // Calculate deviations
      const deviations = this.calculateDeviations(
        currentAllocation,
        recommendedAllocation,
        currentValue
      );

      // Calculate risk metrics
      const riskMetrics = this.calculateRiskMetrics(currentPortfolio, performance);

      // Generate recommendations
      const recommendations = this.generateAnalysisRecommendations(
        deviations,
        riskMetrics,
        profile
      );

      const analysis: PortfolioAnalysis = {
        analysisId: `analysis-${Date.now()}`,
        currentValue,
        performance,
        allocation: {
          current: currentAllocation,
          recommended: recommendedAllocation,
          deviations,
        },
        riskMetrics,
        recommendations,
        analyzedAt: Date.now(),
      };

      this.logger.info('Portfolio analysis completed', {
        currentValue,
        deviationsCount: deviations.length
      });

      return analysis;
    } catch (error) {
      this.logger.error('Portfolio analysis failed', error);
      throw new AppError('Portfolio analysis failed', 'ANALYSIS_ERROR', error);
    }
  }

  /**
   * Get market insights
   */
  async getMarketInsights(): Promise<MarketInsights> {
    try {
      this.logger.info('Generating market insights');

      // In production, would fetch real market data
      // This is a simplified example

      const insights: MarketInsights = {
        timestamp: Date.now(),
        summary: 'Current market conditions suggest a balanced approach with focus on diversification.',
        assetClassOutlook: [
          {
            assetClass: AssetClass.STOCKS,
            outlook: 'neutral',
            factors: ['Moderate valuations', 'Economic growth continuing'],
            recommendation: 'Maintain diversified equity exposure',
          },
          {
            assetClass: AssetClass.BONDS,
            outlook: 'neutral',
            factors: ['Rising interest rates', 'Inflation concerns'],
            recommendation: 'Consider shorter-duration bonds',
          },
          {
            assetClass: AssetClass.REAL_ESTATE,
            outlook: 'bullish',
            factors: ['Strong demand', 'Limited supply'],
            recommendation: 'Good long-term growth potential',
          },
        ],
        economicIndicators: {
          gdpGrowth: 2.5,
          inflation: 3.2,
          unemployment: 4.1,
          interestRates: 4.5,
        },
        risks: [
          'Geopolitical tensions',
          'Inflation persistence',
          'Market volatility',
        ],
        opportunities: [
          'Undervalued sectors',
          'Emerging markets recovery',
          'Technology innovation',
        ],
      };

      this.logger.info('Market insights generated');

      return insights;
    } catch (error) {
      this.logger.error('Market insights generation failed', error);
      throw new AppError('Market insights failed', 'INSIGHTS_ERROR', error);
    }
  }

  /**
   * Calculate retirement needs
   */
  async calculateRetirementNeeds(
    currentAge: number,
    retirementAge: number,
    desiredAnnualIncome: number,
    currentSavings: number,
    expectedLifespan: number = 85
  ): Promise<{
    requiredSavings: number;
    monthlySavingsNeeded: number;
    projectedIncome: number;
    gap: number;
    recommendations: string[];
  }> {
    try {
      const yearsToRetirement = retirementAge - currentAge;
      const yearsInRetirement = expectedLifespan - retirementAge;

      // Assume 4% withdrawal rate (conservative)
      const requiredSavings = desiredAnnualIncome / 0.04;

      // Calculate monthly savings needed
      // Using future value of annuity formula
      const monthlyRate = 0.07 / 12; // Assume 7% annual return
      const months = yearsToRetirement * 12;

      const futureValueOfCurrent = currentSavings * Math.pow(1 + monthlyRate, months);
      const additionalNeeded = requiredSavings - futureValueOfCurrent;

      let monthlySavingsNeeded = 0;
      if (additionalNeeded > 0) {
        monthlySavingsNeeded =
          (additionalNeeded * monthlyRate) /
          (Math.pow(1 + monthlyRate, months) - 1);
      }

      // Projected income from current trajectory
      const projectedIncome = (futureValueOfCurrent * 0.04);

      const gap = desiredAnnualIncome - projectedIncome;

      const recommendations: string[] = [];

      if (gap > 0) {
        recommendations.push(`Increase monthly savings by $${monthlySavingsNeeded.toFixed(2)}`);
        recommendations.push('Consider maximizing 401(k) contributions');
        recommendations.push('Explore additional income sources');
      } else {
        recommendations.push('Current savings trajectory is on track');
        recommendations.push('Maintain consistent contributions');
      }

      if (yearsToRetirement < 10 && gap > desiredAnnualIncome * 0.2) {
        recommendations.push('Consider delaying retirement by a few years');
        recommendations.push('Explore part-time work during retirement');
      }

      this.logger.info('Retirement needs calculated', {
        requiredSavings,
        gap,
        yearsToRetirement
      });

      return {
        requiredSavings,
        monthlySavingsNeeded,
        projectedIncome,
        gap,
        recommendations,
      };
    } catch (error) {
      this.logger.error('Retirement calculation failed', error);
      throw new AppError('Retirement calculation failed', 'RETIREMENT_CALC_ERROR', error);
    }
  }

  // ===== Private Methods =====

  private initializeStrategies(): void {
    // Conservative strategy
    this.strategies.set('conservative', {
      name: 'Conservative Growth',
      description: 'Prioritizes capital preservation with modest growth',
      suitableFor: {
        riskTolerance: [RiskTolerance.CONSERVATIVE],
        timeHorizon: 'Short to Medium (1-5 years)',
        goals: [InvestmentGoal.INCOME_GENERATION, InvestmentGoal.EMERGENCY_FUND],
      },
      allocation: new Map([
        [AssetClass.STOCKS, { min: 20, max: 40, target: 30 }],
        [AssetClass.BONDS, { min: 40, max: 60, target: 50 }],
        [AssetClass.CASH, { min: 10, max: 20, target: 15 }],
        [AssetClass.REAL_ESTATE, { min: 0, max: 10, target: 5 }],
      ]),
      rebalancingRules: [
        'Rebalance quarterly',
        'Maintain bond allocation above 40%',
        'Limit equity exposure to 40%',
      ],
      expectedReturn: { min: 4, max: 6, average: 5 },
      volatility: 'low',
    });

    // Moderate strategy
    this.strategies.set('moderate', {
      name: 'Balanced Growth',
      description: 'Balances growth and stability',
      suitableFor: {
        riskTolerance: [RiskTolerance.MODERATE],
        timeHorizon: 'Medium to Long (5-15 years)',
        goals: [InvestmentGoal.WEALTH_BUILDING, InvestmentGoal.RETIREMENT],
      },
      allocation: new Map([
        [AssetClass.STOCKS, { min: 50, max: 70, target: 60 }],
        [AssetClass.BONDS, { min: 20, max: 35, target: 25 }],
        [AssetClass.REAL_ESTATE, { min: 5, max: 15, target: 10 }],
        [AssetClass.CASH, { min: 3, max: 8, target: 5 }],
      ]),
      rebalancingRules: [
        'Rebalance semi-annually',
        'Allow 5% drift before rebalancing',
        'Review allocation annually',
      ],
      expectedReturn: { min: 6, max: 9, average: 7.5 },
      volatility: 'medium',
    });

    // Aggressive strategy
    this.strategies.set('aggressive', {
      name: 'Aggressive Growth',
      description: 'Maximizes growth potential with higher risk',
      suitableFor: {
        riskTolerance: [RiskTolerance.AGGRESSIVE],
        timeHorizon: 'Long-term (15+ years)',
        goals: [InvestmentGoal.WEALTH_BUILDING, InvestmentGoal.RETIREMENT],
      },
      allocation: new Map([
        [AssetClass.STOCKS, { min: 70, max: 90, target: 80 }],
        [AssetClass.REAL_ESTATE, { min: 5, max: 15, target: 10 }],
        [AssetClass.ALTERNATIVE, { min: 0, max: 10, target: 5 }],
        [AssetClass.BONDS, { min: 0, max: 10, target: 5 }],
      ]),
      rebalancingRules: [
        'Rebalance annually',
        'Allow 10% drift before rebalancing',
        'Stay fully invested',
      ],
      expectedReturn: { min: 8, max: 12, average: 10 },
      volatility: 'high',
    });

    this.logger.debug('Investment strategies initialized', {
      strategiesCount: this.strategies.size
    });
  }

  private validateProfile(profile: InvestorProfile): void {
    if (profile.age < 18 || profile.age > 100) {
      throw new ValidationError('Invalid age');
    }

    if (profile.annualIncome < 0 || profile.currentSavings < 0) {
      throw new ValidationError('Income and savings must be non-negative');
    }

    if (profile.investmentGoals.length === 0) {
      throw new ValidationError('At least one investment goal is required');
    }
  }

  private selectStrategy(profile: InvestorProfile): InvestmentStrategy {
    // Select based on risk tolerance
    let strategyKey = 'moderate';

    if (profile.riskTolerance === RiskTolerance.CONSERVATIVE) {
      strategyKey = 'conservative';
    } else if (profile.riskTolerance === RiskTolerance.AGGRESSIVE) {
      strategyKey = 'aggressive';
    }

    // Adjust for age (more conservative as age increases)
    if (profile.age > 60 && strategyKey === 'aggressive') {
      this.logger.info('Adjusting strategy for age', { age: profile.age });
      strategyKey = 'moderate';
    }

    if (profile.age > 70 && strategyKey === 'moderate') {
      strategyKey = 'conservative';
    }

    const strategy = this.strategies.get(strategyKey);
    if (!strategy) {
      throw new AppError('Strategy not found', 'STRATEGY_NOT_FOUND');
    }

    return strategy;
  }

  private calculateAllocation(
    profile: InvestorProfile,
    strategy: InvestmentStrategy
  ): PortfolioRecommendation['allocation'] {
    const allocation: PortfolioRecommendation['allocation'] = [];
    const totalAmount = profile.currentSavings;

    for (const [assetClass, params] of strategy.allocation) {
      const percentage = params.target;
      const amount = (totalAmount * percentage) / 100;
      const expectedReturn = this.historicalReturns.get(assetClass) || 0.05;

      let risk: 'low' | 'medium' | 'high' = 'medium';
      if (assetClass === AssetClass.BONDS || assetClass === AssetClass.CASH) {
        risk = 'low';
      } else if (assetClass === AssetClass.STOCKS || assetClass === AssetClass.CRYPTO) {
        risk = 'high';
      }

      allocation.push({
        assetClass,
        percentage,
        amount,
        reasoning: this.getAssetClassReasoning(assetClass, profile),
        expectedReturn: expectedReturn * 100,
        risk,
      });
    }

    return allocation.sort((a, b) => b.percentage - a.percentage);
  }

  private generateProjections(
    profile: InvestorProfile,
    allocation: PortfolioRecommendation['allocation']
  ): PortfolioRecommendation['projections'] {
    const years = 30; // Project 30 years
    const conservative: { year: number; amount: number }[] = [];
    const expected: { year: number; amount: number }[] = [];
    const optimistic: { year: number; amount: number }[] = [];

    // Calculate weighted average return
    const avgReturn = allocation.reduce(
      (sum, alloc) => sum + (alloc.expectedReturn / 100) * (alloc.percentage / 100),
      0
    );

    let conservativeAmount = profile.currentSavings;
    let expectedAmount = profile.currentSavings;
    let optimisticAmount = profile.currentSavings;

    const monthlyContribution = profile.monthlyInvestmentCapacity;

    for (let year = 1; year <= years; year++) {
      // Conservative (70% of expected return)
      conservativeAmount =
        conservativeAmount * (1 + avgReturn * 0.7) + monthlyContribution * 12;

      // Expected
      expectedAmount = expectedAmount * (1 + avgReturn) + monthlyContribution * 12;

      // Optimistic (130% of expected return)
      optimisticAmount =
        optimisticAmount * (1 + avgReturn * 1.3) + monthlyContribution * 12;

      if (year % 5 === 0 || year === 1) {
        conservative.push({ year, amount: Math.round(conservativeAmount) });
        expected.push({ year, amount: Math.round(expectedAmount) });
        optimistic.push({ year, amount: Math.round(optimisticAmount) });
      }
    }

    return { conservative, expected, optimistic };
  }

  private getRebalancingStrategy(
    riskTolerance: RiskTolerance
  ): PortfolioRecommendation['rebalancingStrategy'] {
    const strategies = {
      [RiskTolerance.CONSERVATIVE]: {
        frequency: 'quarterly' as const,
        triggers: [
          'Any asset class deviates more than 5% from target',
          'Market volatility exceeds threshold',
          'Economic conditions change significantly',
        ],
      },
      [RiskTolerance.MODERATE]: {
        frequency: 'annually' as const,
        triggers: [
          'Any asset class deviates more than 10% from target',
          'Major life events occur',
          'Investment goals change',
        ],
      },
      [RiskTolerance.AGGRESSIVE]: {
        frequency: 'annually' as const,
        triggers: [
          'Any asset class deviates more than 15% from target',
          'Significant underperformance detected',
        ],
      },
    };

    return strategies[riskTolerance];
  }

  private getTaxConsiderations(profile: InvestorProfile): string[] {
    const considerations: string[] = [];

    considerations.push('Maximize tax-advantaged accounts (401k, IRA, HSA)');
    considerations.push('Consider tax-loss harvesting in taxable accounts');

    if (profile.annualIncome > 200000) {
      considerations.push('Municipal bonds may provide tax-free income');
      considerations.push('Consider tax-efficient fund placement');
    }

    considerations.push('Hold growth stocks long-term for favorable capital gains treatment');

    return considerations;
  }

  private generateWarnings(
    profile: InvestorProfile,
    allocation: PortfolioRecommendation['allocation']
  ): string[] {
    const warnings: string[] = [];

    // Check emergency fund
    const cashAllocation = allocation.find(a => a.assetClass === AssetClass.CASH);
    const emergencyFundNeeded = profile.financialObligations?.monthlyExpenses
      ? profile.financialObligations.monthlyExpenses * 6
      : profile.annualIncome / 4;

    if (!cashAllocation || cashAllocation.amount < emergencyFundNeeded) {
      warnings.push(
        `Consider building emergency fund to $${emergencyFundNeeded.toFixed(0)} (6 months expenses)`
      );
    }

    // Check debt
    if (profile.financialObligations && profile.financialObligations.debts > profile.currentSavings * 0.5) {
      warnings.push('High debt levels - consider debt reduction before aggressive investing');
    }

    // Check diversification
    const maxAllocation = Math.max(...allocation.map(a => a.percentage));
    if (maxAllocation > 70) {
      warnings.push('Portfolio may be overconcentrated in single asset class');
    }

    return warnings;
  }

  private generateNextSteps(
    profile: InvestorProfile,
    allocation: PortfolioRecommendation['allocation']
  ): string[] {
    const steps: string[] = [];

    steps.push('Open necessary investment accounts (brokerage, IRA, etc.)');
    steps.push('Set up automatic monthly contributions');

    for (const alloc of allocation.slice(0, 3)) {
      steps.push(
        `Invest ${alloc.percentage}% ($${alloc.amount.toFixed(0)}) in ${alloc.assetClass}`
      );
    }

    steps.push('Review and rebalance according to schedule');
    steps.push('Monitor performance quarterly');
    steps.push('Adjust strategy as life circumstances change');

    return steps;
  }

  private calculatePerformance(
    portfolio: Array<{ assetClass: AssetClass; amount: number; returnRate?: number }>
  ): PortfolioAnalysis['performance'] {
    // Simplified performance calculation
    const avgReturn = portfolio.reduce((sum, holding) => {
      const returnRate = holding.returnRate || this.historicalReturns.get(holding.assetClass) || 0.05;
      const weight = holding.amount / portfolio.reduce((s, h) => s + h.amount, 0);
      return sum + returnRate * weight;
    }, 0);

    return {
      returnYTD: avgReturn * 100,
      return1Year: avgReturn * 100,
      volatility: 15, // Simplified
    };
  }

  private calculateCurrentAllocation(
    portfolio: Array<{ assetClass: AssetClass; amount: number }>
  ): Map<AssetClass, number> {
    const total = portfolio.reduce((sum, holding) => sum + holding.amount, 0);
    const allocation = new Map<AssetClass, number>();

    for (const holding of portfolio) {
      const percentage = (holding.amount / total) * 100;
      allocation.set(
        holding.assetClass,
        (allocation.get(holding.assetClass) || 0) + percentage
      );
    }

    return allocation;
  }

  private extractTargetAllocation(strategy: InvestmentStrategy): Map<AssetClass, number> {
    const allocation = new Map<AssetClass, number>();

    for (const [assetClass, params] of strategy.allocation) {
      allocation.set(assetClass, params.target);
    }

    return allocation;
  }

  private calculateDeviations(
    current: Map<AssetClass, number>,
    target: Map<AssetClass, number>,
    totalValue: number
  ): PortfolioAnalysis['allocation']['deviations'] {
    const deviations: PortfolioAnalysis['allocation']['deviations'] = [];

    // Check all asset classes
    const allAssetClasses = new Set([...current.keys(), ...target.keys()]);

    for (const assetClass of allAssetClasses) {
      const currentPct = current.get(assetClass) || 0;
      const targetPct = target.get(assetClass) || 0;
      const deviation = currentPct - targetPct;

      let action: 'buy' | 'sell' | 'hold' = 'hold';
      if (Math.abs(deviation) > 5) {
        action = deviation > 0 ? 'sell' : 'buy';
      }

      deviations.push({
        assetClass,
        currentPct,
        targetPct,
        deviation,
        action,
      });
    }

    return deviations.sort((a, b) => Math.abs(b.deviation) - Math.abs(a.deviation));
  }

  private calculateRiskMetrics(
    portfolio: Array<{ assetClass: AssetClass; amount: number }>,
    performance: PortfolioAnalysis['performance']
  ): PortfolioAnalysis['riskMetrics'] {
    // Count number of asset classes for diversification
    const uniqueAssets = new Set(portfolio.map(h => h.assetClass)).size;
    const diversificationScore = Math.min(100, (uniqueAssets / 7) * 100);

    return {
      maxDrawdown: -15, // Simplified
      diversificationScore,
    };
  }

  private generateAnalysisRecommendations(
    deviations: PortfolioAnalysis['allocation']['deviations'],
    riskMetrics: PortfolioAnalysis['riskMetrics'],
    profile: InvestorProfile
  ): PortfolioAnalysis['recommendations'] {
    const recommendations: PortfolioAnalysis['recommendations'] = [];

    // Rebalancing recommendations
    const largeDeviations = deviations.filter(d => Math.abs(d.deviation) > 10);
    if (largeDeviations.length > 0) {
      recommendations.push({
        priority: 'high',
        action: 'Rebalance portfolio',
        reasoning: `${largeDeviations.length} asset classes deviate significantly from target`,
        expectedImpact: 'Restore risk profile and improve diversification',
      });
    }

    // Diversification recommendations
    if (riskMetrics.diversificationScore < 60) {
      recommendations.push({
        priority: 'medium',
        action: 'Increase diversification',
        reasoning: 'Portfolio is concentrated in few asset classes',
        expectedImpact: 'Reduce risk through better diversification',
      });
    }

    // General recommendation
    recommendations.push({
      priority: 'low',
      action: 'Continue regular contributions',
      reasoning: 'Dollar-cost averaging reduces market timing risk',
      expectedImpact: 'Steady portfolio growth over time',
    });

    return recommendations;
  }

  private getAssetClassReasoning(assetClass: AssetClass, profile: InvestorProfile): string {
    const reasoning: Record<AssetClass, string> = {
      [AssetClass.STOCKS]: 'Growth potential through equity markets',
      [AssetClass.BONDS]: 'Income generation and portfolio stability',
      [AssetClass.REAL_ESTATE]: 'Inflation hedge and diversification',
      [AssetClass.COMMODITIES]: 'Inflation protection and diversification',
      [AssetClass.CASH]: 'Liquidity and emergency fund',
      [AssetClass.CRYPTO]: 'High-risk, high-reward alternative asset',
      [AssetClass.ALTERNATIVE]: 'Diversification beyond traditional assets',
    };

    return reasoning[assetClass] || 'Portfolio diversification';
  }
}
