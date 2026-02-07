import { Logger } from '@info7/common';
import { MetricsCollector } from '@info7/common';
import { AppError, ValidationError } from '@info7/common';

/**
 * Budget Planner Agent
 *
 * Provides personalized budgeting, expense tracking, and financial planning assistance.
 *
 * IMPORTANT DISCLAIMER:
 * This agent provides general financial planning information and is NOT a substitute
 * for professional financial advice. Always consult certified financial planners or
 * advisors for personalized financial planning, especially for major financial decisions.
 */

// ============================================================================
// Types
// ============================================================================

export enum BudgetCategory {
  // Essential
  HOUSING = 'housing',
  UTILITIES = 'utilities',
  GROCERIES = 'groceries',
  TRANSPORTATION = 'transportation',
  INSURANCE = 'insurance',
  HEALTHCARE = 'healthcare',
  DEBT_PAYMENT = 'debt-payment',

  // Discretionary
  DINING_OUT = 'dining-out',
  ENTERTAINMENT = 'entertainment',
  SHOPPING = 'shopping',
  TRAVEL = 'travel',
  HOBBIES = 'hobbies',
  GIFTS = 'gifts',

  // Financial
  SAVINGS = 'savings',
  INVESTMENTS = 'investments',
  EMERGENCY_FUND = 'emergency-fund',
  RETIREMENT = 'retirement',

  // Other
  OTHER = 'other',
}

export enum BudgetingMethod {
  FIFTY_THIRTY_TWENTY = '50-30-20',  // 50% needs, 30% wants, 20% savings
  ZERO_BASED = 'zero-based',         // Every dollar assigned
  ENVELOPE = 'envelope',              // Cash envelope system
  PAY_YOURSELF_FIRST = 'pay-yourself-first', // Savings first
  PERCENTAGE_BASED = 'percentage-based', // Custom percentages
}

export enum FinancialGoal {
  DEBT_REDUCTION = 'debt-reduction',
  EMERGENCY_FUND = 'emergency-fund',
  HOME_PURCHASE = 'home-purchase',
  VACATION = 'vacation',
  RETIREMENT = 'retirement',
  EDUCATION = 'education',
  WEDDING = 'wedding',
  CAR_PURCHASE = 'car-purchase',
  GENERAL_SAVINGS = 'general-savings',
}

export interface IncomeSource {
  name: string;
  amount: number; // monthly
  frequency: 'monthly' | 'biweekly' | 'weekly';
  taxable: boolean;
}

export interface Expense {
  category: BudgetCategory;
  name: string;
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'annual' | 'one-time';
  isFixed: boolean; // vs variable
  isEssential: boolean;
  dueDate?: number; // day of month
}

export interface Debt {
  type: 'credit-card' | 'student-loan' | 'car-loan' | 'mortgage' | 'personal-loan' | 'other';
  name: string;
  balance: number;
  interestRate: number; // annual percentage
  minimumPayment: number;
  dueDate: number; // day of month
}

export interface SavingsGoal {
  goal: FinancialGoal;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // ISO date
  priority: 'high' | 'medium' | 'low';
  monthlyContribution?: number;
}

export interface BudgetProfile {
  monthlyIncome: IncomeSource[];
  expenses: Expense[];
  debts: Debt[];
  savingsGoals: SavingsGoal[];
  emergencyFundTarget: number; // months of expenses
  preferredMethod?: BudgetingMethod;
}

export interface BudgetPlan {
  totalMonthlyIncome: number;
  totalMonthlyExpenses: number;
  discretionaryIncome: number; // after expenses
  savingsRate: number; // percentage
  budgetMethod: BudgetingMethod;
  categoryAllocations: Array<{
    category: BudgetCategory;
    budgeted: number;
    current: number;
    difference: number;
    percentage: number;
  }>;
  recommendations: BudgetRecommendation[];
  healthScore: number; // 0-100
  cashFlow: {
    month: string;
    income: number;
    expenses: number;
    surplus: number;
  }[];
}

export interface BudgetRecommendation {
  type: 'increase-savings' | 'reduce-expense' | 'debt-payoff' | 'emergency-fund' | 'reallocation';
  priority: 'high' | 'medium' | 'low';
  category?: BudgetCategory;
  recommendation: string;
  potentialSavings?: number;
  implementation: string[];
}

export interface DebtPayoffPlan {
  strategy: 'avalanche' | 'snowball' | 'hybrid';
  totalDebt: number;
  totalInterest: number; // over life of debts
  estimatedPayoffDate: string;
  monthlyPayment: number;
  steps: Array<{
    debtName: string;
    payoffOrder: number;
    monthsToPayoff: number;
    totalInterestPaid: number;
  }>;
  potentialSavings: number; // vs minimum payments only
}

export interface ExpenseAnalysis {
  category: BudgetCategory;
  totalSpent: number;
  averageMonthly: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  percentOfIncome: number;
  comparisonToNational: 'above' | 'average' | 'below';
  topExpenses: Array<{
    name: string;
    amount: number;
    date: string;
  }>;
}

// ============================================================================
// Budget Planner Agent
// ============================================================================

export class BudgetPlannerAgent {
  private logger: Logger;
  private metrics: MetricsCollector;

  // National average expense percentages (US)
  private nationalAverages = {
    [BudgetCategory.HOUSING]: 0.33,
    [BudgetCategory.TRANSPORTATION]: 0.16,
    [BudgetCategory.GROCERIES]: 0.12,
    [BudgetCategory.HEALTHCARE]: 0.08,
    [BudgetCategory.INSURANCE]: 0.11,
    [BudgetCategory.ENTERTAINMENT]: 0.05,
    [BudgetCategory.SAVINGS]: 0.10,
  };

  // Budgeting method rules
  private budgetingRules = new Map<BudgetingMethod, {
    essentialPercent: number;
    discretionaryPercent: number;
    savingsPercent: number;
    description: string;
  }>();

  constructor() {
    this.logger = new Logger('BudgetPlannerAgent');
    this.metrics = new MetricsCollector('budget_planner');
    this.initializeBudgetingRules();
  }

  private initializeBudgetingRules(): void {
    this.budgetingRules.set(BudgetingMethod.FIFTY_THIRTY_TWENTY, {
      essentialPercent: 0.50,
      discretionaryPercent: 0.30,
      savingsPercent: 0.20,
      description: '50% needs, 30% wants, 20% savings - Popular balanced approach',
    });

    this.budgetingRules.set(BudgetingMethod.PAY_YOURSELF_FIRST, {
      essentialPercent: 0.65,
      discretionaryPercent: 0.15,
      savingsPercent: 0.20,
      description: 'Save first (20%), then allocate remaining',
    });

    this.budgetingRules.set(BudgetingMethod.PERCENTAGE_BASED, {
      essentialPercent: 0.60,
      discretionaryPercent: 0.20,
      savingsPercent: 0.20,
      description: 'Custom percentage allocation based on your situation',
    });
  }

  /**
   * Create comprehensive budget plan
   */
  async createBudgetPlan(profile: BudgetProfile): Promise<BudgetPlan> {
    const startTime = Date.now();

    try {
      // Validate input
      if (!profile.monthlyIncome || profile.monthlyIncome.length === 0) {
        throw new ValidationError('At least one income source must be provided');
      }

      this.logger.info('Creating budget plan', {
        incomeSourcesCount: profile.monthlyIncome.length,
        expensesCount: profile.expenses.length,
        debtsCount: profile.debts.length,
      });

      // Calculate total monthly income
      const totalMonthlyIncome = this.calculateTotalIncome(profile.monthlyIncome);

      // Calculate total monthly expenses
      const totalMonthlyExpenses = this.calculateTotalExpenses(profile.expenses);

      // Add debt minimum payments to expenses
      const debtPayments = profile.debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
      const totalExpensesWithDebt = totalMonthlyExpenses + debtPayments;

      // Calculate discretionary income
      const discretionaryIncome = totalMonthlyIncome - totalExpensesWithDebt;

      // Calculate savings rate
      const currentSavings = profile.expenses
        .filter(e => e.category === BudgetCategory.SAVINGS || e.category === BudgetCategory.INVESTMENTS)
        .reduce((sum, e) => sum + this.convertToMonthly(e), 0);
      const savingsRate = (currentSavings / totalMonthlyIncome) * 100;

      // Determine best budgeting method
      const budgetMethod = profile.preferredMethod || this.suggestBudgetingMethod(profile);

      // Create category allocations
      const categoryAllocations = this.createCategoryAllocations(
        profile,
        totalMonthlyIncome,
        budgetMethod
      );

      // Generate recommendations
      const recommendations = this.generateRecommendations(
        profile,
        totalMonthlyIncome,
        totalExpensesWithDebt,
        discretionaryIncome
      );

      // Calculate budget health score
      const healthScore = this.calculateBudgetHealth(
        savingsRate,
        discretionaryIncome,
        totalMonthlyIncome,
        profile
      );

      // Project 6-month cash flow
      const cashFlow = this.projectCashFlow(profile, 6);

      const plan: BudgetPlan = {
        totalMonthlyIncome,
        totalMonthlyExpenses: totalExpensesWithDebt,
        discretionaryIncome,
        savingsRate,
        budgetMethod,
        categoryAllocations,
        recommendations,
        healthScore,
        cashFlow,
      };

      this.metrics.recordMetric('budget_plan_created', 1, {
        method: budgetMethod,
        healthScore,
        duration: Date.now() - startTime,
      });

      return plan;
    } catch (error) {
      this.logger.error('Failed to create budget plan', error);
      throw new AppError('Failed to create budget plan', { cause: error });
    }
  }

  /**
   * Create debt payoff plan
   */
  async createDebtPayoffPlan(
    debts: Debt[],
    extraPayment: number = 0,
    strategy: 'avalanche' | 'snowball' | 'hybrid' = 'avalanche'
  ): Promise<DebtPayoffPlan> {
    try {
      if (!debts || debts.length === 0) {
        throw new ValidationError('No debts provided');
      }

      this.logger.info('Creating debt payoff plan', {
        debtCount: debts.length,
        strategy,
        extraPayment,
      });

      // Calculate totals
      const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
      const totalMinimumPayment = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
      const totalPayment = totalMinimumPayment + extraPayment;

      // Sort debts based on strategy
      const sortedDebts = this.sortDebtsByStrategy(debts, strategy);

      // Calculate payoff schedule
      const payoffSteps = this.calculatePayoffSchedule(
        sortedDebts,
        totalMinimumPayment,
        extraPayment
      );

      // Calculate total interest
      const totalInterest = payoffSteps.reduce((sum, step) => sum + step.totalInterestPaid, 0);

      // Find estimated payoff date
      const maxMonths = Math.max(...payoffSteps.map(s => s.monthsToPayoff));
      const payoffDate = new Date();
      payoffDate.setMonth(payoffDate.getMonth() + maxMonths);

      // Calculate savings vs minimum payments only
      const minimumOnlyInterest = this.calculateMinimumPaymentInterest(debts);
      const potentialSavings = minimumOnlyInterest - totalInterest;

      const plan: DebtPayoffPlan = {
        strategy,
        totalDebt,
        totalInterest,
        estimatedPayoffDate: payoffDate.toISOString().split('T')[0],
        monthlyPayment: totalPayment,
        steps: payoffSteps,
        potentialSavings,
      };

      this.metrics.recordMetric('debt_payoff_plan_created', 1, {
        strategy,
        debtCount: debts.length,
        totalDebt,
      });

      return plan;
    } catch (error) {
      this.logger.error('Failed to create debt payoff plan', error);
      throw new AppError('Failed to create debt payoff plan', { cause: error });
    }
  }

  /**
   * Analyze expense category
   */
  async analyzeExpenseCategory(
    category: BudgetCategory,
    expenses: Expense[],
    monthlyIncome: number
  ): Promise<ExpenseAnalysis> {
    try {
      const categoryExpenses = expenses.filter(e => e.category === category);

      const totalSpent = categoryExpenses.reduce((sum, e) => sum + this.convertToMonthly(e), 0);
      const averageMonthly = totalSpent;

      // Determine trend (simplified - in real implementation, use historical data)
      const trend: 'increasing' | 'stable' | 'decreasing' = 'stable';

      const percentOfIncome = (totalSpent / monthlyIncome) * 100;

      // Compare to national average
      const nationalAvg = this.nationalAverages[category] || 0.05;
      const nationalAvgAmount = monthlyIncome * nationalAvg;
      let comparisonToNational: 'above' | 'average' | 'below';
      if (totalSpent > nationalAvgAmount * 1.2) {
        comparisonToNational = 'above';
      } else if (totalSpent < nationalAvgAmount * 0.8) {
        comparisonToNational = 'below';
      } else {
        comparisonToNational = 'average';
      }

      // Get top expenses
      const topExpenses = categoryExpenses
        .sort((a, b) => this.convertToMonthly(b) - this.convertToMonthly(a))
        .slice(0, 5)
        .map(e => ({
          name: e.name,
          amount: this.convertToMonthly(e),
          date: new Date().toISOString().split('T')[0], // Would use actual date
        }));

      return {
        category,
        totalSpent,
        averageMonthly,
        trend,
        percentOfIncome,
        comparisonToNational,
        topExpenses,
      };
    } catch (error) {
      this.logger.error('Failed to analyze expense category', error);
      throw new AppError('Failed to analyze expense category', { cause: error });
    }
  }

  /**
   * Track savings goals progress
   */
  async trackSavingsGoals(goals: SavingsGoal[]): Promise<Array<{
    goal: SavingsGoal;
    progressPercent: number;
    monthsRemaining: number;
    onTrack: boolean;
    recommendedMonthlyContribution: number;
    projection: {
      atCurrentRate: string; // completion date
      withRecommended: string;
    };
  }>> {
    try {
      return goals.map(goal => {
        const progressPercent = (goal.currentAmount / goal.targetAmount) * 100;
        const remaining = goal.targetAmount - goal.currentAmount;

        const targetDate = new Date(goal.targetDate);
        const today = new Date();
        const monthsRemaining = Math.max(
          0,
          (targetDate.getFullYear() - today.getFullYear()) * 12 +
          (targetDate.getMonth() - today.getMonth())
        );

        const recommendedMonthlyContribution = monthsRemaining > 0
          ? remaining / monthsRemaining
          : remaining;

        const currentContribution = goal.monthlyContribution || 0;
        const onTrack = currentContribution >= recommendedMonthlyContribution * 0.9;

        // Project completion dates
        const atCurrentRateMonths = currentContribution > 0
          ? Math.ceil(remaining / currentContribution)
          : 999;
        const withRecommendedMonths = recommendedMonthlyContribution > 0
          ? Math.ceil(remaining / recommendedMonthlyContribution)
          : 999;

        const atCurrentRateDate = new Date(today);
        atCurrentRateDate.setMonth(atCurrentRateDate.getMonth() + atCurrentRateMonths);

        const withRecommendedDate = new Date(today);
        withRecommendedDate.setMonth(withRecommendedDate.getMonth() + withRecommendedMonths);

        return {
          goal,
          progressPercent: Math.round(progressPercent),
          monthsRemaining,
          onTrack,
          recommendedMonthlyContribution: Math.round(recommendedMonthlyContribution),
          projection: {
            atCurrentRate: atCurrentRateDate.toISOString().split('T')[0],
            withRecommended: withRecommendedDate.toISOString().split('T')[0],
          },
        };
      });
    } catch (error) {
      this.logger.error('Failed to track savings goals', error);
      throw new AppError('Failed to track savings goals', { cause: error });
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private calculateTotalIncome(sources: IncomeSource[]): number {
    return sources.reduce((sum, source) => {
      let monthlyAmount = source.amount;
      if (source.frequency === 'biweekly') {
        monthlyAmount = (source.amount * 26) / 12;
      } else if (source.frequency === 'weekly') {
        monthlyAmount = (source.amount * 52) / 12;
      }
      return sum + monthlyAmount;
    }, 0);
  }

  private calculateTotalExpenses(expenses: Expense[]): number {
    return expenses.reduce((sum, expense) => sum + this.convertToMonthly(expense), 0);
  }

  private convertToMonthly(expense: Expense): number {
    switch (expense.frequency) {
      case 'monthly':
        return expense.amount;
      case 'quarterly':
        return expense.amount / 3;
      case 'annual':
        return expense.amount / 12;
      case 'one-time':
        return expense.amount / 12; // Amortize over year
      default:
        return expense.amount;
    }
  }

  private suggestBudgetingMethod(profile: BudgetProfile): BudgetingMethod {
    const totalIncome = this.calculateTotalIncome(profile.monthlyIncome);
    const totalExpenses = this.calculateTotalExpenses(profile.expenses);
    const discretionaryPercent = 1 - (totalExpenses / totalIncome);

    // If tight budget, suggest zero-based
    if (discretionaryPercent < 0.10) {
      return BudgetingMethod.ZERO_BASED;
    }

    // If high debt, suggest pay yourself first
    if (profile.debts.length > 3) {
      return BudgetingMethod.PAY_YOURSELF_FIRST;
    }

    // Default to 50/30/20
    return BudgetingMethod.FIFTY_THIRTY_TWENTY;
  }

  private createCategoryAllocations(
    profile: BudgetProfile,
    totalIncome: number,
    method: BudgetingMethod
  ): Array<{
    category: BudgetCategory;
    budgeted: number;
    current: number;
    difference: number;
    percentage: number;
  }> {
    const rules = this.budgetingRules.get(method);
    if (!rules) {
      throw new Error(`Unknown budgeting method: ${method}`);
    }

    // Group expenses by category
    const categoryTotals = new Map<BudgetCategory, number>();
    profile.expenses.forEach(expense => {
      const current = categoryTotals.get(expense.category) || 0;
      categoryTotals.set(expense.category, current + this.convertToMonthly(expense));
    });

    // Create allocations
    return Array.from(categoryTotals.entries()).map(([category, current]) => {
      // Determine budgeted amount based on method
      let budgeted: number;
      const isEssential = this.isEssentialCategory(category);

      if (isEssential) {
        budgeted = current; // Keep current for essentials
      } else {
        // Allocate from discretionary budget
        budgeted = totalIncome * rules.discretionaryPercent * 0.2; // Simplified
      }

      return {
        category,
        budgeted: Math.round(budgeted),
        current: Math.round(current),
        difference: Math.round(budgeted - current),
        percentage: Math.round((current / totalIncome) * 100),
      };
    });
  }

  private isEssentialCategory(category: BudgetCategory): boolean {
    const essential = [
      BudgetCategory.HOUSING,
      BudgetCategory.UTILITIES,
      BudgetCategory.GROCERIES,
      BudgetCategory.TRANSPORTATION,
      BudgetCategory.INSURANCE,
      BudgetCategory.HEALTHCARE,
      BudgetCategory.DEBT_PAYMENT,
    ];
    return essential.includes(category);
  }

  private generateRecommendations(
    profile: BudgetProfile,
    income: number,
    expenses: number,
    discretionary: number
  ): BudgetRecommendation[] {
    const recommendations: BudgetRecommendation[] = [];

    // Emergency fund recommendation
    const currentEmergencyFund = profile.savingsGoals
      .find(g => g.goal === FinancialGoal.EMERGENCY_FUND)?.currentAmount || 0;
    const targetEmergencyFund = expenses * (profile.emergencyFundTarget || 6);

    if (currentEmergencyFund < targetEmergencyFund) {
      recommendations.push({
        type: 'emergency-fund',
        priority: 'high',
        recommendation: `Build emergency fund to ${profile.emergencyFundTarget || 6} months of expenses`,
        potentialSavings: targetEmergencyFund - currentEmergencyFund,
        implementation: [
          `Target: $${Math.round(targetEmergencyFund)}`,
          `Current: $${Math.round(currentEmergencyFund)}`,
          `Monthly contribution: $${Math.round((targetEmergencyFund - currentEmergencyFund) / 12)}`,
        ],
      });
    }

    // Savings rate recommendation
    const currentSavingsRate = ((discretionary > 0 ? discretionary : 0) / income) * 100;
    if (currentSavingsRate < 20) {
      recommendations.push({
        type: 'increase-savings',
        priority: 'high',
        recommendation: 'Increase savings rate to at least 20% of income',
        potentialSavings: (income * 0.20) - discretionary,
        implementation: [
          'Automate savings transfers',
          'Review and cut discretionary expenses',
          'Consider additional income sources',
        ],
      });
    }

    // High expense category recommendations
    profile.expenses.forEach(expense => {
      const monthlyAmount = this.convertToMonthly(expense);
      const percentOfIncome = (monthlyAmount / income) * 100;

      if (!expense.isEssential && percentOfIncome > 10) {
        recommendations.push({
          type: 'reduce-expense',
          priority: 'medium',
          category: expense.category,
          recommendation: `Reduce ${expense.category} expenses - currently ${percentOfIncome.toFixed(1)}% of income`,
          potentialSavings: monthlyAmount * 0.25, // Suggest 25% reduction
          implementation: [
            'Review all expenses in this category',
            'Identify non-essential items',
            'Set a monthly limit',
          ],
        });
      }
    });

    // Debt recommendations
    if (profile.debts.length > 0) {
      const highInterestDebt = profile.debts.filter(d => d.interestRate > 15);
      if (highInterestDebt.length > 0) {
        recommendations.push({
          type: 'debt-payoff',
          priority: 'high',
          recommendation: 'Prioritize paying off high-interest debt (>15% APR)',
          implementation: [
            'Use avalanche method (highest interest first)',
            'Consider debt consolidation',
            'Allocate extra payments to highest rate debt',
          ],
        });
      }
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  private calculateBudgetHealth(
    savingsRate: number,
    discretionary: number,
    income: number,
    profile: BudgetProfile
  ): number {
    let score = 50; // Base score

    // Savings rate (max 30 points)
    if (savingsRate >= 20) score += 30;
    else if (savingsRate >= 15) score += 20;
    else if (savingsRate >= 10) score += 10;

    // Discretionary income (max 20 points)
    const discretionaryPercent = (discretionary / income) * 100;
    if (discretionaryPercent >= 20) score += 20;
    else if (discretionaryPercent >= 10) score += 10;
    else if (discretionaryPercent < 0) score -= 20;

    // Emergency fund (max 20 points)
    const hasEmergencyFund = profile.savingsGoals.some(
      g => g.goal === FinancialGoal.EMERGENCY_FUND && g.currentAmount > 0
    );
    if (hasEmergencyFund) score += 20;

    // Debt situation (max 10 points)
    const debtToIncomeRatio = profile.debts.reduce((sum, d) => sum + d.minimumPayment, 0) / income;
    if (debtToIncomeRatio < 0.10) score += 10;
    else if (debtToIncomeRatio > 0.40) score -= 10;

    return Math.max(0, Math.min(100, score));
  }

  private projectCashFlow(profile: BudgetProfile, months: number): Array<{
    month: string;
    income: number;
    expenses: number;
    surplus: number;
  }> {
    const projections = [];
    const monthlyIncome = this.calculateTotalIncome(profile.monthlyIncome);
    const monthlyExpenses = this.calculateTotalExpenses(profile.expenses);
    const debtPayments = profile.debts.reduce((sum, d) => sum + d.minimumPayment, 0);

    for (let i = 0; i < months; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      const monthName = date.toLocaleString('en-US', { month: 'short', year: 'numeric' });

      projections.push({
        month: monthName,
        income: Math.round(monthlyIncome),
        expenses: Math.round(monthlyExpenses + debtPayments),
        surplus: Math.round(monthlyIncome - monthlyExpenses - debtPayments),
      });
    }

    return projections;
  }

  private sortDebtsByStrategy(
    debts: Debt[],
    strategy: 'avalanche' | 'snowball' | 'hybrid'
  ): Debt[] {
    const sorted = [...debts];

    if (strategy === 'avalanche') {
      // Highest interest rate first
      sorted.sort((a, b) => b.interestRate - a.interestRate);
    } else if (strategy === 'snowball') {
      // Smallest balance first
      sorted.sort((a, b) => a.balance - b.balance);
    } else {
      // Hybrid: high interest (>20%) first, then smallest balance
      const highInterest = sorted.filter(d => d.interestRate > 20).sort((a, b) => b.interestRate - a.interestRate);
      const rest = sorted.filter(d => d.interestRate <= 20).sort((a, b) => a.balance - b.balance);
      return [...highInterest, ...rest];
    }

    return sorted;
  }

  private calculatePayoffSchedule(
    debts: Debt[],
    minimumPayment: number,
    extraPayment: number
  ): Array<{
    debtName: string;
    payoffOrder: number;
    monthsToPayoff: number;
    totalInterestPaid: number;
  }> {
    const steps = [];
    let totalExtra = extraPayment;
    let cumulativeMonths = 0;

    debts.forEach((debt, index) => {
      const payment = debt.minimumPayment + (index === 0 ? totalExtra : 0);
      const monthsToPayoff = this.calculateMonthsToPayoff(
        debt.balance,
        payment,
        debt.interestRate / 100 / 12
      );
      const totalInterestPaid = (payment * monthsToPayoff) - debt.balance;

      steps.push({
        debtName: debt.name,
        payoffOrder: index + 1,
        monthsToPayoff: Math.ceil(monthsToPayoff),
        totalInterestPaid: Math.max(0, totalInterestPaid),
      });

      // Once this debt is paid off, add its payment to extra for next debt
      if (index < debts.length - 1) {
        totalExtra += debt.minimumPayment;
      }

      cumulativeMonths += monthsToPayoff;
    });

    return steps;
  }

  private calculateMonthsToPayoff(
    balance: number,
    monthlyPayment: number,
    monthlyRate: number
  ): number {
    if (monthlyRate === 0) {
      return balance / monthlyPayment;
    }

    // Using amortization formula
    const months = -Math.log(1 - (balance * monthlyRate) / monthlyPayment) / Math.log(1 + monthlyRate);
    return Math.max(1, months);
  }

  private calculateMinimumPaymentInterest(debts: Debt[]): number {
    return debts.reduce((sum, debt) => {
      const months = this.calculateMonthsToPayoff(
        debt.balance,
        debt.minimumPayment,
        debt.interestRate / 100 / 12
      );
      const totalPaid = debt.minimumPayment * months;
      return sum + (totalPaid - debt.balance);
    }, 0);
  }
}
