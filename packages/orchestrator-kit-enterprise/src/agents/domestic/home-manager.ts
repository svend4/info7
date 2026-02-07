/**
 * Home Manager Agent
 *
 * Specialized agent for household planning, task scheduling, budget management,
 * and home automation recommendations.
 * Integrates with @info7/common utilities.
 */

import {
  Logger,
  MetricsCollector,
  AppError,
  ValidationError,
} from '@info7/common';

/**
 * Task frequency
 */
export enum TaskFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

/**
 * Task priority
 */
export enum TaskPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

/**
 * Task category
 */
export enum TaskCategory {
  CLEANING = 'cleaning',
  COOKING = 'cooking',
  SHOPPING = 'shopping',
  MAINTENANCE = 'maintenance',
  CHILDCARE = 'childcare',
  PETCARE = 'petcare',
  GARDENING = 'gardening',
  LAUNDRY = 'laundry',
  ORGANIZATION = 'organization',
}

/**
 * Household task
 */
export interface HouseholdTask {
  id: string;
  name: string;
  category: TaskCategory;
  frequency: TaskFrequency;
  priority: TaskPriority;
  estimatedTime: number;  // minutes
  assignedTo?: string;
  dueDate?: number;
  notes?: string;
}

/**
 * Budget category
 */
export interface BudgetCategory {
  name: string;
  plannedAmount: number;
  actualSpent: number;
  remaining: number;
  items: BudgetItem[];
}

/**
 * Budget item
 */
export interface BudgetItem {
  description: string;
  amount: number;
  date: number;
  category: string;
}

/**
 * Household preferences
 */
export interface HouseholdPreferences {
  // Family size
  adults: number;
  children: number;
  pets: number;

  // Home details
  homeSize: number;  // square meters
  rooms: number;
  hasgarden: boolean;

  // Preferences
  cleaningLevel: 'minimal' | 'standard' | 'thorough';
  cookingFrequency: 'rarely' | 'sometimes' | 'daily';
  budgetConstraint: 'tight' | 'moderate' | 'flexible';

  // Availability
  availableTime: number;  // hours per week
  preferredDays: string[];
}

/**
 * Household plan
 */
export interface HouseholdPlan {
  tasks: HouseholdTask[];
  schedule: Map<string, HouseholdTask[]>;  // day -> tasks
  budget: {
    total: number;
    categories: BudgetCategory[];
  };
  recommendations: string[];
  automations: AutomationSuggestion[];
  estimatedTimePerWeek: number;
}

/**
 * Automation suggestion
 */
export interface AutomationSuggestion {
  task: string;
  device: string;
  estimatedCost: number;
  timeSaved: number;  // hours per week
  priority: TaskPriority;
  paybackPeriod: number;  // months
}

/**
 * Home Manager Agent
 */
export class HomeManagerAgent {
  private logger: Logger;
  private metrics: MetricsCollector;

  // Standard time estimates (minutes)
  private readonly TIME_ESTIMATES = {
    [TaskCategory.CLEANING]: {
      'vacuum-floors': 30,
      'mop-floors': 25,
      'dust-surfaces': 20,
      'clean-bathroom': 30,
      'clean-kitchen': 25,
      'make-beds': 10,
      'tidy-rooms': 15,
    },
    [TaskCategory.COOKING]: {
      'prepare-breakfast': 15,
      'prepare-lunch': 30,
      'prepare-dinner': 45,
      'meal-prep': 120,
      'grocery-planning': 20,
    },
    [TaskCategory.SHOPPING]: {
      'grocery-shopping': 60,
      'household-supplies': 30,
      'online-ordering': 15,
    },
    [TaskCategory.LAUNDRY]: {
      'wash-clothes': 20,
      'dry-clothes': 10,
      'fold-clothes': 30,
      'iron-clothes': 40,
    },
    [TaskCategory.MAINTENANCE]: {
      'check-hvac': 15,
      'replace-filters': 10,
      'check-plumbing': 20,
      'lawn-mowing': 60,
      'garden-care': 45,
    },
  };

  constructor() {
    this.logger = new Logger({
      level: 'info',
      context: { agent: 'home-manager' },
    });

    this.metrics = new MetricsCollector();
    this.logger.info('Home Manager Agent initialized');
  }

  /**
   * Create comprehensive household plan
   */
  async createHouseholdPlan(
    preferences: HouseholdPreferences
  ): Promise<HouseholdPlan> {
    const planCounter = this.metrics.counter('household.plan.created');
    const planTimer = this.metrics.timer('household.plan.duration');

    this.logger.info('Creating household plan', {
      adults: preferences.adults,
      children: preferences.children,
      homeSize: preferences.homeSize,
    });

    try {
      const plan = await planTimer.time(async () => {
        // Generate tasks
        const tasks = this.generateTasks(preferences);

        // Create schedule
        const schedule = this.createSchedule(tasks, preferences);

        // Calculate budget
        const budget = this.calculateBudget(preferences, tasks);

        // Generate recommendations
        const recommendations = this.generateRecommendations(
          preferences,
          tasks
        );

        // Suggest automations
        const automations = this.suggestAutomations(tasks, preferences);

        // Calculate total time
        const estimatedTimePerWeek = tasks.reduce((total, task) => {
          const frequency = this.getWeeklyFrequency(task.frequency);
          return total + task.estimatedTime * frequency;
        }, 0) / 60;  // convert to hours

        return {
          tasks,
          schedule,
          budget,
          recommendations,
          automations,
          estimatedTimePerWeek,
        };
      });

      planCounter.inc();

      this.logger.info('Household plan created', {
        tasksCount: plan.tasks.length,
        weeklyHours: plan.estimatedTimePerWeek,
        budget: plan.budget.total,
      });

      return plan;
    } catch (error) {
      this.logger.error('Household plan creation failed', error);
      throw new AppError(
        'Household plan creation failed',
        'HOUSEHOLD_PLAN_FAILED',
        500,
        'medium'
      );
    }
  }

  /**
   * Generate household tasks based on preferences
   */
  private generateTasks(
    preferences: HouseholdPreferences
  ): HouseholdTask[] {
    const tasks: HouseholdTask[] = [];
    let taskId = 1;

    // Cleaning tasks
    if (preferences.cleaningLevel !== 'minimal') {
      tasks.push({
        id: `task-${taskId++}`,
        name: 'Vacuum all floors',
        category: TaskCategory.CLEANING,
        frequency: preferences.cleaningLevel === 'thorough' ? TaskFrequency.BIWEEKLY : TaskFrequency.WEEKLY,
        priority: TaskPriority.HIGH,
        estimatedTime: preferences.homeSize / 4,  // ~4 sqm/min
      });

      tasks.push({
        id: `task-${taskId++}`,
        name: 'Clean bathrooms',
        category: TaskCategory.CLEANING,
        frequency: TaskFrequency.WEEKLY,
        priority: TaskPriority.HIGH,
        estimatedTime: 30 * Math.ceil(preferences.rooms / 3),
      });

      tasks.push({
        id: `task-${taskId++}`,
        name: 'Clean kitchen',
        category: TaskCategory.CLEANING,
        frequency: TaskFrequency.DAILY,
        priority: TaskPriority.MEDIUM,
        estimatedTime: 25,
      });
    }

    // Cooking tasks
    if (preferences.cookingFrequency !== 'rarely') {
      const mealsPerWeek = preferences.cookingFrequency === 'daily' ? 21 : 7;

      tasks.push({
        id: `task-${taskId++}`,
        name: 'Meal planning',
        category: TaskCategory.COOKING,
        frequency: TaskFrequency.WEEKLY,
        priority: TaskPriority.MEDIUM,
        estimatedTime: 20,
      });

      tasks.push({
        id: `task-${taskId++}`,
        name: 'Grocery shopping',
        category: TaskCategory.SHOPPING,
        frequency: TaskFrequency.WEEKLY,
        priority: TaskPriority.HIGH,
        estimatedTime: 60,
      });
    }

    // Laundry tasks
    const laundryLoadsPerWeek = (preferences.adults + preferences.children) * 2;

    tasks.push({
      id: `task-${taskId++}`,
      name: 'Laundry',
      category: TaskCategory.LAUNDRY,
      frequency: TaskFrequency.WEEKLY,
      priority: TaskPriority.MEDIUM,
      estimatedTime: laundryLoadsPerWeek * 15,  // 15 min per load
    });

    // Child care tasks
    if (preferences.children > 0) {
      tasks.push({
        id: `task-${taskId++}`,
        name: 'School preparation',
        category: TaskCategory.CHILDCARE,
        frequency: TaskFrequency.DAILY,
        priority: TaskPriority.CRITICAL,
        estimatedTime: 30 * preferences.children,
      });

      tasks.push({
        id: `task-${taskId++}`,
        name: 'Children activities',
        category: TaskCategory.CHILDCARE,
        frequency: TaskFrequency.DAILY,
        priority: TaskPriority.HIGH,
        estimatedTime: 60,
      });
    }

    // Pet care tasks
    if (preferences.pets > 0) {
      tasks.push({
        id: `task-${taskId++}`,
        name: 'Feed pets',
        category: TaskCategory.PETCARE,
        frequency: TaskFrequency.DAILY,
        priority: TaskPriority.HIGH,
        estimatedTime: 10 * preferences.pets,
      });

      tasks.push({
        id: `task-${taskId++}`,
        name: 'Walk pets',
        category: TaskCategory.PETCARE,
        frequency: TaskFrequency.DAILY,
        priority: TaskPriority.MEDIUM,
        estimatedTime: 30 * preferences.pets,
      });
    }

    // Garden tasks
    if (preferences.hasgarden) {
      tasks.push({
        id: `task-${taskId++}`,
        name: 'Lawn mowing',
        category: TaskCategory.GARDENING,
        frequency: TaskFrequency.BIWEEKLY,
        priority: TaskPriority.LOW,
        estimatedTime: 60,
      });

      tasks.push({
        id: `task-${taskId++}`,
        name: 'Garden maintenance',
        category: TaskCategory.GARDENING,
        frequency: TaskFrequency.WEEKLY,
        priority: TaskPriority.LOW,
        estimatedTime: 45,
      });
    }

    // Maintenance tasks
    tasks.push({
      id: `task-${taskId++}`,
      name: 'Check HVAC filters',
      category: TaskCategory.MAINTENANCE,
      frequency: TaskFrequency.MONTHLY,
      priority: TaskPriority.MEDIUM,
      estimatedTime: 15,
    });

    return tasks;
  }

  /**
   * Create weekly schedule for tasks
   */
  private createSchedule(
    tasks: HouseholdTask[],
    preferences: HouseholdPreferences
  ): Map<string, HouseholdTask[]> {
    const schedule = new Map<string, HouseholdTask[]>();
    const days = preferences.preferredDays.length > 0
      ? preferences.preferredDays
      : ['Monday', 'Wednesday', 'Saturday'];

    // Distribute tasks across preferred days
    tasks.forEach((task, index) => {
      const day = days[index % days.length];
      if (!schedule.has(day)) {
        schedule.set(day, []);
      }
      schedule.get(day)!.push(task);
    });

    return schedule;
  }

  /**
   * Calculate household budget
   */
  private calculateBudget(
    preferences: HouseholdPreferences,
    tasks: HouseholdTask[]
  ): { total: number; categories: BudgetCategory[] } {
    const categories: BudgetCategory[] = [];

    // Groceries
    const groceryBudget = (preferences.adults * 15000) + (preferences.children * 10000);
    categories.push({
      name: 'Groceries',
      plannedAmount: groceryBudget,
      actualSpent: 0,
      remaining: groceryBudget,
      items: [],
    });

    // Household supplies
    const suppliesBudget = 5000 + (preferences.rooms * 500);
    categories.push({
      name: 'Household Supplies',
      plannedAmount: suppliesBudget,
      actualSpent: 0,
      remaining: suppliesBudget,
      items: [],
    });

    // Utilities
    const utilitiesBudget = preferences.homeSize * 80;  // руб/sqm
    categories.push({
      name: 'Utilities',
      plannedAmount: utilitiesBudget,
      actualSpent: 0,
      remaining: utilitiesBudget,
      items: [],
    });

    // Pet care
    if (preferences.pets > 0) {
      const petBudget = preferences.pets * 3000;
      categories.push({
        name: 'Pet Care',
        plannedAmount: petBudget,
        actualSpent: 0,
        remaining: petBudget,
        items: [],
      });
    }

    const total = categories.reduce((sum, cat) => sum + cat.plannedAmount, 0);

    return { total, categories };
  }

  /**
   * Generate household recommendations
   */
  private generateRecommendations(
    preferences: HouseholdPreferences,
    tasks: HouseholdTask[]
  ): string[] {
    const recommendations: string[] = [];

    const weeklyHours = tasks.reduce((total, task) => {
      return total + task.estimatedTime * this.getWeeklyFrequency(task.frequency);
    }, 0) / 60;

    if (weeklyHours > preferences.availableTime) {
      const deficit = weeklyHours - preferences.availableTime;
      recommendations.push(
        `Требуется ${weeklyHours.toFixed(1)} часов/неделю, доступно ${preferences.availableTime}. ` +
        `Рекомендуется делегировать ${deficit.toFixed(1)} часов работы или автоматизировать задачи.`
      );
    }

    if (preferences.cleaningLevel === 'thorough' && preferences.availableTime < 10) {
      recommendations.push(
        'Тщательная уборка требует больше времени. Рассмотрите найм уборщицы 1-2 раза в месяц.'
      );
    }

    if (preferences.children > 0) {
      recommendations.push(
        'С детьми рекомендуется создать расписание с визуальными напоминаниями и чек-листами.'
      );
    }

    if (preferences.budgetConstraint === 'tight') {
      recommendations.push(
        'При ограниченном бюджете приоритезируйте задачи и используйте бесплатные приложения для планирования.'
      );
    }

    return recommendations;
  }

  /**
   * Suggest home automations
   */
  private suggestAutomations(
    tasks: HouseholdTask[],
    preferences: HouseholdPreferences
  ): AutomationSuggestion[] {
    const suggestions: AutomationSuggestion[] = [];

    // Robot vacuum
    const cleaningTasks = tasks.filter(t => t.category === TaskCategory.CLEANING);
    if (cleaningTasks.length > 0) {
      const timeSaved = cleaningTasks.reduce((total, task) => {
        if (task.name.toLowerCase().includes('vacuum')) {
          return total + task.estimatedTime * this.getWeeklyFrequency(task.frequency);
        }
        return total;
      }, 0) / 60;

      if (timeSaved > 1) {
        suggestions.push({
          task: 'Vacuum floors',
          device: 'Robot Vacuum (e.g., Xiaomi, Roborock)',
          estimatedCost: 25000,
          timeSaved,
          priority: TaskPriority.HIGH,
          paybackPeriod: 12,
        });
      }
    }

    // Dishwasher
    const cookingTasks = tasks.filter(t => t.category === TaskCategory.COOKING);
    if (cookingTasks.length > 0 && preferences.cookingFrequency !== 'rarely') {
      suggestions.push({
        task: 'Wash dishes',
        device: 'Dishwasher',
        estimatedCost: 30000,
        timeSaved: 7,  // ~1 hour/day
        priority: TaskPriority.MEDIUM,
        paybackPeriod: 18,
      });
    }

    // Smart thermostat
    suggestions.push({
      task: 'Temperature control',
      device: 'Smart Thermostat',
      estimatedCost: 15000,
      timeSaved: 1,
      priority: TaskPriority.LOW,
      paybackPeriod: 24,  // through energy savings
    });

    // Automatic pet feeder
    if (preferences.pets > 0) {
      suggestions.push({
        task: 'Feed pets',
        device: 'Automatic Pet Feeder',
        estimatedCost: 5000,
        timeSaved: preferences.pets * 0.5,
        priority: TaskPriority.MEDIUM,
        paybackPeriod: 6,
      });
    }

    return suggestions.sort((a, b) => b.timeSaved - a.timeSaved);
  }

  /**
   * Get weekly frequency multiplier
   */
  private getWeeklyFrequency(frequency: TaskFrequency): number {
    switch (frequency) {
      case TaskFrequency.DAILY:
        return 7;
      case TaskFrequency.WEEKLY:
        return 1;
      case TaskFrequency.BIWEEKLY:
        return 0.5;
      case TaskFrequency.MONTHLY:
        return 0.25;
      case TaskFrequency.QUARTERLY:
        return 0.083;
      case TaskFrequency.YEARLY:
        return 0.019;
      default:
        return 1;
    }
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    return this.metrics.export();
  }
}
