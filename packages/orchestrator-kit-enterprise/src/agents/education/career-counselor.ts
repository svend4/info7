/**
 * Career Counselor Agent
 *
 * Provides career guidance, skill assessment, and professional development planning.
 */

import { Logger, MetricsCollector, AppError, ValidationError } from '@info7/common';

/**
 * Career stage
 */
export enum CareerStage {
  ENTRY_LEVEL = 'entry-level',
  MID_CAREER = 'mid-career',
  SENIOR_LEVEL = 'senior-level',
  EXECUTIVE = 'executive',
  TRANSITION = 'transition',
  RETIREMENT_PLANNING = 'retirement-planning',
}

/**
 * Skill level
 */
export enum SkillLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

/**
 * Career field
 */
export enum CareerField {
  TECHNOLOGY = 'technology',
  HEALTHCARE = 'healthcare',
  FINANCE = 'finance',
  EDUCATION = 'education',
  ENGINEERING = 'engineering',
  CREATIVE = 'creative',
  BUSINESS = 'business',
  SCIENCE = 'science',
  LAW = 'law',
  OTHER = 'other',
}

/**
 * Skill assessment
 */
export interface SkillAssessment {
  skill: string;
  level: SkillLevel;
  yearsOfExperience: number;
  lastUsed?: string;
  certifications?: string[];
}

/**
 * Career profile
 */
export interface CareerProfile {
  fullName: string;
  age: number;
  currentRole?: string;
  currentField: CareerField;
  yearsOfExperience: number;
  careerStage: CareerStage;
  education: Array<{
    degree: string;
    field: string;
    institution: string;
    year: number;
  }>;
  skills: SkillAssessment[];
  interests: string[];
  values: Array<{
    value: string;
    importance: 'high' | 'medium' | 'low';
  }>;
  constraints?: {
    location?: string[];
    remoteWork?: 'required' | 'preferred' | 'acceptable' | 'not-preferred';
    salaryExpectations?: { min: number; max: number };
    workLifeBalance?: 'high-priority' | 'moderate' | 'flexible';
  };
}

/**
 * Career recommendation
 */
export interface CareerRecommendation {
  recommendationId: string;
  profile: CareerProfile;
  suggestedRoles: Array<{
    title: string;
    field: CareerField;
    description: string;
    matchScore: number;  // 0-100
    reasoning: string[];
    requiredSkills: Array<{
      skill: string;
      currentLevel: SkillLevel | 'none';
      requiredLevel: SkillLevel;
      gap: number;  // 0-3
    }>;
    salaryRange: { min: number; max: number };
    growthPotential: 'high' | 'medium' | 'low';
    workLifeBalance: 'excellent' | 'good' | 'moderate' | 'challenging';
  }>;
  skillDevelopmentPlan: {
    priority: 'high' | 'medium' | 'low';
    skill: string;
    currentLevel: SkillLevel | 'none';
    targetLevel: SkillLevel;
    learningPath: string[];
    estimatedTimeMonths: number;
    resources: Array<{
      type: 'course' | 'book' | 'certification' | 'practice';
      name: string;
      provider?: string;
      cost?: number;
    }>;
  }[];
  nextSteps: string[];
  timeline: {
    immediate: string[];  // 0-3 months
    shortTerm: string[];  // 3-6 months
    mediumTerm: string[];  // 6-12 months
    longTerm: string[];  // 12+ months
  };
  createdAt: number;
}

/**
 * Skill gap analysis
 */
export interface SkillGapAnalysis {
  analysisId: string;
  profile: CareerProfile;
  targetRole: string;
  targetField: CareerField;
  gaps: Array<{
    skill: string;
    importance: 'critical' | 'important' | 'nice-to-have';
    currentLevel: SkillLevel | 'none';
    requiredLevel: SkillLevel;
    gapSize: number;  // 0-3
    priority: number;  // 1-10
    acquisitionDifficulty: 'easy' | 'moderate' | 'challenging';
  }>;
  strengths: Array<{
    skill: string;
    level: SkillLevel;
    marketValue: 'high' | 'medium' | 'low';
  }>;
  developmentPlan: {
    totalEstimatedMonths: number;
    phases: Array<{
      phase: string;
      duration: number;
      skills: string[];
      milestones: string[];
    }>;
  };
  readinessScore: number;  // 0-100
  recommendations: string[];
  analyzedAt: number;
}

/**
 * Career path suggestion
 */
export interface CareerPathSuggestion {
  pathId: string;
  currentRole: string;
  targetRole: string;
  steps: Array<{
    step: number;
    role: string;
    duration: string;
    keyResponsibilities: string[];
    skillsToAcquire: string[];
    typicalSalary: { min: number; max: number };
  }>;
  totalDuration: string;
  difficulty: 'achievable' | 'challenging' | 'very-challenging';
  successFactors: string[];
  potentialObstacles: string[];
  alternativePaths: Array<{
    description: string;
    advantages: string[];
    disadvantages: string[];
  }>;
}

/**
 * Interview preparation
 */
export interface InterviewPreparation {
  role: string;
  company?: string;
  preparation: {
    technical: {
      topics: string[];
      commonQuestions: string[];
      practiceResources: string[];
    };
    behavioral: {
      competencies: string[];
      starExamples: Array<{
        situation: string;
        task: string;
        action: string;
        result: string;
      }>;
      commonQuestions: string[];
    };
    companyResearch: {
      keyPoints: string[];
      questionsToAsk: string[];
    };
  };
  tips: string[];
  redFlags: string[];
}

/**
 * Career Counselor Agent
 */
export class CareerCounselorAgent {
  private logger: Logger;
  private metrics: MetricsCollector;

  // Career field knowledge base
  private fieldKnowledge = new Map<CareerField, {
    commonRoles: string[];
    keySkills: string[];
    growthOutlook: string;
    avgSalaryRange: { min: number; max: number };
  }>();

  // Skill importance by field
  private skillImportance = new Map<string, { field: CareerField; level: 'critical' | 'important' | 'nice-to-have' }[]>();

  constructor() {
    this.logger = new Logger('career-counselor');
    this.metrics = new MetricsCollector('career-counselor');

    this.initializeKnowledgeBase();

    this.logger.info('Career Counselor Agent initialized');
  }

  /**
   * Generate personalized career recommendations
   */
  async generateRecommendations(profile: CareerProfile): Promise<CareerRecommendation> {
    const startTime = Date.now();

    try {
      this.logger.info('Generating career recommendations', {
        currentField: profile.currentField,
        careerStage: profile.careerStage
      });

      // Validate profile
      this.validateProfile(profile);

      // Find matching roles
      const suggestedRoles = this.findMatchingRoles(profile);

      // Create skill development plan
      const skillDevelopmentPlan = this.createSkillDevelopmentPlan(profile, suggestedRoles);

      // Generate next steps
      const nextSteps = this.generateNextSteps(profile, suggestedRoles);

      // Create timeline
      const timeline = this.createTimeline(profile, skillDevelopmentPlan);

      const recommendation: CareerRecommendation = {
        recommendationId: `rec-${Date.now()}`,
        profile,
        suggestedRoles: suggestedRoles.slice(0, 5),
        skillDevelopmentPlan,
        nextSteps,
        timeline,
        createdAt: Date.now(),
      };

      const duration = Date.now() - startTime;
      this.metrics.recordValue('recommendation_duration', duration);
      this.logger.info('Career recommendations generated', {
        rolesCount: suggestedRoles.length,
        duration
      });

      return recommendation;
    } catch (error) {
      this.logger.error('Recommendation generation failed', error);
      throw new AppError('Career recommendation failed', 'RECOMMENDATION_ERROR', error);
    }
  }

  /**
   * Analyze skill gaps for target role
   */
  async analyzeSkillGaps(
    profile: CareerProfile,
    targetRole: string,
    targetField: CareerField
  ): Promise<SkillGapAnalysis> {
    try {
      this.logger.info('Analyzing skill gaps', {
        targetRole,
        targetField
      });

      // Get required skills for target role
      const requiredSkills = this.getRequiredSkills(targetRole, targetField);

      // Identify gaps
      const gaps = this.identifyGaps(profile, requiredSkills);

      // Identify strengths
      const strengths = this.identifyStrengths(profile, targetField);

      // Create development plan
      const developmentPlan = this.createDevelopmentPlan(gaps);

      // Calculate readiness score
      const readinessScore = this.calculateReadinessScore(gaps, strengths);

      // Generate recommendations
      const recommendations = this.generateGapRecommendations(gaps, readinessScore);

      const analysis: SkillGapAnalysis = {
        analysisId: `analysis-${Date.now()}`,
        profile,
        targetRole,
        targetField,
        gaps,
        strengths,
        developmentPlan,
        readinessScore,
        recommendations,
        analyzedAt: Date.now(),
      };

      this.logger.info('Skill gap analysis completed', {
        gapsCount: gaps.length,
        readinessScore
      });

      return analysis;
    } catch (error) {
      this.logger.error('Skill gap analysis failed', error);
      throw new AppError('Skill gap analysis failed', 'ANALYSIS_ERROR', error);
    }
  }

  /**
   * Suggest career path progression
   */
  async suggestCareerPath(
    currentRole: string,
    targetRole: string,
    profile: CareerProfile
  ): Promise<CareerPathSuggestion> {
    try {
      this.logger.info('Suggesting career path', {
        from: currentRole,
        to: targetRole
      });

      // Determine path steps
      const steps = this.determinePathSteps(currentRole, targetRole, profile);

      // Calculate total duration
      const totalDuration = this.calculateTotalDuration(steps);

      // Assess difficulty
      const difficulty = this.assessPathDifficulty(steps, profile);

      // Identify success factors
      const successFactors = this.identifySuccessFactors(steps, profile);

      // Identify potential obstacles
      const potentialObstacles = this.identifyObstacles(steps, profile);

      // Generate alternative paths
      const alternativePaths = this.generateAlternativePaths(currentRole, targetRole);

      const pathSuggestion: CareerPathSuggestion = {
        pathId: `path-${Date.now()}`,
        currentRole,
        targetRole,
        steps,
        totalDuration,
        difficulty,
        successFactors,
        potentialObstacles,
        alternativePaths,
      };

      this.logger.info('Career path suggested', {
        stepsCount: steps.length,
        duration: totalDuration
      });

      return pathSuggestion;
    } catch (error) {
      this.logger.error('Career path suggestion failed', error);
      throw new AppError('Career path suggestion failed', 'PATH_ERROR', error);
    }
  }

  /**
   * Prepare interview guidance
   */
  async prepareForInterview(
    role: string,
    field: CareerField,
    company?: string
  ): Promise<InterviewPreparation> {
    try {
      this.logger.info('Preparing interview guidance', {
        role,
        field
      });

      // Technical preparation
      const technical = this.prepareTechnicalQuestions(role, field);

      // Behavioral preparation
      const behavioral = this.prepareBehavioralQuestions(role);

      // Company research
      const companyResearch = this.prepareCompanyResearch(company);

      // General tips
      const tips = this.getInterviewTips(role, field);

      // Red flags to watch for
      const redFlags = this.getInterviewRedFlags();

      const preparation: InterviewPreparation = {
        role,
        company,
        preparation: {
          technical,
          behavioral,
          companyResearch,
        },
        tips,
        redFlags,
      };

      this.logger.info('Interview preparation completed');

      return preparation;
    } catch (error) {
      this.logger.error('Interview preparation failed', error);
      throw new AppError('Interview preparation failed', 'INTERVIEW_PREP_ERROR', error);
    }
  }

  // ===== Private Methods =====

  private initializeKnowledgeBase(): void {
    // Technology field
    this.fieldKnowledge.set(CareerField.TECHNOLOGY, {
      commonRoles: [
        'Software Engineer',
        'Data Scientist',
        'Product Manager',
        'DevOps Engineer',
        'Full Stack Developer',
        'Mobile Developer',
        'AI/ML Engineer',
        'Cloud Architect',
      ],
      keySkills: [
        'Programming',
        'System Design',
        'Algorithms',
        'Cloud Computing',
        'Database Management',
        'Problem Solving',
      ],
      growthOutlook: 'Strong growth expected, high demand',
      avgSalaryRange: { min: 80000, max: 180000 },
    });

    // Healthcare field
    this.fieldKnowledge.set(CareerField.HEALTHCARE, {
      commonRoles: [
        'Physician',
        'Nurse Practitioner',
        'Healthcare Administrator',
        'Medical Researcher',
        'Physical Therapist',
      ],
      keySkills: [
        'Clinical Knowledge',
        'Patient Care',
        'Communication',
        'Empathy',
        'Critical Thinking',
      ],
      growthOutlook: 'Strong growth, aging population',
      avgSalaryRange: { min: 60000, max: 250000 },
    });

    // Finance field
    this.fieldKnowledge.set(CareerField.FINANCE, {
      commonRoles: [
        'Financial Analyst',
        'Investment Banker',
        'Portfolio Manager',
        'Financial Advisor',
        'Risk Manager',
      ],
      keySkills: [
        'Financial Analysis',
        'Excel/Modeling',
        'Market Knowledge',
        'Communication',
        'Risk Management',
      ],
      growthOutlook: 'Moderate growth, competitive',
      avgSalaryRange: { min: 70000, max: 200000 },
    });

    this.logger.debug('Career knowledge base initialized');
  }

  private validateProfile(profile: CareerProfile): void {
    if (!profile.fullName || profile.fullName.trim() === '') {
      throw new ValidationError('Full name is required');
    }

    if (profile.age < 16 || profile.age > 80) {
      throw new ValidationError('Invalid age');
    }

    if (profile.skills.length === 0) {
      throw new ValidationError('At least one skill is required');
    }
  }

  private findMatchingRoles(profile: CareerProfile): CareerRecommendation['suggestedRoles'] {
    const roles: CareerRecommendation['suggestedRoles'] = [];

    // Get roles from current and related fields
    const fieldsToConsider = [profile.currentField];

    // Add related fields based on interests
    if (profile.interests.includes('technology')) {
      fieldsToConsider.push(CareerField.TECHNOLOGY);
    }

    for (const field of fieldsToConsider) {
      const fieldInfo = this.fieldKnowledge.get(field);
      if (!fieldInfo) continue;

      for (const role of fieldInfo.commonRoles) {
        const matchScore = this.calculateRoleMatch(profile, role, field);

        if (matchScore > 50) {
          const requiredSkills = this.getRequiredSkillsForRole(role, field, profile);

          roles.push({
            title: role,
            field,
            description: `${role} in ${field} field`,
            matchScore,
            reasoning: this.generateMatchReasoning(profile, role, matchScore),
            requiredSkills,
            salaryRange: fieldInfo.avgSalaryRange,
            growthPotential: matchScore > 80 ? 'high' : matchScore > 65 ? 'medium' : 'low',
            workLifeBalance: this.estimateWorkLifeBalance(role, field),
          });
        }
      }
    }

    return roles.sort((a, b) => b.matchScore - a.matchScore);
  }

  private calculateRoleMatch(profile: CareerProfile, role: string, field: CareerField): number {
    let score = 50;  // Base score

    // Same field bonus
    if (profile.currentField === field) {
      score += 20;
    }

    // Experience level match
    if (profile.careerStage === CareerStage.ENTRY_LEVEL) {
      if (role.includes('Junior') || role.includes('Associate')) {
        score += 15;
      }
    } else if (profile.careerStage === CareerStage.SENIOR_LEVEL) {
      if (role.includes('Senior') || role.includes('Lead')) {
        score += 15;
      }
    }

    // Skill match
    const requiredSkills = this.getRequiredSkills(role, field);
    const matchingSkills = profile.skills.filter(s =>
      requiredSkills.some(rs => rs.skill.toLowerCase().includes(s.skill.toLowerCase()))
    );
    score += Math.min(20, matchingSkills.length * 5);

    return Math.min(100, score);
  }

  private createSkillDevelopmentPlan(
    profile: CareerProfile,
    roles: CareerRecommendation['suggestedRoles']
  ): CareerRecommendation['skillDevelopmentPlan'] {
    const plan: CareerRecommendation['skillDevelopmentPlan'] = [];

    if (roles.length === 0) return plan;

    // Focus on top role
    const topRole = roles[0];

    // Identify skills with gaps
    const skillsWithGaps = topRole.requiredSkills.filter(rs => rs.gap > 0);

    for (const skillGap of skillsWithGaps.slice(0, 5)) {
      const priority = skillGap.gap >= 2 ? 'high' : skillGap.gap === 1 ? 'medium' : 'low';

      plan.push({
        priority,
        skill: skillGap.skill,
        currentLevel: skillGap.currentLevel,
        targetLevel: skillGap.requiredLevel,
        learningPath: this.generateLearningPath(skillGap.skill, skillGap.currentLevel, skillGap.requiredLevel),
        estimatedTimeMonths: skillGap.gap * 3,
        resources: this.suggestLearningResources(skillGap.skill),
      });
    }

    return plan.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  private generateNextSteps(
    profile: CareerProfile,
    roles: CareerRecommendation['suggestedRoles']
  ): string[] {
    const steps: string[] = [];

    if (roles.length > 0) {
      const topRole = roles[0];
      steps.push(`Research ${topRole.title} role in detail`);
      steps.push(`Connect with professionals in ${topRole.field}`);

      if (topRole.requiredSkills.some(rs => rs.gap > 0)) {
        steps.push('Start addressing skill gaps (see development plan)');
      }
    }

    steps.push('Update resume and LinkedIn profile');
    steps.push('Build portfolio or showcase projects');
    steps.push('Network with industry professionals');
    steps.push('Apply to 2-3 roles per week');

    return steps;
  }

  private createTimeline(
    profile: CareerProfile,
    plan: CareerRecommendation['skillDevelopmentPlan']
  ): CareerRecommendation['timeline'] {
    return {
      immediate: [
        'Update career profiles (LinkedIn, Resume)',
        'Start high-priority skill development',
        'Research target companies',
      ],
      shortTerm: [
        'Complete online courses for critical skills',
        'Build portfolio projects',
        'Attend industry events',
      ],
      mediumTerm: [
        'Obtain relevant certifications',
        'Contribute to open source (if applicable)',
        'Apply to target roles',
      ],
      longTerm: [
        'Continue professional development',
        'Build industry network',
        'Seek mentorship opportunities',
      ],
    };
  }

  private getRequiredSkills(role: string, field: CareerField): Array<{
    skill: string;
    level: SkillLevel;
    importance: 'critical' | 'important' | 'nice-to-have';
  }> {
    // Simplified - in production would have comprehensive database
    const techSkills = [
      { skill: 'Programming', level: SkillLevel.ADVANCED, importance: 'critical' as const },
      { skill: 'System Design', level: SkillLevel.INTERMEDIATE, importance: 'important' as const },
      { skill: 'Algorithms', level: SkillLevel.INTERMEDIATE, importance: 'important' as const },
    ];

    const financeSkills = [
      { skill: 'Financial Analysis', level: SkillLevel.ADVANCED, importance: 'critical' as const },
      { skill: 'Excel', level: SkillLevel.ADVANCED, importance: 'critical' as const },
      { skill: 'Communication', level: SkillLevel.INTERMEDIATE, importance: 'important' as const },
    ];

    return field === CareerField.TECHNOLOGY ? techSkills :
           field === CareerField.FINANCE ? financeSkills :
           [];
  }

  private getRequiredSkillsForRole(
    role: string,
    field: CareerField,
    profile: CareerProfile
  ): CareerRecommendation['suggestedRoles'][0]['requiredSkills'] {
    const required = this.getRequiredSkills(role, field);

    return required.map(rs => {
      const currentSkill = profile.skills.find(s =>
        s.skill.toLowerCase().includes(rs.skill.toLowerCase())
      );

      const currentLevel = currentSkill?.level || 'none';
      const gap = currentLevel === 'none' ? 3 :
                  this.calculateSkillGap(currentLevel as SkillLevel, rs.level);

      return {
        skill: rs.skill,
        currentLevel,
        requiredLevel: rs.level,
        gap,
      };
    });
  }

  private calculateSkillGap(current: SkillLevel, required: SkillLevel): number {
    const levels = {
      [SkillLevel.BEGINNER]: 1,
      [SkillLevel.INTERMEDIATE]: 2,
      [SkillLevel.ADVANCED]: 3,
      [SkillLevel.EXPERT]: 4,
    };

    return Math.max(0, levels[required] - levels[current]);
  }

  private generateMatchReasoning(profile: CareerProfile, role: string, score: number): string[] {
    const reasoning: string[] = [];

    if (score > 80) {
      reasoning.push('Strong match based on current skills and experience');
    } else if (score > 65) {
      reasoning.push('Good match with some skill development needed');
    } else {
      reasoning.push('Achievable with focused skill development');
    }

    if (profile.currentField) {
      reasoning.push(`Experience in ${profile.currentField} is transferable`);
    }

    return reasoning;
  }

  private estimateWorkLifeBalance(role: string, field: CareerField): 'excellent' | 'good' | 'moderate' | 'challenging' {
    // Simplified estimation
    if (field === CareerField.FINANCE && role.includes('Investment Banking')) {
      return 'challenging';
    }
    if (field === CareerField.HEALTHCARE && role.includes('Physician')) {
      return 'challenging';
    }
    return 'good';
  }

  private identifyGaps(
    profile: CareerProfile,
    requiredSkills: Array<{ skill: string; level: SkillLevel; importance: 'critical' | 'important' | 'nice-to-have' }>
  ): SkillGapAnalysis['gaps'] {
    const gaps: SkillGapAnalysis['gaps'] = [];

    for (const required of requiredSkills) {
      const currentSkill = profile.skills.find(s =>
        s.skill.toLowerCase() === required.skill.toLowerCase()
      );

      const currentLevel = currentSkill?.level || 'none';
      const gapSize = currentLevel === 'none' ? 3 :
                     this.calculateSkillGap(currentLevel, required.level);

      if (gapSize > 0) {
        gaps.push({
          skill: required.skill,
          importance: required.importance,
          currentLevel,
          requiredLevel: required.level,
          gapSize,
          priority: required.importance === 'critical' ? 10 : required.importance === 'important' ? 7 : 5,
          acquisitionDifficulty: gapSize >= 2 ? 'challenging' : gapSize === 1 ? 'moderate' : 'easy',
        });
      }
    }

    return gaps.sort((a, b) => b.priority - a.priority);
  }

  private identifyStrengths(profile: CareerProfile, field: CareerField): SkillGapAnalysis['strengths'] {
    return profile.skills
      .filter(s => s.level === SkillLevel.ADVANCED || s.level === SkillLevel.EXPERT)
      .map(s => ({
        skill: s.skill,
        level: s.level,
        marketValue: s.level === SkillLevel.EXPERT ? 'high' : 'medium',
      }));
  }

  private createDevelopmentPlan(gaps: SkillGapAnalysis['gaps']): SkillGapAnalysis['developmentPlan'] {
    const criticalGaps = gaps.filter(g => g.importance === 'critical');
    const importantGaps = gaps.filter(g => g.importance === 'important');

    const phases = [];

    if (criticalGaps.length > 0) {
      phases.push({
        phase: 'Foundation (Critical Skills)',
        duration: criticalGaps.reduce((sum, g) => sum + g.gapSize * 2, 0),
        skills: criticalGaps.map(g => g.skill),
        milestones: ['Complete foundational courses', 'Build practice projects'],
      });
    }

    if (importantGaps.length > 0) {
      phases.push({
        phase: 'Enhancement (Important Skills)',
        duration: importantGaps.reduce((sum, g) => sum + g.gapSize * 2, 0),
        skills: importantGaps.map(g => g.skill),
        milestones: ['Gain practical experience', 'Obtain certifications'],
      });
    }

    const totalMonths = phases.reduce((sum, p) => sum + p.duration, 0);

    return {
      totalEstimatedMonths: totalMonths,
      phases,
    };
  }

  private calculateReadinessScore(gaps: SkillGapAnalysis['gaps'], strengths: SkillGapAnalysis['strengths']): number {
    let score = 50;  // Base score

    // Penalize for critical gaps
    const criticalGaps = gaps.filter(g => g.importance === 'critical');
    score -= criticalGaps.length * 10;

    // Bonus for strengths
    score += Math.min(30, strengths.length * 10);

    return Math.max(0, Math.min(100, score));
  }

  private generateGapRecommendations(gaps: SkillGapAnalysis['gaps'], readinessScore: number): string[] {
    const recommendations: string[] = [];

    if (readinessScore >= 70) {
      recommendations.push('You are well-positioned for this role');
      recommendations.push('Focus on addressing remaining gaps while applying');
    } else if (readinessScore >= 50) {
      recommendations.push('Develop critical skills before applying');
      recommendations.push('Consider related roles while building skills');
    } else {
      recommendations.push('Significant skill development needed');
      recommendations.push('Set realistic timeline of 6-12 months');
      recommendations.push('Consider entry-level positions in the field');
    }

    const criticalGaps = gaps.filter(g => g.importance === 'critical');
    if (criticalGaps.length > 0) {
      recommendations.push(`Priority: Master ${criticalGaps[0].skill}`);
    }

    return recommendations;
  }

  private determinePathSteps(
    current: string,
    target: string,
    profile: CareerProfile
  ): CareerPathSuggestion['steps'] {
    // Simplified path - in production would have detailed career ladders
    const steps: CareerPathSuggestion['steps'] = [];

    const isSignificantJump = !target.toLowerCase().includes(current.toLowerCase().split(' ')[0]);

    if (isSignificantJump) {
      // Need intermediate step
      steps.push({
        step: 1,
        role: current,
        duration: '1-2 years',
        keyResponsibilities: ['Build foundational experience', 'Develop core skills'],
        skillsToAcquire: ['Domain knowledge', 'Technical skills'],
        typicalSalary: { min: 60000, max: 90000 },
      });

      steps.push({
        step: 2,
        role: `Mid-level ${target.split(' ').pop()}`,
        duration: '2-3 years',
        keyResponsibilities: ['Take on more responsibility', 'Lead small projects'],
        skillsToAcquire: ['Leadership', 'Project management'],
        typicalSalary: { min: 80000, max: 120000 },
      });
    }

    steps.push({
      step: steps.length + 1,
      role: target,
      duration: 'Career goal',
      keyResponsibilities: ['Lead major initiatives', 'Strategic decision making'],
      skillsToAcquire: ['Advanced expertise', 'Thought leadership'],
      typicalSalary: { min: 100000, max: 180000 },
    });

    return steps;
  }

  private calculateTotalDuration(steps: CareerPathSuggestion['steps']): string {
    const totalYears = steps.reduce((sum, step) => {
      const years = step.duration.includes('-') ?
        parseInt(step.duration.split('-')[1]) :
        3;
      return sum + years;
    }, 0);

    return `${totalYears}-${totalYears + 2} years`;
  }

  private assessPathDifficulty(
    steps: CareerPathSuggestion['steps'],
    profile: CareerProfile
  ): CareerPathSuggestion['difficulty'] {
    return steps.length >= 3 ? 'very-challenging' :
           steps.length === 2 ? 'challenging' :
           'achievable';
  }

  private identifySuccessFactors(
    steps: CareerPathSuggestion['steps'],
    profile: CareerProfile
  ): string[] {
    return [
      'Consistent skill development',
      'Strong professional network',
      'Track record of results',
      'Adaptability and learning mindset',
      'Mentorship and guidance',
    ];
  }

  private identifyObstacles(
    steps: CareerPathSuggestion['steps'],
    profile: CareerProfile
  ): string[] {
    return [
      'Skill gaps in critical areas',
      'Limited relevant experience',
      'Industry competition',
      'Economic conditions',
    ];
  }

  private generateAlternativePaths(current: string, target: string): CareerPathSuggestion['alternativePaths'] {
    return [
      {
        description: 'Lateral move first, then vertical',
        advantages: ['Broader experience', 'Lower risk'],
        disadvantages: ['Takes longer', 'May require relocation'],
      },
      {
        description: 'Consulting/contracting route',
        advantages: ['Diverse experience', 'Faster skill building'],
        disadvantages: ['Less stability', 'Requires self-marketing'],
      },
    ];
  }

  private generateLearningPath(skill: string, current: SkillLevel | 'none', target: SkillLevel): string[] {
    const paths: string[] = [];

    if (current === 'none' || current === SkillLevel.BEGINNER) {
      paths.push('Complete beginner course or bootcamp');
      paths.push('Practice with small projects');
    }

    if (target === SkillLevel.INTERMEDIATE || target === SkillLevel.ADVANCED) {
      paths.push('Build real-world projects');
      paths.push('Contribute to open source or team projects');
    }

    if (target === SkillLevel.ADVANCED || target === SkillLevel.EXPERT) {
      paths.push('Take advanced specialized courses');
      paths.push('Obtain professional certification');
      paths.push('Mentor others and teach');
    }

    return paths;
  }

  private suggestLearningResources(skill: string): CareerRecommendation['skillDevelopmentPlan'][0]['resources'] {
    return [
      { type: 'course', name: `${skill} Fundamentals`, provider: 'Coursera/Udemy', cost: 50 },
      { type: 'book', name: `${skill} in Practice`, cost: 40 },
      { type: 'certification', name: `Professional ${skill} Certificate`, cost: 300 },
      { type: 'practice', name: `${skill} Practice Projects`, cost: 0 },
    ];
  }

  private prepareTechnicalQuestions(role: string, field: CareerField): InterviewPreparation['preparation']['technical'] {
    return {
      topics: ['Core competencies', 'Problem-solving', 'Technical knowledge'],
      commonQuestions: [
        'Describe your experience with [key technology/skill]',
        'Walk through a challenging project you completed',
        'How do you approach problem-solving?',
      ],
      practiceResources: ['LeetCode', 'HackerRank', 'Practice problems'],
    };
  }

  private prepareBehavioralQuestions(role: string): InterviewPreparation['preparation']['behavioral'] {
    return {
      competencies: ['Leadership', 'Teamwork', 'Adaptability', 'Problem-solving'],
      starExamples: [
        {
          situation: 'Challenging project situation',
          task: 'Your responsibility',
          action: 'Steps you took',
          result: 'Positive outcome achieved',
        },
      ],
      commonQuestions: [
        'Tell me about a time you faced a challenge',
        'Describe a situation where you led a team',
        'How do you handle conflicting priorities?',
      ],
    };
  }

  private prepareCompanyResearch(company?: string): InterviewPreparation['preparation']['companyResearch'] {
    return {
      keyPoints: [
        'Company mission and values',
        'Recent news and developments',
        'Products and services',
        'Company culture',
      ],
      questionsToAsk: [
        'What does success look like in this role?',
        'How does the team collaborate?',
        'What are the growth opportunities?',
        'What are the biggest challenges facing the team?',
      ],
    };
  }

  private getInterviewTips(role: string, field: CareerField): string[] {
    return [
      'Research the company thoroughly',
      'Practice STAR method for behavioral questions',
      'Prepare specific examples from your experience',
      'Dress professionally and arrive early',
      'Prepare thoughtful questions for the interviewer',
      'Send follow-up thank you email within 24 hours',
    ];
  }

  private getInterviewRedFlags(): string[] {
    return [
      'Vague job description or responsibilities',
      'High turnover rate',
      'Lack of growth opportunities',
      'Poor communication during process',
      'Unrealistic expectations',
      'Negative company reviews',
    ];
  }
}
