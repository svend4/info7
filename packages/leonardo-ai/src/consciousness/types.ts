/**
 * Consciousness Layer Types
 *
 * Types for self-reflection, action explanation, and metacognitive awareness.
 */

import { State, Action } from '../rl/types';
import { StrategyType } from '../meta-learning/types';

/**
 * Reflection depth levels
 */
export enum ReflectionDepth {
  SURFACE = 'surface',      // Basic action-outcome analysis
  INTERMEDIATE = 'intermediate',  // Strategy and reasoning analysis
  DEEP = 'deep',           // Meta-cognitive and learning analysis
}

/**
 * Decision context - What was the situation when the decision was made?
 */
export interface DecisionContext {
  timestamp: number;
  state: State;
  availableActions: Action[];
  selectedAction: Action;
  strategy: {
    type: StrategyType;
    hyperparameters: Record<string, any>;
  };
  constraints: {
    timeLimit?: number;
    resourceLimit?: number;
    qualityThreshold?: number;
  };
  priorExperience: {
    similarTasksCount: number;
    averagePerformance: number;
    recentFailures: number;
  };
}

/**
 * Action rationale - Why was this action chosen?
 */
export interface ActionRationale {
  primaryReason: string;
  contributingFactors: Array<{
    factor: string;
    weight: number;
    description: string;
  }>;
  alternatives: Array<{
    action: Action;
    reason: string;
    whyNotChosen: string;
  }>;
  confidence: number;
  uncertainties: string[];
}

/**
 * Self-assessment of a decision
 */
export interface SelfAssessment {
  decisionQuality: number;  // 0-1
  confidenceCalibration: number;  // How well-calibrated was the confidence?
  strategicAlignment: number;  // Did it align with overall strategy?
  learningValue: number;  // How much did we learn from this?
  identifiedBiases: Array<{
    type: string;
    severity: number;
    description: string;
  }>;
  improvementAreas: Array<{
    area: string;
    currentLevel: number;
    targetLevel: number;
    actionSteps: string[];
  }>;
}

/**
 * Reflection result - What did we learn from reflection?
 */
export interface ReflectionResult {
  context: DecisionContext;
  rationale: ActionRationale;
  assessment: SelfAssessment;
  insights: Array<{
    type: 'pattern' | 'mistake' | 'success' | 'anomaly';
    description: string;
    confidence: number;
    actionable: boolean;
    recommendation?: string;
  }>;
  metaCognition: {
    thinkingPatterns: string[];
    blindSpots: string[];
    strengths: string[];
    weaknesses: string[];
  };
  depth: ReflectionDepth;
}

/**
 * Explanation style preferences
 */
export enum ExplanationStyle {
  TECHNICAL = 'technical',      // Detailed technical explanation
  INTUITIVE = 'intuitive',      // High-level intuitive explanation
  STEP_BY_STEP = 'step-by-step',  // Step-by-step reasoning
  COMPARATIVE = 'comparative',   // Comparison with alternatives
}

/**
 * Explanation request
 */
export interface ExplanationRequest {
  context: DecisionContext;
  style: ExplanationStyle;
  audience: 'developer' | 'user' | 'system';
  detailLevel: 'brief' | 'standard' | 'comprehensive';
  includeAlternatives: boolean;
  includeConfidence: boolean;
}

/**
 * Structured explanation of a decision
 */
export interface Explanation {
  summary: string;
  reasoning: {
    steps: Array<{
      step: number;
      description: string;
      data: Record<string, any>;
      reasoning: string;
    }>;
    conclusion: string;
  };
  alternatives?: Array<{
    action: Action;
    pros: string[];
    cons: string[];
    confidence: number;
  }>;
  confidence?: {
    level: number;
    factors: string[];
    uncertainties: string[];
  };
  assumptions: string[];
  limitations: string[];
  style: ExplanationStyle;
}

/**
 * Confidence calibration data
 */
export interface ConfidenceCalibration {
  predictedConfidence: number;
  actualPerformance: number;
  calibrationError: number;
  overconfident: boolean;
  underconfident: boolean;
}

/**
 * Learning insight from consciousness
 */
export interface ConsciousnessInsight {
  id: string;
  timestamp: number;
  type: 'behavioral' | 'strategic' | 'metacognitive';
  insight: string;
  evidence: Array<{
    source: string;
    data: Record<string, any>;
  }>;
  confidence: number;
  actionable: boolean;
  recommendations: string[];
  priority: 'low' | 'medium' | 'high';
}

/**
 * Consciousness state snapshot
 */
export interface ConsciousnessState {
  timestamp: number;
  currentStrategy: StrategyType;
  confidenceLevel: number;
  recentReflections: ReflectionResult[];
  activeInsights: ConsciousnessInsight[];
  metacognitiveAwareness: {
    selfKnowledge: number;  // How well does it know its own capabilities?
    adaptability: number;   // How well can it adapt?
    learningRate: number;   // How fast is it learning?
  };
  biasDetection: {
    detectedBiases: string[];
    mitigationStrategies: string[];
  };
}

/**
 * Consciousness configuration
 */
export interface ConsciousnessConfig {
  enableReflection: boolean;
  reflectionFrequency: number;  // Reflect every N decisions
  defaultDepth: ReflectionDepth;
  enableExplanation: boolean;
  defaultExplanationStyle: ExplanationStyle;
  confidenceCalibrationEnabled: boolean;
  biasDetectionEnabled: boolean;
  insightGenerationThreshold: number;  // Min confidence for insights
  maxStoredReflections: number;
}

/**
 * Consciousness statistics
 */
export interface ConsciousnessStatistics {
  totalReflections: number;
  totalExplanations: number;
  averageReflectionDepth: ReflectionDepth;
  insightsGenerated: number;
  biasesDetected: number;
  confidenceCalibration: {
    averageCalibrationError: number;
    overconfidenceRate: number;
    underconfidenceRate: number;
  };
  improvementAreas: Map<string, {
    count: number;
    avgCurrentLevel: number;
    avgTargetLevel: number;
  }>;
}
