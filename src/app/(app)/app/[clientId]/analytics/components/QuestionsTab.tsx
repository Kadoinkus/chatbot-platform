'use client';

import { HelpCircle, CheckCircle, AlertTriangle, Globe } from 'lucide-react';
import { KpiCard, KpiGrid } from '@/components/analytics';
import { BotComparisonTable, ProgressBar, type ColumnDefinition } from '@/components/analytics/BotComparisonTable';
import {
  formatNumber,
  formatPercent,
  calculateHandoffs,
  type BotWithMetrics,
} from '@/lib/analytics/botComparison';

interface QuestionsTabProps {
  botMetrics: BotWithMetrics[];
  brandColor: string;
  onOpenQuestionsModal: (questions: string[], title: string) => void;
}

export function QuestionsTab({ botMetrics, brandColor, onOpenQuestionsModal }: QuestionsTabProps) {
  // Calculate totals
  const totalQuestions = botMetrics.reduce((sum, b) => sum + b.questions.length, 0);
  const totalUnanswered = botMetrics.reduce((sum, b) => sum + b.unanswered.length, 0);
  const totalAnswered = totalQuestions - totalUnanswered;
  const avgAnswerRate = totalQuestions > 0 ? (totalAnswered / totalQuestions) * 100 : 0;
  const totalUrlHandoffs = botMetrics.reduce((sum, b) => sum + calculateHandoffs(b).urlHandoffs, 0);
  const totalEmailHandoffs = botMetrics.reduce((sum, b) => sum + calculateHandoffs(b).emailHandoffs, 0);

  // Column definitions
  const columns: ColumnDefinition[] = [
    {
      key: 'questions',
      header: 'Questions',
      render: (bot) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenQuestionsModal(bot.questions.map((q) => q.question), `Questions - ${bot.botName}`);
          }}
          className="text-info-600 dark:text-info-500 hover:underline"
        >
          {bot.questions.length}
        </button>
      ),
      sortValue: (bot) => bot.questions.length,
      align: 'right',
    },
    {
      key: 'answered',
      header: 'Answered',
      render: (bot) => {
        const answered = bot.questions.length - bot.unanswered.length;
        return <span className="text-success-600 dark:text-success-500">{answered}</span>;
      },
      sortValue: (bot) => bot.questions.length - bot.unanswered.length,
      align: 'right',
    },
    {
      key: 'unanswered',
      header: 'Unanswered',
      render: (bot) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenQuestionsModal(bot.unanswered.map((q) => q.question), `Unanswered - ${bot.botName}`);
          }}
          className="text-error-600 dark:text-error-500 hover:underline"
        >
          {bot.unanswered.length}
        </button>
      ),
      sortValue: (bot) => bot.unanswered.length,
      align: 'right',
    },
    {
      key: 'answerRate',
      header: 'Answer Rate',
      render: (bot) => {
        const rate =
          bot.questions.length > 0
            ? ((bot.questions.length - bot.unanswered.length) / bot.questions.length) * 100
            : 0;
        return <ProgressBar value={rate} color={rate >= 80 ? 'success' : rate >= 60 ? 'warning' : 'error'} />;
      },
      sortValue: (bot) =>
        bot.questions.length > 0
          ? ((bot.questions.length - bot.unanswered.length) / bot.questions.length) * 100
          : 0,
      width: '150px',
    },
    {
      key: 'urlHandoffs',
      header: 'URL Handoffs',
      render: (bot) => calculateHandoffs(bot).urlHandoffs,
      sortValue: (bot) => calculateHandoffs(bot).urlHandoffs,
      align: 'right',
    },
    {
      key: 'emailHandoffs',
      header: 'Email Handoffs',
      render: (bot) => calculateHandoffs(bot).emailHandoffs,
      sortValue: (bot) => calculateHandoffs(bot).emailHandoffs,
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

      {/* Bot Comparison Table */}
      <BotComparisonTable
        bots={botMetrics}
        columns={columns}
        brandColor={brandColor}
        title="Bot Comparison - Questions & Gaps"
        description={
          botMetrics.length === 0
            ? 'No bots selected'
            : `Comparing ${botMetrics.length} bot${botMetrics.length !== 1 ? 's' : ''}`
        }
        emptyMessage="Select bots to compare their metrics"
        expandableContent={(bot) => (
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Top Unanswered Questions</h4>
            {bot.unanswered.length > 0 ? (
              <ul className="space-y-2">
                {bot.unanswered.slice(0, 5).map((q, i) => (
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
