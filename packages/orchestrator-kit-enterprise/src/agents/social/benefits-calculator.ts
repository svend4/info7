/**
 * Benefits Calculator Agent
 *
 * Specialized agent for calculating social benefits based on Russian legislation
 * (ФЗ-178, ФЗ-181, ФЗ-400, ФЗ-81).
 * Integrates with @info7/common utilities.
 */

import {
  Logger,
  MetricsCollector,
  AppError,
  ValidationError,
  Validator,
  commonSchemas,
} from '@info7/common';
import { z } from 'zod';

/**
 * Benefit types based on Russian legislation
 */
export enum BenefitType {
  PENSION_DISABILITY = 'pension-disability',     // ФЗ-400
  PENSION_OLD_AGE = 'pension-old-age',           // ФЗ-400
  CHILD_SUPPORT = 'child-support',               // ФЗ-81
  DISABILITY_SUPPORT = 'disability-support',     // ФЗ-181
  UNEMPLOYMENT = 'unemployment',                 // ФЗ-1032-1
  MATERNITY = 'maternity',                       // ФЗ-81
  HOUSING_SUBSIDY = 'housing-subsidy',           // ФЗ-178
}

/**
 * Disability group (Russian classification)
 */
export enum DisabilityGroup {
  GROUP_1 = '1',  // Most severe
  GROUP_2 = '2',
  GROUP_3 = '3',  // Least severe
  CHILD = 'child',
}

/**
 * Benefit input data
 */
export interface BenefitInput {
  // Personal information
  age: number;
  hasDisability: boolean;
  disabilityGroup?: DisabilityGroup;
  workExperience: number;  // years

  // Family information
  childrenCount: number;
  childrenAges: number[];
  isPregnant: boolean;

  // Financial information
  monthlyIncome: number;
  region: string;
  livingArea: number;  // square meters

  // Employment
  isEmployed: boolean;
  lastSalary?: number;
}

/**
 * Single benefit calculation
 */
export interface Benefit {
  type: BenefitType;
  name: string;
  amount: number;
  frequency: 'monthly' | 'yearly' | 'one-time';
  law: string;
  eligible: boolean;
  reason?: string;
  nextSteps: string[];
}

/**
 * Complete benefit calculation result
 */
export interface BenefitResult {
  eligible: Benefit[];
  notEligible: Benefit[];
  totalMonthly: number;
  totalYearly: number;
  recommendations: string[];
  nextSteps: string[];
  calculatedAt: number;
}

/**
 * Benefit rule definition
 */
interface BenefitRule {
  type: BenefitType;
  name: string;
  law: string;
  baseAmount: number;
  frequency: 'monthly' | 'yearly' | 'one-time';
  checkEligibility: (input: BenefitInput) => { eligible: boolean; reason?: string };
  calculateAmount: (input: BenefitInput) => number;
  getNextSteps: () => string[];
}

/**
 * Benefits Calculator Agent
 */
export class BenefitsCalculatorAgent {
  private logger: Logger;
  private metrics: MetricsCollector;
  private rules: Map<BenefitType, BenefitRule>;

  // Constants (2026 values, updated annually)
  private readonly PENSION_BASE = 7500;  // руб/месяц
  private readonly CHILD_SUPPORT_BASE = 6000;  // руб/месяц
  private readonly DISABILITY_MULTIPLIERS = {
    [DisabilityGroup.GROUP_1]: 2.0,
    [DisabilityGroup.GROUP_2]: 1.5,
    [DisabilityGroup.GROUP_3]: 1.0,
    [DisabilityGroup.CHILD]: 2.5,
  };
  private readonly RETIREMENT_AGE = { male: 65, female: 60 };
  private readonly MIN_WORK_EXPERIENCE = 15;  // years

  constructor() {
    this.logger = new Logger({
      level: 'info',
      context: { agent: 'benefits-calculator' },
    });

    this.metrics = new MetricsCollector();
    this.rules = new Map();

    this.initializeRules();
    this.logger.info('Benefits Calculator Agent initialized');
  }

  /**
   * Initialize benefit calculation rules
   */
  private initializeRules(): void {
    // Old Age Pension (ФЗ-400)
    this.rules.set(BenefitType.PENSION_OLD_AGE, {
      type: BenefitType.PENSION_OLD_AGE,
      name: 'Пенсия по старости',
      law: 'ФЗ-400',
      baseAmount: this.PENSION_BASE,
      frequency: 'monthly',
      checkEligibility: (input) => {
        if (input.age >= this.RETIREMENT_AGE.male &&
            input.workExperience >= this.MIN_WORK_EXPERIENCE) {
          return { eligible: true };
        }
        return {
          eligible: false,
          reason: `Требуется возраст ${this.RETIREMENT_AGE.male}+ и стаж ${this.MIN_WORK_EXPERIENCE}+ лет`,
        };
      },
      calculateAmount: (input) => {
        const baseAmount = this.PENSION_BASE;
        const experienceBonus = Math.max(0, input.workExperience - this.MIN_WORK_EXPERIENCE) * 100;
        return baseAmount + experienceBonus;
      },
      getNextSteps: () => [
        'Обратиться в Пенсионный Фонд РФ',
        'Подготовить трудовую книжку',
        'Получить справку о доходах',
        'Подать заявление за 1 месяц до пенсионного возраста',
      ],
    });

    // Disability Pension (ФЗ-181)
    this.rules.set(BenefitType.PENSION_DISABILITY, {
      type: BenefitType.PENSION_DISABILITY,
      name: 'Пенсия по инвалидности',
      law: 'ФЗ-181',
      baseAmount: this.PENSION_BASE,
      frequency: 'monthly',
      checkEligibility: (input) => {
        if (input.hasDisability && input.disabilityGroup) {
          return { eligible: true };
        }
        return {
          eligible: false,
          reason: 'Требуется установленная группа инвалидности',
        };
      },
      calculateAmount: (input) => {
        if (!input.disabilityGroup) return 0;
        const multiplier = this.DISABILITY_MULTIPLIERS[input.disabilityGroup];
        return this.PENSION_BASE * multiplier;
      },
      getNextSteps: () => [
        'Пройти медико-социальную экспертизу (МСЭ)',
        'Получить справку об инвалидности',
        'Обратиться в Пенсионный Фонд РФ',
        'Подать заявление с медицинскими документами',
      ],
    });

    // Child Support (ФЗ-81)
    this.rules.set(BenefitType.CHILD_SUPPORT, {
      type: BenefitType.CHILD_SUPPORT,
      name: 'Пособие на ребёнка',
      law: 'ФЗ-81',
      baseAmount: this.CHILD_SUPPORT_BASE,
      frequency: 'monthly',
      checkEligibility: (input) => {
        const childrenUnder18 = input.childrenAges.filter(age => age < 18).length;
        if (childrenUnder18 > 0) {
          return { eligible: true };
        }
        return {
          eligible: false,
          reason: 'Требуется наличие детей до 18 лет',
        };
      },
      calculateAmount: (input) => {
        const childrenUnder18 = input.childrenAges.filter(age => age < 18).length;
        const childrenUnder3 = input.childrenAges.filter(age => age < 3).length;

        let total = childrenUnder18 * this.CHILD_SUPPORT_BASE;

        // Повышенное пособие для детей до 3 лет
        total += childrenUnder3 * this.CHILD_SUPPORT_BASE * 0.5;

        return total;
      },
      getNextSteps: () => [
        'Обратиться в МФЦ или отдел соцзащиты',
        'Подготовить свидетельства о рождении детей',
        'Предоставить справку о доходах семьи',
        'Заполнить заявление на пособие',
      ],
    });

    // Maternity Benefit (ФЗ-81)
    this.rules.set(BenefitType.MATERNITY, {
      type: BenefitType.MATERNITY,
      name: 'Пособие по беременности и родам',
      law: 'ФЗ-81',
      baseAmount: 70000,  // one-time payment
      frequency: 'one-time',
      checkEligibility: (input) => {
        if (input.isPregnant) {
          return { eligible: true };
        }
        return {
          eligible: false,
          reason: 'Требуется беременность',
        };
      },
      calculateAmount: (input) => {
        if (!input.lastSalary) return 70000;  // minimum

        // 100% of average salary for 140 days (normal birth)
        const dailySalary = input.lastSalary / 30;
        return dailySalary * 140;
      },
      getNextSteps: () => [
        'Получить больничный лист в женской консультации',
        'Обратиться к работодателю (если трудоустроены)',
        'Подать заявление в течение 6 месяцев после родов',
        'Предоставить справку о доходах за 2 года',
      ],
    });

    // Housing Subsidy (ФЗ-178)
    this.rules.set(BenefitType.HOUSING_SUBSIDY, {
      type: BenefitType.HOUSING_SUBSIDY,
      name: 'Субсидия на оплату ЖКУ',
      law: 'ФЗ-178',
      baseAmount: 3000,  // average
      frequency: 'monthly',
      checkEligibility: (input) => {
        // Housing costs > 22% of family income threshold
        const housingCostThreshold = input.monthlyIncome * 0.22;
        const estimatedHousingCost = input.livingArea * 150;  // руб/м² average

        if (estimatedHousingCost > housingCostThreshold) {
          return { eligible: true };
        }
        return {
          eligible: false,
          reason: 'Расходы на ЖКУ не превышают 22% дохода семьи',
        };
      },
      calculateAmount: (input) => {
        const housingCostThreshold = input.monthlyIncome * 0.22;
        const estimatedHousingCost = input.livingArea * 150;

        return Math.max(0, estimatedHousingCost - housingCostThreshold);
      },
      getNextSteps: () => [
        'Собрать квитанции об оплате ЖКУ за последние 6 месяцев',
        'Получить справки о доходах всех членов семьи',
        'Обратиться в МФЦ или отдел соцзащиты',
        'Подать заявление на субсидию',
      ],
    });

    this.logger.info('Benefit rules initialized', {
      count: this.rules.size,
    });
  }

  /**
   * Calculate all eligible benefits
   */
  async calculateBenefits(input: BenefitInput): Promise<BenefitResult> {
    const calculationCounter = this.metrics.counter(
      'benefits.calculation.total'
    );
    const calculationTimer = this.metrics.timer(
      'benefits.calculation.duration'
    );

    this.logger.info('Calculating benefits', {
      age: input.age,
      childrenCount: input.childrenCount,
      hasDisability: input.hasDisability,
    });

    // Validate input
    this.validateInput(input);

    try {
      const result = await calculationTimer.time(async () => {
        const eligible: Benefit[] = [];
        const notEligible: Benefit[] = [];

        // Check each benefit rule
        for (const [type, rule] of this.rules) {
          const eligibilityCheck = rule.checkEligibility(input);

          const benefit: Benefit = {
            type: rule.type,
            name: rule.name,
            amount: eligibilityCheck.eligible ? rule.calculateAmount(input) : 0,
            frequency: rule.frequency,
            law: rule.law,
            eligible: eligibilityCheck.eligible,
            reason: eligibilityCheck.reason,
            nextSteps: eligibilityCheck.eligible ? rule.getNextSteps() : [],
          };

          if (eligibilityCheck.eligible) {
            eligible.push(benefit);
          } else {
            notEligible.push(benefit);
          }
        }

        // Calculate totals
        const monthlyBenefits = eligible.filter(b => b.frequency === 'monthly');
        const yearlyBenefits = eligible.filter(b => b.frequency === 'yearly');
        const oneTimeBenefits = eligible.filter(b => b.frequency === 'one-time');

        const totalMonthly = monthlyBenefits.reduce((sum, b) => sum + b.amount, 0);
        const totalYearly = totalMonthly * 12 +
                            yearlyBenefits.reduce((sum, b) => sum + b.amount, 0);

        // Generate recommendations
        const recommendations = this.generateRecommendations(input, eligible, notEligible);

        // Collect all next steps
        const nextSteps = eligible.flatMap(b => b.nextSteps);

        return {
          eligible,
          notEligible,
          totalMonthly,
          totalYearly,
          recommendations,
          nextSteps: [...new Set(nextSteps)],  // unique steps
          calculatedAt: Date.now(),
        };
      });

      calculationCounter.inc();

      // Track metrics
      const benefitsGauge = this.metrics.gauge('benefits.eligible.count');
      benefitsGauge.set(result.eligible.length);

      const amountGauge = this.metrics.gauge('benefits.total.monthly');
      amountGauge.set(result.totalMonthly);

      this.logger.info('Benefits calculated', {
        eligibleCount: result.eligible.length,
        totalMonthly: result.totalMonthly,
      });

      return result;
    } catch (error) {
      this.logger.error('Benefits calculation failed', error);
      throw new AppError(
        'Benefits calculation failed',
        'BENEFITS_CALCULATION_FAILED',
        500,
        'medium'
      );
    }
  }

  /**
   * Validate input data
   */
  private validateInput(input: BenefitInput): void {
    if (input.age < 0 || input.age > 120) {
      throw new ValidationError('Invalid age', {
        age: ['Age must be between 0 and 120'],
      });
    }

    if (input.workExperience < 0 || input.workExperience > input.age) {
      throw new ValidationError('Invalid work experience', {
        workExperience: ['Work experience cannot exceed age'],
      });
    }

    if (input.childrenCount < 0) {
      throw new ValidationError('Invalid children count', {
        childrenCount: ['Children count cannot be negative'],
      });
    }

    if (input.childrenAges.length !== input.childrenCount) {
      throw new ValidationError('Children ages mismatch', {
        childrenAges: ['Number of ages must match children count'],
      });
    }
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    input: BenefitInput,
    eligible: Benefit[],
    notEligible: Benefit[]
  ): string[] {
    const recommendations: string[] = [];

    if (eligible.length === 0) {
      recommendations.push(
        'В настоящее время вы не имеете права на социальные выплаты'
      );
    } else {
      recommendations.push(
        `Вы имеете право на ${eligible.length} вид(ов) социальных выплат`
      );
    }

    // Check for upcoming eligibility
    const pensionAge = this.RETIREMENT_AGE.male;
    if (input.age >= pensionAge - 5 && input.age < pensionAge) {
      recommendations.push(
        `Через ${pensionAge - input.age} лет вы достигнете пенсионного возраста`
      );
    }

    // Check work experience
    if (input.workExperience < this.MIN_WORK_EXPERIENCE &&
        input.age < pensionAge) {
      const yearsNeeded = this.MIN_WORK_EXPERIENCE - input.workExperience;
      recommendations.push(
        `Для пенсии по старости требуется ещё ${yearsNeeded} лет стажа`
      );
    }

    // Housing subsidy recommendation
    if (!eligible.some(b => b.type === BenefitType.HOUSING_SUBSIDY) &&
        input.monthlyIncome < 30000) {
      recommendations.push(
        'При низком доходе рекомендуется подать заявление на субсидию ЖКУ'
      );
    }

    return recommendations;
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    return this.metrics.export();
  }
}
