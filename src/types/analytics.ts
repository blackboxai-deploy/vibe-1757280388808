export interface AnalyticsMetrics {
  // Overview Metrics
  totalCampaigns: number;
  activeCampaigns: number;
  totalCalls: number;
  totalContacts: number;
  
  // Performance Metrics
  overallSuccessRate: number;
  averageCallDuration: number;
  averageSentimentScore: number;
  totalCallMinutes: number;
  
  // Time-based Metrics
  callsToday: number;
  callsThisWeek: number;
  callsThisMonth: number;
  
  // Status Distribution
  callStatusDistribution: {
    completed: number;
    inProgress: number;
    failed: number;
    noAnswer: number;
    busy: number;
    optedOut: number;
  };
  
  // Sentiment Distribution
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export interface TimeSeriesData {
  timestamp: Date;
  value: number;
  label?: string;
}

export interface CallAnalytics {
  // Volume Metrics
  callVolume: TimeSeriesData[];
  successRate: TimeSeriesData[];
  averageDuration: TimeSeriesData[];
  
  // Sentiment Analysis
  sentimentTrends: TimeSeriesData[];
  sentimentByTimeOfDay: {
    hour: number;
    positive: number;
    neutral: number;
    negative: number;
  }[];
  
  // Performance Analysis
  answerRateByHour: {
    hour: number;
    answerRate: number;
    totalCalls: number;
  }[];
  
  // Geographic Analysis
  callsByRegion?: {
    region: string;
    calls: number;
    successRate: number;
    avgSentiment: number;
  }[];
}

export interface CampaignPerformance {
  campaignId: string;
  campaignName: string;
  
  // Key Metrics
  totalCalls: number;
  completedCalls: number;
  successRate: number;
  averageDuration: number;
  averageSentiment: number;
  
  // Progress Metrics
  progressPercentage: number;
  estimatedCompletion?: Date;
  callsPerHour: number;
  
  // Quality Metrics
  transcriptionAccuracy?: number;
  humanEscalationRate: number;
  optOutRate: number;
  
  // Cost Analysis
  estimatedCost?: number;
  costPerCall?: number;
  costPerCompletion?: number;
}

export interface RealTimeStats {
  // Live Metrics
  activeCalls: number;
  callsInQueue: number;
  callsCompletedToday: number;
  
  // Current Performance
  currentSuccessRate: number;
  currentAverageDuration: number;
  currentSentimentScore: number;
  
  // System Status
  systemHealth: 'healthy' | 'degraded' | 'critical';
  apiLatency: number;
  queueBacklog: number;
  
  // Rate Limits
  openaiUsage: {
    tokens: number;
    limit: number;
    resetTime: Date;
  };
  twilioUsage: {
    minutes: number;
    limit: number;
    resetTime: Date;
  };
}

export interface ConversationAnalytics {
  callId: string;
  
  // Conversation Quality
  totalTurns: number;
  averageResponseTime: number;
  transcriptionConfidence: number;
  
  // Content Analysis
  keyWords: string[];
  topics: string[];
  intent: string;
  
  // Sentiment Journey
  sentimentFlow: {
    turn: number;
    sentiment: number;
    confidence: number;
  }[];
  
  // Interaction Quality
  interruptions: number;
  silenceDuration: number;
  speechRate: number;
  
  // Outcome Analysis
  goalAchieved: boolean;
  escalationReason?: string;
  followupRequired: boolean;
}

export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'map' | 'list';
  title: string;
  size: 'small' | 'medium' | 'large';
  data: any;
  refreshInterval?: number; // seconds
  lastUpdated: Date;
}

export interface AnalyticsFilter {
  dateRange: {
    start: Date;
    end: Date;
  };
  campaigns?: string[];
  contactLists?: string[];
  callStatus?: string[];
  sentimentRange?: {
    min: number;
    max: number;
  };
  durationRange?: {
    min: number;
    max: number;
  };
}