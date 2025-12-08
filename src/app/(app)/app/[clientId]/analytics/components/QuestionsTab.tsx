'use client';

import { HelpCircle, CheckCircle, AlertTriangle, Globe } from 'lucide-react';
import { KpiCard, KpiGrid } from '@/components/analytics';
import { AssistantComparisonTable, ProgressBar, type ColumnDefinition } from '@/components/analytics/AssistantComparisonTable';
import {
  formatNumber,
  formatPercent,
  calculateHandoffs,
  type AssistantWithMetrics,
} from '@/lib/analytics/assistantComparison';

interface QuestionsTabProps {
  assistantMetrics: AssistantWithMetrics[];
  brandColor: string;
  onOpenQuestionsModal: (questions: string[], title: string) => void;
}

export function QuestionsTab({ assistantMetrics, brandColor, onOpenQuestionsModal }: QuestionsTabProps) {
  // Calculate totals
  const totalQuestions = assistantMetrics.reduce((sum, a) => sum + a.questions.length, 0);
  const totalUnanswered = assistantMetrics.reduce((sum, a) => sum + a.unanswered.length, 0);
  const totalAnswered = totalQuestions - totalUnanswered;
  const avgAnswerRate = totalQuestions > 0 ? (totalAnswered / totalQuestions) * 100 : 0;
  const totalUrlHandoffs = assistantMetrics.reduce((sum, a) => sum + calculateHandoffs(a).urlHandoffs, 0);
  const totalEmailHandoffs = assistantMetrics.reduce((sum, a) => sum + calculateHandoffs(a).emailHandoffs, 0);

  // Column definitions
  const columns: ColumnDefinition[] = [
    {
      key: 'questions',
      header: 'Questions',
      render: (assistant) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenQuestionsModal(assistant.questions.map((q) => q.question), `Questions - ${assistant.assistantName}`);
          }}
          className="text-info-600 dark:text-info-500 hover:underline"
        >
          {assistant.questions.length}
        </button>
      ),
      sortValue: (assistant) => assistant.questions.length,
      align: 'right',
    },
    {
      key: 'answered',
      header: 'Answered',
      render: (assistant) => {
        const answered = assistant.questions.length - assistant.unanswered.length;
        return <span className="text-success-600 dark:text-success-500">{answered}</span>;
      },
      sortValue: (assistant) => assistant.questions.length - assistant.unanswered.length,
      align: 'right',
    },
    {
      key: 'unanswered',
      header: 'Unanswered',
      render: (assistant) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenQuestionsModal(assistant.unanswered.map((q) => q.question), `Unanswered - ${assistant.assistantName}`);
          }}
          className="text-error-600 dark:text-error-500 hover:underline"
        >
          {assistant.unanswered.length}
        </button>
      ),
      sortValue: (assistant) => assistant.unanswered.length,
      align: 'right',
    },
    {
      key: 'answerRate',
      header: 'Answer Rate',
      render: (assistant) => {
        const rate =
          assistant.questions.length > 0
            ? ((assistant.questions.length - assistant.unanswered.length) / assistant.questions.length) * 100
            : 0;
        return <ProgressBar value={rate} color={rate >= 80 ? 'success' : rate >= 60 ? 'warning' : 'error'} />;
      },
      sortValue: (assistant) =>
        assistant.questions.length > 0
          ? ((assistant.questions.length - assistant.unanswered.length) / assistant.questions.length) * 100
          : 0,
      width: '150px',
    },
    {
      key: 'urlHandoffs',
      header: 'URL Handoffs',
      render: (assistant) => calculateHandoffs(assistant).urlHandoffs,
      sortValue: (assistant) => calculateHandoffs(assistant).urlHandoffs,
      align: 'right',
    },
    {
      key: 'emailHandoffs',
      header: 'Email Handoffs',
      render: (assistant) => calculateHandoffs(assistant).emailHandoffs,
      sortValue: (assistant) => calculateHandoffs(assistant).emailHandoffs,
      align: 'right',
    },
  ];

  return (
    <>
      {/* KPI Cards */}
      <KpiGrid className="mb-6">
        <KpiCard
          icon={HelpCircle}
          label="Total Questions"
          value={formatNumber(totalQuestions)}
        />
        <KpiCard
          icon={CheckCircle}
          label="Answer Rate"
          value={formatPercent(avgAnswerRate)}
        />
        <KpiCard
          icon={AlertTriangle}
          label="Knowledge Gaps"
          value={formatNumber(totalUnanswered)}
        />
        <KpiCard
          icon={Globe}
          label="Total Handoffs"
          value={formatNumber(totalUrlHandoffs + totalEmailHandoffs)}
        />
      </KpiGrid>

      {/* AI Assistant Comparison Table */}
      <AssistantComparisonTable
        assistants={assistantMetrics}
        columns={columns}
        brandColor={brandColor}
        title="AI Assistant Comparison - Questions & Gaps"
        description={
          assistantMetrics.length === 0
            ? 'No AI assistants selected'
            : `Comparing ${assistantMetrics.length} AI assistant${assistantMetrics.length !== 1 ? 's' : ''}`
        }
        emptyMessage="Select AI assistants to compare their metrics"
        expandableContent={(assistant) => (
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Top Unanswered Questions</h4>
            {assistant.unanswered.length > 0 ? (
              <ul className="space-y-2">
                {assistant.unanswered.slice(0, 5).map((q, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-warning-600 dark:text-warning-500 font-medium">•</span>
                    <span className="text-foreground">{q.question}</span>
                    <span className="text-foreground-tertiary">({q.frequency}x)</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-foreground-tertiary text-sm">No unanswered questions</p>
            )}
          </div>
        )}
      />
    </>
  );
}

export default QuestionsTab;
