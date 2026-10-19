export type PriorityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export type RecommendationCategory = 
  | 'Revenue' 
  | 'Data Quality' 
  | 'Customer Retention' 
  | 'Operations' 
  | 'Compliance';

export type RecommendationStatus = 
  | 'Immediate Action Required' 
  | 'In Progress' 
  | 'Under Review' 
  | 'Completed';

export interface ActionItem {
  id: string;
  label: string;
  completed: boolean;
  assignedTo?: string;
  dueDate?: string;
}

export interface Recommendation {
  id: string;
  title: string;
  category: RecommendationCategory;
  priority: PriorityLevel;
  impactLevel: 'High Impact' | 'Medium Impact' | 'Low Impact';
  status: RecommendationStatus;
  description: string;
  actions: ActionItem[];
  estimatedImpact: string;
  timeline: string;
  // Detailed Information Panel Data
  detailedAnalysis?: {
    rootCause: string;
    affectedSegments: string[];
    riskScore: number; // 0 - 100
    financialUpside: string;
    detectionDate: string;
    owner: string;
    metricsTrend: {
      label: string;
      current: string;
      target: string;
      variance: string;
    }[];
    suggestedMitigation: string[];
  };
}

export interface MetricSummary {
  criticalActions: number;
  opportunities: number;
  completed: number;
  potentialImpact: string;
}

export interface AdvisoryFilterOptions {
  category: string;
  priority: string;
  status: string;
  searchQuery: string;
}
