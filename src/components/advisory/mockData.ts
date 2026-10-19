import { Recommendation, MetricSummary } from './types';

export const INITIAL_METRICS: MetricSummary = {
  criticalActions: 3,
  opportunities: 7,
  completed: 12,
  potentialImpact: '₹1.2M',
};

export const INITIAL_RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'rec-1',
    title: 'Revenue Decline in Subscription Plan B',
    category: 'Revenue',
    priority: 'Critical',
    impactLevel: 'High Impact',
    status: 'Immediate Action Required',
    description:
      'Subscription Plan B shows a 15% decline in revenue over the last quarter, correlating with a 22% increase in churn in Segment B. Customer feedback indicates pricing concerns.',
    actions: [
      { id: 'act-1-1', label: 'Review and adjust retention offers for Segment B', completed: false, assignedTo: 'Growth Team', dueDate: '3 days' },
      { id: 'act-1-2', label: 'Conduct pricing analysis and competitor benchmarking', completed: false, assignedTo: 'Finance Ops', dueDate: '1 week' },
      { id: 'act-1-3', label: 'Implement targeted re-engagement campaigns', completed: false, assignedTo: 'Marketing', dueDate: '2 weeks' },
    ],
    estimatedImpact: '₹450K potential recovery',
    timeline: 'Implement within 2 weeks',
    detailedAnalysis: {
      rootCause:
        'Competitor X launched a mid-tier tier offering 20% lower price point with similar feature parity, triggering high churn amongst price-sensitive SMB accounts.',
      affectedSegments: ['Segment B (SMB)', 'Mid-Market Annual Renewals', 'APAC Region'],
      riskScore: 84,
      financialUpside: '₹450,000 / Quarter ARR Protection',
      detectionDate: '12 Oct 2026',
      owner: 'Ananya Sharma (VP Revenue Ops)',
      metricsTrend: [
        { label: 'Quarterly ARR', current: '₹2.55M', target: '₹3.00M', variance: '-15%' },
        { label: 'Segment B Churn', current: '6.8%', target: '3.2%', variance: '+112%' },
        { label: 'Renewal Rate', current: '71%', target: '88%', variance: '-17%' },
      ],
      suggestedMitigation: [
        'Roll out flexible bi-annual billing cycles with a 10% loyalty discount.',
        'Create a feature-locked starter tier for sub-50 user seats.',
        'Schedule executive outreach for top 20 accounts pending renewal.',
      ],
    },
  },
  {
    id: 'rec-2',
    title: 'Data Quality Issues Affecting Analysis',
    category: 'Data Quality',
    priority: 'Critical',
    impactLevel: 'High Impact',
    status: 'Immediate Action Required',
    description:
      '275 missing values detected in transaction records and 14 duplicate entries found. This represents 1% inconsistency rate which may impact forecasting accuracy.',
    actions: [
      { id: 'act-2-1', label: 'Fill missing values in transaction dataset', completed: false, assignedTo: 'Data Engineering', dueDate: '2 days' },
      { id: 'act-2-2', label: 'Review duplicates and merge records', completed: false, assignedTo: 'Analytics Team', dueDate: '4 days' },
      { id: 'act-2-3', label: 'Implement data validation rules at source', completed: false, assignedTo: 'DevOps & Pipeline', dueDate: '1 week' },
    ],
    estimatedImpact: 'Improved forecast accuracy by 8-12%',
    timeline: 'Resolve within 1 week',
    detailedAnalysis: {
      rootCause:
        'A webhook retry failure during the payment gateway migration caused partial record drops and duplicate insertion without unique transaction constraints.',
      affectedSegments: ['Payment Webhooks', 'Q4 Financial Models', 'BI Pipelines'],
      riskScore: 78,
      financialUpside: 'Eliminates 12% revenue variance error in board reporting',
      detectionDate: '15 Oct 2026',
      owner: 'Rohan Mehta (Principal Data Architect)',
      metricsTrend: [
        { label: 'Record Consistency', current: '98.9%', target: '99.99%', variance: '-1.09%' },
        { label: 'Missing Fields', current: '275 records', target: '0 records', variance: '+275' },
        { label: 'Duplicate Trx', current: '14 detected', target: '0 detected', variance: '+14' },
      ],
      suggestedMitigation: [
        'Run idempotent deduplication script across PostgreSQL transaction replica.',
        'Configure dead-letter queue (DLQ) alerts on AWS SQS for ingestion drops.',
        'Add schema assertion unit tests in DBT transformation pipeline.',
      ],
    },
  },
  {
    id: 'rec-3',
    title: 'Customer Onboarding Friction in Enterprise Tier',
    category: 'Customer Retention',
    priority: 'High',
    impactLevel: 'High Impact',
    status: 'In Progress',
    description:
      'Enterprise client time-to-first-value has stretched from 14 days to 31 days due to manual SSO and LDAP configuration bottlenecks. 3 key pilots are delayed.',
    actions: [
      { id: 'act-3-1', label: 'Automate SAML/OIDC self-service setup flow', completed: true, assignedTo: 'Identity Team', dueDate: 'Completed' },
      { id: 'act-3-2', label: 'Provide dedicated onboarding solutions engineer', completed: false, assignedTo: 'Customer Success', dueDate: '5 days' },
      { id: 'act-3-3', label: 'Publish interactive enterprise integration docs', completed: false, assignedTo: 'DevRel', dueDate: '10 days' },
    ],
    estimatedImpact: '₹320K potential expansion ARR',
    timeline: 'Implement within 3 weeks',
    detailedAnalysis: {
      rootCause:
        'Enterprise customers require custom IDP setups that currently necessitate manual engineering intervention, delaying deployment milestones.',
      affectedSegments: ['Tier 1 Enterprise', 'Customer Success Queue'],
      riskScore: 65,
      financialUpside: '₹320,000 / Year in faster contract conversions',
      detectionDate: '10 Oct 2026',
      owner: 'Kavita Pillai (Head of Customer Success)',
      metricsTrend: [
        { label: 'Time to Value', current: '31 Days', target: '14 Days', variance: '+121%' },
        { label: 'Pilot Conversion', current: '62%', target: '80%', variance: '-18%' },
      ],
      suggestedMitigation: [
        'Integrate WorkOS or custom SAML wizard for 1-click Okta/AzureAD linking.',
        'Standardize security audit pack to eliminate recurring compliance queries.',
      ],
    },
  },
  {
    id: 'rec-4',
    title: 'Cloud Infrastructure Resource Under-Utilization',
    category: 'Operations',
    priority: 'Medium',
    impactLevel: 'Medium Impact',
    status: 'Under Review',
    description:
      'Analytical query clusters in ap-south-1 remain provisioned at peak capacity during off-peak hours (11 PM - 7 AM IST), incurring unnecessary compute overhead.',
    actions: [
      { id: 'act-4-1', label: 'Implement auto-scaling policy based on queue depth', completed: false, assignedTo: 'Cloud Ops', dueDate: '1 week' },
      { id: 'act-4-2', label: 'Transition dev/test environments to spot instances', completed: true, assignedTo: 'DevOps', dueDate: 'Completed' },
      { id: 'act-4-3', label: 'Audit reserved instance utilization commitment', completed: false, assignedTo: 'FinOps', dueDate: '2 weeks' },
    ],
    estimatedImpact: '₹180K quarterly cloud cost reduction',
    timeline: 'Resolve within 2 weeks',
    detailedAnalysis: {
      rootCause:
        'Static node provisioning left 64 compute vCPUs idle over weekends and night hours without dynamic scale-down listeners.',
      affectedSegments: ['Infrastructure & Cloud', 'EKS Clusters', 'Monthly OPEX'],
      riskScore: 42,
      financialUpside: '₹180,000 / Quarter OPEX savings',
      detectionDate: '14 Oct 2026',
      owner: 'Vikram Sengupta (FinOps Lead)',
      metricsTrend: [
        { label: 'Idle CPU Hours', current: '38%', target: '< 10%', variance: '+28%' },
        { label: 'Monthly AWS Bill', current: '₹620K', target: '₹440K', variance: '+41%' },
      ],
      suggestedMitigation: [
        'Enable Karpenter autoscaler with off-peak scale-down crons.',
        'Purchase 1-year convertible savings plans for baseline core workers.',
      ],
    },
  },
];
