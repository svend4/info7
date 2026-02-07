/**
 * Professional Agents Usage Examples
 *
 * Demonstrates the usage of new professional agents.
 */

import {
  ContractLawyerAgent,
  ContractDraftRequest,
} from './agents/legal/contract-lawyer';

import {
  BenefitsCalculatorAgent,
  BenefitInput,
} from './agents/social/benefits-calculator';

import {
  HomeManagerAgent,
  HouseholdPreferences,
} from './agents/domestic/home-manager';

import {
  ElderlyCareAgent,
  Vitals,
  MedicationRecord,
  Activity,
} from './agents/care/elderly-care';

/**
 * Example usage of all professional agents
 */
async function runProfessionalAgentsExample() {
  console.log('🤖 Professional Agents - Usage Examples\n');
  console.log('━'.repeat(60));
  console.log();

  // ═══════════════════════════════════════════════════════════════
  // Example 1: Contract Lawyer Agent
  // ═══════════════════════════════════════════════════════════════

  console.log('Example 1: Contract Lawyer Agent\n');

  const contractLawyer = new ContractLawyerAgent();

  // Analyze a contract
  const sampleContract = `
    This Service Agreement is made between Company A and Company B.

    1. SERVICES
    The Provider agrees to deliver software development services.

    2. COMPENSATION
    Client shall pay $100,000 upon completion.

    3. INDEMNIFICATION
    Provider agrees to indemnify Client against all claims, damages, and expenses.

    4. LIABILITY
    Provider accepts unlimited liability for all damages.

    5. NON-COMPETE
    Provider agrees not to compete with Client for 5 years worldwide.

    6. AUTO-RENEWAL
    This agreement automatically renews for successive 1-year terms.
  `;

  const analysis = await contractLawyer.analyzeContract('contract-001', sampleContract);

  console.log('Contract Analysis Results:');
  console.log(`  Risk Score: ${analysis.score}/100`);
  console.log(`  Summary: ${analysis.summary}`);
  console.log(`  Risks Identified: ${analysis.risks.length}`);
  console.log();

  if (analysis.risks.length > 0) {
    console.log('  Top Risks:');
    analysis.risks.slice(0, 3).forEach((risk, i) => {
      console.log(`    ${i + 1}. ${risk.type} (${risk.severity}): ${risk.description}`);
      console.log(`       → ${risk.recommendation}`);
    });
    console.log();
  }

  console.log('  Recommendations:');
  analysis.recommendations.slice(0, 3).forEach((rec, i) => {
    console.log(`    ${i + 1}. ${rec}`);
  });
  console.log();

  // Draft a contract
  console.log('Drafting NDA Contract...\n');

  const draftRequest: ContractDraftRequest = {
    type: 'nda',
    parties: [
      { name: 'TechCorp Inc.', role: 'Disclosing Party', jurisdiction: 'US' },
      { name: 'DevStudio LLC', role: 'Receiving Party', jurisdiction: 'US' },
    ],
    terms: {
      purpose: 'evaluation of potential partnership',
      term: '2',
    },
    jurisdiction: 'California, USA',
    language: 'English',
  };

  const draft = await contractLawyer.draftContract(draftRequest);
  console.log('Contract Draft (first 200 chars):');
  console.log(`  ${draft.substring(0, 200)}...`);
  console.log();

  console.log('━'.repeat(60));
  console.log();

  // ═══════════════════════════════════════════════════════════════
  // Example 2: Benefits Calculator Agent
  // ═══════════════════════════════════════════════════════════════

  console.log('Example 2: Benefits Calculator Agent\n');

  const benefitsCalculator = new BenefitsCalculatorAgent();

  const benefitInput: BenefitInput = {
    age: 67,
    hasDisability: true,
    disabilityGroup: '2' as any,
    workExperience: 25,
    childrenCount: 2,
    childrenAges: [15, 8],
    isPregnant: false,
    monthlyIncome: 20000,
    region: 'Moscow',
    livingArea: 65,
    isEmployed: false,
    lastSalary: 35000,
  };

  const benefits = await benefitsCalculator.calculateBenefits(benefitInput);

  console.log('Benefits Calculation Results:');
  console.log(`  Eligible Benefits: ${benefits.eligible.length}`);
  console.log(`  Total Monthly: ${benefits.totalMonthly.toLocaleString('ru-RU')} руб`);
  console.log(`  Total Yearly: ${benefits.totalYearly.toLocaleString('ru-RU')} руб`);
  console.log();

  console.log('  Eligible Benefits:');
  benefits.eligible.forEach((benefit, i) => {
    console.log(`    ${i + 1}. ${benefit.name} (${benefit.law})`);
    console.log(`       Amount: ${benefit.amount.toLocaleString('ru-RU')} руб/${benefit.frequency === 'monthly' ? 'месяц' : 'год'}`);
  });
  console.log();

  console.log('  Recommendations:');
  benefits.recommendations.forEach((rec, i) => {
    console.log(`    ${i + 1}. ${rec}`);
  });
  console.log();

  console.log('  Next Steps:');
  benefits.nextSteps.slice(0, 3).forEach((step, i) => {
    console.log(`    ${i + 1}. ${step}`);
  });
  console.log();

  console.log('━'.repeat(60));
  console.log();

  // ═══════════════════════════════════════════════════════════════
  // Example 3: Home Manager Agent
  // ═══════════════════════════════════════════════════════════════

  console.log('Example 3: Home Manager Agent\n');

  const homeManager = new HomeManagerAgent();

  const householdPrefs: HouseholdPreferences = {
    adults: 2,
    children: 2,
    pets: 1,
    homeSize: 100,
    rooms: 4,
    hasgarden: true,
    cleaningLevel: 'standard',
    cookingFrequency: 'daily',
    budgetConstraint: 'moderate',
    availableTime: 15,
    preferredDays: ['Saturday', 'Sunday'],
  };

  const householdPlan = await homeManager.createHouseholdPlan(householdPrefs);

  console.log('Household Plan Results:');
  console.log(`  Total Tasks: ${householdPlan.tasks.length}`);
  console.log(`  Weekly Time Required: ${householdPlan.estimatedTimePerWeek.toFixed(1)} hours`);
  console.log(`  Monthly Budget: ${householdPlan.budget.total.toLocaleString('ru-RU')} руб`);
  console.log();

  console.log('  Task Categories:');
  const categories = new Map<string, number>();
  householdPlan.tasks.forEach(task => {
    categories.set(task.category, (categories.get(task.category) || 0) + 1);
  });
  for (const [category, count] of categories) {
    console.log(`    • ${category}: ${count} tasks`);
  }
  console.log();

  console.log('  Top 5 Tasks:');
  householdPlan.tasks.slice(0, 5).forEach((task, i) => {
    console.log(`    ${i + 1}. ${task.name} (${task.frequency})`);
    console.log(`       Category: ${task.category}, Priority: ${task.priority}`);
    console.log(`       Estimated Time: ${task.estimatedTime} min`);
  });
  console.log();

  console.log('  Budget Breakdown:');
  householdPlan.budget.categories.forEach(cat => {
    console.log(`    • ${cat.name}: ${cat.plannedAmount.toLocaleString('ru-RU')} руб`);
  });
  console.log();

  console.log('  Automation Suggestions:');
  householdPlan.automations.slice(0, 3).forEach((auto, i) => {
    console.log(`    ${i + 1}. ${auto.device} for "${auto.task}"`);
    console.log(`       Cost: ${auto.estimatedCost.toLocaleString('ru-RU')} руб`);
    console.log(`       Time Saved: ${auto.timeSaved.toFixed(1)} hours/week`);
    console.log(`       Payback: ${auto.paybackPeriod} months`);
  });
  console.log();

  console.log('  Recommendations:');
  householdPlan.recommendations.forEach((rec, i) => {
    console.log(`    ${i + 1}. ${rec}`);
  });
  console.log();

  console.log('━'.repeat(60));
  console.log();

  // ═══════════════════════════════════════════════════════════════
  // Example 4: Elderly Care Agent
  // ═══════════════════════════════════════════════════════════════

  console.log('Example 4: Elderly Care Agent\n');

  const elderlyCare = new ElderlyCareAgent();

  const patientVitals: Vitals = {
    heartRate: 75,
    bloodPressure: {
      systolic: 145,  // Slightly elevated
      diastolic: 85,
    },
    temperature: 36.6,
    oxygenSaturation: 96,
    respiratoryRate: 16,
    measuredAt: Date.now(),
  };

  const medications: MedicationRecord[] = [
    {
      medicationId: 'med-001',
      scheduledTime: '08:00',
      taken: true,
      skipped: false,
      takenAt: Date.now() - 2 * 60 * 60 * 1000,  // 2 hours ago
    },
    {
      medicationId: 'med-002',
      scheduledTime: '14:00',
      taken: false,
      skipped: false,
      // Not taken yet (overdue)
    },
    {
      medicationId: 'med-003',
      scheduledTime: '20:00',
      taken: true,
      skipped: false,
      takenAt: Date.now() - 12 * 60 * 60 * 1000,  // yesterday
    },
  ];

  const activities: Activity[] = [
    {
      type: 'walking',
      startTime: Date.now() - 3 * 60 * 60 * 1000,
      endTime: Date.now() - 2.5 * 60 * 60 * 1000,
      duration: 30,
      location: 'living room',
    },
    {
      type: 'sitting',
      startTime: Date.now() - 2 * 60 * 60 * 1000,
      duration: 120,
      location: 'armchair',
    },
  ];

  const healthStatus = await elderlyCare.monitorPatient(
    'patient-001',
    patientVitals,
    medications,
    activities
  );

  console.log('Health Monitoring Results:');
  console.log(`  Overall Status: ${healthStatus.overallStatus.toUpperCase()}`);
  console.log(`  Medication Compliance: ${healthStatus.medications.compliance}%`);
  console.log(`  Active Alerts: ${healthStatus.alerts.length}`);
  console.log();

  console.log('  Current Vitals:');
  console.log(`    Heart Rate: ${healthStatus.vitals.heartRate} bpm`);
  console.log(`    Blood Pressure: ${healthStatus.vitals.bloodPressure.systolic}/${healthStatus.vitals.bloodPressure.diastolic} mmHg`);
  console.log(`    Temperature: ${healthStatus.vitals.temperature}°C`);
  console.log(`    Oxygen Saturation: ${healthStatus.vitals.oxygenSaturation}%`);
  console.log();

  if (healthStatus.alerts.length > 0) {
    console.log('  Health Alerts:');
    healthStatus.alerts.forEach((alert, i) => {
      console.log(`    ${i + 1}. [${alert.severity.toUpperCase()}] ${alert.type}`);
      console.log(`       ${alert.message}`);
    });
    console.log();
  }

  console.log('  Care Recommendations:');
  healthStatus.recommendations.forEach((rec, i) => {
    console.log(`    ${i + 1}. ${rec}`);
  });
  console.log();

  console.log('  Recent Activities:');
  activities.slice(0, 3).forEach((activity, i) => {
    const ago = Math.round((Date.now() - activity.startTime) / (1000 * 60 * 60));
    console.log(`    ${i + 1}. ${activity.type} - ${activity.duration} min (${ago}h ago)`);
  });
  console.log();

  console.log('━'.repeat(60));
  console.log();
  console.log('✅ Professional Agents examples completed!\n');
}

// Run example if executed directly
if (require.main === module) {
  runProfessionalAgentsExample().catch(console.error);
}

export { runProfessionalAgentsExample };
