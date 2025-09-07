export interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  scheduledAt?: Date;
  
  // Call Configuration
  script?: string;
  useAiConversation: boolean;
  recordingUrl?: string;
  maxCallDuration: number; // in seconds
  maxRetries: number;
  retryInterval: number; // in minutes
  
  // AI Configuration
  aiPersonality?: string;
  conversationGoals?: string[];
  language: string;
  accent?: string;
  voiceModel: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  
  // Personalization
  usePersonalization: boolean;
  personalizationFields?: string[];
  greetingTemplate?: string;
  
  // Analytics
  totalContacts: number;
  contactsCalled: number;
  contactsAnswered: number;
  contactsCompleted: number;
  averageCallDuration: number;
  successRate: number;
}

export interface Call {
  id: string;
  campaignId: string;
  contactId: string;
  
  // Call Details
  phoneNumber: string;
  status: 'queued' | 'dialing' | 'in-progress' | 'completed' | 'failed' | 'no-answer' | 'busy' | 'opted-out';
  startedAt?: Date;
  endedAt?: Date;
  duration?: number; // in seconds
  
  // Twilio Details
  twilioCallSid?: string;
  twilioStatus?: string;
  
  // Conversation Details
  transcript?: string;
  recording?: string;
  sentimentScore?: number;
  sentimentLabel?: 'positive' | 'neutral' | 'negative';
  
  // Interaction Details
  answered: boolean;
  optedOut: boolean;
  humanEscalation: boolean;
  dtmfInputs?: string[];
  
  // Retry Information
  attempts: number;
  lastAttemptAt?: Date;
  nextRetryAt?: Date;
  
  // Error Information
  error?: string;
  errorCode?: string;
}

export interface CallEvent {
  id: string;
  callId: string;
  type: 'call-started' | 'call-answered' | 'call-ended' | 'recording-started' | 'transcript-updated' | 'sentiment-updated' | 'error';
  timestamp: Date;
  data?: any;
}

export interface ConversationTurn {
  id: string;
  callId: string;
  speaker: 'ai' | 'human';
  content: string;
  timestamp: Date;
  audioUrl?: string;
  confidence?: number;
  sentimentScore?: number;
}

export interface CampaignStats {
  campaignId: string;
  totalCalls: number;
  completedCalls: number;
  successfulCalls: number;
  failedCalls: number;
  averageDuration: number;
  averageSentiment: number;
  optOutRate: number;
  answerRate: number;
  completionRate: number;
  
  // Time-based metrics
  callsPerHour: number;
  peakHours: string[];
  
  // Sentiment distribution
  positiveSentiment: number;
  neutralSentiment: number;
  negativeSentiment: number;
}