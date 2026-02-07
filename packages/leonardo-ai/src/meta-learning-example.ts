/**
 * Meta-Learning Example
 *
 * Demonstrates how to use the Meta-Learning Module to optimize
 * learning strategies for different types of tasks.
 */

import { Logger } from '@info7/common';
import { MetaLearner, StrategyType, TaskFeatures } from './meta-learning';
import { State, Action } from './rl/types';

const logger = new Logger('meta-learning-example');

/**
 * Example 1: Strategy Selection for Different Tasks
 */
async function example1_StrategySelection() {
  logger.info('Example 1: Strategy Selection for Different Tasks');

  const metaLearner = new MetaLearner();

  // Task 1: Novel, complex task with limited data
  const novelTask: TaskFeatures = {
    taskType: 'novel-optimization',
    complexity: 0.9,
    novelty: 0.95,
    dataAvailability: 0.2,
    timeConstraint: 0.3,
    qualityRequirement: 0.8,
  };

  const result1 = await metaLearner.selectStrategy(novelTask);
  logger.info(`Novel Task Strategy: ${result1.selectedStrategy.type}`);
  logger.info(`Confidence: ${result1.confidence.toFixed(2)}`);
  logger.info(`Reasoning: ${result1.reasoning}`);
  logger.info(`Expected Performance: ${result1.expectedPerformance.toFixed(2)}`);

  // Task 2: Familiar task with abundant data
  const familiarTask: TaskFeatures = {
    taskType: 'standard-classification',
    complexity: 0.5,
    novelty: 0.2,
    dataAvailability: 0.9,
    timeConstraint: 0.7,
    qualityRequirement: 0.6,
  };

  const result2 = await metaLearner.selectStrategy(familiarTask);
  logger.info(`\nFamiliar Task Strategy: ${result2.selectedStrategy.type}`);
  logger.info(`Confidence: ${result2.confidence.toFixed(2)}`);
  logger.info(`Reasoning: ${result2.reasoning}`);

  // Task 3: Time-critical task
  const urgentTask: TaskFeatures = {
    taskType: 'urgent-prediction',
    complexity: 0.6,
    novelty: 0.5,
    dataAvailability: 0.7,
    timeConstraint: 0.1,
    qualityRequirement: 0.7,
  };

  const result3 = await metaLearner.selectStrategy(urgentTask);
  logger.info(`\nUrgent Task Strategy: ${result3.selectedStrategy.type}`);
  logger.info(`Confidence: ${result3.confidence.toFixed(2)}`);
  logger.info(`Reasoning: ${result3.reasoning}`);
  logger.info(`Alternatives:`);
  result3.alternatives.forEach((alt, idx) => {
    logger.info(`  ${idx + 1}. ${alt.type} (confidence: ${alt.confidence.toFixed(2)})`);
    logger.info(`     Tradeoff: ${alt.tradeoff}`);
  });
}

/**
 * Example 2: Learning with Selected Strategy
 */
async function example2_LearningWithStrategy() {
  logger.info('\nExample 2: Learning with Selected Strategy');

  const metaLearner = new MetaLearner();

  // Define task
  const task: TaskFeatures = {
    taskType: 'resource-allocation',
    complexity: 0.7,
    novelty: 0.6,
    dataAvailability: 0.5,
    timeConstraint: 0.5,
    qualityRequirement: 0.8,
  };

  // Select strategy
  const result = await metaLearner.selectStrategy(task);
  logger.info(`Selected Strategy: ${result.selectedStrategy.type}`);
  logger.info(`Hyperparameters:`, result.selectedStrategy);

  // Generate training experiences
  const experiences = generateExperiences(100);

  // Learn with selected strategy
  const startTime = Date.now();
  const loss = await metaLearner.learn(experiences);
  const learningTime = Date.now() - startTime;

  logger.info(`\nLearning completed in ${learningTime}ms`);
  logger.info(`Final loss: ${loss.toFixed(4)}`);

  // Simulate task performance
  const performance = 1 - loss;

  // Record task completion
  metaLearner.recordTaskCompletion(task, performance, learningTime);
  logger.info(`Recorded task completion with performance: ${performance.toFixed(2)}`);

  // Get statistics
  const stats = metaLearner.getStatistics();
  logger.info(`\nMeta-Learning Statistics:`);
  logger.info(`  Total tasks: ${stats.totalTasks}`);
  logger.info(`  Average performance: ${stats.averagePerformance.toFixed(2)}`);
  logger.info(`  Average learning time: ${stats.averageLearningTime.toFixed(0)}ms`);
}

/**
 * Example 3: Strategy Adaptation
 */
async function example3_StrategyAdaptation() {
  logger.info('\nExample 3: Strategy Adaptation');

  const metaLearner = new MetaLearner();

  // Similar task repeated over time
  const task: TaskFeatures = {
    taskType: 'route-optimization',
    complexity: 0.6,
    novelty: 0.7,
    dataAvailability: 0.6,
    timeConstraint: 0.6,
    qualityRequirement: 0.75,
  };

  // First execution - high novelty
  logger.info('First execution (high novelty):');
  const result1 = await metaLearner.selectStrategy(task);
  logger.info(`  Strategy: ${result1.selectedStrategy.type}`);
  logger.info(`  Exploration rate: ${result1.selectedStrategy.explorationRate}`);

  // Simulate learning
  const experiences1 = generateExperiences(50);
  await metaLearner.learn(experiences1);
  metaLearner.recordTaskCompletion(task, 0.65, 200);

  // Second execution - novelty decreases
  logger.info('\nSecond execution (decreased novelty):');
  task.novelty = 0.4;
  const result2 = await metaLearner.selectStrategy(task);
  logger.info(`  Strategy: ${result2.selectedStrategy.type}`);
  logger.info(`  Exploration rate: ${result2.selectedStrategy.explorationRate}`);

  // Simulate learning
  const experiences2 = generateExperiences(50);
  await metaLearner.learn(experiences2);
  metaLearner.recordTaskCompletion(task, 0.78, 180);

  // Third execution - task becomes familiar
  logger.info('\nThird execution (familiar task):');
  task.novelty = 0.2;
  const result3 = await metaLearner.selectStrategy(task);
  logger.info(`  Strategy: ${result3.selectedStrategy.type}`);
  logger.info(`  Exploration rate: ${result3.selectedStrategy.explorationRate}`);
  logger.info(`  Reasoning: ${result3.reasoning}`);

  // Simulate learning
  const experiences3 = generateExperiences(50);
  await metaLearner.learn(experiences3);
  metaLearner.recordTaskCompletion(task, 0.88, 150);

  // Show statistics
  const stats = metaLearner.getStatistics();
  logger.info(`\nPerformance improvement over time:`);
  logger.info(`  Total tasks: ${stats.totalTasks}`);
  logger.info(`  Average performance: ${stats.averagePerformance.toFixed(2)}`);
  logger.info(`  Average learning time: ${stats.averageLearningTime.toFixed(0)}ms`);
}

/**
 * Example 4: Transfer Learning Scenario
 */
async function example4_TransferLearning() {
  logger.info('\nExample 4: Transfer Learning Scenario');

  const metaLearner = new MetaLearner();

  // Source task 1: Text classification
  const sourceTask1: TaskFeatures = {
    taskType: 'text-classification-sentiment',
    complexity: 0.5,
    novelty: 0.3,
    dataAvailability: 0.9,
    timeConstraint: 0.7,
    qualityRequirement: 0.8,
  };

  logger.info('Learning source task 1: Sentiment Analysis');
  const experiences1 = generateExperiences(200);
  await metaLearner.selectStrategy(sourceTask1);
  await metaLearner.learn(experiences1);
  metaLearner.recordTaskCompletion(sourceTask1, 0.85, 300);

  // Source task 2: Text classification (different domain)
  const sourceTask2: TaskFeatures = {
    taskType: 'text-classification-topic',
    complexity: 0.5,
    novelty: 0.3,
    dataAvailability: 0.8,
    timeConstraint: 0.7,
    qualityRequirement: 0.8,
  };

  logger.info('Learning source task 2: Topic Classification');
  const experiences2 = generateExperiences(200);
  await metaLearner.selectStrategy(sourceTask2);
  await metaLearner.learn(experiences2);
  metaLearner.recordTaskCompletion(sourceTask2, 0.82, 320);

  // Target task: Similar to source tasks
  const targetTask: TaskFeatures = {
    taskType: 'text-classification-intent',
    complexity: 0.5,
    novelty: 0.5,
    dataAvailability: 0.4,
    timeConstraint: 0.5,
    qualityRequirement: 0.8,
  };

  logger.info('\nLearning target task: Intent Classification (limited data)');
  const result = await metaLearner.selectStrategy(targetTask);
  logger.info(`  Selected strategy: ${result.selectedStrategy.type}`);
  logger.info(`  Reasoning: ${result.reasoning}`);

  if (result.selectedStrategy.type === StrategyType.TRANSFER_LEARNING) {
    logger.info(`  Transfer source: ${result.selectedStrategy.transferSource}`);
  }

  const experiences3 = generateExperiences(50);
  const loss = await metaLearner.learn(experiences3);
  logger.info(`  Final loss: ${loss.toFixed(4)}`);
  logger.info(`  Performance: ${(1 - loss).toFixed(2)}`);
}

/**
 * Example 5: Few-Shot Learning
 */
async function example5_FewShotLearning() {
  logger.info('\nExample 5: Few-Shot Learning');

  const metaLearner = new MetaLearner();

  // Train on multiple related tasks first
  const relatedTasks = [
    'image-classification-animals',
    'image-classification-vehicles',
    'image-classification-furniture',
    'image-classification-food',
  ];

  logger.info('Pre-training on related tasks...');
  for (const taskType of relatedTasks) {
    const task: TaskFeatures = {
      taskType,
      complexity: 0.6,
      novelty: 0.4,
      dataAvailability: 0.8,
      timeConstraint: 0.7,
      qualityRequirement: 0.75,
    };

    await metaLearner.selectStrategy(task);
    const experiences = generateExperiences(150);
    await metaLearner.learn(experiences);
    metaLearner.recordTaskCompletion(task, 0.78, 250);
  }

  // New task with very few examples
  const fewShotTask: TaskFeatures = {
    taskType: 'image-classification-tools',
    complexity: 0.6,
    novelty: 0.8,
    dataAvailability: 0.1, // Very limited data
    timeConstraint: 0.4,
    qualityRequirement: 0.8,
  };

  logger.info('\nNew task with only 5 examples per class:');
  const result = await metaLearner.selectStrategy(fewShotTask);
  logger.info(`  Selected strategy: ${result.selectedStrategy.type}`);
  logger.info(`  Confidence: ${result.confidence.toFixed(2)}`);
  logger.info(`  Reasoning: ${result.reasoning}`);

  // Simulate few-shot learning
  const fewExperiences = generateExperiences(10); // Very few examples
  const startTime = Date.now();
  const loss = await metaLearner.learn(fewExperiences);
  const learningTime = Date.now() - startTime;

  logger.info(`\nFew-shot learning completed:`);
  logger.info(`  Time: ${learningTime}ms`);
  logger.info(`  Performance: ${(1 - loss).toFixed(2)}`);
  logger.info(`  Expected performance: ${result.expectedPerformance.toFixed(2)}`);
}

/**
 * Helper: Generate synthetic experiences
 */
function generateExperiences(count: number) {
  const experiences = [];
  for (let i = 0; i < count; i++) {
    experiences.push({
      state: generateState(),
      action: generateAction(),
      reward: Math.random() * 0.5 + 0.3, // Random reward between 0.3 and 0.8
      nextState: generateState(),
      done: Math.random() > 0.95,
    });
  }
  return experiences;
}

/**
 * Helper: Generate synthetic state
 */
function generateState(): State {
  const features: Record<string, number> = {};
  for (let i = 0; i < 10; i++) {
    features[`feature_${i}`] = Math.random();
  }
  return { features };
}

/**
 * Helper: Generate synthetic action
 */
function generateAction(): Action {
  return {
    type: `action_${Math.floor(Math.random() * 5)}`,
    parameters: {
      value: Math.random(),
    },
    confidence: Math.random() * 0.5 + 0.5,
  };
}

/**
 * Run all examples
 */
export async function runMetaLearningExample() {
  logger.info('='.repeat(80));
  logger.info('Leonardo AI - Meta-Learning Examples');
  logger.info('='.repeat(80));

  try {
    await example1_StrategySelection();
    await example2_LearningWithStrategy();
    await example3_StrategyAdaptation();
    await example4_TransferLearning();
    await example5_FewShotLearning();

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
  runMetaLearningExample()
    .then(() => process.exit(0))
    .catch((error) => {
      logger.error('Fatal error:', error);
      process.exit(1);
    });
}
