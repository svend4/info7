/**
 * Consciousness Layer Example
 *
 * Demonstrates self-reflection, action explanation, and metacognitive
 * awareness capabilities of Leonardo AI.
 */

import { Logger } from '@info7/common';
import {
  Consciousness,
  DecisionContext,
  ReflectionDepth,
  ExplanationStyle,
  ExplanationRequest,
} from './consciousness';
import { StrategyType } from './meta-learning';
import { State, Action } from './rl/types';

const logger = new Logger('consciousness-example');

/**
 * Example 1: Basic Reflection
 */
async function example1_BasicReflection() {
  logger.info('Example 1: Basic Reflection');

  const consciousness = new Consciousness();

  // Create a decision context
  const context: DecisionContext = {
    timestamp: Date.now(),
    state: createState(['user_active', 'high_priority', 'time_sensitive']),
    availableActions: [
      createAction('immediate_response', 0.85),
      createAction('gather_more_info', 0.65),
      createAction('delegate_task', 0.45),
    ],
    selectedAction: createAction('immediate_response', 0.85),
    strategy: {
      type: StrategyType.FAST_ADAPTATION,
      hyperparameters: {
        learningRate: 0.01,
        explorationRate: 0.1,
        adaptationSteps: 5,
      },
    },
    constraints: {
      timeLimit: 5000,
      qualityThreshold: 0.8,
    },
    priorExperience: {
      similarTasksCount: 15,
      averagePerformance: 0.78,
      recentFailures: 1,
    },
  };

  // Reflect without outcome (during decision-making)
  logger.info('\nReflecting on decision (before outcome)...');
  const reflectionBefore = await consciousness.reflect(context);

  logger.info(`Primary Reason: ${reflectionBefore.rationale.primaryReason}`);
  logger.info(`Confidence: ${reflectionBefore.rationale.confidence.toFixed(2)}`);
  logger.info(`Contributing Factors:`);
  reflectionBefore.rationale.contributingFactors.forEach(factor => {
    logger.info(`  - ${factor.factor} (weight: ${factor.weight.toFixed(2)}): ${factor.description}`);
  });

  logger.info(`\nAlternatives Considered:`);
  reflectionBefore.rationale.alternatives.forEach(alt => {
    logger.info(`  - ${alt.action.type}: ${alt.reason}`);
    logger.info(`    Why not chosen: ${alt.whyNotChosen}`);
  });

  // Simulate task execution and outcome
  const outcome = { reward: 0.82, success: true };

  // Reflect after outcome
  logger.info('\nReflecting on decision (after outcome)...');
  const reflectionAfter = await consciousness.reflect(context, outcome, ReflectionDepth.INTERMEDIATE);

  logger.info(`\nSelf-Assessment:`);
  logger.info(`  Decision Quality: ${reflectionAfter.assessment.decisionQuality.toFixed(2)}`);
  logger.info(`  Confidence Calibration: ${reflectionAfter.assessment.confidenceCalibration.toFixed(2)}`);
  logger.info(`  Strategic Alignment: ${reflectionAfter.assessment.strategicAlignment.toFixed(2)}`);
  logger.info(`  Learning Value: ${reflectionAfter.assessment.learningValue.toFixed(2)}`);

  if (reflectionAfter.insights.length > 0) {
    logger.info(`\nInsights:`);
    reflectionAfter.insights.forEach((insight, idx) => {
      logger.info(`  ${idx + 1}. [${insight.type}] ${insight.description} (confidence: ${insight.confidence.toFixed(2)})`);
      if (insight.recommendation) {
        logger.info(`     Recommendation: ${insight.recommendation}`);
      }
    });
  }

  // Record outcome for calibration
  consciousness.recordOutcome(context, outcome.reward);
}

/**
 * Example 2: Deep Reflection and Meta-Cognition
 */
async function example2_DeepReflection() {
  logger.info('\n' + '='.repeat(80));
  logger.info('Example 2: Deep Reflection and Meta-Cognition');

  const consciousness = new Consciousness({
    reflectionFrequency: 5,
    defaultDepth: ReflectionDepth.DEEP,
  });

  // Simulate a series of decisions
  const contexts = [
    createDecisionContext('optimize_query', StrategyType.STANDARD_RL, 0.75, 20, 0.82),
    createDecisionContext('cache_result', StrategyType.EXPLOITATION, 0.88, 25, 0.85),
    createDecisionContext('scale_resources', StrategyType.EXPLORATION_HEAVY, 0.62, 30, 0.88),
    createDecisionContext('optimize_query', StrategyType.TRANSFER_LEARNING, 0.91, 35, 0.90),
  ];

  const outcomes = [
    { reward: 0.78, success: true },
    { reward: 0.85, success: true },
    { reward: 0.55, success: false },  // Unexpected failure
    { reward: 0.93, success: true },
  ];

  for (let i = 0; i < contexts.length; i++) {
    logger.info(`\nDecision ${i + 1}: ${contexts[i].selectedAction.type}`);

    const reflection = await consciousness.reflect(contexts[i], outcomes[i], ReflectionDepth.DEEP);

    consciousness.recordOutcome(contexts[i], outcomes[i].reward);

    logger.info(`  Outcome: ${outcomes[i].success ? 'Success' : 'Failure'} (reward: ${outcomes[i].reward.toFixed(2)})`);
    logger.info(`  Quality: ${reflection.assessment.decisionQuality.toFixed(2)}`);

    if (reflection.assessment.identifiedBiases.length > 0) {
      logger.info(`  Biases Detected:`);
      reflection.assessment.identifiedBiases.forEach(bias => {
        logger.info(`    - ${bias.type} (severity: ${bias.severity.toFixed(2)}): ${bias.description}`);
      });
    }

    if (reflection.assessment.improvementAreas.length > 0) {
      logger.info(`  Improvement Areas:`);
      reflection.assessment.improvementAreas.forEach(area => {
        logger.info(`    - ${area.area}: ${area.currentLevel.toFixed(2)} → ${area.targetLevel.toFixed(2)}`);
      });
    }
  }

  // Get consciousness state
  const state = consciousness.getState();

  logger.info(`\nConsciousness State:`);
  logger.info(`  Current Strategy: ${state.currentStrategy}`);
  logger.info(`  Confidence Level: ${state.confidenceLevel.toFixed(2)}`);
  logger.info(`  Metacognitive Awareness:`);
  logger.info(`    - Self-Knowledge: ${state.metacognitiveAwareness.selfKnowledge.toFixed(2)}`);
  logger.info(`    - Adaptability: ${state.metacognitiveAwareness.adaptability.toFixed(2)}`);
  logger.info(`    - Learning Rate: ${state.metacognitiveAwareness.learningRate.toFixed(2)}`);

  if (state.biasDetection.detectedBiases.length > 0) {
    logger.info(`  Detected Biases: ${state.biasDetection.detectedBiases.join(', ')}`);
    logger.info(`  Mitigation Strategies:`);
    state.biasDetection.mitigationStrategies.forEach(strategy => {
      logger.info(`    - ${strategy}`);
    });
  }
}

/**
 * Example 3: Action Explanation - Different Styles
 */
async function example3_ExplanationStyles() {
  logger.info('\n' + '='.repeat(80));
  logger.info('Example 3: Action Explanation - Different Styles');

  const consciousness = new Consciousness();

  const context = createDecisionContext('deploy_model', StrategyType.FAST_ADAPTATION, 0.82, 12, 0.80);

  // Technical explanation for developers
  logger.info('\n--- Technical Explanation ---');
  const technicalRequest: ExplanationRequest = {
    context,
    style: ExplanationStyle.TECHNICAL,
    audience: 'developer',
    detailLevel: 'comprehensive',
    includeAlternatives: true,
    includeConfidence: true,
  };

  const technicalExplanation = await consciousness.explain(technicalRequest);
  logger.info(`Summary: ${technicalExplanation.summary}`);
  logger.info(`\nReasoning Steps:`);
  technicalExplanation.reasoning.steps.forEach(step => {
    logger.info(`  ${step.step}. ${step.description}`);
    logger.info(`     ${step.reasoning}`);
  });
  logger.info(`\nConclusion: ${technicalExplanation.reasoning.conclusion}`);

  if (technicalExplanation.confidence) {
    logger.info(`\nConfidence: ${technicalExplanation.confidence.level.toFixed(2)}`);
    logger.info(`Confidence Factors:`);
    technicalExplanation.confidence.factors.forEach(factor => {
      logger.info(`  - ${factor}`);
    });
  }

  // Intuitive explanation for users
  logger.info('\n--- Intuitive Explanation ---');
  const intuitiveRequest: ExplanationRequest = {
    context,
    style: ExplanationStyle.INTUITIVE,
    audience: 'user',
    detailLevel: 'brief',
    includeAlternatives: false,
    includeConfidence: false,
  };

  const intuitiveExplanation = await consciousness.explain(intuitiveRequest);
  logger.info(`Summary: ${intuitiveExplanation.summary}`);
  logger.info(`Conclusion: ${intuitiveExplanation.reasoning.conclusion}`);

  // Step-by-step explanation
  logger.info('\n--- Step-by-Step Explanation ---');
  const stepByStepRequest: ExplanationRequest = {
    context,
    style: ExplanationStyle.STEP_BY_STEP,
    audience: 'user',
    detailLevel: 'standard',
    includeAlternatives: true,
    includeConfidence: true,
  };

  const stepByStepExplanation = await consciousness.explain(stepByStepRequest);
  logger.info(`Summary: ${stepByStepExplanation.summary}`);
  logger.info(`\nSteps:`);
  stepByStepExplanation.reasoning.steps.forEach(step => {
    logger.info(`  Step ${step.step}: ${step.description}`);
    logger.info(`    → ${step.reasoning}`);
  });

  if (stepByStepExplanation.alternatives) {
    logger.info(`\nAlternatives:`);
    stepByStepExplanation.alternatives.forEach(alt => {
      logger.info(`  - ${alt.action.type} (confidence: ${alt.confidence.toFixed(2)})`);
      logger.info(`    Pros: ${alt.pros.join(', ')}`);
      logger.info(`    Cons: ${alt.cons.join(', ')}`);
    });
  }

  // Comparative explanation
  logger.info('\n--- Comparative Explanation ---');
  const comparativeRequest: ExplanationRequest = {
    context,
    style: ExplanationStyle.COMPARATIVE,
    audience: 'system',
    detailLevel: 'comprehensive',
    includeAlternatives: true,
    includeConfidence: true,
  };

  const comparativeExplanation = await consciousness.explain(comparativeRequest);
  logger.info(`Summary: ${comparativeExplanation.summary}`);
  logger.info(`Conclusion: ${comparativeExplanation.reasoning.conclusion}`);
}

/**
 * Example 4: Confidence Calibration
 */
async function example4_ConfidenceCalibration() {
  logger.info('\n' + '='.repeat(80));
  logger.info('Example 4: Confidence Calibration');

  const consciousness = new Consciousness({
    confidenceCalibrationEnabled: true,
  });

  logger.info('Simulating 20 decisions with varying confidence levels...\n');

  // Simulate decisions with predictions and actual outcomes
  const predictions = [
    { confidence: 0.9, actual: 0.85 },  // Slight overconfidence
    { confidence: 0.8, actual: 0.82 },  // Well-calibrated
    { confidence: 0.7, actual: 0.75 },  // Well-calibrated
    { confidence: 0.9, actual: 0.65 },  // Significant overconfidence
    { confidence: 0.5, actual: 0.75 },  // Underconfident
    { confidence: 0.85, actual: 0.88 }, // Slight underconfidence
    { confidence: 0.75, actual: 0.78 }, // Well-calibrated
    { confidence: 0.95, actual: 0.70 }, // Major overconfidence
    { confidence: 0.6, actual: 0.65 },  // Well-calibrated
    { confidence: 0.7, actual: 0.72 },  // Well-calibrated
    { confidence: 0.8, actual: 0.50 },  // Overconfidence
    { confidence: 0.55, actual: 0.80 }, // Underconfident
    { confidence: 0.85, actual: 0.82 }, // Well-calibrated
    { confidence: 0.9, actual: 0.92 },  // Slight underconfidence
    { confidence: 0.65, actual: 0.68 }, // Well-calibrated
    { confidence: 0.75, actual: 0.55 }, // Overconfidence
    { confidence: 0.8, actual: 0.85 },  // Slight underconfidence
    { confidence: 0.7, actual: 0.72 },  // Well-calibrated
    { confidence: 0.95, actual: 0.75 }, // Major overconfidence
    { confidence: 0.6, actual: 0.82 },  // Underconfident
  ];

  for (let i = 0; i < predictions.length; i++) {
    const context = createDecisionContext(
      `action_${i}`,
      StrategyType.STANDARD_RL,
      predictions[i].confidence,
      10 + i,
      0.75
    );

    consciousness.recordOutcome(context, predictions[i].actual);
  }

  // Get statistics
  const stats = consciousness.getStatistics();

  logger.info('Confidence Calibration Analysis:');
  logger.info(`  Total Reflections: ${stats.totalReflections}`);
  logger.info(`  Average Calibration Error: ${stats.confidenceCalibration.averageCalibrationError.toFixed(3)}`);
  logger.info(`  Overconfidence Rate: ${(stats.confidenceCalibration.overconfidenceRate * 100).toFixed(1)}%`);
  logger.info(`  Underconfidence Rate: ${(stats.confidenceCalibration.underconfidenceRate * 100).toFixed(1)}%`);

  // Get current state
  const state = consciousness.getState();

  if (state.biasDetection.detectedBiases.length > 0) {
    logger.info(`\nDetected Biases:`);
    state.biasDetection.detectedBiases.forEach(bias => {
      logger.info(`  - ${bias}`);
    });

    logger.info(`\nRecommended Mitigation Strategies:`);
    state.biasDetection.mitigationStrategies.forEach(strategy => {
      logger.info(`  - ${strategy}`);
    });
  }
}

/**
 * Example 5: Learning and Improvement Tracking
 */
async function example5_LearningTracking() {
  logger.info('\n' + '='.repeat(80));
  logger.info('Example 5: Learning and Improvement Tracking');

  const consciousness = new Consciousness({
    reflectionFrequency: 3,
    defaultDepth: ReflectionDepth.INTERMEDIATE,
  });

  logger.info('Simulating learning progression over 15 tasks...\n');

  // Simulate improving performance over time
  const performanceProgression = [
    0.60, 0.62, 0.65,  // Initial phase
    0.68, 0.70, 0.72,  // Learning phase
    0.75, 0.78, 0.80,  // Improvement phase
    0.82, 0.83, 0.85,  // Mastery phase
    0.87, 0.88, 0.90,  // Expert phase
  ];

  for (let i = 0; i < performanceProgression.length; i++) {
    const context = createDecisionContext(
      'process_request',
      i < 5 ? StrategyType.EXPLORATION_HEAVY :
      i < 10 ? StrategyType.STANDARD_RL :
      StrategyType.EXPLOITATION,
      performanceProgression[i],
      i + 1,
      i > 0 ? performanceProgression[i - 1] : 0.5
    );

    const outcome = {
      reward: performanceProgression[i],
      success: performanceProgression[i] > 0.7,
    };

    await consciousness.reflect(context, outcome);
    consciousness.recordOutcome(context, outcome.reward);

    if ((i + 1) % 5 === 0) {
      const state = consciousness.getState();
      logger.info(`\nProgress Check (Task ${i + 1}):`);
      logger.info(`  Performance: ${performanceProgression[i].toFixed(2)}`);
      logger.info(`  Self-Knowledge: ${state.metacognitiveAwareness.selfKnowledge.toFixed(2)}`);
      logger.info(`  Adaptability: ${state.metacognitiveAwareness.adaptability.toFixed(2)}`);
      logger.info(`  Learning Rate: ${state.metacognitiveAwareness.learningRate.toFixed(2)}`);
    }
  }

  // Final statistics
  const stats = consciousness.getStatistics();

  logger.info('\n' + '-'.repeat(80));
  logger.info('Learning Summary:');
  logger.info(`  Total Reflections: ${stats.totalReflections}`);
  logger.info(`  Insights Generated: ${stats.insightsGenerated}`);
  logger.info(`  Average Calibration Error: ${stats.confidenceCalibration.averageCalibrationError.toFixed(3)}`);

  if (stats.improvementAreas.size > 0) {
    logger.info(`\nImprovement Areas Identified:`);
    for (const [area, data] of stats.improvementAreas) {
      logger.info(`  - ${area}:`);
      logger.info(`    Occurrences: ${data.count}`);
      logger.info(`    Average Current: ${data.avgCurrentLevel.toFixed(2)}`);
      logger.info(`    Average Target: ${data.avgTargetLevel.toFixed(2)}`);
    }
  }

  const finalState = consciousness.getState();
  logger.info(`\nFinal Consciousness State:`);
  logger.info(`  Confidence Level: ${finalState.confidenceLevel.toFixed(2)}`);
  logger.info(`  Self-Knowledge: ${finalState.metacognitiveAwareness.selfKnowledge.toFixed(2)}`);
  logger.info(`  Adaptability: ${finalState.metacognitiveAwareness.adaptability.toFixed(2)}`);
  logger.info(`  Learning Rate: ${finalState.metacognitiveAwareness.learningRate.toFixed(2)}`);
}

// ===== Helper Functions =====

function createState(features: string[]): State {
  const stateFeatures: Record<string, number> = {};
  features.forEach((feature, idx) => {
    stateFeatures[feature] = Math.random();
  });
  return { features: stateFeatures };
}

function createAction(type: string, confidence: number): Action {
  return {
    type,
    parameters: { value: Math.random() },
    confidence,
  };
}

function createDecisionContext(
  actionType: string,
  strategyType: StrategyType,
  confidence: number,
  similarTasks: number,
  avgPerformance: number
): DecisionContext {
  return {
    timestamp: Date.now(),
    state: createState(['feature_1', 'feature_2', 'feature_3']),
    availableActions: [
      createAction(actionType, confidence),
      createAction('alternative_1', confidence - 0.1),
      createAction('alternative_2', confidence - 0.2),
    ],
    selectedAction: createAction(actionType, confidence),
    strategy: {
      type: strategyType,
      hyperparameters: {
        learningRate: 0.01,
        explorationRate: strategyType === StrategyType.EXPLORATION_HEAVY ? 0.3 : 0.1,
      },
    },
    constraints: {
      qualityThreshold: 0.75,
    },
    priorExperience: {
      similarTasksCount: similarTasks,
      averagePerformance: avgPerformance,
      recentFailures: avgPerformance < 0.6 ? 2 : 0,
    },
  };
}

/**
 * Run all examples
 */
export async function runConsciousnessExample() {
  logger.info('='.repeat(80));
  logger.info('Leonardo AI - Consciousness Layer Examples');
  logger.info('='.repeat(80));

  try {
    await example1_BasicReflection();
    await example2_DeepReflection();
    await example3_ExplanationStyles();
    await example4_ConfidenceCalibration();
    await example5_LearningTracking();

    logger.info('\n' + '='.repeat(80));
    logger.info('All examples completed successfully!');
    logger.info('='.repeat(80));
  } catch (error) {
    logger.error('Error running examples:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  runConsciousnessExample()
    .then(() => process.exit(0))
    .catch((error) => {
      logger.error('Fatal error:', error);
      process.exit(1);
    });
}
