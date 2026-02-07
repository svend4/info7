import { Logger } from '@info7/common';
import { MetricsCollector } from '@info7/common';
import { AppError, ValidationError } from '@info7/common';

/**
 * Mental Health Counselor Agent
 *
 * Provides psychological support, mental health assessment, and therapeutic recommendations.
 *
 * IMPORTANT DISCLAIMER:
 * This agent is for informational and support purposes only.
 * It is NOT a substitute for professional mental health care.
 * Always consult licensed mental health professionals for diagnosis and treatment.
 * If experiencing crisis, contact emergency services or crisis hotlines immediately.
 */

// ============================================================================
// Types
// ============================================================================

export enum MentalHealthSymptomCategory {
  MOOD = 'mood',
  ANXIETY = 'anxiety',
  COGNITIVE = 'cognitive',
  BEHAVIORAL = 'behavioral',
  PHYSICAL = 'physical',
  SOCIAL = 'social',
}

export enum SeverityLevel {
  MINIMAL = 'minimal',
  MILD = 'mild',
  MODERATE = 'moderate',
  MODERATELY_SEVERE = 'moderately-severe',
  SEVERE = 'severe',
}

export enum UrgencyLevel {
  ROUTINE = 'routine',           // Regular support
  PROMPT = 'prompt',             // Schedule soon (within 1-2 weeks)
  URGENT = 'urgent',             // Schedule ASAP (within 1-3 days)
  CRISIS = 'crisis',             // Immediate intervention needed
}

export enum TherapyType {
  CBT = 'cognitive-behavioral-therapy',
  DBT = 'dialectical-behavior-therapy',
  PSYCHODYNAMIC = 'psychodynamic-therapy',
  HUMANISTIC = 'humanistic-therapy',
  MINDFULNESS = 'mindfulness-based',
  EMDR = 'emdr',
  GROUP_THERAPY = 'group-therapy',
  FAMILY_THERAPY = 'family-therapy',
}

export interface MentalHealthSymptom {
  category: MentalHealthSymptomCategory;
  description: string;
  severity: SeverityLevel;
  duration: string; // e.g., "2 weeks", "3 months"
  frequency: 'constant' | 'frequent' | 'occasional' | 'rare';
  triggers?: string[];
}

export interface PatientMentalHealthContext {
  age: number;
  gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  previousDiagnoses?: string[];
  currentMedications?: string[];
  therapyHistory?: {
    type: TherapyType;
    duration: string;
    effectiveness: 'very-effective' | 'somewhat-effective' | 'not-effective';
  }[];
  lifeStressors?: string[];
  supportSystem?: 'strong' | 'moderate' | 'weak' | 'none';
  substanceUse?: {
    type: string;
    frequency: string;
  }[];
}

export interface MentalHealthAssessment {
  overallSeverity: SeverityLevel;
  urgency: UrgencyLevel;
  primaryConcerns: string[];
  possibleConditions: Array<{
    condition: string;
    likelihood: number; // 0-1
    reasoning: string;
  }>;
  riskFactors: string[];
  protectiveFactors: string[];
  recommendations: TherapeuticRecommendation[];
  crisis: {
    isCrisis: boolean;
    crisisResources: string[];
  };
  assessmentScore: {
    depression: number; // PHQ-9 style, 0-27
    anxiety: number;    // GAD-7 style, 0-21
    stress: number;     // PSS style, 0-40
  };
  disclaimer: string;
}

export interface TherapeuticRecommendation {
  type: 'therapy' | 'lifestyle' | 'medical' | 'support-group' | 'self-help';
  priority: 'high' | 'medium' | 'low';
  description: string;
  resources?: string[];
  estimatedDuration?: string;
}

export interface CopingStrategy {
  category: 'immediate' | 'short-term' | 'long-term';
  technique: string;
  description: string;
  whenToUse: string;
  steps: string[];
  effectiveness: 'high' | 'moderate' | 'varies';
}

export interface TherapyMatchResult {
  recommendedTypes: Array<{
    type: TherapyType;
    matchScore: number; // 0-100
    rationale: string;
    typicalDuration: string;
  }>;
  considerations: string[];
}

// ============================================================================
// Mental Health Counselor Agent
// ============================================================================

export class MentalHealthCounselorAgent {
  private logger: Logger;
  private metrics: MetricsCollector;

  // Knowledge base of mental health conditions
  private conditionKnowledge = new Map<string, {
    symptoms: MentalHealthSymptomCategory[];
    typicalSeverity: SeverityLevel;
    recommendedTherapies: TherapyType[];
    description: string;
  }>();

  // Coping strategies database
  private copingStrategies: CopingStrategy[] = [];

  // Crisis resources
  private crisisResources = {
    us: [
      'National Suicide Prevention Lifeline: 988',
      'Crisis Text Line: Text HOME to 741741',
      'SAMHSA National Helpline: 1-800-662-4357',
    ],
    international: [
      'International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/',
    ],
  };

  constructor() {
    this.logger = new Logger('MentalHealthCounselorAgent');
    this.metrics = new MetricsCollector('mental_health_counselor');
    this.initializeKnowledgeBase();
    this.initializeCopingStrategies();
  }

  private initializeKnowledgeBase(): void {
    // Major Depressive Disorder
    this.conditionKnowledge.set('major-depression', {
      symptoms: [MentalHealthSymptomCategory.MOOD, MentalHealthSymptomCategory.COGNITIVE, MentalHealthSymptomCategory.BEHAVIORAL],
      typicalSeverity: SeverityLevel.MODERATE,
      recommendedTherapies: [TherapyType.CBT, TherapyType.PSYCHODYNAMIC, TherapyType.MINDFULNESS],
      description: 'Persistent depressed mood or loss of interest with additional symptoms',
    });

    // Generalized Anxiety Disorder
    this.conditionKnowledge.set('generalized-anxiety', {
      symptoms: [MentalHealthSymptomCategory.ANXIETY, MentalHealthSymptomCategory.PHYSICAL, MentalHealthSymptomCategory.COGNITIVE],
      typicalSeverity: SeverityLevel.MODERATE,
      recommendedTherapies: [TherapyType.CBT, TherapyType.MINDFULNESS, TherapyType.DBT],
      description: 'Excessive anxiety and worry about various events or activities',
    });

    // Panic Disorder
    this.conditionKnowledge.set('panic-disorder', {
      symptoms: [MentalHealthSymptomCategory.ANXIETY, MentalHealthSymptomCategory.PHYSICAL],
      typicalSeverity: SeverityLevel.MODERATE,
      recommendedTherapies: [TherapyType.CBT, TherapyType.MINDFULNESS],
      description: 'Recurrent unexpected panic attacks with persistent concern',
    });

    // PTSD
    this.conditionKnowledge.set('ptsd', {
      symptoms: [MentalHealthSymptomCategory.ANXIETY, MentalHealthSymptomCategory.COGNITIVE, MentalHealthSymptomCategory.MOOD],
      typicalSeverity: SeverityLevel.MODERATELY_SEVERE,
      recommendedTherapies: [TherapyType.EMDR, TherapyType.CBT, TherapyType.DBT],
      description: 'Trauma-related disorder with intrusive memories and avoidance',
    });

    // Bipolar Disorder
    this.conditionKnowledge.set('bipolar-disorder', {
      symptoms: [MentalHealthSymptomCategory.MOOD, MentalHealthSymptomCategory.BEHAVIORAL, MentalHealthSymptomCategory.COGNITIVE],
      typicalSeverity: SeverityLevel.MODERATELY_SEVERE,
      recommendedTherapies: [TherapyType.DBT, TherapyType.CBT, TherapyType.FAMILY_THERAPY],
      description: 'Mood disorder with alternating episodes of mania and depression',
    });

    // OCD
    this.conditionKnowledge.set('ocd', {
      symptoms: [MentalHealthSymptomCategory.COGNITIVE, MentalHealthSymptomCategory.BEHAVIORAL, MentalHealthSymptomCategory.ANXIETY],
      typicalSeverity: SeverityLevel.MODERATE,
      recommendedTherapies: [TherapyType.CBT, TherapyType.MINDFULNESS],
      description: 'Obsessive thoughts and compulsive behaviors',
    });

    // Social Anxiety
    this.conditionKnowledge.set('social-anxiety', {
      symptoms: [MentalHealthSymptomCategory.ANXIETY, MentalHealthSymptomCategory.SOCIAL, MentalHealthSymptomCategory.PHYSICAL],
      typicalSeverity: SeverityLevel.MODERATE,
      recommendedTherapies: [TherapyType.CBT, TherapyType.GROUP_THERAPY],
      description: 'Intense fear of social situations and being judged by others',
    });
  }

  private initializeCopingStrategies(): void {
    // Immediate coping strategies
    this.copingStrategies.push({
      category: 'immediate',
      technique: '5-4-3-2-1 Grounding',
      description: 'Sensory grounding technique for anxiety and panic',
      whenToUse: 'During anxiety attack, panic, or dissociation',
      steps: [
        'Name 5 things you can see',
        'Name 4 things you can touch',
        'Name 3 things you can hear',
        'Name 2 things you can smell',
        'Name 1 thing you can taste',
      ],
      effectiveness: 'high',
    });

    this.copingStrategies.push({
      category: 'immediate',
      technique: 'Box Breathing',
      description: '4-4-4-4 breathing pattern for immediate calm',
      whenToUse: 'Stress, anxiety, or panic',
      steps: [
        'Breathe in for 4 seconds',
        'Hold for 4 seconds',
        'Breathe out for 4 seconds',
        'Hold for 4 seconds',
        'Repeat 4-5 times',
      ],
      effectiveness: 'high',
    });

    // Short-term strategies
    this.copingStrategies.push({
      category: 'short-term',
      technique: 'Cognitive Restructuring',
      description: 'Challenge and reframe negative thoughts',
      whenToUse: 'Rumination or negative thought patterns',
      steps: [
        'Identify the negative thought',
        'Examine evidence for and against it',
        'Consider alternative perspectives',
        'Create a balanced thought',
        'Practice the new perspective',
      ],
      effectiveness: 'high',
    });

    this.copingStrategies.push({
      category: 'short-term',
      technique: 'Behavioral Activation',
      description: 'Engage in meaningful activities despite low mood',
      whenToUse: 'Depression, low motivation',
      steps: [
        'List activities you used to enjoy',
        'Start with smallest, easiest activity',
        'Schedule it at a specific time',
        'Do it even if you don\'t feel like it',
        'Notice any mood changes afterward',
      ],
      effectiveness: 'high',
    });

    // Long-term strategies
    this.copingStrategies.push({
      category: 'long-term',
      technique: 'Mindfulness Meditation',
      description: 'Regular practice of present-moment awareness',
      whenToUse: 'Daily practice for overall well-being',
      steps: [
        'Set aside 10-20 minutes daily',
        'Find a quiet, comfortable space',
        'Focus on breath or body sensations',
        'Notice thoughts without judgment',
        'Gently return focus when mind wanders',
      ],
      effectiveness: 'high',
    });

    this.copingStrategies.push({
      category: 'long-term',
      technique: 'Sleep Hygiene',
      description: 'Optimize sleep for mental health',
      whenToUse: 'Daily routine for better mental health',
      steps: [
        'Consistent sleep/wake times',
        'Dark, cool, quiet bedroom',
        'No screens 1 hour before bed',
        'Limit caffeine after 2 PM',
        'Create relaxing bedtime routine',
      ],
      effectiveness: 'high',
    });
  }

  /**
   * Assess mental health symptoms and provide recommendations
   */
  async assessMentalHealth(
    symptoms: MentalHealthSymptom[],
    context: PatientMentalHealthContext
  ): Promise<MentalHealthAssessment> {
    const startTime = Date.now();

    try {
      // Validate input
      if (!symptoms || symptoms.length === 0) {
        throw new ValidationError('At least one symptom must be provided');
      }

      this.logger.info('Assessing mental health', {
        symptomCount: symptoms.length,
        age: context.age,
      });

      // Calculate assessment scores
      const scores = this.calculateAssessmentScores(symptoms);

      // Determine overall severity
      const overallSeverity = this.determineOverallSeverity(symptoms, scores);

      // Check for crisis indicators
      const crisis = this.checkCrisisIndicators(symptoms, context);

      // Identify possible conditions
      const possibleConditions = this.identifyPossibleConditions(symptoms, context);

      // Determine urgency
      const urgency = this.determineUrgency(overallSeverity, crisis.isCrisis, symptoms);

      // Extract primary concerns
      const primaryConcerns = this.extractPrimaryConcerns(symptoms);

      // Identify risk and protective factors
      const riskFactors = this.identifyRiskFactors(symptoms, context);
      const protectiveFactors = this.identifyProtectiveFactors(context);

      // Generate recommendations
      const recommendations = this.generateRecommendations(
        overallSeverity,
        possibleConditions,
        context,
        urgency
      );

      const assessment: MentalHealthAssessment = {
        overallSeverity,
        urgency,
        primaryConcerns,
        possibleConditions,
        riskFactors,
        protectiveFactors,
        recommendations,
        crisis,
        assessmentScore: scores,
        disclaimer: this.getDisclaimer(),
      };

      this.metrics.recordMetric('assessment_completed', 1, {
        severity: overallSeverity,
        urgency,
        duration: Date.now() - startTime,
      });

      return assessment;
    } catch (error) {
      this.logger.error('Mental health assessment failed', error);
      throw new AppError('Failed to assess mental health', { cause: error });
    }
  }

  /**
   * Get coping strategies for specific symptoms or situations
   */
  async getCopingStrategies(
    symptomCategories: MentalHealthSymptomCategory[],
    timeframe: 'immediate' | 'short-term' | 'long-term' | 'all' = 'all'
  ): Promise<CopingStrategy[]> {
    try {
      let strategies = this.copingStrategies;

      if (timeframe !== 'all') {
        strategies = strategies.filter(s => s.category === timeframe);
      }

      // For now, return all relevant strategies
      // In a real implementation, this would filter based on symptom categories
      return strategies;
    } catch (error) {
      this.logger.error('Failed to get coping strategies', error);
      throw new AppError('Failed to retrieve coping strategies', { cause: error });
    }
  }

  /**
   * Match patient to appropriate therapy types
   */
  async matchToTherapy(
    symptoms: MentalHealthSymptom[],
    context: PatientMentalHealthContext
  ): Promise<TherapyMatchResult> {
    try {
      const possibleConditions = this.identifyPossibleConditions(symptoms, context);

      // Aggregate recommended therapies
      const therapyScores = new Map<TherapyType, number>();

      possibleConditions.forEach(condition => {
        const knowledge = this.conditionKnowledge.get(condition.condition);
        if (knowledge) {
          knowledge.recommendedTherapies.forEach(therapy => {
            const currentScore = therapyScores.get(therapy) || 0;
            therapyScores.set(therapy, currentScore + condition.likelihood);
          });
        }
      });

      // Consider therapy history
      if (context.therapyHistory) {
        context.therapyHistory.forEach(history => {
          if (history.effectiveness === 'very-effective') {
            const currentScore = therapyScores.get(history.type) || 0;
            therapyScores.set(history.type, currentScore + 0.3);
          } else if (history.effectiveness === 'not-effective') {
            const currentScore = therapyScores.get(history.type) || 0;
            therapyScores.set(history.type, Math.max(0, currentScore - 0.2));
          }
        });
      }

      // Convert to recommendations
      const recommendedTypes = Array.from(therapyScores.entries())
        .map(([type, score]) => ({
          type,
          matchScore: Math.min(100, Math.round(score * 100)),
          rationale: this.getTherapyRationale(type, possibleConditions),
          typicalDuration: this.getTypicalDuration(type),
        }))
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 3);

      const considerations = this.getTherapyConsiderations(context);

      return {
        recommendedTypes,
        considerations,
      };
    } catch (error) {
      this.logger.error('Therapy matching failed', error);
      throw new AppError('Failed to match to therapy', { cause: error });
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private calculateAssessmentScores(symptoms: MentalHealthSymptom[]): {
    depression: number;
    anxiety: number;
    stress: number;
  } {
    let depression = 0;
    let anxiety = 0;
    let stress = 0;

    const severityPoints = {
      [SeverityLevel.MINIMAL]: 0,
      [SeverityLevel.MILD]: 1,
      [SeverityLevel.MODERATE]: 2,
      [SeverityLevel.MODERATELY_SEVERE]: 3,
      [SeverityLevel.SEVERE]: 4,
    };

    symptoms.forEach(symptom => {
      const points = severityPoints[symptom.severity];

      if (symptom.category === MentalHealthSymptomCategory.MOOD) {
        depression += points;
      }
      if (symptom.category === MentalHealthSymptomCategory.ANXIETY) {
        anxiety += points;
      }
      if (symptom.category === MentalHealthSymptomCategory.PHYSICAL ||
          symptom.category === MentalHealthSymptomCategory.COGNITIVE) {
        stress += points;
      }
    });

    return {
      depression: Math.min(27, depression),
      anxiety: Math.min(21, anxiety),
      stress: Math.min(40, stress),
    };
  }

  private determineOverallSeverity(
    symptoms: MentalHealthSymptom[],
    scores: { depression: number; anxiety: number; stress: number }
  ): SeverityLevel {
    const maxScore = Math.max(scores.depression, scores.anxiety, scores.stress);

    const severestSymptom = symptoms.reduce((max, symptom) => {
      const severityOrder = [
        SeverityLevel.MINIMAL,
        SeverityLevel.MILD,
        SeverityLevel.MODERATE,
        SeverityLevel.MODERATELY_SEVERE,
        SeverityLevel.SEVERE,
      ];
      const maxIndex = severityOrder.indexOf(max);
      const currentIndex = severityOrder.indexOf(symptom.severity);
      return currentIndex > maxIndex ? symptom.severity : max;
    }, SeverityLevel.MINIMAL);

    return severestSymptom;
  }

  private checkCrisisIndicators(
    symptoms: MentalHealthSymptom[],
    context: PatientMentalHealthContext
  ): { isCrisis: boolean; crisisResources: string[] } {
    // Crisis keywords
    const crisisKeywords = [
      'suicidal', 'suicide', 'self-harm', 'harm myself', 'kill myself',
      'want to die', 'life not worth', 'hopeless', 'no reason to live',
    ];

    const hasCrisisSymptom = symptoms.some(symptom =>
      crisisKeywords.some(keyword =>
        symptom.description.toLowerCase().includes(keyword)
      )
    );

    const hasSeverePsychosis = symptoms.some(symptom =>
      symptom.description.toLowerCase().includes('hallucination') ||
      symptom.description.toLowerCase().includes('delusion') ||
      symptom.description.toLowerCase().includes('hearing voices')
    );

    const isCrisis = hasCrisisSymptom || hasSeverePsychosis;

    return {
      isCrisis,
      crisisResources: isCrisis
        ? [...this.crisisResources.us, ...this.crisisResources.international]
        : [],
    };
  }

  private identifyPossibleConditions(
    symptoms: MentalHealthSymptom[],
    context: PatientMentalHealthContext
  ): Array<{ condition: string; likelihood: number; reasoning: string }> {
    const conditions: Array<{ condition: string; likelihood: number; reasoning: string }> = [];

    const symptomCategories = new Set(symptoms.map(s => s.category));

    this.conditionKnowledge.forEach((knowledge, conditionName) => {
      let matchScore = 0;
      let matchedSymptoms = 0;

      knowledge.symptoms.forEach(requiredCategory => {
        if (symptomCategories.has(requiredCategory)) {
          matchedSymptoms++;
        }
      });

      matchScore = matchedSymptoms / knowledge.symptoms.length;

      // Boost if previously diagnosed
      if (context.previousDiagnoses?.includes(conditionName)) {
        matchScore += 0.2;
      }

      if (matchScore > 0.3) {
        conditions.push({
          condition: conditionName,
          likelihood: Math.min(1, matchScore),
          reasoning: `${matchedSymptoms} of ${knowledge.symptoms.length} symptom categories match`,
        });
      }
    });

    return conditions.sort((a, b) => b.likelihood - a.likelihood).slice(0, 3);
  }

  private determineUrgency(
    severity: SeverityLevel,
    isCrisis: boolean,
    symptoms: MentalHealthSymptom[]
  ): UrgencyLevel {
    if (isCrisis) {
      return UrgencyLevel.CRISIS;
    }

    if (severity === SeverityLevel.SEVERE || severity === SeverityLevel.MODERATELY_SEVERE) {
      return UrgencyLevel.URGENT;
    }

    if (severity === SeverityLevel.MODERATE) {
      return UrgencyLevel.PROMPT;
    }

    return UrgencyLevel.ROUTINE;
  }

  private extractPrimaryConcerns(symptoms: MentalHealthSymptom[]): string[] {
    // Group by category and find most severe in each
    const concernsByCategory = new Map<MentalHealthSymptomCategory, MentalHealthSymptom>();

    symptoms.forEach(symptom => {
      const existing = concernsByCategory.get(symptom.category);
      if (!existing || this.compareSeverity(symptom.severity, existing.severity) > 0) {
        concernsByCategory.set(symptom.category, symptom);
      }
    });

    return Array.from(concernsByCategory.values())
      .sort((a, b) => this.compareSeverity(b.severity, a.severity))
      .slice(0, 3)
      .map(s => s.description);
  }

  private compareSeverity(a: SeverityLevel, b: SeverityLevel): number {
    const order = [
      SeverityLevel.MINIMAL,
      SeverityLevel.MILD,
      SeverityLevel.MODERATE,
      SeverityLevel.MODERATELY_SEVERE,
      SeverityLevel.SEVERE,
    ];
    return order.indexOf(a) - order.indexOf(b);
  }

  private identifyRiskFactors(
    symptoms: MentalHealthSymptom[],
    context: PatientMentalHealthContext
  ): string[] {
    const risks: string[] = [];

    if (context.supportSystem === 'weak' || context.supportSystem === 'none') {
      risks.push('Limited social support system');
    }

    if (context.substanceUse && context.substanceUse.length > 0) {
      risks.push('Substance use present');
    }

    if (context.lifeStressors && context.lifeStressors.length >= 3) {
      risks.push('Multiple significant life stressors');
    }

    const severeSymptoms = symptoms.filter(
      s => s.severity === SeverityLevel.SEVERE || s.severity === SeverityLevel.MODERATELY_SEVERE
    );
    if (severeSymptoms.length >= 3) {
      risks.push('Multiple severe symptoms');
    }

    return risks;
  }

  private identifyProtectiveFactors(context: PatientMentalHealthContext): string[] {
    const protective: string[] = [];

    if (context.supportSystem === 'strong' || context.supportSystem === 'moderate') {
      protective.push('Good social support system');
    }

    if (context.therapyHistory && context.therapyHistory.length > 0) {
      const effectiveTherapy = context.therapyHistory.find(
        t => t.effectiveness === 'very-effective' || t.effectiveness === 'somewhat-effective'
      );
      if (effectiveTherapy) {
        protective.push('Previous positive therapy experience');
      }
    }

    if (!context.substanceUse || context.substanceUse.length === 0) {
      protective.push('No substance use');
    }

    return protective;
  }

  private generateRecommendations(
    severity: SeverityLevel,
    possibleConditions: Array<{ condition: string; likelihood: number }>,
    context: PatientMentalHealthContext,
    urgency: UrgencyLevel
  ): TherapeuticRecommendation[] {
    const recommendations: TherapeuticRecommendation[] = [];

    // Professional help
    if (urgency === UrgencyLevel.CRISIS) {
      recommendations.push({
        type: 'medical',
        priority: 'high',
        description: 'IMMEDIATE professional intervention required - Contact emergency services or crisis hotline',
        resources: this.crisisResources.us,
      });
    } else if (urgency === UrgencyLevel.URGENT || urgency === UrgencyLevel.PROMPT) {
      recommendations.push({
        type: 'therapy',
        priority: 'high',
        description: 'Schedule appointment with licensed mental health professional',
        estimatedDuration: 'Initial consultation within 1-2 weeks',
      });
    }

    // Therapy recommendations
    if (possibleConditions.length > 0) {
      const topCondition = possibleConditions[0];
      const knowledge = this.conditionKnowledge.get(topCondition.condition);
      if (knowledge && knowledge.recommendedTherapies.length > 0) {
        recommendations.push({
          type: 'therapy',
          priority: 'high',
          description: `Consider evidence-based therapies: ${knowledge.recommendedTherapies.slice(0, 2).join(', ')}`,
          estimatedDuration: '8-16 weeks typical',
        });
      }
    }

    // Lifestyle recommendations
    recommendations.push({
      type: 'lifestyle',
      priority: 'medium',
      description: 'Establish consistent sleep schedule (7-9 hours)',
      resources: ['Sleep hygiene guidelines'],
    });

    recommendations.push({
      type: 'lifestyle',
      priority: 'medium',
      description: 'Regular physical activity (30 minutes, 3-5 times per week)',
      resources: ['Exercise guidelines for mental health'],
    });

    // Self-help strategies
    recommendations.push({
      type: 'self-help',
      priority: 'medium',
      description: 'Practice daily coping strategies and mindfulness',
      resources: ['Mindfulness apps', 'Self-help workbooks'],
    });

    // Support groups
    if (context.supportSystem === 'weak' || context.supportSystem === 'none') {
      recommendations.push({
        type: 'support-group',
        priority: 'medium',
        description: 'Join peer support group for additional support',
        resources: ['Local support group directories', 'Online support communities'],
      });
    }

    return recommendations;
  }

  private getTherapyRationale(
    type: TherapyType,
    possibleConditions: Array<{ condition: string; likelihood: number }>
  ): string {
    const rationales: Record<TherapyType, string> = {
      [TherapyType.CBT]: 'Evidence-based for changing thought patterns and behaviors',
      [TherapyType.DBT]: 'Effective for emotion regulation and distress tolerance',
      [TherapyType.PSYCHODYNAMIC]: 'Explores unconscious patterns and past experiences',
      [TherapyType.HUMANISTIC]: 'Focus on personal growth and self-actualization',
      [TherapyType.MINDFULNESS]: 'Cultivates present-moment awareness and acceptance',
      [TherapyType.EMDR]: 'Specialized for trauma processing',
      [TherapyType.GROUP_THERAPY]: 'Benefits from peer support and shared experiences',
      [TherapyType.FAMILY_THERAPY]: 'Addresses relational dynamics and family patterns',
    };

    return rationales[type] || 'Evidence-based therapeutic approach';
  }

  private getTypicalDuration(type: TherapyType): string {
    const durations: Record<TherapyType, string> = {
      [TherapyType.CBT]: '12-20 sessions',
      [TherapyType.DBT]: '6 months to 1 year',
      [TherapyType.PSYCHODYNAMIC]: '6 months to several years',
      [TherapyType.HUMANISTIC]: '3-6 months or ongoing',
      [TherapyType.MINDFULNESS]: '8-12 weeks initial course',
      [TherapyType.EMDR]: '6-12 sessions',
      [TherapyType.GROUP_THERAPY]: '8-16 weeks or ongoing',
      [TherapyType.FAMILY_THERAPY]: '8-20 sessions',
    };

    return durations[type] || 'Varies by individual needs';
  }

  private getTherapyConsiderations(context: PatientMentalHealthContext): string[] {
    const considerations: string[] = [];

    if (context.age < 18) {
      considerations.push('Age-appropriate therapeutic approaches recommended');
    }

    if (context.age > 65) {
      considerations.push('Consider therapists experienced with older adults');
    }

    if (context.previousDiagnoses && context.previousDiagnoses.length > 0) {
      considerations.push('Discuss previous diagnoses with potential therapists');
    }

    if (context.currentMedications && context.currentMedications.length > 0) {
      considerations.push('Coordinate therapy with prescribing physician');
    }

    considerations.push('Therapeutic relationship (rapport) is key to success');
    considerations.push('It may take 2-3 sessions to assess fit with therapist');

    return considerations;
  }

  private getDisclaimer(): string {
    return 'DISCLAIMER: This assessment is for informational purposes only and is NOT a substitute ' +
      'for professional mental health diagnosis or treatment. Always consult with licensed mental health ' +
      'professionals for proper evaluation and care. If you are experiencing a mental health crisis, ' +
      'please contact emergency services (911) or a crisis hotline immediately.';
  }
}
