/**
 * Contract Lawyer Agent
 *
 * Specialized agent for contract analysis, drafting, and legal risk assessment.
 * Integrates with @info7/common utilities for logging, metrics, and error handling.
 */

import {
  Logger,
  MetricsCollector,
  AppError,
  ValidationError,
  NotFoundError,
} from '@info7/common';

/**
 * Risk severity levels
 */
export enum RiskSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Risk types in contracts
 */
export enum RiskType {
  LIABILITY = 'liability',
  TERMINATION = 'termination',
  RESTRICTION = 'restriction',
  FINANCIAL = 'financial',
  COMPLIANCE = 'compliance',
  IP_RIGHTS = 'ip-rights',
}

/**
 * Contract risk
 */
export interface ContractRisk {
  type: RiskType;
  severity: RiskSeverity;
  location: number;
  clause: string;
  description: string;
  recommendation: string;
  impact: string;
}

/**
 * Contract analysis result
 */
export interface ContractAnalysis {
  contractId: string;
  risks: ContractRisk[];
  recommendations: string[];
  compliance: ComplianceCheck;
  score: number;
  summary: string;
  analyzedAt: number;
}

/**
 * Compliance check result
 */
export interface ComplianceCheck {
  passed: boolean;
  violations: string[];
  standards: string[];
  warnings: string[];
}

/**
 * Contract drafting request
 */
export interface ContractDraftRequest {
  type: 'nda' | 'employment' | 'service' | 'sales' | 'partnership';
  parties: {
    name: string;
    role: string;
    jurisdiction: string;
  }[];
  terms: Record<string, any>;
  jurisdiction: string;
  language: string;
}

/**
 * Contract Lawyer Agent
 */
export class ContractLawyerAgent {
  private logger: Logger;
  private metrics: MetricsCollector;
  private riskPatterns: Map<RegExp, ContractRisk>;

  constructor() {
    this.logger = new Logger({
      level: 'info',
      context: { agent: 'contract-lawyer' },
    });

    this.metrics = new MetricsCollector();
    this.riskPatterns = new Map();

    this.initializeRiskPatterns();
    this.logger.info('Contract Lawyer Agent initialized');
  }

  /**
   * Initialize risk detection patterns
   */
  private initializeRiskPatterns(): void {
    // High-risk patterns
    this.riskPatterns.set(/indemnif(y|ication)/gi, {
      type: RiskType.LIABILITY,
      severity: RiskSeverity.HIGH,
      location: 0,
      clause: 'Indemnification',
      description: 'Broad indemnification clause found',
      recommendation: 'Review and negotiate limitations on indemnification obligations',
      impact: 'Unlimited liability exposure',
    });

    this.riskPatterns.set(/unlimited\s+liability/gi, {
      type: RiskType.LIABILITY,
      severity: RiskSeverity.CRITICAL,
      location: 0,
      clause: 'Unlimited Liability',
      description: 'Unlimited liability clause detected',
      recommendation: 'Negotiate liability cap or insurance requirements',
      impact: 'Catastrophic financial risk',
    });

    this.riskPatterns.set(/non[- ]compete/gi, {
      type: RiskType.RESTRICTION,
      severity: RiskSeverity.HIGH,
      location: 0,
      clause: 'Non-Compete',
      description: 'Non-compete restriction found',
      recommendation: 'Review scope, duration, and geographic limitations',
      impact: 'Business operation restrictions',
    });

    this.riskPatterns.set(/force\s+majeure/gi, {
      type: RiskType.TERMINATION,
      severity: RiskSeverity.MEDIUM,
      location: 0,
      clause: 'Force Majeure',
      description: 'Force majeure clause present',
      recommendation: 'Ensure clause includes pandemic and cyber events',
      impact: 'Limited protection for unforeseen events',
    });

    this.riskPatterns.set(/intellectual\s+property/gi, {
      type: RiskType.IP_RIGHTS,
      severity: RiskSeverity.HIGH,
      location: 0,
      clause: 'Intellectual Property',
      description: 'IP rights assignment or licensing',
      recommendation: 'Clarify ownership, licensing scope, and restrictions',
      impact: 'Loss of IP rights or revenue',
    });

    this.riskPatterns.set(/auto[- ]renew/gi, {
      type: RiskType.TERMINATION,
      severity: RiskSeverity.MEDIUM,
      location: 0,
      clause: 'Auto-Renewal',
      description: 'Automatic renewal clause',
      recommendation: 'Ensure adequate notice period for termination',
      impact: 'Difficult to exit contract',
    });

    this.logger.info('Risk patterns initialized', {
      count: this.riskPatterns.size,
    });
  }

  /**
   * Analyze contract for risks and compliance
   */
  async analyzeContract(
    contractId: string,
    contractText: string
  ): Promise<ContractAnalysis> {
    const analysisCounter = this.metrics.counter('contract.analysis.total', {
      agent: 'contract-lawyer',
    });
    const analysisTimer = this.metrics.timer('contract.analysis.duration');

    this.logger.info('Analyzing contract', {
      contractId,
      length: contractText.length,
    });

    if (!contractText || contractText.trim().length === 0) {
      throw new ValidationError('Contract text cannot be empty', {
        contractText: ['Contract text is required'],
      });
    }

    try {
      const result = await analysisTimer.time(async () => {
        // Identify risks
        const risks = this.identifyRisks(contractText);

        // Generate recommendations
        const recommendations = this.generateRecommendations(risks);

        // Check compliance
        const compliance = this.checkCompliance(contractText, risks);

        // Calculate risk score
        const score = this.calculateRiskScore(risks);

        // Generate summary
        const summary = this.generateSummary(risks, score);

        return {
          contractId,
          risks,
          recommendations,
          compliance,
          score,
          summary,
          analyzedAt: Date.now(),
        };
      });

      analysisCounter.inc();

      // Track risk metrics
      const riskGauge = this.metrics.gauge('contract.risk.score', {
        contractId,
      });
      riskGauge.set(result.score);

      this.logger.info('Contract analysis completed', {
        contractId,
        riskCount: result.risks.length,
        score: result.score,
      });

      return result;
    } catch (error) {
      this.logger.error('Contract analysis failed', error, { contractId });
      throw new AppError(
        'Contract analysis failed',
        'CONTRACT_ANALYSIS_FAILED',
        500,
        'high',
        { contractId }
      );
    }
  }

  /**
   * Identify risks in contract text
   */
  private identifyRisks(contractText: string): ContractRisk[] {
    const risks: ContractRisk[] = [];

    for (const [pattern, riskTemplate] of this.riskPatterns) {
      const matches = contractText.matchAll(pattern);

      for (const match of matches) {
        risks.push({
          ...riskTemplate,
          location: match.index || 0,
          clause: this.extractClause(contractText, match.index || 0),
        });
      }
    }

    this.logger.debug('Risks identified', { count: risks.length });
    return risks;
  }

  /**
   * Extract clause text around match location
   */
  private extractClause(text: string, location: number): string {
    const start = Math.max(0, location - 100);
    const end = Math.min(text.length, location + 100);
    return text.substring(start, end).trim();
  }

  /**
   * Generate recommendations based on risks
   */
  private generateRecommendations(risks: ContractRisk[]): string[] {
    const recommendations: string[] = [];

    const criticalRisks = risks.filter(
      r => r.severity === RiskSeverity.CRITICAL
    );
    const highRisks = risks.filter(r => r.severity === RiskSeverity.HIGH);

    if (criticalRisks.length > 0) {
      recommendations.push(
        `URGENT: ${criticalRisks.length} critical risk(s) require immediate attention before signing`
      );
    }

    if (highRisks.length > 0) {
      recommendations.push(
        `${highRisks.length} high-severity risk(s) should be negotiated`
      );
    }

    // Add specific recommendations
    const uniqueRecommendations = new Set(
      risks.map(r => r.recommendation)
    );
    recommendations.push(...Array.from(uniqueRecommendations));

    return recommendations;
  }

  /**
   * Check compliance with legal standards
   */
  private checkCompliance(
    contractText: string,
    risks: ContractRisk[]
  ): ComplianceCheck {
    const violations: string[] = [];
    const warnings: string[] = [];
    const standards = ['GDPR', 'CCPA', 'SOX', 'HIPAA'];

    // Check for GDPR compliance
    if (contractText.toLowerCase().includes('personal data')) {
      if (!contractText.toLowerCase().includes('gdpr')) {
        warnings.push('Contract mentions personal data but no GDPR reference');
      }
    }

    // Check for critical risks
    const criticalRisks = risks.filter(
      r => r.severity === RiskSeverity.CRITICAL
    );
    if (criticalRisks.length > 0) {
      violations.push(
        `${criticalRisks.length} critical risk(s) violate best practices`
      );
    }

    return {
      passed: violations.length === 0,
      violations,
      standards,
      warnings,
    };
  }

  /**
   * Calculate overall risk score (0-100, lower is better)
   */
  private calculateRiskScore(risks: ContractRisk[]): number {
    let score = 0;

    for (const risk of risks) {
      switch (risk.severity) {
        case RiskSeverity.CRITICAL:
          score += 25;
          break;
        case RiskSeverity.HIGH:
          score += 15;
          break;
        case RiskSeverity.MEDIUM:
          score += 8;
          break;
        case RiskSeverity.LOW:
          score += 3;
          break;
      }
    }

    return Math.min(100, score);
  }

  /**
   * Generate analysis summary
   */
  private generateSummary(risks: ContractRisk[], score: number): string {
    const criticalCount = risks.filter(
      r => r.severity === RiskSeverity.CRITICAL
    ).length;
    const highCount = risks.filter(
      r => r.severity === RiskSeverity.HIGH
    ).length;

    if (score >= 75) {
      return `High-risk contract (score: ${score}). ${criticalCount} critical and ${highCount} high-severity issues detected. Not recommended for signing without major revisions.`;
    } else if (score >= 50) {
      return `Moderate-risk contract (score: ${score}). ${highCount} high-severity issues should be addressed through negotiation.`;
    } else if (score >= 25) {
      return `Low-risk contract (score: ${score}). Minor issues can be reviewed but overall acceptable.`;
    } else {
      return `Minimal-risk contract (score: ${score}). No significant issues identified.`;
    }
  }

  /**
   * Draft a contract based on request
   */
  async draftContract(
    request: ContractDraftRequest
  ): Promise<string> {
    const draftCounter = this.metrics.counter('contract.draft.total', {
      type: request.type,
    });

    this.logger.info('Drafting contract', {
      type: request.type,
      parties: request.parties.length,
      jurisdiction: request.jurisdiction,
    });

    try {
      const template = this.getTemplate(request.type);
      const draft = this.fillTemplate(template, request);

      draftCounter.inc();

      this.logger.info('Contract drafted', {
        type: request.type,
        length: draft.length,
      });

      return draft;
    } catch (error) {
      this.logger.error('Contract drafting failed', error, {
        type: request.type,
      });
      throw new AppError(
        'Contract drafting failed',
        'CONTRACT_DRAFT_FAILED',
        500,
        'medium',
        { type: request.type }
      );
    }
  }

  /**
   * Get contract template
   */
  private getTemplate(type: ContractDraftRequest['type']): string {
    const templates = {
      nda: `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is entered into as of {{date}}

BETWEEN: {{party1.name}} ("Disclosing Party")
AND: {{party2.name}} ("Receiving Party")

1. CONFIDENTIAL INFORMATION
The Receiving Party agrees to maintain confidentiality of all information disclosed by the Disclosing Party.

2. OBLIGATIONS
The Receiving Party shall:
- Not disclose confidential information to third parties
- Use confidential information solely for {{purpose}}
- Protect information with reasonable care

3. TERM
This Agreement shall remain in effect for {{term}} years from the date of signing.

4. GOVERNING LAW
This Agreement shall be governed by the laws of {{jurisdiction}}.`,

      employment: `EMPLOYMENT AGREEMENT

This Employment Agreement is made between:
EMPLOYER: {{party1.name}}
EMPLOYEE: {{party2.name}}

1. POSITION: {{position}}
2. COMPENSATION: {{compensation}}
3. BENEFITS: {{benefits}}
4. TERM: {{term}}

5. TERMINATION
Either party may terminate with {{notice_period}} days notice.

6. CONFIDENTIALITY
Employee agrees to maintain confidentiality of company information.

7. GOVERNING LAW: {{jurisdiction}}`,

      service: `SERVICE AGREEMENT

SERVICE PROVIDER: {{party1.name}}
CLIENT: {{party2.name}}

1. SERVICES
Provider shall deliver: {{services}}

2. COMPENSATION
Client shall pay: {{compensation}}

3. TERM
Agreement effective from {{start_date}} to {{end_date}}

4. TERMINATION
{{termination_clause}}

5. LIABILITY
Maximum liability limited to {{liability_cap}}

6. GOVERNING LAW: {{jurisdiction}}`,
    };

    const template = templates[type];
    if (!template) {
      throw new NotFoundError('Template', type);
    }

    return template;
  }

  /**
   * Fill template with request data
   */
  private fillTemplate(
    template: string,
    request: ContractDraftRequest
  ): string {
    let filled = template;

    // Replace party information
    request.parties.forEach((party, index) => {
      filled = filled.replace(
        new RegExp(`{{party${index + 1}.name}}`, 'g'),
        party.name
      );
    });

    // Replace terms
    for (const [key, value] of Object.entries(request.terms)) {
      filled = filled.replace(
        new RegExp(`{{${key}}}`, 'g'),
        String(value)
      );
    }

    // Replace jurisdiction
    filled = filled.replace(/{{jurisdiction}}/g, request.jurisdiction);

    // Replace date
    filled = filled.replace(/{{date}}/g, new Date().toISOString().split('T')[0]);

    return filled;
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    return this.metrics.export();
  }
}
