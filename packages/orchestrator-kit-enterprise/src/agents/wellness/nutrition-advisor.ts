import { Logger } from '@info7/common';
import { MetricsCollector } from '@info7/common';
import { AppError, ValidationError } from '@info7/common';

/**
 * Nutrition Advisor Agent
 *
 * Provides personalized nutrition guidance, meal planning, and dietary recommendations.
 *
 * IMPORTANT DISCLAIMER:
 * This agent provides general nutritional information and is NOT a substitute
 * for professional medical or nutritional advice. Always consult registered
 * dietitians or healthcare providers for personalized dietary plans, especially
 * if you have medical conditions or specific dietary needs.
 */

// ============================================================================
// Types
// ============================================================================

export enum DietaryGoal {
  WEIGHT_LOSS = 'weight-loss',
  WEIGHT_GAIN = 'weight-gain',
  MUSCLE_GAIN = 'muscle-gain',
  MAINTENANCE = 'maintenance',
  ATHLETIC_PERFORMANCE = 'athletic-performance',
  HEART_HEALTH = 'heart-health',
  DIABETES_MANAGEMENT = 'diabetes-management',
  GENERAL_HEALTH = 'general-health',
}

export enum ActivityLevel {
  SEDENTARY = 'sedentary',           // Little to no exercise
  LIGHTLY_ACTIVE = 'lightly-active', // 1-3 days/week
  MODERATELY_ACTIVE = 'moderately-active', // 3-5 days/week
  VERY_ACTIVE = 'very-active',       // 6-7 days/week
  EXTREMELY_ACTIVE = 'extremely-active', // Professional athlete
}

export enum DietType {
  STANDARD = 'standard',
  VEGETARIAN = 'vegetarian',
  VEGAN = 'vegan',
  KETO = 'ketogenic',
  PALEO = 'paleo',
  MEDITERRANEAN = 'mediterranean',
  LOW_CARB = 'low-carb',
  LOW_FAT = 'low-fat',
  DASH = 'dash', // Dietary Approaches to Stop Hypertension
  GLUTEN_FREE = 'gluten-free',
}

export interface UserNutritionProfile {
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number; // cm
  currentWeight: number; // kg
  targetWeight?: number; // kg
  activityLevel: ActivityLevel;
  dietaryGoal: DietaryGoal;
  preferredDietType?: DietType;
  allergies?: string[];
  foodIntolerances?: string[];
  medicalConditions?: string[]; // diabetes, hypertension, etc.
  restrictions?: string[]; // religious, ethical, etc.
}

export interface MacronutrientTargets {
  calories: number; // kcal/day
  protein: number;  // grams/day
  carbs: number;    // grams/day
  fat: number;      // grams/day
  fiber: number;    // grams/day
  water: number;    // liters/day
}

export interface MealPlan {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  meals: Meal[];
  snacks: Meal[];
  hydrationReminder: string;
}

export interface Meal {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  preparation?: string;
  timing?: string; // e.g., "7:00 AM", "pre-workout"
}

export interface NutritionRecommendation {
  category: 'macro-balance' | 'food-choice' | 'timing' | 'supplementation' | 'hydration';
  priority: 'high' | 'medium' | 'low';
  recommendation: string;
  rationale: string;
  implementation: string[];
}

export interface FoodAnalysis {
  food: string;
  serving: string;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  micronutrients: Array<{
    nutrient: string;
    amount: number;
    unit: string;
    dailyValuePercent: number;
  }>;
  healthScore: number; // 0-100
  benefits: string[];
  concerns: string[];
}

export interface ProgressTracking {
  date: string;
  weight: number;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  adherence: number; // 0-100%
  notes?: string;
}

// ============================================================================
// Nutrition Advisor Agent
// ============================================================================

export class NutritionAdvisorAgent {
  private logger: Logger;
  private metrics: MetricsCollector;

  // Nutritional constants
  private readonly CALORIES_PER_GRAM = {
    protein: 4,
    carbs: 4,
    fat: 9,
  };

  // BMR multipliers for activity level
  private readonly ACTIVITY_MULTIPLIERS = {
    [ActivityLevel.SEDENTARY]: 1.2,
    [ActivityLevel.LIGHTLY_ACTIVE]: 1.375,
    [ActivityLevel.MODERATELY_ACTIVE]: 1.55,
    [ActivityLevel.VERY_ACTIVE]: 1.725,
    [ActivityLevel.EXTREMELY_ACTIVE]: 1.9,
  };

  // Food database (simplified - in real implementation, use comprehensive DB)
  private foodDatabase = new Map<string, Omit<FoodAnalysis, 'food'>>();

  // Meal templates
  private mealTemplates = new Map<DietType, {
    breakfast: Meal[];
    lunch: Meal[];
    dinner: Meal[];
    snacks: Meal[];
  }>();

  constructor() {
    this.logger = new Logger('NutritionAdvisorAgent');
    this.metrics = new MetricsCollector('nutrition_advisor');
    this.initializeFoodDatabase();
    this.initializeMealTemplates();
  }

  private initializeFoodDatabase(): void {
    // Common foods (100g serving)
    this.foodDatabase.set('chicken-breast', {
      serving: '100g',
      calories: 165,
      macros: { protein: 31, carbs: 0, fat: 3.6 },
      micronutrients: [
        { nutrient: 'Vitamin B6', amount: 0.6, unit: 'mg', dailyValuePercent: 30 },
        { nutrient: 'Niacin', amount: 14, unit: 'mg', dailyValuePercent: 70 },
      ],
      healthScore: 90,
      benefits: ['High protein', 'Low fat', 'Rich in B vitamins'],
      concerns: [],
    });

    this.foodDatabase.set('salmon', {
      serving: '100g',
      calories: 208,
      macros: { protein: 20, carbs: 0, fat: 13 },
      micronutrients: [
        { nutrient: 'Omega-3', amount: 2.3, unit: 'g', dailyValuePercent: 100 },
        { nutrient: 'Vitamin D', amount: 526, unit: 'IU', dailyValuePercent: 132 },
      ],
      healthScore: 95,
      benefits: ['High omega-3', 'Heart healthy', 'Rich in vitamin D'],
      concerns: [],
    });

    this.foodDatabase.set('brown-rice', {
      serving: '100g cooked',
      calories: 111,
      macros: { protein: 2.6, carbs: 23, fat: 0.9 },
      micronutrients: [
        { nutrient: 'Manganese', amount: 0.9, unit: 'mg', dailyValuePercent: 45 },
        { nutrient: 'Selenium', amount: 14, unit: 'mcg', dailyValuePercent: 20 },
      ],
      healthScore: 75,
      benefits: ['Complex carbs', 'High fiber', 'Whole grain'],
      concerns: [],
    });

    this.foodDatabase.set('broccoli', {
      serving: '100g',
      calories: 34,
      macros: { protein: 2.8, carbs: 7, fat: 0.4 },
      micronutrients: [
        { nutrient: 'Vitamin C', amount: 89, unit: 'mg', dailyValuePercent: 99 },
        { nutrient: 'Vitamin K', amount: 102, unit: 'mcg', dailyValuePercent: 85 },
      ],
      healthScore: 98,
      benefits: ['High in vitamins', 'Anti-inflammatory', 'High fiber'],
      concerns: [],
    });

    this.foodDatabase.set('almonds', {
      serving: '100g',
      calories: 579,
      macros: { protein: 21, carbs: 22, fat: 50 },
      micronutrients: [
        { nutrient: 'Vitamin E', amount: 26, unit: 'mg', dailyValuePercent: 171 },
        { nutrient: 'Magnesium', amount: 270, unit: 'mg', dailyValuePercent: 68 },
      ],
      healthScore: 88,
      benefits: ['Healthy fats', 'High vitamin E', 'Heart healthy'],
      concerns: ['High calorie density'],
    });

    this.foodDatabase.set('greek-yogurt', {
      serving: '100g',
      calories: 59,
      macros: { protein: 10, carbs: 3.6, fat: 0.4 },
      micronutrients: [
        { nutrient: 'Calcium', amount: 110, unit: 'mg', dailyValuePercent: 11 },
        { nutrient: 'Probiotics', amount: 1, unit: 'billion CFU', dailyValuePercent: 0 },
      ],
      healthScore: 85,
      benefits: ['High protein', 'Probiotics', 'Low fat'],
      concerns: [],
    });
  }

  private initializeMealTemplates(): void {
    // Standard diet templates
    this.mealTemplates.set(DietType.STANDARD, {
      breakfast: [
        {
          mealType: 'breakfast',
          name: 'Greek Yogurt Parfait',
          calories: 350,
          protein: 25,
          carbs: 45,
          fat: 8,
          ingredients: ['Greek yogurt', 'Berries', 'Granola', 'Honey'],
          preparation: 'Layer yogurt, berries, and granola',
        },
        {
          mealType: 'breakfast',
          name: 'Oatmeal with Protein',
          calories: 400,
          protein: 30,
          carbs: 50,
          fat: 10,
          ingredients: ['Oats', 'Protein powder', 'Banana', 'Almond butter'],
          preparation: 'Cook oats, add protein powder and toppings',
        },
      ],
      lunch: [
        {
          mealType: 'lunch',
          name: 'Grilled Chicken Salad',
          calories: 450,
          protein: 40,
          carbs: 30,
          fat: 18,
          ingredients: ['Chicken breast', 'Mixed greens', 'Quinoa', 'Olive oil dressing'],
          preparation: 'Grill chicken, assemble salad',
        },
      ],
      dinner: [
        {
          mealType: 'dinner',
          name: 'Salmon with Vegetables',
          calories: 550,
          protein: 45,
          carbs: 40,
          fat: 22,
          ingredients: ['Salmon fillet', 'Brown rice', 'Broccoli', 'Sweet potato'],
          preparation: 'Bake salmon, steam vegetables, cook rice',
        },
      ],
      snacks: [
        {
          mealType: 'snack',
          name: 'Protein Shake',
          calories: 200,
          protein: 25,
          carbs: 15,
          fat: 5,
          ingredients: ['Protein powder', 'Almond milk', 'Banana'],
          preparation: 'Blend all ingredients',
        },
      ],
    });

    // Mediterranean diet templates
    this.mealTemplates.set(DietType.MEDITERRANEAN, {
      breakfast: [
        {
          mealType: 'breakfast',
          name: 'Mediterranean Breakfast Bowl',
          calories: 380,
          protein: 18,
          carbs: 45,
          fat: 15,
          ingredients: ['Eggs', 'Tomatoes', 'Olives', 'Whole grain bread', 'Feta cheese'],
          preparation: 'Scramble eggs, add vegetables and cheese',
        },
      ],
      lunch: [
        {
          mealType: 'lunch',
          name: 'Mediterranean Chickpea Salad',
          calories: 420,
          protein: 15,
          carbs: 50,
          fat: 18,
          ingredients: ['Chickpeas', 'Cucumber', 'Tomatoes', 'Red onion', 'Olive oil', 'Lemon'],
          preparation: 'Mix all ingredients, dress with olive oil and lemon',
        },
      ],
      dinner: [
        {
          mealType: 'dinner',
          name: 'Grilled Fish with Vegetables',
          calories: 500,
          protein: 40,
          carbs: 35,
          fat: 22,
          ingredients: ['White fish', 'Roasted vegetables', 'Quinoa', 'Olive oil'],
          preparation: 'Grill fish, roast vegetables, cook quinoa',
        },
      ],
      snacks: [
        {
          mealType: 'snack',
          name: 'Hummus and Vegetables',
          calories: 180,
          protein: 6,
          carbs: 20,
          fat: 9,
          ingredients: ['Hummus', 'Carrot sticks', 'Cucumber', 'Bell peppers'],
          preparation: 'Serve hummus with cut vegetables',
        },
      ],
    });

    // Add more diet types...
  }

  /**
   * Calculate personalized macro targets
   */
  async calculateMacroTargets(profile: UserNutritionProfile): Promise<MacronutrientTargets> {
    try {
      // Validate input
      if (profile.age < 18 || profile.age > 100) {
        throw new ValidationError('Age must be between 18 and 100');
      }
      if (profile.height < 100 || profile.height > 250) {
        throw new ValidationError('Height must be between 100 and 250 cm');
      }
      if (profile.currentWeight < 30 || profile.currentWeight > 300) {
        throw new ValidationError('Weight must be between 30 and 300 kg');
      }

      this.logger.info('Calculating macro targets', {
        goal: profile.dietaryGoal,
        activityLevel: profile.activityLevel,
      });

      // Calculate BMR using Mifflin-St Jeor equation
      const bmr = this.calculateBMR(profile);

      // Calculate TDEE (Total Daily Energy Expenditure)
      const tdee = bmr * this.ACTIVITY_MULTIPLIERS[profile.activityLevel];

      // Adjust calories based on goal
      let targetCalories = tdee;
      if (profile.dietaryGoal === DietaryGoal.WEIGHT_LOSS) {
        targetCalories = tdee * 0.80; // 20% deficit
      } else if (profile.dietaryGoal === DietaryGoal.WEIGHT_GAIN || profile.dietaryGoal === DietaryGoal.MUSCLE_GAIN) {
        targetCalories = tdee * 1.10; // 10% surplus
      }

      // Calculate macro split based on goal
      const macros = this.calculateMacroSplit(targetCalories, profile);

      const targets: MacronutrientTargets = {
        calories: Math.round(targetCalories),
        protein: Math.round(macros.protein),
        carbs: Math.round(macros.carbs),
        fat: Math.round(macros.fat),
        fiber: Math.round(14 * (targetCalories / 1000)), // 14g per 1000 kcal
        water: this.calculateWaterNeeds(profile.currentWeight, profile.activityLevel),
      };

      this.metrics.recordMetric('macro_targets_calculated', 1, {
        goal: profile.dietaryGoal,
        calories: targets.calories,
      });

      return targets;
    } catch (error) {
      this.logger.error('Failed to calculate macro targets', error);
      throw new AppError('Failed to calculate macro targets', { cause: error });
    }
  }

  /**
   * Generate personalized meal plan
   */
  async generateMealPlan(
    profile: UserNutritionProfile,
    targets: MacronutrientTargets,
    daysCount: number = 7
  ): Promise<MealPlan[]> {
    try {
      const mealPlans: MealPlan[] = [];
      const dietType = profile.preferredDietType || DietType.STANDARD;
      const templates = this.mealTemplates.get(dietType);

      if (!templates) {
        throw new ValidationError(`No meal templates available for diet type: ${dietType}`);
      }

      for (let day = 0; day < daysCount; day++) {
        const date = new Date();
        date.setDate(date.getDate() + day);

        // Select meals for the day
        const breakfast = this.selectMeal(templates.breakfast);
        const lunch = this.selectMeal(templates.lunch);
        const dinner = this.selectMeal(templates.dinner);
        const snack = this.selectMeal(templates.snacks);

        const meals = [breakfast, lunch, dinner];
        const snacks = [snack];

        // Calculate totals
        const totalCalories = [...meals, ...snacks].reduce((sum, meal) => sum + meal.calories, 0);
        const totalProtein = [...meals, ...snacks].reduce((sum, meal) => sum + meal.protein, 0);
        const totalCarbs = [...meals, ...snacks].reduce((sum, meal) => sum + meal.carbs, 0);
        const totalFat = [...meals, ...snacks].reduce((sum, meal) => sum + meal.fat, 0);

        mealPlans.push({
          date: date.toISOString().split('T')[0],
          totalCalories: Math.round(totalCalories),
          totalProtein: Math.round(totalProtein),
          totalCarbs: Math.round(totalCarbs),
          totalFat: Math.round(totalFat),
          meals,
          snacks,
          hydrationReminder: `Drink ${targets.water}L of water throughout the day`,
        });
      }

      this.metrics.recordMetric('meal_plan_generated', 1, {
        days: daysCount,
        dietType,
      });

      return mealPlans;
    } catch (error) {
      this.logger.error('Failed to generate meal plan', error);
      throw new AppError('Failed to generate meal plan', { cause: error });
    }
  }

  /**
   * Get personalized nutrition recommendations
   */
  async getRecommendations(
    profile: UserNutritionProfile,
    targets: MacronutrientTargets
  ): Promise<NutritionRecommendation[]> {
    try {
      const recommendations: NutritionRecommendation[] = [];

      // Protein recommendations
      if (profile.dietaryGoal === DietaryGoal.MUSCLE_GAIN) {
        recommendations.push({
          category: 'macro-balance',
          priority: 'high',
          recommendation: `Consume ${targets.protein}g protein daily for muscle growth`,
          rationale: 'Adequate protein intake is crucial for muscle protein synthesis',
          implementation: [
            'Aim for 20-40g protein per meal',
            'Include protein in every meal and snack',
            'Consider protein timing around workouts',
          ],
        });
      }

      // Hydration recommendations
      recommendations.push({
        category: 'hydration',
        priority: 'high',
        recommendation: `Drink ${targets.water}L of water daily`,
        rationale: 'Proper hydration is essential for metabolic function and performance',
        implementation: [
          'Start day with 500ml water',
          'Drink 250ml before each meal',
          'Increase during exercise (add 500ml per hour)',
        ],
      });

      // Timing recommendations
      if (profile.activityLevel === ActivityLevel.VERY_ACTIVE ||
          profile.activityLevel === ActivityLevel.EXTREMELY_ACTIVE) {
        recommendations.push({
          category: 'timing',
          priority: 'medium',
          recommendation: 'Optimize nutrient timing around training',
          rationale: 'Proper timing enhances performance and recovery',
          implementation: [
            'Eat 2-3 hours before training',
            'Consume protein + carbs within 2 hours post-workout',
            'Don\'t train fasted for intense sessions',
          ],
        });
      }

      // Food choice recommendations
      if (profile.medicalConditions?.includes('diabetes')) {
        recommendations.push({
          category: 'food-choice',
          priority: 'high',
          recommendation: 'Focus on low glycemic index foods',
          rationale: 'Helps maintain stable blood sugar levels',
          implementation: [
            'Choose whole grains over refined grains',
            'Pair carbs with protein or healthy fats',
            'Monitor portion sizes of carbohydrate-rich foods',
          ],
        });
      }

      // Supplementation recommendations
      if (profile.preferredDietType === DietType.VEGAN) {
        recommendations.push({
          category: 'supplementation',
          priority: 'high',
          recommendation: 'Consider B12 and omega-3 supplementation',
          rationale: 'These nutrients are primarily found in animal products',
          implementation: [
            'Take 2.4mcg B12 daily or 1000mcg weekly',
            'Consider algae-based omega-3 supplements',
            'Get vitamin D tested and supplement if needed',
          ],
        });
      }

      return recommendations;
    } catch (error) {
      this.logger.error('Failed to generate recommendations', error);
      throw new AppError('Failed to generate recommendations', { cause: error });
    }
  }

  /**
   * Analyze specific food
   */
  async analyzeFood(foodName: string, serving?: string): Promise<FoodAnalysis> {
    try {
      const foodData = this.foodDatabase.get(foodName.toLowerCase());

      if (!foodData) {
        throw new ValidationError(`Food not found in database: ${foodName}`);
      }

      return {
        food: foodName,
        ...foodData,
      };
    } catch (error) {
      this.logger.error('Failed to analyze food', error);
      throw new AppError('Failed to analyze food', { cause: error });
    }
  }

  /**
   * Track nutrition progress
   */
  async trackProgress(tracking: ProgressTracking): Promise<{
    status: 'on-track' | 'needs-adjustment';
    feedback: string[];
    trends: {
      weightChange: number;
      avgCalories: number;
      avgAdherence: number;
    };
  }> {
    try {
      // In a real implementation, this would analyze historical data
      // For now, provide basic feedback

      const feedback: string[] = [];
      let status: 'on-track' | 'needs-adjustment' = 'on-track';

      if (tracking.adherence < 70) {
        status = 'needs-adjustment';
        feedback.push('Adherence is below 70% - try meal prepping to stay on track');
      } else if (tracking.adherence >= 90) {
        feedback.push('Excellent adherence! Keep up the great work');
      }

      feedback.push('Continue tracking daily for best results');

      return {
        status,
        feedback,
        trends: {
          weightChange: 0, // Would calculate from historical data
          avgCalories: tracking.calories,
          avgAdherence: tracking.adherence,
        },
      };
    } catch (error) {
      this.logger.error('Failed to track progress', error);
      throw new AppError('Failed to track progress', { cause: error });
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private calculateBMR(profile: UserNutritionProfile): number {
    // Mifflin-St Jeor equation
    if (profile.gender === 'male') {
      return 10 * profile.currentWeight + 6.25 * profile.height - 5 * profile.age + 5;
    } else {
      return 10 * profile.currentWeight + 6.25 * profile.height - 5 * profile.age - 161;
    }
  }

  private calculateMacroSplit(calories: number, profile: UserNutritionProfile): {
    protein: number;
    carbs: number;
    fat: number;
  } {
    let proteinPercent: number;
    let carbPercent: number;
    let fatPercent: number;

    // Adjust macro split based on goal
    switch (profile.dietaryGoal) {
      case DietaryGoal.MUSCLE_GAIN:
        proteinPercent = 0.30; // 30% protein
        carbPercent = 0.45;    // 45% carbs
        fatPercent = 0.25;     // 25% fat
        break;

      case DietaryGoal.WEIGHT_LOSS:
        proteinPercent = 0.35; // 35% protein (higher for satiety)
        carbPercent = 0.30;    // 30% carbs
        fatPercent = 0.35;     // 35% fat
        break;

      case DietaryGoal.ATHLETIC_PERFORMANCE:
        proteinPercent = 0.25;
        carbPercent = 0.50;    // Higher carbs for performance
        fatPercent = 0.25;
        break;

      default:
        proteinPercent = 0.30;
        carbPercent = 0.40;
        fatPercent = 0.30;
    }

    // Adjust for specific diet types
    if (profile.preferredDietType === DietType.KETO) {
      proteinPercent = 0.20;
      carbPercent = 0.05;
      fatPercent = 0.75;
    } else if (profile.preferredDietType === DietType.LOW_CARB) {
      carbPercent = 0.20;
      fatPercent = 0.40;
      proteinPercent = 0.40;
    }

    return {
      protein: (calories * proteinPercent) / this.CALORIES_PER_GRAM.protein,
      carbs: (calories * carbPercent) / this.CALORIES_PER_GRAM.carbs,
      fat: (calories * fatPercent) / this.CALORIES_PER_GRAM.fat,
    };
  }

  private calculateWaterNeeds(weight: number, activityLevel: ActivityLevel): number {
    // Base: 30-35ml per kg of body weight
    let baseWater = (weight * 0.033); // liters

    // Add for activity
    if (activityLevel === ActivityLevel.VERY_ACTIVE) {
      baseWater += 0.5;
    } else if (activityLevel === ActivityLevel.EXTREMELY_ACTIVE) {
      baseWater += 1.0;
    }

    return Math.round(baseWater * 10) / 10; // Round to 1 decimal
  }

  private selectMeal(mealOptions: Meal[]): Meal {
    // In a real implementation, this would intelligently select based on variety,
    // nutritional needs, etc. For now, just pick randomly
    return mealOptions[Math.floor(Math.random() * mealOptions.length)];
  }
}
