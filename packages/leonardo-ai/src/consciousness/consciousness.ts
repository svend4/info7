/**
 * Consciousness Layer
 *
 * Provides self-reflection, action explanation, and metacognitive awareness
 * for Leonardo AI decision-making.
 */

import { Logger, MetricsCollector, AppError } from '@info7/common';
import {
  ConsciousnessConfig,
  ConsciousnessState,
  ConsciousnessStatistics,
  DecisionContext,
  ReflectionResult,
  ReflectionDepth,
  ActionRationale,
  SelfAssessment,
  Explanation,
  ExplanationRequest,
  ExplanationStyle,
  ConsciousnessInsight,
  ConfidenceCalibration,
} from './types';
import { Action } from '../rl/types';

/**
 * Main Consciousness Layer implementation
 */
export class Consciousness {
  private logger: Logger;
  private metrics: MetricsCollector;
  private config: ConsciousnessConfig;

  private reflectionHistory: ReflectionResult[] = [];
  private insights: ConsciousnessInsight[] = [];
  private decisionCount = 0;
  private confidenceHistory: ConfidenceCalibration[] = [];

  // Statistics
  private stats = {
    totalReflections: 0,
    totalExplanations: 0,
    reflectionDepthCounts: new Map<ReflectionDepth, number>(),
    insightsGenerated: 0,
    biasesDetected: 0,
  };

  constructor(config: Partial<ConsciousnessConfig> = {}) {
    this.logger = new Logger('consciousness');
    this.metrics = new MetricsCollector('consciousness');

    this.config = {
      enableReflection: true,
      reflectionFrequency: 10,
      defaultDepth: ReflectionDepth.INTERMEDIATE,
      enableExplanation: true,
      defaultExplanationStyle: ExplanationStyle.STEP_BY_STEP,
      confidenceCalibrationEnabled: true,
      biasDetectionEnabled: true,
      insightGenerationThreshold: 0.7,
      maxStoredReflections: 100,
      ...config,
    };

    this.logger.info('Consciousness Layer initialized', { config: this.config });
  }

  /**
   * Reflect on a decision that was made
   */
  async reflect(
    context: DecisionContext,
    outcome?: { reward: number; success: boolean },
    depth: ReflectionDepth = this.config.defaultDepth
  ): Promise<ReflectionResult> {
    const startTime = Date.now();
    this.decisionCount++;

    try {
      this.logger.info('Starting reflection', { depth, decisionCount: this.decisionCount });

      // Generate action rationale
      const rationale = this.generateRationale(context);

      // Self-assessment
      const assessment = outcome
        ? this.assessDecision(context, rationale, outcome)
        : this.estimateAssessment(context, rationale);

      // Generate insights based on depth
      const insights = await this.generateInsights(context, rationale, assessment, depth);

      // Meta-cognition analysis
      const metaCognition = this.analyzeMetaCognition(context, rationale, assessment);

      const result: ReflectionResult = {
        context,
        rationale,
        assessment,
        insights,
        metaCognition,
        depth,
      };

      // Store reflection
      this.storeReflection(result);

      // Update statistics
      this.stats.totalReflections++;
      this.stats.reflectionDepthCounts.set(
        depth,
        (this.stats.reflectionDepthCounts.get(depth) || 0) + 1
      );

      // Generate consciousness insights if threshold met
      if (this.shouldGenerateInsight()) {
        const consciousnessInsight = this.extractConsciousnessInsight(result);
        if (consciousnessInsight) {
          this.insights.push(consciousnessInsight);
          this.stats.insightsGenerated++;
        }
      }

      const duration = Date.now() - startTime;
      this.metrics.recordValue('reflection_duration', duration);
      this.logger.info('Reflection completed', { depth, duration });

      return result;
    } catch (error) {
      this.logger.error('Reflection failed', error);
      throw new AppError('Reflection failed', 'REFLECTION_ERROR', error);
    }
  }

  /**
   * Generate explanation for a decision
   */
  async explain(request: ExplanationRequest): Promise<Explanation> {
    const startTime = Date.now();

    try {
      this.logger.info('Generating explanation', { style: request.style });

      const explanation = this.buildExplanation(request);

      this.stats.totalExplanations++;

      const duration = Date.now() - startTime;
      this.metrics.recordValue('explanation_duration', duration);
      this.logger.info('Explanation generated', { style: request.style, duration });

      return explanation;
    } catch (error) {
      this.logger.error('Explanation generation failed', error);
      throw new AppError('Explanation failed', 'EXPLANATION_ERROR', error);
    }
  }

  /**
   * Record actual outcome for confidence calibration
   */
  recordOutcome(context: DecisionContext, performance: number): void {
    if (!this.config.confidenceCalibrationEnabled) {
      return;
    }

    const calibration: ConfidenceCalibration = {
      predictedConfidence: context.selectedAction.confidence,
      actualPerformance: performance,
      calibrationError: Math.abs(context.selectedAction.confidence - performance),
      overconfident: context.selectedAction.confidence > performance + 0.1,
      underconfident: context.selectedAction.confidence < performance - 0.1,
    };

    this.confidenceHistory.push(calibration);

    // Keep only recent history
    if (this.confidenceHistory.length > 1000) {
      this.confidenceHistory.shift();
    }
  }

  /**
   * Get current consciousness state
   */
  getState(): ConsciousnessState {
    const recentReflections = this.reflectionHistory.slice(-10);

    // Calculate metacognitive awareness
    const selfKnowledge = this.calculateSelfKnowledge();
    const adaptability = this.calculateAdaptability();
    const learningRate = this.calculateLearningRate();

    // Detect biases
    const biases = this.detectBiases();

    return {
      timestamp: Date.now(),
      currentStrategy: recentReflections[recentReflections.length - 1]?.context.strategy.type,
      confidenceLevel: this.getAverageConfidence(),
      recentReflections,
      activeInsights: this.insights.slice(-5),
      metacognitiveAwareness: {
        selfKnowledge,
        adaptability,
        learningRate,
      },
      biasDetection: {
        detectedBiases: biases,
        mitigationStrategies: this.generateMitigationStrategies(biases),
      },
    };
  }

  /**
   * Get statistics
   */
  getStatistics(): ConsciousnessStatistics {
    // Calculate average calibration error
    const avgCalibrationError = this.confidenceHistory.length > 0
      ? this.confidenceHistory.reduce((sum, c) => sum + c.calibrationError, 0) / this.confidenceHistory.length
      : 0;

    const overconfidenceRate = this.confidenceHistory.length > 0
      ? this.confidenceHistory.filter(c => c.overconfident).length / this.confidenceHistory.length
      : 0;

    const underconfidenceRate = this.confidenceHistory.length > 0
      ? this.confidenceHistory.filter(c => c.underconfident).length / this.confidenceHistory.length
      : 0;

    // Aggregate improvement areas
    const improvementAreas = new Map<string, { count: number; avgCurrentLevel: number; avgTargetLevel: number }>();

    for (const reflection of this.reflectionHistory) {
      for (const area of reflection.assessment.improvementAreas) {
        const existing = improvementAreas.get(area.area);
        if (existing) {
          existing.count++;
          existing.avgCurrentLevel = (existing.avgCurrentLevel * (existing.count - 1) + area.currentLevel) / existing.count;
          existing.avgTargetLevel = (existing.avgTargetLevel * (existing.count - 1) + area.targetLevel) / existing.count;
        } else {
          improvementAreas.set(area.area, {
            count: 1,
            avgCurrentLevel: area.currentLevel,
            avgTargetLevel: area.targetLevel,
          });
        }
      }
    }

    // Calculate average depth
    let totalDepthScore = 0;
    for (const [depth, count] of this.stats.reflectionDepthCounts) {
      const score = depth === ReflectionDepth.SURFACE ? 1 : depth === ReflectionDepth.INTERMEDIATE ? 2 : 3;
      totalDepthScore += score * count;
    }
    const avgDepthScore = this.stats.totalReflections > 0 ? totalDepthScore / this.stats.totalReflections : 2;
    const averageReflectionDepth =
      avgDepthScore < 1.5 ? ReflectionDepth.SURFACE :
      avgDepthScore < 2.5 ? ReflectionDepth.INTERMEDIATE :
      ReflectionDepth.DEEP;

    return {
      totalReflections: this.stats.totalReflections,
      totalExplanations: this.stats.totalExplanations,
      averageReflectionDepth,
      insightsGenerated: this.stats.insightsGenerated,
      biasesDetected: this.stats.biasesDetected,
      confidenceCalibration: {
        averageCalibrationError: avgCalibrationError,
        overconfidenceRate,
        underconfidenceRate,
      },
      improvementAreas,
    };
  }

  /**
   * Generate action rationale
   */
  private generateRationale(context: DecisionContext): ActionRationale {
    const { state, selectedAction, availableActions, strategy } = context;

    // Identify primary reason
    const primaryReason = this.identifyPrimaryReason(context);

    // Identify contributing factors
    const contributingFactors = this.identifyContributingFactors(context);

    // Generate alternatives analysis
    const alternatives = availableActions
      .filter(a => a.type !== selectedAction.type)
      .slice(0, 3)
      .map(action => ({
        action,
        reason: this.explainActionChoice(context, action),
        whyNotChosen: this.explainWhyNotChosen(context, action, selectedAction),
      }));

    // Identify uncertainties
    const uncertainties = this.identifyUncertainties(context);

    return {
      primaryReason,
      contributingFactors,
      alternatives,
      confidence: selectedAction.confidence,
      uncertainties,
    };
  }

  /**
   * Assess a decision
   */
  private assessDecision(
    context: DecisionContext,
    rationale: ActionRationale,
    outcome: { reward: number; success: boolean }
  ): SelfAssessment {
    // Decision quality based on outcome
    const decisionQuality = outcome.reward;

    // Confidence calibration
    const confidenceCalibration = 1 - Math.abs(rationale.confidence - outcome.reward);

    // Strategic alignment (high if strategy was appropriate)
    const strategicAlignment = this.assessStrategicAlignment(context, outcome);

    // Learning value
    const learningValue = this.assessLearningValue(context, outcome);

    // Identify biases
    const identifiedBiases = this.identifyBiasesInDecision(context, outcome);

    // Identify improvement areas
    const improvementAreas = this.identifyImprovementAreas(context, outcome);

    return {
      decisionQuality,
      confidenceCalibration,
      strategicAlignment,
      learningValue,
      identifiedBiases,
      improvementAreas,
    };
  }

  /**
   * Estimate assessment when outcome is not yet known
   */
  private estimateAssessment(context: DecisionContext, rationale: ActionRationale): SelfAssessment {
    return {
      decisionQuality: rationale.confidence,
      confidenceCalibration: 0.8, // Neutral estimate
      strategicAlignment: 0.7, // Neutral estimate
      learningValue: 0.5,
      identifiedBiases: [],
      improvementAreas: [],
    };
  }

  /**
   * Generate insights from reflection
   */
  private async generateInsights(
    context: DecisionContext,
    rationale: ActionRationale,
    assessment: SelfAssessment,
    depth: ReflectionDepth
  ): Promise<ReflectionResult['insights']> {
    const insights: ReflectionResult['insights'] = [];

    if (depth === ReflectionDepth.SURFACE) {
      // Basic outcome analysis
      if (assessment.decisionQuality > 0.8) {
        insights.push({
          type: 'success',
          description: `High-quality decision with ${(assessment.decisionQuality * 100).toFixed(0)}% success rate`,
          confidence: 0.9,
          actionable: false,
        });
      }
    } else if (depth === ReflectionDepth.INTERMEDIATE) {
      // Strategy and reasoning analysis
      if (assessment.confidenceCalibration < 0.6) {
        insights.push({
          type: 'mistake',
          description: 'Poor confidence calibration detected',
          confidence: 0.8,
          actionable: true,
          recommendation: 'Adjust confidence estimation parameters',
        });
      }

      if (assessment.identifiedBiases.length > 0) {
        insights.push({
          type: 'pattern',
          description: `Detected ${assessment.identifiedBiases.length} cognitive biases`,
          confidence: 0.75,
          actionable: true,
          recommendation: 'Apply bias mitigation strategies',
        });
      }
    } else {
      // Deep meta-cognitive analysis
      const patterns = this.detectDeepPatterns(context, rationale, assessment);
      insights.push(...patterns);
    }

    return insights;
  }

  /**
   * Analyze meta-cognition
   */
  private analyzeMetaCognition(
    context: DecisionContext,
    rationale: ActionRationale,
    assessment: SelfAssessment
  ): ReflectionResult['metaCognition'] {
    const thinkingPatterns = this.identifyThinkingPatterns(context, rationale);
    const blindSpots = this.identifyBlindSpots(context, assessment);
    const strengths = this.identifyStrengths(context, assessment);
    const weaknesses = this.identifyWeaknesses(context, assessment);

    return {
      thinkingPatterns,
      blindSpots,
      strengths,
      weaknesses,
    };
  }

  /**
   * Build explanation based on request
   */
  private buildExplanation(request: ExplanationRequest): Explanation {
    const { context, style, detailLevel } = request;

    let summary: string;
    let steps: Explanation['reasoning']['steps'];
    let conclusion: string;

    if (style === ExplanationStyle.TECHNICAL) {
      summary = this.generateTechnicalSummary(context);
      steps = this.generateTechnicalSteps(context);
      conclusion = this.generateTechnicalConclusion(context);
    } else if (style === ExplanationStyle.INTUITIVE) {
      summary = this.generateIntuitiveSummary(context);
      steps = this.generateIntuitiveSteps(context);
      conclusion = this.generateIntuitiveConclusion(context);
    } else if (style === ExplanationStyle.STEP_BY_STEP) {
      summary = this.generateStepByStepSummary(context);
      steps = this.generateDetailedSteps(context);
      conclusion = this.generateStepByStepConclusion(context);
    } else {
      summary = this.generateComparativeSummary(context);
      steps = this.generateComparativeSteps(context);
      conclusion = this.generateComparativeConclusion(context);
    }

    const explanation: Explanation = {
      summary,
      reasoning: {
        steps,
        conclusion,
      },
      assumptions: this.identifyAssumptions(context),
      limitations: this.identifyLimitations(context),
      style,
    };

    if (request.includeAlternatives) {
      explanation.alternatives = this.generateAlternativesComparison(context);
    }

    if (request.includeConfidence) {
      explanation.confidence = {
        level: context.selectedAction.confidence,
        factors: this.getConfidenceFactors(context),
        uncertainties: this.identifyUncertainties(context),
      };
    }

    return explanation;
  }

  // ===== Helper Methods =====

  private identifyPrimaryReason(context: DecisionContext): string {
    const { strategy, selectedAction } = context;
    return `Selected ${selectedAction.type} based on ${strategy.type} strategy with confidence ${(selectedAction.confidence * 100).toFixed(0)}%`;
  }

  private identifyContributingFactors(context: DecisionContext): ActionRationale['contributingFactors'] {
    return [
      {
        factor: 'Prior Experience',
        weight: context.priorExperience.similarTasksCount > 10 ? 0.8 : 0.3,
        description: `${context.priorExperience.similarTasksCount} similar tasks completed with ${(context.priorExperience.averagePerformance * 100).toFixed(0)}% success`,
      },
      {
        factor: 'Time Constraints',
        weight: context.constraints.timeLimit ? 0.6 : 0.2,
        description: context.constraints.timeLimit ? 'Time-limited decision' : 'No time pressure',
      },
      {
        factor: 'Quality Requirements',
        weight: context.constraints.qualityThreshold || 0.5,
        description: `Quality threshold: ${((context.constraints.qualityThreshold || 0.5) * 100).toFixed(0)}%`,
      },
    ];
  }

  private explainActionChoice(context: DecisionContext, action: Action): string {
    return `Action ${action.type} has ${(action.confidence * 100).toFixed(0)}% confidence`;
  }

  private explainWhyNotChosen(context: DecisionContext, notChosen: Action, chosen: Action): string {
    if (chosen.confidence > notChosen.confidence) {
      return `Lower confidence (${(notChosen.confidence * 100).toFixed(0)}% vs ${(chosen.confidence * 100).toFixed(0)}%)`;
    }
    return 'Alternative strategy deemed less suitable';
  }

  private identifyUncertainties(context: DecisionContext): string[] {
    const uncertainties: string[] = [];

    if (context.selectedAction.confidence < 0.7) {
      uncertainties.push('Low confidence in action selection');
    }

    if (context.priorExperience.similarTasksCount < 5) {
      uncertainties.push('Limited prior experience with similar tasks');
    }

    if (context.priorExperience.recentFailures > 2) {
      uncertainties.push('Recent failures may indicate strategy mismatch');
    }

    return uncertainties;
  }

  private assessStrategicAlignment(context: DecisionContext, outcome: { reward: number }): number {
    // High alignment if outcome matches expected performance
    const expected = context.priorExperience.averagePerformance;
    return 1 - Math.abs(expected - outcome.reward);
  }

  private assessLearningValue(context: DecisionContext, outcome: { reward: number }): number {
    // Higher learning value for novel situations or unexpected outcomes
    const novelty = context.priorExperience.similarTasksCount < 5 ? 0.8 : 0.3;
    const surprise = Math.abs(outcome.reward - context.selectedAction.confidence);
    return (novelty + surprise) / 2;
  }

  private identifyBiasesInDecision(
    context: DecisionContext,
    outcome: { reward: number }
  ): SelfAssessment['identifiedBiases'] {
    const biases: SelfAssessment['identifiedBiases'] = [];

    // Overconfidence bias
    if (context.selectedAction.confidence > outcome.reward + 0.2) {
      biases.push({
        type: 'overconfidence',
        severity: context.selectedAction.confidence - outcome.reward,
        description: 'Predicted confidence exceeded actual performance',
      });
    }

    // Recency bias
    if (context.priorExperience.recentFailures > 0 && outcome.reward < 0.5) {
      biases.push({
        type: 'recency',
        severity: 0.6,
        description: 'Recent failures may have influenced decision-making',
      });
    }

    return biases;
  }

  private identifyImprovementAreas(
    context: DecisionContext,
    outcome: { reward: number }
  ): SelfAssessment['improvementAreas'] {
    const areas: SelfAssessment['improvementAreas'] = [];

    if (outcome.reward < 0.6) {
      areas.push({
        area: 'Decision Quality',
        currentLevel: outcome.reward,
        targetLevel: 0.8,
        actionSteps: [
          'Gather more training data',
          'Refine strategy selection',
          'Improve feature engineering',
        ],
      });
    }

    if (Math.abs(context.selectedAction.confidence - outcome.reward) > 0.2) {
      areas.push({
        area: 'Confidence Calibration',
        currentLevel: 1 - Math.abs(context.selectedAction.confidence - outcome.reward),
        targetLevel: 0.9,
        actionSteps: [
          'Calibrate confidence estimation',
          'Track prediction accuracy',
          'Adjust uncertainty quantification',
        ],
      });
    }

    return areas;
  }

  private detectDeepPatterns(
    context: DecisionContext,
    rationale: ActionRationale,
    assessment: SelfAssessment
  ): ReflectionResult['insights'] {
    // Analyze historical reflections for deep patterns
    const insights: ReflectionResult['insights'] = [];

    // Pattern: Consistent overconfidence
    const recentCalibrations = this.confidenceHistory.slice(-20);
    const overconfidentCount = recentCalibrations.filter(c => c.overconfident).length;
    if (overconfidentCount > 10) {
      insights.push({
        type: 'pattern',
        description: 'Systematic overconfidence detected across multiple decisions',
        confidence: 0.9,
        actionable: true,
        recommendation: 'Apply confidence penalty factor of 0.9',
      });
    }

    return insights;
  }

  private identifyThinkingPatterns(context: DecisionContext, rationale: ActionRationale): string[] {
    const patterns: string[] = [];

    if (rationale.confidence > 0.8) {
      patterns.push('High-confidence decision-making');
    }

    if (context.priorExperience.similarTasksCount > 20) {
      patterns.push('Experience-driven reasoning');
    }

    return patterns;
  }

  private identifyBlindSpots(context: DecisionContext, assessment: SelfAssessment): string[] {
    const blindSpots: string[] = [];

    if (context.priorExperience.similarTasksCount < 5) {
      blindSpots.push('Limited experience domain');
    }

    if (assessment.identifiedBiases.length > 0) {
      blindSpots.push('Cognitive biases in decision process');
    }

    return blindSpots;
  }

  private identifyStrengths(context: DecisionContext, assessment: SelfAssessment): string[] {
    const strengths: string[] = [];

    if (assessment.decisionQuality > 0.8) {
      strengths.push('High-quality decision-making');
    }

    if (assessment.confidenceCalibration > 0.8) {
      strengths.push('Well-calibrated confidence');
    }

    return strengths;
  }

  private identifyWeaknesses(context: DecisionContext, assessment: SelfAssessment): string[] {
    const weaknesses: string[] = [];

    if (assessment.decisionQuality < 0.6) {
      weaknesses.push('Suboptimal decision quality');
    }

    if (assessment.confidenceCalibration < 0.6) {
      weaknesses.push('Poor confidence calibration');
    }

    return weaknesses;
  }

  private storeReflection(reflection: ReflectionResult): void {
    this.reflectionHistory.push(reflection);

    if (this.reflectionHistory.length > this.config.maxStoredReflections) {
      this.reflectionHistory.shift();
    }
  }

  private shouldGenerateInsight(): boolean {
    return this.decisionCount % this.config.reflectionFrequency === 0;
  }

  private extractConsciousnessInsight(reflection: ReflectionResult): ConsciousnessInsight | null {
    // Extract high-confidence insights
    const highConfidenceInsights = reflection.insights.filter(
      i => i.confidence >= this.config.insightGenerationThreshold && i.actionable
    );

    if (highConfidenceInsights.length === 0) {
      return null;
    }

    const insight = highConfidenceInsights[0];

    return {
      id: `insight-${Date.now()}`,
      timestamp: Date.now(),
      type: 'metacognitive',
      insight: insight.description,
      evidence: [{
        source: 'reflection',
        data: { reflection: reflection.context },
      }],
      confidence: insight.confidence,
      actionable: insight.actionable,
      recommendations: insight.recommendation ? [insight.recommendation] : [],
      priority: insight.confidence > 0.9 ? 'high' : 'medium',
    };
  }

  private calculateSelfKnowledge(): number {
    // Based on confidence calibration accuracy
    if (this.confidenceHistory.length === 0) return 0.5;

    const avgError = this.confidenceHistory.reduce((sum, c) => sum + c.calibrationError, 0) / this.confidenceHistory.length;
    return 1 - avgError;
  }

  private calculateAdaptability(): number {
    // Based on variety of strategies used
    if (this.reflectionHistory.length < 10) return 0.5;

    const strategies = new Set(this.reflectionHistory.map(r => r.context.strategy.type));
    return Math.min(1, strategies.size / 5);
  }

  private calculateLearningRate(): number {
    // Based on improvement over time
    if (this.reflectionHistory.length < 20) return 0.5;

    const recent = this.reflectionHistory.slice(-10);
    const older = this.reflectionHistory.slice(-20, -10);

    const recentAvg = recent.reduce((sum, r) => sum + r.assessment.decisionQuality, 0) / recent.length;
    const olderAvg = older.reduce((sum, r) => sum + r.assessment.decisionQuality, 0) / older.length;

    return Math.min(1, Math.max(0, (recentAvg - olderAvg) + 0.5));
  }

  private getAverageConfidence(): number {
    if (this.reflectionHistory.length === 0) return 0.5;

    const recent = this.reflectionHistory.slice(-10);
    return recent.reduce((sum, r) => sum + r.rationale.confidence, 0) / recent.length;
  }

  private detectBiases(): string[] {
    const biases: string[] = [];

    // Check for overconfidence
    const overconfidentRate = this.confidenceHistory.filter(c => c.overconfident).length / Math.max(1, this.confidenceHistory.length);
    if (overconfidentRate > 0.5) {
      biases.push('overconfidence');
      this.stats.biasesDetected++;
    }

    // Check for underconfidence
    const underconfidentRate = this.confidenceHistory.filter(c => c.underconfident).length / Math.max(1, this.confidenceHistory.length);
    if (underconfidentRate > 0.5) {
      biases.push('underconfidence');
      this.stats.biasesDetected++;
    }

    return biases;
  }

  private generateMitigationStrategies(biases: string[]): string[] {
    return biases.map(bias => {
      if (bias === 'overconfidence') {
        return 'Apply confidence penalty factor';
      } else if (bias === 'underconfidence') {
        return 'Boost confidence for high-performing strategies';
      }
      return 'Monitor and adjust';
    });
  }

  // Explanation generation helpers

  private generateTechnicalSummary(context: DecisionContext): string {
    return `Selected action ${context.selectedAction.type} using ${context.strategy.type} strategy with parameters ${JSON.stringify(context.strategy.hyperparameters)}`;
  }

  private generateTechnicalSteps(context: DecisionContext): Explanation['reasoning']['steps'] {
    return [
      {
        step: 1,
        description: 'State analysis',
        data: { state: context.state },
        reasoning: 'Analyzed current state features',
      },
      {
        step: 2,
        description: 'Strategy selection',
        data: { strategy: context.strategy },
        reasoning: `Selected ${context.strategy.type} based on task characteristics`,
      },
      {
        step: 3,
        description: 'Action selection',
        data: { action: context.selectedAction },
        reasoning: `Chose ${context.selectedAction.type} with ${(context.selectedAction.confidence * 100).toFixed(0)}% confidence`,
      },
    ];
  }

  private generateTechnicalConclusion(context: DecisionContext): string {
    return `Action ${context.selectedAction.type} selected with confidence ${context.selectedAction.confidence.toFixed(2)}`;
  }

  private generateIntuitiveSummary(context: DecisionContext): string {
    return `Chose ${context.selectedAction.type} because it seemed most promising given past experience`;
  }

  private generateIntuitiveSteps(context: DecisionContext): Explanation['reasoning']['steps'] {
    return [
      {
        step: 1,
        description: 'Situation assessment',
        data: {},
        reasoning: 'Evaluated the current situation',
      },
      {
        step: 2,
        description: 'Decision',
        data: {},
        reasoning: `Selected ${context.selectedAction.type} based on similar past successes`,
      },
    ];
  }

  private generateIntuitiveConclusion(context: DecisionContext): string {
    return `${context.selectedAction.type} felt like the right choice`;
  }

  private generateStepByStepSummary(context: DecisionContext): string {
    return `Following a systematic process, selected ${context.selectedAction.type}`;
  }

  private generateDetailedSteps(context: DecisionContext): Explanation['reasoning']['steps'] {
    return [
      {
        step: 1,
        description: 'Analyze current state',
        data: { features: Object.keys(context.state.features).length },
        reasoning: 'Examined all state features',
      },
      {
        step: 2,
        description: 'Evaluate available actions',
        data: { count: context.availableActions.length },
        reasoning: `Considered ${context.availableActions.length} possible actions`,
      },
      {
        step: 3,
        description: 'Apply strategy',
        data: { strategy: context.strategy.type },
        reasoning: `Used ${context.strategy.type} to rank actions`,
      },
      {
        step: 4,
        description: 'Select best action',
        data: { selected: context.selectedAction.type },
        reasoning: `Chose ${context.selectedAction.type} as highest-ranked`,
      },
    ];
  }

  private generateStepByStepConclusion(context: DecisionContext): string {
    return `Systematic analysis led to selection of ${context.selectedAction.type}`;
  }

  private generateComparativeSummary(context: DecisionContext): string {
    return `${context.selectedAction.type} chosen over ${context.availableActions.length - 1} alternatives`;
  }

  private generateComparativeSteps(context: DecisionContext): Explanation['reasoning']['steps'] {
    return [
      {
        step: 1,
        description: 'Compare alternatives',
        data: { alternatives: context.availableActions.map(a => a.type) },
        reasoning: 'Ranked all available actions',
      },
      {
        step: 2,
        description: 'Select winner',
        data: { winner: context.selectedAction.type },
        reasoning: `${context.selectedAction.type} scored highest`,
      },
    ];
  }

  private generateComparativeConclusion(context: DecisionContext): string {
    return `${context.selectedAction.type} outperformed alternatives`;
  }

  private generateAlternativesComparison(context: DecisionContext): Explanation['alternatives'] {
    return context.availableActions
      .filter(a => a.type !== context.selectedAction.type)
      .slice(0, 3)
      .map(action => ({
        action,
        pros: ['Available', 'Feasible'],
        cons: ['Lower confidence than selected action'],
        confidence: action.confidence,
      }));
  }

  private getConfidenceFactors(context: DecisionContext): string[] {
    return [
      `Prior experience: ${context.priorExperience.similarTasksCount} similar tasks`,
      `Average performance: ${(context.priorExperience.averagePerformance * 100).toFixed(0)}%`,
      `Strategy: ${context.strategy.type}`,
    ];
  }

  private identifyAssumptions(context: DecisionContext): string[] {
    return [
      'State features accurately represent the situation',
      'Past performance predicts future results',
      'Available actions are complete',
    ];
  }

  private identifyLimitations(context: DecisionContext): string[] {
    const limitations: string[] = [];

    if (context.priorExperience.similarTasksCount < 10) {
      limitations.push('Limited prior experience');
    }

    if (context.selectedAction.confidence < 0.7) {
      limitations.push('Moderate confidence level');
    }

    return limitations;
  }
}
