import type { ChatSessionWithAnalysis } from '@/types';
import type {
  OverviewMetrics,
  SentimentBreakdown,
  CategoryBreakdown,
  LanguageBreakdown,
  CountryBreakdown,
  TimeSeriesDataPoint,
  QuestionAnalytics,
  DeviceBreakdown,
  SentimentTimeSeriesDataPoint,
  HourlyBreakdown,
  AnimationStats,
} from '@/lib/db/analytics';

/**
 * Common props shared by all tab components
 */
export interface TabProps {
  brandColor: string;
  sessions: ChatSessionWithAnalysis[];
  formatNumber: (value: number) => string;
  formatPercent: (value: number) => string;
  formatCurrency: (value: number) => string;
  formatDuration: (seconds: number) => string;
}

/**
 * Overview Tab Props
 */
export interface OverviewTabProps extends TabProps {
  overview: OverviewMetrics | null;
  sentiment: SentimentBreakdown | null;
  categories: CategoryBreakdown[];
  timeSeries: TimeSeriesDataPoint[];
  countries: CountryBreakdown[];
  languages: LanguageBreakdown[];
  devices: DeviceBreakdown[];
}

/**
 * Conversations Tab Props
 */
export interface ConversationsTabProps extends TabProps {
  overview: OverviewMetrics | null;
  sentiment: SentimentBreakdown | null;
  sentimentTimeSeries: SentimentTimeSeriesDataPoint[];
  hourlyBreakdown: HourlyBreakdown[];
  onOpenTranscript: (session: ChatSessionWithAnalysis) => void;
}

/**
 * Questions Tab Props
 */
export interface QuestionsTabProps extends TabProps {
  questions: QuestionAnalytics[];
  unansweredQuestions: QuestionAnalytics[];
  categories: CategoryBreakdown[];
  onShowSessionIds: (title: string, sessionIds: string[]) => void;
}

/**
 * Audience Tab Props
 */
export interface AudienceTabProps extends TabProps {
  countries: CountryBreakdown[];
  languages: LanguageBreakdown[];
  devices: DeviceBreakdown[];
}

/**
 * Animations Tab Props
 */
export interface AnimationsTabProps extends TabProps {
  animationStats: AnimationStats | null;
}

/**
 * Costs Tab Props
 */
export interface CostsTabProps extends TabProps {
  overview: OverviewMetrics | null;
}

/**
 * Custom Tab Props (placeholder)
 */
export interface CustomTabProps {
  brandColor: string;
}
