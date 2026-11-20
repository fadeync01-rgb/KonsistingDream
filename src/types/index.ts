import { Competition, EducationLevel, ExperienceLevel, OpportunityStatus, UserPreferences } from '../utils/recommendationEngine';
import { PreparationTask, TimelineMilestone } from '../utils/checklistGenerator';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  isGuest: boolean;
  role: 'student' | 'admin';
  avatarUrl?: string;
  createdAt: string;
}

export interface UserOpportunity {
  competitionId: string;
  status: OpportunityStatus;
  savedAt: string;
  personalNotes?: string;
  checklistProgressPercent: number;
  tasks: PreparationTask[];
  timeline: TimelineMilestone[];
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'deadline' | 'verified_update' | 'ai_recommendation' | 'system';
  isRead: boolean;
  linkAction?: string;
}

export interface HandbookAnalysisResult {
  eligibilitySummary: string;
  keyDates: Array<{ label: string; date: string; importance: string }>;
  scoringRubric: Array<{ criterion: string; weightPercent: number; description: string }>;
  requiredDocuments: string[];
  submissionGuidelines: string;
  criticalWarnings: string[];
  officialDisclaimer: string;
}
