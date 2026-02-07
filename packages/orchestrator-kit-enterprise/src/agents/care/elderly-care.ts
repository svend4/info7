/**
 * Elderly Care Agent
 *
 * Specialized agent for elderly care monitoring, health tracking,
 * medication reminders, and emergency detection.
 * Integrates with @info7/common utilities.
 */

import {
  Logger,
  MetricsCollector,
  AppError,
  ValidationError,
} from '@info7/common';

/**
 * Alert severity levels
 */
export enum AlertSeverity {
  INFO = 'info',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Alert types
 */
export enum AlertType {
  VITALS_ABNORMAL = 'vitals-abnormal',
  MEDICATION_MISSED = 'medication-missed',
  FALL_DETECTED = 'fall-detected',
  INACTIVITY = 'inactivity',
  HEART_RATE = 'heart-rate',
  BLOOD_PRESSURE = 'blood-pressure',
  TEMPERATURE = 'temperature',
  OXYGEN = 'oxygen',
}

/**
 * Vital signs
 */
export interface Vitals {
  heartRate: number;  // bpm
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
  temperature: number;  // Celsius
  oxygenSaturation: number;  // %
  respiratoryRate: number;  // breaths per minute
  measuredAt: number;
}

/**
 * Medication schedule
 */
export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;  // e.g., "2 times daily"
  times: string[];  // e.g., ["08:00", "20:00"]
  withFood: boolean;
  notes?: string;
}

/**
 * Medication taken record
 */
export interface MedicationRecord {
  medicationId: string;
  scheduledTime: string;
  takenAt?: number;
  taken: boolean;
  skipped: boolean;
  skipReason?: string;
}

/**
 * Activity record
 */
export interface Activity {
  type: 'walking' | 'sitting' | 'lying' | 'standing' | 'sleeping';
  startTime: number;
  endTime?: number;
  duration?: number;  // minutes
  location?: string;
}

/**
 * Health alert
 */
export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  timestamp: number;
  vitals?: Partial<Vitals>;
  resolved: boolean;
  resolvedAt?: number;
  notificationSent: boolean;
}

/**
 * Health status report
 */
export interface HealthStatus {
  patientId: string;
  vitals: Vitals;
  medications: {
    scheduled: MedicationRecord[];
    compliance: number;  // 0-100%
  };
  activities: Activity[];
  alerts: Alert[];
  recommendations: string[];
  overallStatus: 'good' | 'fair' | 'concerning' | 'critical';
  reportedAt: number;
}

/**
 * Care recommendation
 */
export interface CareRecommendation {
  category: 'vitals' | 'medication' | 'activity' | 'nutrition' | 'social';
  priority: AlertSeverity;
  recommendation: string;
  reasoning: string;
  actionItems: string[];
}

/**
 * Elderly Care Agent
 */
export class ElderlyCareAgent {
  private logger: Logger;
  private metrics: MetricsCollector;
  private alerts: Map<string, Alert>;
  private alertIdCounter: number;

  // Normal vital ranges for elderly (65+)
  private readonly NORMAL_RANGES = {
    heartRate: { min: 60, max: 100 },
    bloodPressure: {
      systolic: { min: 110, max: 140 },
      diastolic: { min: 60, max: 90 },
    },
    temperature: { min: 36.0, max: 37.5 },
    oxygenSaturation: { min: 95, max: 100 },
    respiratoryRate: { min: 12, max: 20 },
  };

  constructor() {
    this.logger = new Logger({
      level: 'info',
      context: { agent: 'elderly-care' },
    });

    this.metrics = new MetricsCollector();
    this.alerts = new Map();
    this.alertIdCounter = 1;

    this.logger.info('Elderly Care Agent initialized');
  }

  /**
   * Monitor patient health status
   */
  async monitorPatient(
    patientId: string,
    vitals: Vitals,
    medications: MedicationRecord[],
    activities: Activity[]
  ): Promise<HealthStatus> {
    const monitorCounter = this.metrics.counter('elderly.monitor.total', {
      patientId,
    });
    const monitorTimer = this.metrics.timer('elderly.monitor.duration');

    this.logger.info('Monitoring patient', { patientId });

    try {
      const status = await monitorTimer.time(async () => {
        // Detect vital anomalies
        const vitalAlerts = this.detectVitalAnomalies(patientId, vitals);

        // Check medication compliance
        const medicationAlerts = this.checkMedicationCompliance(
          patientId,
          medications
        );

        // Analyze activity patterns
        const activityAlerts = this.analyzeActivityPatterns(
          patientId,
          activities
        );

        // Combine all alerts
        const allAlerts = [
          ...vitalAlerts,
          ...medicationAlerts,
          ...activityAlerts,
        ];

        // Store alerts
        allAlerts.forEach(alert => this.alerts.set(alert.id, alert));

        // Send critical notifications
        await this.handleCriticalAlerts(patientId, allAlerts);

        // Calculate medication compliance
        const compliance = this.calculateCompliance(medications);

        // Generate recommendations
        const recommendations = this.generateCareRecommendations(
          vitals,
          medications,
          activities,
          allAlerts
        );

        // Determine overall status
        const overallStatus = this.determineOverallStatus(allAlerts, compliance);

        return {
          patientId,
          vitals,
          medications: {
            scheduled: medications,
            compliance,
          },
          activities,
          alerts: allAlerts,
          recommendations: recommendations.map(r => r.recommendation),
          overallStatus,
          reportedAt: Date.now(),
        };
      });

      monitorCounter.inc();

      // Track metrics
      const alertsGauge = this.metrics.gauge('elderly.alerts.count', {
        patientId,
      });
      alertsGauge.set(status.alerts.length);

      const complianceGauge = this.metrics.gauge('elderly.medication.compliance', {
        patientId,
      });
      complianceGauge.set(status.medications.compliance);

      this.logger.info('Patient monitoring completed', {
        patientId,
        alertsCount: status.alerts.length,
        overallStatus: status.overallStatus,
      });

      return status;
    } catch (error) {
      this.logger.error('Patient monitoring failed', error, { patientId });
      throw new AppError(
        'Patient monitoring failed',
        'PATIENT_MONITOR_FAILED',
        500,
        'high',
        { patientId }
      );
    }
  }

  /**
   * Detect anomalies in vital signs
   */
  private detectVitalAnomalies(
    patientId: string,
    vitals: Vitals
  ): Alert[] {
    const alerts: Alert[] = [];

    // Check heart rate
    if (vitals.heartRate < this.NORMAL_RANGES.heartRate.min) {
      alerts.push(this.createAlert(
        AlertType.HEART_RATE,
        AlertSeverity.HIGH,
        `Low heart rate: ${vitals.heartRate} bpm (normal: ${this.NORMAL_RANGES.heartRate.min}-${this.NORMAL_RANGES.heartRate.max})`,
        { heartRate: vitals.heartRate }
      ));
    } else if (vitals.heartRate > this.NORMAL_RANGES.heartRate.max) {
      alerts.push(this.createAlert(
        AlertType.HEART_RATE,
        AlertSeverity.HIGH,
        `High heart rate: ${vitals.heartRate} bpm (normal: ${this.NORMAL_RANGES.heartRate.min}-${this.NORMAL_RANGES.heartRate.max})`,
        { heartRate: vitals.heartRate }
      ));
    }

    // Check blood pressure
    if (vitals.bloodPressure.systolic > 140) {
      alerts.push(this.createAlert(
        AlertType.BLOOD_PRESSURE,
        vitals.bloodPressure.systolic > 160 ? AlertSeverity.CRITICAL : AlertSeverity.MEDIUM,
        `Elevated blood pressure: ${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic} mmHg`,
        { bloodPressure: vitals.bloodPressure }
      ));
    } else if (vitals.bloodPressure.systolic < 110) {
      alerts.push(this.createAlert(
        AlertType.BLOOD_PRESSURE,
        AlertSeverity.MEDIUM,
        `Low blood pressure: ${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic} mmHg`,
        { bloodPressure: vitals.bloodPressure }
      ));
    }

    // Check temperature
    if (vitals.temperature > this.NORMAL_RANGES.temperature.max) {
      alerts.push(this.createAlert(
        AlertType.TEMPERATURE,
        vitals.temperature > 38.0 ? AlertSeverity.HIGH : AlertSeverity.MEDIUM,
        `Fever detected: ${vitals.temperature}°C`,
        { temperature: vitals.temperature }
      ));
    } else if (vitals.temperature < this.NORMAL_RANGES.temperature.min) {
      alerts.push(this.createAlert(
        AlertType.TEMPERATURE,
        AlertSeverity.MEDIUM,
        `Low body temperature: ${vitals.temperature}°C`,
        { temperature: vitals.temperature }
      ));
    }

    // Check oxygen saturation
    if (vitals.oxygenSaturation < this.NORMAL_RANGES.oxygenSaturation.min) {
      alerts.push(this.createAlert(
        AlertType.OXYGEN,
        vitals.oxygenSaturation < 90 ? AlertSeverity.CRITICAL : AlertSeverity.HIGH,
        `Low oxygen saturation: ${vitals.oxygenSaturation}% (normal: ≥95%)`,
        { oxygenSaturation: vitals.oxygenSaturation }
      ));
    }

    return alerts;
  }

  /**
   * Check medication compliance
   */
  private checkMedicationCompliance(
    patientId: string,
    medications: MedicationRecord[]
  ): Alert[] {
    const alerts: Alert[] = [];
    const now = Date.now();

    for (const record of medications) {
      if (!record.taken && !record.skipped) {
        // Check if medication is overdue (more than 1 hour)
        const scheduledTime = this.parseTime(record.scheduledTime);
        const overdueMinutes = (now - scheduledTime) / (1000 * 60);

        if (overdueMinutes > 60) {
          alerts.push(this.createAlert(
            AlertType.MEDICATION_MISSED,
            overdueMinutes > 180 ? AlertSeverity.HIGH : AlertSeverity.MEDIUM,
            `Medication missed: ${record.medicationId} (overdue by ${Math.round(overdueMinutes)} minutes)`
          ));
        }
      }
    }

    return alerts;
  }

  /**
   * Analyze activity patterns
   */
  private analyzeActivityPatterns(
    patientId: string,
    activities: Activity[]
  ): Alert[] {
    const alerts: Alert[] = [];

    if (activities.length === 0) {
      return alerts;
    }

    // Check for prolonged inactivity
    const lastActivity = activities[activities.length - 1];
    const timeSinceLastActivity = Date.now() - (lastActivity.endTime || lastActivity.startTime);
    const hoursSinceLastActivity = timeSinceLastActivity / (1000 * 60 * 60);

    if (hoursSinceLastActivity > 4 && lastActivity.type !== 'sleeping') {
      alerts.push(this.createAlert(
        AlertType.INACTIVITY,
        hoursSinceLastActivity > 6 ? AlertSeverity.HIGH : AlertSeverity.MEDIUM,
        `Prolonged inactivity: ${Math.round(hoursSinceLastActivity)} hours since last activity`
      ));
    }

    // Check for falls (rapid position changes)
    // This would require accelerometer data in a real implementation
    // For now, this is a placeholder

    return alerts;
  }

  /**
   * Calculate medication compliance percentage
   */
  private calculateCompliance(medications: MedicationRecord[]): number {
    if (medications.length === 0) return 100;

    const taken = medications.filter(m => m.taken).length;
    return Math.round((taken / medications.length) * 100);
  }

  /**
   * Generate care recommendations
   */
  private generateCareRecommendations(
    vitals: Vitals,
    medications: MedicationRecord[],
    activities: Activity[],
    alerts: Alert[]
  ): CareRecommendation[] {
    const recommendations: CareRecommendation[] = [];

    // Vitals-based recommendations
    if (vitals.bloodPressure.systolic > 140) {
      recommendations.push({
        category: 'vitals',
        priority: AlertSeverity.HIGH,
        recommendation: 'Monitor blood pressure more frequently',
        reasoning: 'Elevated blood pressure detected',
        actionItems: [
          'Measure blood pressure 3 times daily',
          'Reduce salt intake',
          'Consult with doctor if persists',
        ],
      });
    }

    // Medication compliance
    const compliance = this.calculateCompliance(medications);
    if (compliance < 80) {
      recommendations.push({
        category: 'medication',
        priority: AlertSeverity.MEDIUM,
        recommendation: 'Improve medication adherence',
        reasoning: `Current compliance: ${compliance}%`,
        actionItems: [
          'Set up medication reminders',
          'Use pill organizer',
          'Consider automatic medication dispenser',
        ],
      });
    }

    // Activity recommendations
    const totalActivity = activities.reduce((sum, a) => sum + (a.duration || 0), 0);
    if (totalActivity < 30) {  // Less than 30 minutes of activity
      recommendations.push({
        category: 'activity',
        priority: AlertSeverity.LOW,
        recommendation: 'Increase daily physical activity',
        reasoning: 'Low activity level detected',
        actionItems: [
          'Take short walks (10-15 minutes) 2-3 times daily',
          'Do light stretching exercises',
          'Engage in seated activities if mobility limited',
        ],
      });
    }

    return recommendations;
  }

  /**
   * Determine overall health status
   */
  private determineOverallStatus(
    alerts: Alert[],
    compliance: number
  ): 'good' | 'fair' | 'concerning' | 'critical' {
    const criticalAlerts = alerts.filter(a => a.severity === AlertSeverity.CRITICAL);
    const highAlerts = alerts.filter(a => a.severity === AlertSeverity.HIGH);

    if (criticalAlerts.length > 0) {
      return 'critical';
    }

    if (highAlerts.length > 0 || compliance < 70) {
      return 'concerning';
    }

    if (alerts.length > 2 || compliance < 85) {
      return 'fair';
    }

    return 'good';
  }

  /**
   * Create alert object
   */
  private createAlert(
    type: AlertType,
    severity: AlertSeverity,
    message: string,
    vitals?: Partial<Vitals>
  ): Alert {
    return {
      id: `alert-${this.alertIdCounter++}`,
      type,
      severity,
      message,
      timestamp: Date.now(),
      vitals,
      resolved: false,
      notificationSent: false,
    };
  }

  /**
   * Handle critical alerts (send notifications)
   */
  private async handleCriticalAlerts(
    patientId: string,
    alerts: Alert[]
  ): Promise<void> {
    const criticalAlerts = alerts.filter(
      a => a.severity === AlertSeverity.CRITICAL && !a.notificationSent
    );

    for (const alert of criticalAlerts) {
      this.logger.warn('Critical alert detected', {
        patientId,
        alertType: alert.type,
        message: alert.message,
      });

      // In a real implementation, this would send SMS/email/push notification
      // to caregivers or emergency services
      alert.notificationSent = true;

      // Track critical alert metric
      const criticalCounter = this.metrics.counter('elderly.alerts.critical', {
        type: alert.type,
      });
      criticalCounter.inc();
    }
  }

  /**
   * Parse time string to timestamp
   */
  private parseTime(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    const now = new Date();
    now.setHours(hours, minutes, 0, 0);
    return now.getTime();
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    return this.metrics.export();
  }

  /**
   * Get all active alerts for a patient
   */
  getActiveAlerts(patientId: string): Alert[] {
    return Array.from(this.alerts.values()).filter(
      a => !a.resolved
    );
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = Date.now();
      this.logger.info('Alert resolved', { alertId });
      return true;
    }
    return false;
  }
}
