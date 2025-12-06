import type { ChatSessionWithAnalysis, Bot } from '@/types';

// Shared props for all conversation tab components
export interface BaseTabProps {
  sessions: ChatSessionWithAnalysis[];
  paginatedSessions: ChatSessionWithAnalysis[];
  brandColor: string;
  getBotInfo: (mascotId: string) => Bot | undefined;
  onOpenTranscript: (session: ChatSessionWithAnalysis) => void;
  formatTimestamp: (dateStr: string) => string;
  formatDuration: (seconds: number | null | undefined) => string;
  formatCost: (cost: number | null | undefined) => string;
  // Pagination
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

// Overview tab specific props
export interface OverviewTabProps extends BaseTabProps {
  getStatusIcon: (session: ChatSessionWithAnalysis) => React.ReactNode;
  getStatusLabel: (session: ChatSessionWithAnalysis) => string;
  getSentimentIcon: (sentiment: string | null | undefined) => React.ReactNode;
}

// Conversations tab specific props
export interface ConversationsTabProps extends BaseTabProps {}

// Questions tab specific props
export interface QuestionsTabProps extends BaseTabProps {
  onOpenQuestions: (session: ChatSessionWithAnalysis, type: 'asked' | 'unanswered') => void;
}

// Audience tab specific props
export interface AudienceTabProps extends BaseTabProps {
  getDeviceIcon: (deviceType: string | null | undefined) => React.ReactNode;
}

// Animations tab specific props
export interface AnimationsTabProps extends BaseTabProps {}

// Costs tab specific props
export interface CostsTabProps extends BaseTabProps {}

// Custom tab specific props
export interface CustomTabProps extends BaseTabProps {}

// Stats for the overview section
export interface ConversationStats {
  total: number;
  resolved: number;
  resolutionRate: number;
  avgDuration: number;
  sentimentCounts: {
    positive: number;
    neutral: number;
    negative: number;
  };
}
