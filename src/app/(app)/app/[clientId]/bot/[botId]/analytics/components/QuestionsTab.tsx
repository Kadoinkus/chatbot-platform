'use client';

import { useCallback } from 'react';
import {
  HelpCircle,
  AlertTriangle,
  CheckCircle,
  BarChart3,
} from 'lucide-react';
import { Card } from '@/components/ui';
import { GREY } from '@/lib/chartColors';
import { KpiCard, KpiGrid } from '@/components/analytics/KpiCard';
import type { QuestionsTabProps } from './types';

export function QuestionsTab({
  brandColor,
  sessions,
  questions,
  unansweredQuestions,
  categories,
  formatNumber,
  formatPercent,
  onShowSessionIds,
}: QuestionsTabProps) {
  // Helper functions
  const findSessionsForQuestion = useCallback(
    (questionText: string) => {
      return sessions
        .filter((s) =>
          s.analysis?.questions?.some(
            (q) =>
              q.toLowerCase().includes(questionText.toLowerCase()) ||
              questionText.toLowerCase().includes(q.toLowerCase())
          )
        )
        .map((s) => s.id);
    },
    [sessions]
  );

  const findSessionsForUrl = useCallback(
    (url: string) => {
      return sessions
        .filter((s) => s.analysis?.url_links?.some((u) => u.includes(url) || url.includes(u)))
        .map((s) => s.id);
    },
    [sessions]
  );

  const findSessionsForEmail = useCallback(
    (email: string) => {
      return sessions.filter((s) => s.analysis?.email_links?.includes(email)).map((s) => s.id);
    },
    [sessions]
  );

  // Calculate handoff stats
  const sessionsWithHandoffs = sessions.filter(
    (s) =>
      (s.analysis?.url_links && s.analysis.url_links.length > 0) ||
      (s.analysis?.email_links && s.analysis.email_links.length > 0)
  ).length;
  const urlOnly = sessions.filter(
    (s) =>
      s.analysis?.url_links &&
      s.analysis.url_links.length > 0 &&
      (!s.analysis?.email_links || s.analysis.email_links.length === 0)
  ).length;
  const emailOnly = sessions.filter(
    (s) =>
      (!s.analysis?.url_links || s.analysis.url_links.length === 0) &&
      s.analysis?.email_links &&
      s.analysis.email_links.length > 0
  ).length;
  const both = sessions.filter(
    (s) =>
      s.analysis?.url_links &&
      s.analysis.url_links.length > 0 &&
      s.analysis?.email_links &&
      s.analysis.email_links.length > 0
  ).length;
  const handoffRate = sessions.length > 0 ? (sessionsWithHandoffs / sessions.length) * 100 : 0;

  // Build URL handoffs
  const urlHandoffs: { destination: string; fullUrl: string; count: number }[] = [];
  sessions.forEach((s) => {
    s.analysis?.url_links?.forEach((url) => {
      let shortUrl = url;
      try {
        const parsed = new URL(url);
        shortUrl = parsed.hostname + parsed.pathname;
      } catch {}
      const existing = urlHandoffs.find((h) => h.destination === shortUrl);
      if (existing) existing.count++;
      else urlHandoffs.push({ destination: shortUrl, fullUrl: url, count: 1 });
    });
  });
  urlHandoffs.sort((a, b) => b.count - a.count);

  // Build email handoffs
  const emailHandoffs: { destination: string; count: number }[] = [];
  sessions.forEach((s) => {
    s.analysis?.email_links?.forEach((email) => {
      const existing = emailHandoffs.find((h) => h.destination === email);
      if (existing) existing.count++;
      else emailHandoffs.push({ destination: email, count: 1 });
    });
  });
  emailHandoffs.sort((a, b) => b.count - a.count);

  const answerRate =
    questions.length > 0 ? ((questions.length - unansweredQuestions.length) / questions.length) * 100 : 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* KPI Cards */}
      <KpiGrid>
        <KpiCard icon={HelpCircle} label="Total Questions" value={formatNumber(questions.length)} />
        <KpiCard icon={AlertTriangle} label="Unanswered" value={formatNumber(unansweredQuestions.length)} />
        <KpiCard icon={CheckCircle} label="Answer Rate" value={formatPercent(answerRate)} />
        <KpiCard icon={BarChart3} label="Top Category" value={categories[0]?.category || '-'} />
      </KpiGrid>

      {/* Handoff Analytics */}
      <Card>
        <h3 className="font-semibold text-foreground mb-6">Handoff Analytics</h3>
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Handoff Rate */}
          <div className="flex-1">
            <p className="text-sm text-foreground-secondary mb-3">Handoff Rate</p>
            <div className="flex items-end gap-3 mb-4">
              <span className="text-4xl sm:text-5xl font-bold" style={{ color: brandColor }}>
                {handoffRate.toFixed(1)}%
              </span>
              <span className="text-foreground-secondary pb-2">of sessions</span>
            </div>
            <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${handoffRate}%`, backgroundColor: brandColor }}
              />
            </div>
            <p className="text-sm text-foreground-tertiary mt-2">
              {sessionsWithHandoffs} of {sessions.length} sessions included a URL or email handoff
            </p>
          </div>

          {/* Divider */}
          <div className="border-t md:border-t-0 md:border-l border-border" />

          {/* Breakdown */}
          <div className="flex-1">
            <p className="text-sm text-foreground-secondary mb-3">Handoff Breakdown</p>
            {sessionsWithHandoffs === 0 ? (
              <p className="text-foreground-tertiary">No handoffs yet</p>
            ) : (
              <div className="space-y-4">
                <ProgressBar
                  label="URL Only"
                  value={urlOnly}
                  total={sessionsWithHandoffs}
                  color={brandColor}
                />
                <ProgressBar
                  label="Email Only"
                  value={emailOnly}
                  total={sessionsWithHandoffs}
                  color={GREY[400]}
                />
                <ProgressBar
                  label="Both URL & Email"
                  value={both}
                  total={sessionsWithHandoffs}
                  color={GREY[600]}
                />
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Questions Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Top Questions</h3>
            {questions.length > 5 && (
              <span className="text-xs text-foreground-tertiary">{questions.length} total</span>
            )}
          </div>
          <ScrollList>
            {questions.map((q, index) => (
              <ListButton
                key={index}
                onClick={() => onShowSessionIds(q.question, findSessionsForQuestion(q.question))}
              >
                <span className="text-sm text-foreground line-clamp-1 flex-1 mr-3">{q.question}</span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm text-foreground-secondary">{q.frequency}×</span>
                  {q.answered ? (
                    <CheckCircle size={14} className="text-success-500" />
                  ) : (
                    <AlertTriangle size={14} className="text-warning-500" />
                  )}
                </div>
              </ListButton>
            ))}
            {questions.length === 0 && <EmptyMessage>No questions yet</EmptyMessage>}
          </ScrollList>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Unanswered Questions</h3>
            {unansweredQuestions.length > 0 && (
              <span className="text-xs text-warning-600 dark:text-warning-500 font-medium">
                {unansweredQuestions.length} gaps
              </span>
            )}
          </div>
          <ScrollList>
            {unansweredQuestions.map((q, index) => (
              <ListButton
                key={index}
                onClick={() => onShowSessionIds(q.question, findSessionsForQuestion(q.question))}
              >
                <span className="text-sm text-foreground line-clamp-1 flex-1 mr-3">{q.question}</span>
                <span className="text-sm text-foreground-secondary flex-shrink-0">{q.frequency}×</span>
              </ListButton>
            ))}
            {unansweredQuestions.length === 0 && (
              <div className="text-center py-6">
                <CheckCircle size={24} className="text-success-500 mx-auto mb-2" />
                <p className="text-sm text-foreground-secondary">All questions answered</p>
              </div>
            )}
          </ScrollList>
        </Card>
      </div>

      {/* Handoffs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">URL Handoffs</h3>
            <span className="text-xs text-foreground-tertiary">
              {sessions.filter((s) => s.analysis?.url_links?.length).length} sessions
            </span>
          </div>
          <ScrollList>
            {urlHandoffs.length > 0 ? (
              urlHandoffs.map((h, i) => (
                <ListButton key={i} onClick={() => onShowSessionIds(h.destination, findSessionsForUrl(h.fullUrl))}>
                  <span className="text-sm text-foreground line-clamp-1 flex-1 mr-3">{h.destination}</span>
                  <span className="text-sm text-foreground-secondary flex-shrink-0">{h.count}×</span>
                </ListButton>
              ))
            ) : (
              <EmptyMessage>No URL handoffs yet</EmptyMessage>
            )}
          </ScrollList>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Email Handoffs</h3>
            <span className="text-xs text-foreground-tertiary">
              {sessions.filter((s) => s.analysis?.email_links?.length).length} sessions
            </span>
          </div>
          <ScrollList>
            {emailHandoffs.length > 0 ? (
              emailHandoffs.map((h, i) => (
                <ListButton key={i} onClick={() => onShowSessionIds(h.destination, findSessionsForEmail(h.destination))}>
                  <span className="text-sm text-foreground line-clamp-1 flex-1 mr-3">{h.destination}</span>
                  <span className="text-sm text-foreground-secondary flex-shrink-0">{h.count}×</span>
                </ListButton>
              ))
            ) : (
              <EmptyMessage>No email handoffs yet</EmptyMessage>
            )}
          </ScrollList>
        </Card>
      </div>
    </div>
  );
}

// Helper components
function ProgressBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const percent = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-foreground">{label}</span>
        <span className="text-foreground-secondary">
          {value} ({percent.toFixed(0)}%)
        </span>
      </div>
      <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function ScrollList({ children }: { children: React.ReactNode }) {
  return <div className="max-h-[200px] overflow-y-auto space-y-1">{children}</div>;
}

function ListButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-background-hover transition-colors text-left min-h-[44px]"
    >
      {children}
    </button>
  );
}

function EmptyMessage({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-foreground-tertiary text-center py-6">{children}</p>;
}

export default QuestionsTab;
