/**
 * Medical Diagnosis Assistant Agent
 *
 * Assists with preliminary medical assessment, symptom analysis, and healthcare guidance.
 * NOT a replacement for professional medical diagnosis.
 */

import { Logger, MetricsCollector, AppError, ValidationError } from '@info7/common';

/**
 * Symptom severity levels
 */
export enum SymptomSeverity {
  MILD = 'mild',
  MODERATE = 'moderate',
  SEVERE = 'severe',
  CRITICAL = 'critical',
}

/**
 * Urgency levels for medical attention
 */
export enum UrgencyLevel {
  ROUTINE = 'routine',           // Can wait for regular appointment
  PROMPT = 'prompt',             // Should see doctor within days
  URGENT = 'urgent',             // Should see doctor same day
  EMERGENCY = 'emergency',       // Go to ER immediately
}

/**
 * Symptom input
 */
export interface Symptom {
  name: string;
  severity: SymptomSeverity;
  duration: string;  // e.g., "3 days", "2 weeks"
  frequency: 'constant' | 'intermittent' | 'occasional';
  location?: string;
  additionalDetails?: string;
}

/**
 * Patient context
 */
export interface PatientContext {
  age: number;
  gender: 'male' | 'female' | 'other';
  medicalHistory?: string[];
  currentMedications?: string[];
  allergies?: string[];
  recentTravel?: boolean;
  recentExposure?: string;
}

/**
 * Possible condition
 */
export interface PossibleCondition {
  name: string;
  probability: number;  // 0-1
  matchingSymptoms: string[];
  description: string;
  commonCauses: string[];
  riskFactors: string[];
  recommendations: string[];
}

/**
 * Medical assessment result
 */
export interface MedicalAssessment {
  assessmentId: string;
  symptoms: Symptom[];
  patientContext: PatientContext;
  urgencyLevel: UrgencyLevel;
  possibleConditions: PossibleCondition[];
  recommendations: {
    immediateActions: string[];
    selfCare: string[];
    whenToSeekHelp: string[];
    redFlags: string[];
  };
  disclaimer: string;
  assessedAt: number;
}

/**
 * Health check input
 */
export interface HealthCheckInput {
  vitalSigns?: {
    temperature?: number;  // Celsius
    bloodPressure?: { systolic: number; diastolic: number };
    heartRate?: number;    // BPM
    respiratoryRate?: number;
    oxygenSaturation?: number;  // %
  };
  symptoms?: Symptom[];
  concerns?: string[];
}

/**
 * Health check result
 */
export interface HealthCheckResult {
  overallStatus: 'good' | 'monitor' | 'concerning' | 'urgent';
  vitalSignsAnalysis: {
    sign: string;
    value: any;
    status: 'normal' | 'borderline' | 'abnormal';
    recommendation: string;
  }[];
  riskFactors: string[];
  recommendations: string[];
  followUp: string;
}

/**
 * Medical Diagnosis Assistant Agent
 */
export class MedicalDiagnosisAssistant {
  private logger: Logger;
  private metrics: MetricsCollector;

  // Knowledge base of common conditions
  private conditionsKB = new Map<string, PossibleCondition>();

  // Red flag symptoms requiring immediate attention
  private redFlagSymptoms = new Set([
    'chest pain',
    'difficulty breathing',
    'severe headache',
    'loss of consciousness',
    'sudden weakness',
    'severe bleeding',
    'seizure',
    'confusion',
    'severe abdominal pain',
    'high fever with stiff neck',
  ]);

  constructor() {
    this.logger = new Logger('medical-diagnosis-assistant');
    this.metrics = new MetricsCollector('medical-diagnosis-assistant');

    this.initializeKnowledgeBase();

    this.logger.info('Medical Diagnosis Assistant Agent initialized');
  }

  /**
   * Assess symptoms and provide medical guidance
   */
  async assessSymptoms(
    symptoms: Symptom[],
    context: PatientContext
  ): Promise<MedicalAssessment> {
    const startTime = Date.now();

    try {
      this.logger.info('Assessing symptoms', {
        symptomCount: symptoms.length,
        patientAge: context.age
      });

      // Validate input
      this.validateInput(symptoms, context);

      // Determine urgency level
      const urgencyLevel = this.determineUrgency(symptoms, context);

      // Find matching conditions
      const possibleConditions = this.findMatchingConditions(symptoms, context);

      // Generate recommendations
      const recommendations = this.generateRecommendations(
        symptoms,
        possibleConditions,
        urgencyLevel,
        context
      );

      const assessment: MedicalAssessment = {
        assessmentId: `assessment-${Date.now()}`,
        symptoms,
        patientContext: context,
        urgencyLevel,
        possibleConditions: possibleConditions.slice(0, 5),
        recommendations,
        disclaimer: this.getDisclaimer(),
        assessedAt: Date.now(),
      };

      const duration = Date.now() - startTime;
      this.metrics.recordValue('assessment_duration', duration);
      this.logger.info('Assessment completed', {
        urgency: urgencyLevel,
        conditionsFound: possibleConditions.length,
        duration
      });

      return assessment;
    } catch (error) {
      this.logger.error('Assessment failed', error);
      throw new AppError('Medical assessment failed', 'ASSESSMENT_ERROR', error);
    }
  }

  /**
   * Perform health check based on vital signs
   */
  async performHealthCheck(input: HealthCheckInput): Promise<HealthCheckResult> {
    try {
      this.logger.info('Performing health check');

      const vitalSignsAnalysis = this.analyzeVitalSigns(input.vitalSigns);
      const riskFactors = this.identifyRiskFactors(input);
      const recommendations = this.generateHealthRecommendations(
        vitalSignsAnalysis,
        riskFactors
      );

      // Determine overall status
      const overallStatus = this.determineOverallHealth(vitalSignsAnalysis, riskFactors);

      const result: HealthCheckResult = {
        overallStatus,
        vitalSignsAnalysis,
        riskFactors,
        recommendations,
        followUp: this.generateFollowUpAdvice(overallStatus, vitalSignsAnalysis),
      };

      this.logger.info('Health check completed', { status: overallStatus });

      return result;
    } catch (error) {
      this.logger.error('Health check failed', error);
      throw new AppError('Health check failed', 'HEALTH_CHECK_ERROR', error);
    }
  }

  /**
   * Get medication interaction information
   */
  async checkMedicationInteractions(
    medications: string[]
  ): Promise<{
    interactions: Array<{
      medications: string[];
      severity: 'mild' | 'moderate' | 'severe';
      description: string;
      recommendation: string;
    }>;
    warnings: string[];
  }> {
    try {
      this.logger.info('Checking medication interactions', {
        medicationCount: medications.length
      });

      // In a real implementation, would check against drug interaction database
      // This is a simplified example

      const interactions: any[] = [];
      const warnings: string[] = [];

      // Check for common interaction patterns
      const hasAspirin = medications.some(m => m.toLowerCase().includes('aspirin'));
      const hasWarfarin = medications.some(m => m.toLowerCase().includes('warfarin'));

      if (hasAspirin && hasWarfarin) {
        interactions.push({
          medications: ['Aspirin', 'Warfarin'],
          severity: 'severe',
          description: 'Increased risk of bleeding when combined',
          recommendation: 'Consult doctor before combining these medications',
        });
      }

      if (medications.length > 5) {
        warnings.push('Taking multiple medications - ensure your doctor is aware of all medications');
      }

      this.logger.info('Medication interaction check completed', {
        interactionsFound: interactions.length
      });

      return { interactions, warnings };
    } catch (error) {
      this.logger.error('Medication interaction check failed', error);
      throw new AppError('Medication check failed', 'MEDICATION_CHECK_ERROR', error);
    }
  }

  // ===== Private Methods =====

  private initializeKnowledgeBase(): void {
    // Common cold/flu
    this.conditionsKB.set('common-cold', {
      name: 'Common Cold',
      probability: 0,
      matchingSymptoms: ['runny nose', 'sore throat', 'cough', 'mild fever'],
      description: 'Viral infection of the upper respiratory tract',
      commonCauses: ['Rhinovirus', 'Coronavirus (not COVID-19)'],
      riskFactors: ['Close contact with infected people', 'Weakened immune system'],
      recommendations: [
        'Get plenty of rest',
        'Stay hydrated',
        'Use over-the-counter cold remedies',
        'Symptoms typically resolve in 7-10 days',
      ],
    });

    // Flu
    this.conditionsKB.set('influenza', {
      name: 'Influenza (Flu)',
      probability: 0,
      matchingSymptoms: ['high fever', 'body aches', 'fatigue', 'cough', 'headache'],
      description: 'Viral infection causing respiratory and systemic symptoms',
      commonCauses: ['Influenza virus types A, B, C'],
      riskFactors: ['Seasonal factors', 'Lack of vaccination', 'Weakened immune system'],
      recommendations: [
        'Rest and hydration',
        'Antiviral medications if prescribed early',
        'Over-the-counter symptom relief',
        'Monitor for complications',
      ],
    });

    // Migraine
    this.conditionsKB.set('migraine', {
      name: 'Migraine Headache',
      probability: 0,
      matchingSymptoms: ['severe headache', 'nausea', 'light sensitivity', 'sound sensitivity'],
      description: 'Intense throbbing headache, often on one side',
      commonCauses: ['Triggers: stress, foods, hormones', 'Genetic factors'],
      riskFactors: ['Family history', 'Female gender', 'Age 25-55'],
      recommendations: [
        'Rest in dark, quiet room',
        'Pain relief medication',
        'Identify and avoid triggers',
        'Consider preventive medication if frequent',
      ],
    });

    // Gastroenteritis
    this.conditionsKB.set('gastroenteritis', {
      name: 'Gastroenteritis (Stomach Flu)',
      probability: 0,
      matchingSymptoms: ['nausea', 'vomiting', 'diarrhea', 'abdominal pain', 'mild fever'],
      description: 'Inflammation of the stomach and intestines',
      commonCauses: ['Viral infection', 'Bacterial infection', 'Food poisoning'],
      riskFactors: ['Contaminated food/water', 'Close contact with infected persons'],
      recommendations: [
        'Stay hydrated with clear fluids',
        'Bland diet once tolerating food',
        'Rest',
        'Seek help if severe dehydration occurs',
      ],
    });

    // Allergic rhinitis
    this.conditionsKB.set('allergic-rhinitis', {
      name: 'Allergic Rhinitis',
      probability: 0,
      matchingSymptoms: ['runny nose', 'sneezing', 'itchy eyes', 'nasal congestion'],
      description: 'Allergic reaction causing nasal symptoms',
      commonCauses: ['Pollen', 'Dust mites', 'Pet dander', 'Mold'],
      riskFactors: ['Personal/family history of allergies', 'Environmental exposure'],
      recommendations: [
        'Avoid known allergens',
        'Antihistamine medications',
        'Nasal corticosteroid spray',
        'Consider allergy testing',
      ],
    });

    this.logger.debug('Knowledge base initialized', {
      conditionsCount: this.conditionsKB.size
    });
  }

  private validateInput(symptoms: Symptom[], context: PatientContext): void {
    if (!symptoms || symptoms.length === 0) {
      throw new ValidationError('At least one symptom is required');
    }

    if (!context.age || context.age < 0 || context.age > 150) {
      throw new ValidationError('Valid age is required');
    }

    for (const symptom of symptoms) {
      if (!symptom.name || symptom.name.trim() === '') {
        throw new ValidationError('Symptom name is required');
      }
    }
  }

  private determineUrgency(symptoms: Symptom[], context: PatientContext): UrgencyLevel {
    // Check for red flag symptoms
    for (const symptom of symptoms) {
      const symptomLower = symptom.name.toLowerCase();

      if (this.redFlagSymptoms.has(symptomLower)) {
        this.logger.warn('Red flag symptom detected', { symptom: symptom.name });
        return UrgencyLevel.EMERGENCY;
      }

      if (symptom.severity === SymptomSeverity.CRITICAL) {
        return UrgencyLevel.EMERGENCY;
      }
    }

    // Check for severe symptoms
    const severeCount = symptoms.filter(s => s.severity === SymptomSeverity.SEVERE).length;
    if (severeCount >= 2) {
      return UrgencyLevel.URGENT;
    }

    // Check for high-risk patient groups
    if (context.age > 65 || context.age < 2) {
      if (symptoms.some(s => s.severity === SymptomSeverity.MODERATE)) {
        return UrgencyLevel.URGENT;
      }
    }

    // Check for prolonged symptoms
    const prolongedSymptom = symptoms.find(s =>
      s.duration.includes('week') && parseInt(s.duration) >= 2
    );
    if (prolongedSymptom && prolongedSymptom.severity !== SymptomSeverity.MILD) {
      return UrgencyLevel.PROMPT;
    }

    // Moderate symptoms
    const moderateCount = symptoms.filter(s => s.severity === SymptomSeverity.MODERATE).length;
    if (moderateCount >= 3) {
      return UrgencyLevel.PROMPT;
    }

    return UrgencyLevel.ROUTINE;
  }

  private findMatchingConditions(
    symptoms: Symptom[],
    context: PatientContext
  ): PossibleCondition[] {
    const symptomNames = symptoms.map(s => s.name.toLowerCase());
    const conditions: PossibleCondition[] = [];

    for (const [id, condition] of this.conditionsKB) {
      const matchingSymptoms = condition.matchingSymptoms.filter(cs =>
        symptomNames.some(sn => sn.includes(cs) || cs.includes(sn))
      );

      if (matchingSymptoms.length > 0) {
        const probability = matchingSymptoms.length / condition.matchingSymptoms.length;

        conditions.push({
          ...condition,
          probability,
          matchingSymptoms,
        });
      }
    }

    // Sort by probability
    return conditions.sort((a, b) => b.probability - a.probability);
  }

  private generateRecommendations(
    symptoms: Symptom[],
    conditions: PossibleCondition[],
    urgency: UrgencyLevel,
    context: PatientContext
  ): MedicalAssessment['recommendations'] {
    const recommendations: MedicalAssessment['recommendations'] = {
      immediateActions: [],
      selfCare: [],
      whenToSeekHelp: [],
      redFlags: [],
    };

    // Immediate actions based on urgency
    if (urgency === UrgencyLevel.EMERGENCY) {
      recommendations.immediateActions.push('Call emergency services (911) immediately');
      recommendations.immediateActions.push('Do not drive yourself to the hospital');
    } else if (urgency === UrgencyLevel.URGENT) {
      recommendations.immediateActions.push('Seek medical attention today');
      recommendations.immediateActions.push('Go to urgent care or contact your doctor immediately');
    } else if (urgency === UrgencyLevel.PROMPT) {
      recommendations.immediateActions.push('Schedule a doctor appointment within the next few days');
    } else {
      recommendations.immediateActions.push('Monitor symptoms and seek care if they worsen');
    }

    // Self-care recommendations from top conditions
    const topConditions = conditions.slice(0, 3);
    for (const condition of topConditions) {
      recommendations.selfCare.push(...condition.recommendations);
    }

    // Remove duplicates
    recommendations.selfCare = Array.from(new Set(recommendations.selfCare));

    // When to seek help
    recommendations.whenToSeekHelp = [
      'Symptoms worsen or do not improve after 7-10 days',
      'New or concerning symptoms develop',
      'Difficulty performing daily activities',
      'Symptoms affecting sleep or eating',
    ];

    // Red flags
    recommendations.redFlags = Array.from(this.redFlagSymptoms);

    return recommendations;
  }

  private analyzeVitalSigns(
    vitalSigns?: HealthCheckInput['vitalSigns']
  ): HealthCheckResult['vitalSignsAnalysis'] {
    const analysis: HealthCheckResult['vitalSignsAnalysis'] = [];

    if (!vitalSigns) return analysis;

    // Temperature
    if (vitalSigns.temperature !== undefined) {
      let status: 'normal' | 'borderline' | 'abnormal' = 'normal';
      let recommendation = 'Temperature is normal';

      if (vitalSigns.temperature > 38) {
        status = 'abnormal';
        recommendation = 'Fever detected - stay hydrated and monitor';
      } else if (vitalSigns.temperature > 37.5) {
        status = 'borderline';
        recommendation = 'Slightly elevated - monitor for fever';
      } else if (vitalSigns.temperature < 36) {
        status = 'abnormal';
        recommendation = 'Low temperature - keep warm and monitor';
      }

      analysis.push({
        sign: 'Temperature',
        value: `${vitalSigns.temperature}°C`,
        status,
        recommendation,
      });
    }

    // Blood Pressure
    if (vitalSigns.bloodPressure) {
      const { systolic, diastolic } = vitalSigns.bloodPressure;
      let status: 'normal' | 'borderline' | 'abnormal' = 'normal';
      let recommendation = 'Blood pressure is normal';

      if (systolic >= 140 || diastolic >= 90) {
        status = 'abnormal';
        recommendation = 'High blood pressure - consult doctor';
      } else if (systolic >= 130 || diastolic >= 85) {
        status = 'borderline';
        recommendation = 'Borderline high - monitor and maintain healthy lifestyle';
      } else if (systolic < 90 || diastolic < 60) {
        status = 'abnormal';
        recommendation = 'Low blood pressure - consult doctor if symptomatic';
      }

      analysis.push({
        sign: 'Blood Pressure',
        value: `${systolic}/${diastolic} mmHg`,
        status,
        recommendation,
      });
    }

    // Heart Rate
    if (vitalSigns.heartRate !== undefined) {
      let status: 'normal' | 'borderline' | 'abnormal' = 'normal';
      let recommendation = 'Heart rate is normal';

      if (vitalSigns.heartRate > 100) {
        status = 'abnormal';
        recommendation = 'Elevated heart rate - rest and monitor, seek care if persistent';
      } else if (vitalSigns.heartRate < 60) {
        status = vitalSigns.heartRate < 50 ? 'abnormal' : 'borderline';
        recommendation = 'Low heart rate - normal for athletes, otherwise consult doctor';
      }

      analysis.push({
        sign: 'Heart Rate',
        value: `${vitalSigns.heartRate} BPM`,
        status,
        recommendation,
      });
    }

    // Oxygen Saturation
    if (vitalSigns.oxygenSaturation !== undefined) {
      let status: 'normal' | 'borderline' | 'abnormal' = 'normal';
      let recommendation = 'Oxygen saturation is normal';

      if (vitalSigns.oxygenSaturation < 92) {
        status = 'abnormal';
        recommendation = 'Low oxygen saturation - seek medical attention immediately';
      } else if (vitalSigns.oxygenSaturation < 95) {
        status = 'borderline';
        recommendation = 'Slightly low - monitor closely and seek care if drops further';
      }

      analysis.push({
        sign: 'Oxygen Saturation',
        value: `${vitalSigns.oxygenSaturation}%`,
        status,
        recommendation,
      });
    }

    return analysis;
  }

  private identifyRiskFactors(input: HealthCheckInput): string[] {
    const risks: string[] = [];

    if (input.symptoms && input.symptoms.length > 3) {
      risks.push('Multiple concurrent symptoms');
    }

    if (input.vitalSigns) {
      const analysis = this.analyzeVitalSigns(input.vitalSigns);
      const abnormalCount = analysis.filter(a => a.status === 'abnormal').length;

      if (abnormalCount > 0) {
        risks.push(`${abnormalCount} abnormal vital sign(s)`);
      }
    }

    return risks;
  }

  private generateHealthRecommendations(
    analysis: HealthCheckResult['vitalSignsAnalysis'],
    risks: string[]
  ): string[] {
    const recommendations: string[] = [];

    const abnormalCount = analysis.filter(a => a.status === 'abnormal').length;

    if (abnormalCount === 0) {
      recommendations.push('Continue healthy lifestyle habits');
      recommendations.push('Regular check-ups as recommended');
    } else if (abnormalCount === 1) {
      recommendations.push('Monitor the abnormal vital sign');
      recommendations.push('Consult healthcare provider if persists');
    } else {
      recommendations.push('Schedule appointment with healthcare provider');
      recommendations.push('Multiple abnormal readings require evaluation');
    }

    if (risks.length > 2) {
      recommendations.push('Multiple risk factors present - seek professional evaluation');
    }

    return recommendations;
  }

  private determineOverallHealth(
    analysis: HealthCheckResult['vitalSignsAnalysis'],
    risks: string[]
  ): HealthCheckResult['overallStatus'] {
    const abnormalCount = analysis.filter(a => a.status === 'abnormal').length;

    if (abnormalCount >= 2 || risks.length >= 3) {
      return 'urgent';
    } else if (abnormalCount === 1 || risks.length >= 2) {
      return 'concerning';
    } else if (analysis.some(a => a.status === 'borderline')) {
      return 'monitor';
    }

    return 'good';
  }

  private generateFollowUpAdvice(
    status: HealthCheckResult['overallStatus'],
    analysis: HealthCheckResult['vitalSignsAnalysis']
  ): string {
    switch (status) {
      case 'urgent':
        return 'Seek medical attention immediately';
      case 'concerning':
        return 'Schedule appointment with healthcare provider within 24-48 hours';
      case 'monitor':
        return 'Monitor symptoms and vital signs, seek care if worsening';
      case 'good':
        return 'Continue routine health maintenance';
    }
  }

  private getDisclaimer(): string {
    return 'This assessment is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. If you think you may have a medical emergency, call your doctor or emergency services immediately.';
  }
}
