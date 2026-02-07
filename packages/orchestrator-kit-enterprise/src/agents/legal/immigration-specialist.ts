import { Logger } from '@info7/common';
import { MetricsCollector } from '@info7/common';
import { AppError, ValidationError } from '@info7/common';

/**
 * Immigration Specialist Agent
 *
 * Provides immigration guidance, visa information, and pathway recommendations.
 *
 * IMPORTANT DISCLAIMER:
 * This agent provides general immigration information and is NOT a substitute
 * for professional legal advice. Immigration laws are complex and constantly changing.
 * Always consult licensed immigration attorneys for specific cases and applications.
 * This agent does not provide legal representation.
 */

// ============================================================================
// Types
// ============================================================================

export enum VisaCategory {
  // Non-immigrant (temporary)
  B1_B2_TOURIST = 'B-1/B-2',
  F1_STUDENT = 'F-1',
  J1_EXCHANGE = 'J-1',
  H1B_SPECIALTY = 'H-1B',
  L1_INTRACOMPANY = 'L-1',
  O1_EXTRAORDINARY = 'O-1',
  E2_INVESTOR = 'E-2',

  // Immigrant (permanent)
  EB1_PRIORITY = 'EB-1',
  EB2_ADVANCED = 'EB-2',
  EB3_SKILLED = 'EB-3',
  EB5_INVESTOR = 'EB-5',
  FAMILY_BASED = 'Family-Based',
  DIVERSITY_LOTTERY = 'DV-Lottery',
  ASYLUM_REFUGEE = 'Asylum/Refugee',
}

export enum ImmigrationGoal {
  TOURISM = 'tourism',
  STUDY = 'study',
  WORK_TEMPORARY = 'work-temporary',
  WORK_PERMANENT = 'work-permanent',
  INVEST = 'invest',
  FAMILY_REUNIFICATION = 'family-reunification',
  PERMANENT_RESIDENCY = 'permanent-residency',
  CITIZENSHIP = 'citizenship',
  ASYLUM = 'asylum',
}

export enum Country {
  UNITED_STATES = 'US',
  CANADA = 'CA',
  UNITED_KINGDOM = 'UK',
  AUSTRALIA = 'AU',
  GERMANY = 'DE',
  FRANCE = 'FR',
  SPAIN = 'ES',
  NEW_ZEALAND = 'NZ',
  SINGAPORE = 'SG',
  JAPAN = 'JP',
}

export enum EducationLevel {
  HIGH_SCHOOL = 'high-school',
  ASSOCIATE = 'associate',
  BACHELOR = 'bachelor',
  MASTER = 'master',
  DOCTORATE = 'doctorate',
  PROFESSIONAL = 'professional',
}

export interface ApplicantProfile {
  currentCountry: Country;
  targetCountry: Country;
  goal: ImmigrationGoal;
  age: number;
  educationLevel: EducationLevel;
  yearsOfExperience: number;
  occupation: string;
  languageSkills: Array<{
    language: string;
    proficiency: 'basic' | 'intermediate' | 'advanced' | 'native';
    certified?: boolean; // TOEFL, IELTS, etc.
  }>;
  familyStatus?: {
    maritalStatus: 'single' | 'married' | 'divorced';
    children: number;
    hasRelativesInTarget?: boolean;
  };
  financialResources?: {
    savingsUSD: number;
    investmentCapacity?: number;
  };
  criminalRecord?: boolean;
  previousViolations?: boolean;
}

export interface VisaPathway {
  visaType: VisaCategory;
  name: string;
  suitabilityScore: number; // 0-100
  requirements: string[];
  timeline: {
    processingTime: string;
    validity: string;
    renewalOption?: string;
  };
  costs: {
    applicationFee: number;
    attorneyFees?: { min: number; max: number };
    otherCosts?: string[];
  };
  eligibilityCriteria: Array<{
    criterion: string;
    met: boolean;
    details: string;
  }>;
  advantages: string[];
  disadvantages: string[];
  nextSteps: string[];
  pathToGreenCard?: {
    possible: boolean;
    pathway?: string;
    estimatedTime?: string;
  };
}

export interface ImmigrationAssessment {
  profile: ApplicantProfile;
  recommendedPathways: VisaPathway[];
  alternativeOptions: VisaPathway[];
  strengths: string[];
  weaknesses: string[];
  recommendations: ImmigrationRecommendation[];
  estimatedSuccessRate: number; // 0-100
  disclaimer: string;
}

export interface ImmigrationRecommendation {
  type: 'preparation' | 'documentation' | 'skill-development' | 'financial' | 'legal' | 'timeline';
  priority: 'critical' | 'high' | 'medium' | 'low';
  recommendation: string;
  rationale: string;
  actionItems: string[];
  resources?: string[];
}

export interface DocumentChecklist {
  category: 'personal' | 'financial' | 'professional' | 'educational' | 'legal';
  documents: Array<{
    name: string;
    required: boolean;
    description: string;
    obtainFrom: string;
    validityPeriod?: string;
  }>;
}

export interface TimelineEstimate {
  phase: string;
  duration: string;
  activities: string[];
  criticalDeadlines?: string[];
}

// ============================================================================
// Immigration Specialist Agent
// ============================================================================

export class ImmigrationSpecialistAgent {
  private logger: Logger;
  private metrics: MetricsCollector;

  // Visa requirements database
  private visaRequirements = new Map<VisaCategory, {
    description: string;
    processingTime: string;
    validity: string;
    baseFee: number;
    requirements: string[];
    leadToGreenCard: boolean;
  }>();

  // Country-specific info
  private countryInfo = new Map<Country, {
    languageRequirements: string[];
    pointsBasedSystem: boolean;
    quotaSystem: boolean;
    preferredOccupations: string[];
  }>();

  constructor() {
    this.logger = new Logger('ImmigrationSpecialistAgent');
    this.metrics = new MetricsCollector('immigration_specialist');
    this.initializeVisaRequirements();
    this.initializeCountryInfo();
  }

  private initializeVisaRequirements(): void {
    // H-1B Specialty Worker
    this.visaRequirements.set(VisaCategory.H1B_SPECIALTY, {
      description: 'Specialty occupation requiring theoretical/practical application of specialized knowledge',
      processingTime: '3-6 months (regular) or 15 days (premium)',
      validity: '3 years, renewable for total of 6 years',
      baseFee: 460,
      requirements: [
        'Bachelor\'s degree or equivalent in specific specialty',
        'Job offer from US employer',
        'Employer must file petition',
        'Subject to annual cap (85,000 visas)',
        'Specialty occupation (IT, Engineering, Science, etc.)',
      ],
      leadToGreenCard: true,
    });

    // L-1 Intracompany Transfer
    this.visaRequirements.set(VisaCategory.L1_INTRACOMPANY, {
      description: 'Transfer within same company to US office',
      processingTime: '2-4 months (regular) or 15 days (premium)',
      validity: 'L-1A: 7 years, L-1B: 5 years',
      baseFee: 460,
      requirements: [
        'Worked for company abroad for 1+ year in last 3 years',
        'Manager/Executive (L-1A) or Specialized Knowledge (L-1B)',
        'Company has qualifying relationship (parent/subsidiary/affiliate)',
        'Coming to work in executive/managerial or specialized knowledge capacity',
        'No annual cap',
      ],
      leadToGreenCard: true,
    });

    // O-1 Extraordinary Ability
    this.visaRequirements.set(VisaCategory.O1_EXTRAORDINARY, {
      description: 'Individuals with extraordinary ability in sciences, arts, education, business, or athletics',
      processingTime: '2-3 months (regular) or 15 days (premium)',
      validity: 'Up to 3 years, unlimited extensions',
      baseFee: 460,
      requirements: [
        'Demonstrated extraordinary ability (national/international recognition)',
        'Major awards (Nobel, Oscar, Olympic) OR 3+ of: published material, high salary, critical role, etc.',
        'Job offer or contract in field of extraordinary ability',
        'No annual cap',
        'Arts vs Sciences have different criteria',
      ],
      leadToGreenCard: true,
    });

    // EB-1 Priority Workers
    this.visaRequirements.set(VisaCategory.EB1_PRIORITY, {
      description: 'Priority workers: extraordinary ability, outstanding professors/researchers, multinational executives',
      processingTime: '8-12 months',
      validity: 'Permanent (Green Card)',
      baseFee: 700,
      requirements: [
        'EB-1A: Extraordinary ability (no job offer needed)',
        'EB-1B: Outstanding professor/researcher (job offer required)',
        'EB-1C: Multinational manager/executive',
        'No labor certification required',
        'Premium processing available for some categories',
      ],
      leadToGreenCard: true,
    });

    // EB-2 Advanced Degree/Exceptional Ability
    this.visaRequirements.set(VisaCategory.EB2_ADVANCED, {
      description: 'Advanced degree or exceptional ability',
      processingTime: '12-18 months + PERM (6-9 months)',
      validity: 'Permanent (Green Card)',
      baseFee: 700,
      requirements: [
        'Advanced degree (Master\'s or Bachelor\'s + 5 years experience) OR exceptional ability',
        'Labor certification (PERM) required (unless NIW)',
        'NIW (National Interest Waiver) option - no job offer needed',
        'Job offer from US employer (unless NIW)',
      ],
      leadToGreenCard: true,
    });

    // EB-3 Skilled Workers
    this.visaRequirements.set(VisaCategory.EB3_SKILLED, {
      description: 'Skilled workers, professionals, other workers',
      processingTime: '18-24 months + PERM (6-9 months)',
      validity: 'Permanent (Green Card)',
      baseFee: 700,
      requirements: [
        'Bachelor\'s degree OR 2+ years experience/training',
        'Labor certification (PERM) required',
        'Job offer from US employer',
        'Longer wait times for many countries',
      ],
      leadToGreenCard: true,
    });

    // F-1 Student
    this.visaRequirements.set(VisaCategory.F1_STUDENT, {
      description: 'Academic student at accredited US institution',
      processingTime: '2-3 months',
      validity: 'Duration of studies + 60 days',
      baseFee: 160,
      requirements: [
        'Acceptance to SEVP-approved school (I-20)',
        'Proof of financial support for tuition + living',
        'Intent to return home after studies',
        'OPT available: 12 months (36 for STEM)',
        'Can work on-campus (20 hrs/week)',
      ],
      leadToGreenCard: false,
    });

    // Add more visa types...
  }

  private initializeCountryInfo(): void {
    this.countryInfo.set(Country.UNITED_STATES, {
      languageRequirements: ['English proficiency for some visas'],
      pointsBasedSystem: false,
      quotaSystem: true, // For employment-based and diversity
      preferredOccupations: [
        'Software Engineer',
        'Data Scientist',
        'Healthcare Professional',
        'Engineer',
        'Researcher',
        'Professor',
      ],
    });

    this.countryInfo.set(Country.CANADA, {
      languageRequirements: ['English or French (CLB/NCLC levels)'],
      pointsBasedSystem: true, // Express Entry CRS
      quotaSystem: false,
      preferredOccupations: [
        'Software Engineer',
        'Healthcare Professional',
        'Skilled Trades',
        'Engineer',
        'IT Professional',
      ],
    });

    this.countryInfo.set(Country.AUSTRALIA, {
      languageRequirements: ['English (IELTS/PTE)'],
      pointsBasedSystem: true, // SkillSelect
      quotaSystem: true,
      preferredOccupations: [
        'Healthcare Professional',
        'Engineer',
        'IT Professional',
        'Accountant',
        'Tradesperson',
      ],
    });
  }

  /**
   * Assess immigration options for applicant
   */
  async assessImmigrationOptions(profile: ApplicantProfile): Promise<ImmigrationAssessment> {
    const startTime = Date.now();

    try {
      // Validate input
      if (profile.age < 18 || profile.age > 80) {
        throw new ValidationError('Age must be between 18 and 80');
      }

      this.logger.info('Assessing immigration options', {
        targetCountry: profile.targetCountry,
        goal: profile.goal,
        occupation: profile.occupation,
      });

      // Find suitable visa pathways
      const allPathways = this.findSuitablePathways(profile);

      // Score and rank pathways
      const rankedPathways = allPathways
        .map(pathway => ({
          ...pathway,
          suitabilityScore: this.calculateSuitabilityScore(pathway, profile),
        }))
        .sort((a, b) => b.suitabilityScore - a.suitabilityScore);

      // Split into recommended and alternative
      const recommendedPathways = rankedPathways.filter(p => p.suitabilityScore >= 60);
      const alternativeOptions = rankedPathways.filter(p => p.suitabilityScore < 60 && p.suitabilityScore >= 30);

      // Identify strengths and weaknesses
      const strengths = this.identifyStrengths(profile);
      const weaknesses = this.identifyWeaknesses(profile);

      // Generate recommendations
      const recommendations = this.generateRecommendations(profile, weaknesses);

      // Calculate overall success rate
      const estimatedSuccessRate = this.calculateSuccessRate(profile, recommendedPathways);

      const assessment: ImmigrationAssessment = {
        profile,
        recommendedPathways: recommendedPathways.slice(0, 3),
        alternativeOptions: alternativeOptions.slice(0, 2),
        strengths,
        weaknesses,
        recommendations,
        estimatedSuccessRate,
        disclaimer: this.getDisclaimer(),
      };

      this.metrics.recordMetric('immigration_assessment_completed', 1, {
        targetCountry: profile.targetCountry,
        pathwaysFound: recommendedPathways.length,
        duration: Date.now() - startTime,
      });

      return assessment;
    } catch (error) {
      this.logger.error('Immigration assessment failed', error);
      throw new AppError('Failed to assess immigration options', { cause: error });
    }
  }

  /**
   * Get document checklist for specific visa
   */
  async getDocumentChecklist(visaType: VisaCategory): Promise<DocumentChecklist[]> {
    try {
      const checklists: DocumentChecklist[] = [];

      // Personal documents
      checklists.push({
        category: 'personal',
        documents: [
          {
            name: 'Valid Passport',
            required: true,
            description: 'Passport valid for at least 6 months beyond intended stay',
            obtainFrom: 'Government passport office',
            validityPeriod: 'Must be valid throughout process',
          },
          {
            name: 'Birth Certificate',
            required: true,
            description: 'Official birth certificate with translation if not in English',
            obtainFrom: 'Vital records office',
          },
          {
            name: 'Photographs',
            required: true,
            description: 'Recent passport-style photos (specific size requirements)',
            obtainFrom: 'Professional photographer',
          },
        ],
      });

      // Professional documents (for work visas)
      if (this.isWorkVisa(visaType)) {
        checklists.push({
          category: 'professional',
          documents: [
            {
              name: 'Resume/CV',
              required: true,
              description: 'Detailed professional resume',
              obtainFrom: 'Self-prepared',
            },
            {
              name: 'Employment Letters',
              required: true,
              description: 'Letters from current and previous employers',
              obtainFrom: 'HR departments',
            },
            {
              name: 'Job Offer Letter',
              required: true,
              description: 'Official offer from sponsoring employer',
              obtainFrom: 'Sponsoring company',
            },
          ],
        });
      }

      // Educational documents
      checklists.push({
        category: 'educational',
        documents: [
          {
            name: 'Degree Certificates',
            required: true,
            description: 'All degree certificates and transcripts',
            obtainFrom: 'Educational institutions',
          },
          {
            name: 'Credential Evaluation',
            required: false,
            description: 'Foreign degree evaluation (if applicable)',
            obtainFrom: 'NACES-approved evaluation service',
          },
        ],
      });

      // Financial documents
      checklists.push({
        category: 'financial',
        documents: [
          {
            name: 'Bank Statements',
            required: true,
            description: 'Recent bank statements (3-6 months)',
            obtainFrom: 'Bank',
            validityPeriod: '3-6 months',
          },
          {
            name: 'Tax Returns',
            required: false,
            description: 'Tax returns from recent years',
            obtainFrom: 'Tax authority',
          },
        ],
      });

      return checklists;
    } catch (error) {
      this.logger.error('Failed to get document checklist', error);
      throw new AppError('Failed to retrieve document checklist', { cause: error });
    }
  }

  /**
   * Create timeline for visa application
   */
  async createApplicationTimeline(visaType: VisaCategory): Promise<TimelineEstimate[]> {
    try {
      const visaInfo = this.visaRequirements.get(visaType);
      if (!visaInfo) {
        throw new ValidationError(`Unknown visa type: ${visaType}`);
      }

      const timeline: TimelineEstimate[] = [];

      // Preparation phase
      timeline.push({
        phase: 'Preparation',
        duration: '1-3 months',
        activities: [
          'Gather all required documents',
          'Get credential evaluations if needed',
          'Obtain employment verification letters',
          'Prepare financial documentation',
          'Take language tests if required',
        ],
      });

      // Application phase
      timeline.push({
        phase: 'Application Submission',
        duration: '2-4 weeks',
        activities: [
          'Complete application forms',
          'Pay application fees',
          'Submit petition (for employer-sponsored)',
          'Submit supporting documents',
          'Schedule biometrics appointment if required',
        ],
        criticalDeadlines: [
          'Application must be complete',
          'All fees paid',
        ],
      });

      // Processing phase
      timeline.push({
        phase: 'Processing',
        duration: visaInfo.processingTime,
        activities: [
          'USCIS reviews petition',
          'Potential RFE (Request for Evidence)',
          'Background checks',
          'Wait for approval notice',
        ],
      });

      // Interview phase
      timeline.push({
        phase: 'Interview & Approval',
        duration: '1-2 months',
        activities: [
          'Schedule visa interview at consulate',
          'Attend interview with required documents',
          'Visa processing after interview',
          'Passport returned with visa',
        ],
        criticalDeadlines: [
          'Must attend interview on scheduled date',
          'Medical exam valid for 6 months',
        ],
      });

      return timeline;
    } catch (error) {
      this.logger.error('Failed to create application timeline', error);
      throw new AppError('Failed to create timeline', { cause: error });
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private findSuitablePathways(profile: ApplicantProfile): VisaPathway[] {
    const pathways: VisaPathway[] = [];

    // Map goals to visa categories
    const goalToVisas: Record<ImmigrationGoal, VisaCategory[]> = {
      [ImmigrationGoal.WORK_TEMPORARY]: [VisaCategory.H1B_SPECIALTY, VisaCategory.L1_INTRACOMPANY, VisaCategory.O1_EXTRAORDINARY],
      [ImmigrationGoal.WORK_PERMANENT]: [VisaCategory.EB1_PRIORITY, VisaCategory.EB2_ADVANCED, VisaCategory.EB3_SKILLED],
      [ImmigrationGoal.STUDY]: [VisaCategory.F1_STUDENT],
      [ImmigrationGoal.INVEST]: [VisaCategory.E2_INVESTOR, VisaCategory.EB5_INVESTOR],
      [ImmigrationGoal.FAMILY_REUNIFICATION]: [VisaCategory.FAMILY_BASED],
      [ImmigrationGoal.PERMANENT_RESIDENCY]: [VisaCategory.EB1_PRIORITY, VisaCategory.EB2_ADVANCED, VisaCategory.EB3_SKILLED],
      [ImmigrationGoal.TOURISM]: [VisaCategory.B1_B2_TOURIST],
      [ImmigrationGoal.CITIZENSHIP]: [],
      [ImmigrationGoal.ASYLUM]: [VisaCategory.ASYLUM_REFUGEE],
    };

    const relevantVisas = goalToVisas[profile.goal] || [];

    relevantVisas.forEach(visaType => {
      const visaInfo = this.visaRequirements.get(visaType);
      if (visaInfo) {
        const pathway = this.buildVisaPathway(visaType, visaInfo, profile);
        pathways.push(pathway);
      }
    });

    return pathways;
  }

  private buildVisaPathway(
    visaType: VisaCategory,
    visaInfo: any,
    profile: ApplicantProfile
  ): VisaPathway {
    const eligibility = this.checkEligibility(visaType, profile);

    return {
      visaType,
      name: visaType,
      suitabilityScore: 0, // Will be calculated later
      requirements: visaInfo.requirements,
      timeline: {
        processingTime: visaInfo.processingTime,
        validity: visaInfo.validity,
      },
      costs: {
        applicationFee: visaInfo.baseFee,
        attorneyFees: { min: 2000, max: 10000 },
        otherCosts: ['Medical exam ($200-500)', 'Translation services ($100-300)'],
      },
      eligibilityCriteria: eligibility,
      advantages: this.getVisaAdvantages(visaType),
      disadvantages: this.getVisaDisadvantages(visaType),
      nextSteps: this.getNextSteps(visaType),
      pathToGreenCard: visaInfo.leadToGreenCard
        ? { possible: true, pathway: 'Employment-based', estimatedTime: '2-5 years' }
        : { possible: false },
    };
  }

  private checkEligibility(visaType: VisaCategory, profile: ApplicantProfile): Array<{
    criterion: string;
    met: boolean;
    details: string;
  }> {
    const criteria = [];

    // Education requirement
    if (visaType === VisaCategory.H1B_SPECIALTY) {
      criteria.push({
        criterion: 'Bachelor\'s degree or higher',
        met: profile.educationLevel === EducationLevel.BACHELOR ||
              profile.educationLevel === EducationLevel.MASTER ||
              profile.educationLevel === EducationLevel.DOCTORATE,
        details: `Your education level: ${profile.educationLevel}`,
      });

      criteria.push({
        criterion: 'Specialty occupation',
        met: this.isSpecialtyOccupation(profile.occupation),
        details: `Your occupation: ${profile.occupation}`,
      });
    }

    // Age (some visas have preferences)
    criteria.push({
      criterion: 'Age range',
      met: profile.age >= 18 && profile.age <= 65,
      details: `Your age: ${profile.age}`,
    });

    // Language proficiency
    const hasEnglish = profile.languageSkills.some(
      lang => lang.language.toLowerCase() === 'english' &&
              (lang.proficiency === 'advanced' || lang.proficiency === 'native')
    );
    criteria.push({
      criterion: 'English proficiency',
      met: hasEnglish,
      details: hasEnglish ? 'Advanced English skills' : 'English proficiency may need improvement',
    });

    return criteria;
  }

  private isSpecialtyOccupation(occupation: string): boolean {
    const specialtyOccupations = [
      'software', 'engineer', 'developer', 'programmer',
      'scientist', 'researcher', 'analyst', 'architect',
      'designer', 'manager', 'consultant', 'professor',
    ];

    return specialtyOccupations.some(keyword =>
      occupation.toLowerCase().includes(keyword)
    );
  }

  private calculateSuitabilityScore(pathway: VisaPathway, profile: ApplicantProfile): number {
    let score = 50; // Base score

    // Eligibility criteria met
    const metCriteria = pathway.eligibilityCriteria.filter(c => c.met).length;
    const totalCriteria = pathway.eligibilityCriteria.length;
    score += (metCriteria / totalCriteria) * 30;

    // Education level
    if (profile.educationLevel === EducationLevel.DOCTORATE) score += 10;
    else if (profile.educationLevel === EducationLevel.MASTER) score += 5;

    // Experience
    if (profile.yearsOfExperience >= 5) score += 10;
    else if (profile.yearsOfExperience >= 3) score += 5;

    // Language skills
    const hasAdvancedEnglish = profile.languageSkills.some(
      lang => lang.language.toLowerCase() === 'english' && lang.proficiency === 'advanced'
    );
    if (hasAdvancedEnglish) score += 5;

    // Financial resources (for investor visas)
    if (pathway.visaType === VisaCategory.EB5_INVESTOR || pathway.visaType === VisaCategory.E2_INVESTOR) {
      if (profile.financialResources && profile.financialResources.investmentCapacity! >= 1000000) {
        score += 20;
      } else {
        score -= 20;
      }
    }

    // Criminal record (negative impact)
    if (profile.criminalRecord) score -= 30;
    if (profile.previousViolations) score -= 20;

    return Math.max(0, Math.min(100, score));
  }

  private identifyStrengths(profile: ApplicantProfile): string[] {
    const strengths = [];

    if (profile.educationLevel === EducationLevel.DOCTORATE || profile.educationLevel === EducationLevel.MASTER) {
      strengths.push('Advanced education level');
    }

    if (profile.yearsOfExperience >= 5) {
      strengths.push('Significant professional experience');
    }

    if (this.isSpecialtyOccupation(profile.occupation)) {
      strengths.push('In-demand occupation');
    }

    const hasAdvancedEnglish = profile.languageSkills.some(
      lang => lang.language.toLowerCase() === 'english' && lang.proficiency === 'advanced'
    );
    if (hasAdvancedEnglish) {
      strengths.push('Strong English proficiency');
    }

    if (profile.age >= 25 && profile.age <= 40) {
      strengths.push('Optimal age range');
    }

    return strengths;
  }

  private identifyWeaknesses(profile: ApplicantProfile): string[] {
    const weaknesses = [];

    if (profile.educationLevel === EducationLevel.HIGH_SCHOOL) {
      weaknesses.push('Limited educational qualifications');
    }

    if (profile.yearsOfExperience < 2) {
      weaknesses.push('Limited professional experience');
    }

    const hasEnglish = profile.languageSkills.some(
      lang => lang.language.toLowerCase() === 'english'
    );
    if (!hasEnglish) {
      weaknesses.push('No English language proficiency documented');
    }

    if (profile.criminalRecord) {
      weaknesses.push('Criminal record may affect eligibility');
    }

    if (profile.age > 50) {
      weaknesses.push('Age may impact point-based systems');
    }

    return weaknesses;
  }

  private generateRecommendations(
    profile: ApplicantProfile,
    weaknesses: string[]
  ): ImmigrationRecommendation[] {
    const recommendations: ImmigrationRecommendation[] = [];

    // Consult attorney
    recommendations.push({
      type: 'legal',
      priority: 'critical',
      recommendation: 'Consult licensed immigration attorney',
      rationale: 'Immigration laws are complex and case-specific',
      actionItems: [
        'Research immigration attorneys with good reviews',
        'Schedule initial consultation',
        'Prepare list of questions',
        'Bring all relevant documents',
      ],
      resources: ['AILA (American Immigration Lawyers Association) directory'],
    });

    // Language improvement
    if (weaknesses.some(w => w.includes('English'))) {
      recommendations.push({
        type: 'skill-development',
        priority: 'high',
        recommendation: 'Improve English language proficiency',
        rationale: 'Strong English skills increase visa approval chances',
        actionItems: [
          'Take TOEFL or IELTS exam',
          'Enroll in English courses if needed',
          'Aim for minimum score requirements',
          'Practice interview English',
        ],
        resources: ['TOEFL official website', 'IELTS official website'],
      });
    }

    // Education
    if (weaknesses.some(w => w.includes('educational'))) {
      recommendations.push({
        type: 'skill-development',
        priority: 'medium',
        recommendation: 'Consider additional education or certifications',
        rationale: 'Higher education levels improve visa eligibility',
        actionItems: [
          'Research relevant degree programs',
          'Consider online/part-time options',
          'Get credential evaluation for foreign degrees',
        ],
      });
    }

    // Financial preparation
    recommendations.push({
      type: 'financial',
      priority: 'high',
      recommendation: 'Prepare comprehensive financial documentation',
      rationale: 'Financial proof is required for most visa categories',
      actionItems: [
        'Organize bank statements (6 months)',
        'Collect tax returns',
        'Document sources of income',
        'Prepare proof of assets',
      ],
    });

    // Document preparation
    recommendations.push({
      type: 'documentation',
      priority: 'high',
      recommendation: 'Start gathering required documents early',
      rationale: 'Document collection can take several months',
      actionItems: [
        'Request documents from employers',
        'Obtain educational transcripts',
        'Get translations if needed',
        'Make certified copies',
      ],
    });

    return recommendations;
  }

  private calculateSuccessRate(profile: ApplicantProfile, pathways: VisaPathway[]): number {
    if (pathways.length === 0) return 0;

    // Average suitability score of top pathways
    const topPathways = pathways.slice(0, 3);
    const avgScore = topPathways.reduce((sum, p) => sum + p.suitabilityScore, 0) / topPathways.length;

    // Adjust for profile factors
    let adjustedScore = avgScore;

    if (profile.criminalRecord) adjustedScore *= 0.5;
    if (profile.previousViolations) adjustedScore *= 0.7;

    return Math.round(Math.max(0, Math.min(100, adjustedScore)));
  }

  private isWorkVisa(visaType: VisaCategory): boolean {
    const workVisas = [
      VisaCategory.H1B_SPECIALTY,
      VisaCategory.L1_INTRACOMPANY,
      VisaCategory.O1_EXTRAORDINARY,
      VisaCategory.EB1_PRIORITY,
      VisaCategory.EB2_ADVANCED,
      VisaCategory.EB3_SKILLED,
    ];
    return workVisas.includes(visaType);
  }

  private getVisaAdvantages(visaType: VisaCategory): string[] {
    const advantages: Record<VisaCategory, string[]> = {
      [VisaCategory.H1B_SPECIALTY]: [
        'Dual intent allowed (can pursue green card)',
        'Can work for specific employer',
        '3-year validity, renewable to 6 years',
        'Spouse (H-4) can apply for work authorization',
      ],
      [VisaCategory.EB1_PRIORITY]: [
        'No labor certification required',
        'Priority date usually current (faster)',
        'Permanent residence from approval',
        'EB-1A requires no job offer',
      ],
      [VisaCategory.F1_STUDENT]: [
        'Can study at any accredited institution',
        'OPT work authorization (12-36 months)',
        'On-campus work allowed',
        'Path to H-1B or other work visas',
      ],
    };

    return advantages[visaType] || ['Case-specific advantages'];
  }

  private getVisaDisadvantages(visaType: VisaCategory): string[] {
    const disadvantages: Record<VisaCategory, string[]> = {
      [VisaCategory.H1B_SPECIALTY]: [
        'Annual cap (lottery system)',
        'Tied to specific employer',
        'Premium processing suspended periodically',
        'Requires bachelor\'s degree minimum',
      ],
      [VisaCategory.EB1_PRIORITY]: [
        'Very high standards for approval',
        'Extensive documentation required',
        'Attorney fees can be substantial',
        'Not all categories have current priority dates',
      ],
      [VisaCategory.F1_STUDENT]: [
        'Cannot work off-campus initially',
        'Must maintain full-time enrollment',
        'Tuition costs',
        'Intent to return home required',
      ],
    };

    return disadvantages[visaType] || ['Case-specific disadvantages'];
  }

  private getNextSteps(visaType: VisaCategory): string[] {
    return [
      'Consult immigration attorney for case review',
      'Gather required documentation',
      'Prepare financial proof',
      'Take required language tests',
      'Submit petition/application',
    ];
  }

  private getDisclaimer(): string {
    return 'DISCLAIMER: This assessment provides general information only and is NOT legal advice. ' +
      'Immigration laws are complex, frequently changing, and highly dependent on individual circumstances. ' +
      'This agent does not provide legal representation. Always consult with a licensed immigration attorney ' +
      'before making immigration decisions or submitting applications. Success rates and timelines are estimates ' +
      'and actual results may vary significantly.';
  }
}
