'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { clients } from '@/lib/data';
import { getAnalyticsForClient } from '@/lib/db/analytics';
import { getClientBrandColor } from '@/lib/brandColors';
import { getContrastTextColor } from '@/lib/chartColors';
import type { ChatSessionWithAnalysis, Workspace, Bot } from '@/types';
import {
  Search,
  Download,
  MessageSquare,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Minus,
  BarChart3,
  HelpCircle,
  Globe,
  Sparkles,
  Receipt,
  Filter,
  Smartphone,
  Monitor,
  Tablet,
  ExternalLink,
  Mail,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  Page,
  PageContent,
  PageHeader,
  Button,
  Input,
  Select,
  Card,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  EmptyState,
  Spinner,
  Modal,
} from '@/components/ui';

// Tab configuration - matching bot analytics exactly
const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'conversations', label: 'Conversations', icon: MessageSquare },
  { id: 'questions', label: 'Questions & Gaps', icon: HelpCircle },
  { id: 'audience', label: 'Audience', icon: Globe },
  { id: 'animations', label: 'Animations', icon: Sparkles },
  { id: 'costs', label: 'True Costs', icon: Receipt },
  { id: 'custom', label: 'Custom Metrics', icon: Filter },
];

export default function ConversationHistoryPage({ params }: { params: { clientId: string } }) {
  const client = clients.find(c => c.id === params.clientId);

  // Tab state
  const [activeTab, setActiveTab] = useState('overview');

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBot, setSelectedBot] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedWorkspace, setSelectedWorkspace] = useState('all');
  const [dateRange, setDateRange] = useState('30days');

  // Data state
  const [sessions, setSessions] = useState<ChatSessionWithAnalysis[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [selectedSession, setSelectedSession] = useState<ChatSessionWithAnalysis | null>(null);
  const [questionsSession, setQuestionsSession] = useState<ChatSessionWithAnalysis | null>(null);
  const [questionsType, setQuestionsType] = useState<'asked' | 'unanswered'>('asked');
  const scrollPositionRef = useRef<number>(0);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Get bot info by mascot_id
  const getBotInfo = useCallback((mascotId: string): Bot | undefined => {
    return client?.bots.find(b => b.id === mascotId);
  }, [client?.bots]);

  // Get date range filter
  const getDateRangeFilter = useCallback(() => {
    const now = new Date();
    const start = new Date();

    switch (dateRange) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case '7days':
        start.setDate(start.getDate() - 7);
        break;
      case '30days':
        start.setDate(start.getDate() - 30);
        break;
      case '90days':
        start.setDate(start.getDate() - 90);
        break;
      default:
        start.setDate(start.getDate() - 30);
    }

    return { start, end: now };
  }, [dateRange]);

  // Fetch sessions
  useEffect(() => {
    if (!client) return;

    async function loadData() {
      setLoading(true);
      try {
        const analytics = getAnalyticsForClient(params.clientId);
        const dateFilter = getDateRangeFilter();
        const sessionsData = await analytics.chatSessions.getWithAnalysisByClientId(
          params.clientId,
          { dateRange: dateFilter }
        );
        setSessions(sessionsData);
      } catch (error) {
        console.error('Error loading sessions:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [params.clientId, client, dateRange, getDateRangeFilter]);

  // Fetch workspaces
  useEffect(() => {
    if (!client) return;

    async function loadWorkspaces() {
      try {
        const res = await fetch(`/api/workspaces?clientId=${params.clientId}`);
        const json = await res.json();
        setWorkspaces(json.data || []);
      } catch (error) {
        console.error('Error loading workspaces:', error);
      }
    }

    loadWorkspaces();
  }, [params.clientId, client]);

  // Open transcript modal
  const handleOpenTranscript = useCallback((session: ChatSessionWithAnalysis) => {
    scrollPositionRef.current = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPositionRef.current}px`;
    document.body.style.width = '100%';
    setSelectedSession(session);
  }, []);

  // Close transcript modal
  const handleCloseTranscript = useCallback(() => {
    const scrollPos = scrollPositionRef.current;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, scrollPos);
    setSelectedSession(null);
  }, []);

  // Filter sessions
  const filteredSessions = useMemo(() => {
    if (!client) return [];
    return sessions.filter(session => {
      if (selectedBot !== 'all' && session.mascot_id !== selectedBot) return false;

      if (selectedStatus !== 'all') {
        const status = session.analysis?.resolution_status;
        if (selectedStatus === 'escalated') {
          if (!session.analysis?.escalated) return false;
        } else if (status !== selectedStatus) {
          return false;
        }
      }

      if (selectedWorkspace !== 'all') {
        const bot = getBotInfo(session.mascot_id);
        if (bot?.workspaceId !== selectedWorkspace) return false;
      }

      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const transcriptText = session.full_transcript?.map(m => m.message).join(' ') || '';
        const summary = session.analysis?.summary || '';
        const category = session.analysis?.category || '';

        if (
          !transcriptText.toLowerCase().includes(searchLower) &&
          !summary.toLowerCase().includes(searchLower) &&
          !category.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [sessions, selectedBot, selectedStatus, selectedWorkspace, searchTerm, client, getBotInfo]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBot, selectedStatus, selectedWorkspace, searchTerm, activeTab]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredSessions.length / ITEMS_PER_PAGE);
  const paginatedSessions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSessions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredSessions, currentPage, ITEMS_PER_PAGE]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = filteredSessions.length;
    const resolved = filteredSessions.filter(s => s.analysis?.resolution_status === 'resolved').length;
    const avgDuration = total > 0
      ? filteredSessions.reduce((sum, s) => sum + (s.session_duration_seconds || 0), 0) / total / 60
      : 0;

    const sentimentCounts = {
      positive: filteredSessions.filter(s => s.analysis?.sentiment === 'positive').length,
      neutral: filteredSessions.filter(s => s.analysis?.sentiment === 'neutral').length,
      negative: filteredSessions.filter(s => s.analysis?.sentiment === 'negative').length,
    };

    return {
      total,
      resolved,
      resolutionRate: total > 0 ? (resolved / total) * 100 : 0,
      avgDuration,
      sentimentCounts,
    };
  }, [filteredSessions]);

  // Brand color
  const brandColor = useMemo(() => {
    return client ? getClientBrandColor(client.id) : '#6B7280';
  }, [client]);

  // Early return for no client
  if (!client) {
    return (
      <Page>
        <PageContent>
          <EmptyState
            icon={<MessageSquare size={48} />}
            title="Client not found"
            message="The requested client could not be found."
          />
        </PageContent>
      </Page>
    );
  }

  // Helper functions
  const formatTimestamp = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const formatDuration = (seconds: number | null | undefined) => {
    if (!seconds) return '-';
    const minutes = Math.round(seconds / 60);
    return `${minutes} min`;
  };

  const formatCost = (cost: number | null | undefined) => {
    if (!cost) return '-';
    return `€${cost.toFixed(4)}`;
  };

  const getLastMessage = (session: ChatSessionWithAnalysis) => {
    const transcript = session.full_transcript;
    if (!transcript || transcript.length === 0) return 'No messages';
    return transcript[transcript.length - 1].message;
  };

  const getStatusIcon = (session: ChatSessionWithAnalysis) => {
    if (session.analysis?.escalated) {
      return <AlertCircle size={16} className="text-warning-600 dark:text-warning-500" />;
    }
    switch (session.analysis?.resolution_status) {
      case 'resolved':
        return <CheckCircle size={16} className="text-success-600 dark:text-success-500" />;
      case 'partial':
        return <Clock size={16} className="text-info-600 dark:text-info-500" />;
      case 'unresolved':
        return <AlertCircle size={16} className="text-error-600 dark:text-error-500" />;
      default:
        return <Clock size={16} className="text-foreground-tertiary" />;
    }
  };

  const getStatusLabel = (session: ChatSessionWithAnalysis) => {
    if (session.analysis?.escalated) return 'Escalated';
    const status = session.analysis?.resolution_status;
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getSentimentIcon = (sentiment: string | null | undefined) => {
    switch (sentiment) {
      case 'positive':
        return <ThumbsUp size={14} className="text-success-600 dark:text-success-500" />;
      case 'negative':
        return <ThumbsDown size={14} className="text-error-600 dark:text-error-500" />;
      default:
        return <Minus size={14} className="text-foreground-tertiary" />;
    }
  };

  const getDeviceIcon = (deviceType: string | null | undefined) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return <Smartphone size={14} className="text-foreground-secondary" />;
      case 'tablet':
        return <Tablet size={14} className="text-foreground-secondary" />;
      default:
        return <Monitor size={14} className="text-foreground-secondary" />;
    }
  };

  // Filter options
  const botOptions = [
    { value: 'all', label: 'All Bots' },
    ...client.bots.map(bot => ({ value: bot.id, label: bot.name }))
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'partial', label: 'Partial' },
    { value: 'unresolved', label: 'Unresolved' },
    { value: 'escalated', label: 'Escalated' },
  ];

  const workspaceOptions = [
    { value: 'all', label: 'All Workspaces' },
    ...workspaces.map(w => ({ value: w.id, label: w.name }))
  ];

  const dateRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: '7days', label: 'Last 7 days' },
    { value: '30days', label: 'Last 30 days' },
    { value: '90days', label: 'Last 90 days' },
  ];

  // Render table headers based on active tab
  const renderTableHeaders = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            <TableHead>Session</TableHead>
            <TableHead>Bot</TableHead>
            <TableHead>Messages</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Sentiment</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Transcript</TableHead>
          </>
        );
      case 'conversations':
        return (
          <>
            <TableHead>Session</TableHead>
            <TableHead>Bot</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Outcome</TableHead>
            <TableHead>Engagement</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Transcript</TableHead>
          </>
        );
      case 'questions':
        return (
          <>
            <TableHead>Session</TableHead>
            <TableHead>Bot</TableHead>
            <TableHead>Questions</TableHead>
            <TableHead>Gaps</TableHead>
            <TableHead>URLs</TableHead>
            <TableHead>Emails</TableHead>
            <TableHead>Transcript</TableHead>
          </>
        );
      case 'audience':
        return (
          <>
            <TableHead>Session</TableHead>
            <TableHead>Bot</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Language</TableHead>
            <TableHead>Device</TableHead>
            <TableHead>Browser</TableHead>
            <TableHead>Transcript</TableHead>
          </>
        );
      case 'animations':
        return (
          <>
            <TableHead>Session</TableHead>
            <TableHead>Bot</TableHead>
            <TableHead>Easter Egg</TableHead>
            <TableHead>User Type</TableHead>
            <TableHead>GLB Load</TableHead>
            <TableHead>Transcript</TableHead>
          </>
        );
      case 'costs':
        return (
          <>
            <TableHead>Session</TableHead>
            <TableHead>Bot</TableHead>
            <TableHead>Chat Tokens</TableHead>
            <TableHead>Chat Cost</TableHead>
            <TableHead>Analysis Cost</TableHead>
            <TableHead>Total Cost</TableHead>
            <TableHead>Transcript</TableHead>
          </>
        );
      case 'custom':
        return (
          <>
            <TableHead>Session</TableHead>
            <TableHead>Bot</TableHead>
            <TableHead>Custom Field 1</TableHead>
            <TableHead>Custom Field 2</TableHead>
            <TableHead>Transcript</TableHead>
          </>
        );
      default:
        return null;
    }
  };

  // Render table row based on active tab
  const renderTableRow = (session: ChatSessionWithAnalysis) => {
    const bot = getBotInfo(session.mascot_id);

    const sessionCell = (
      <TableCell>
        <div>
          <p className="font-medium text-sm text-foreground">
            {session.visitor_country || 'Unknown'}
          </p>
          <p className="text-xs text-foreground-tertiary">
            {session.id.slice(0, 8)}...
          </p>
        </div>
      </TableCell>
    );

    const botCell = (
      <TableCell>
        <div className="flex items-center gap-2">
          {bot?.image ? (
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: brandColor }}
            >
              <img
                src={bot.image}
                alt={bot.name}
                className="w-5 h-5 rounded-full object-cover"
              />
            </div>
          ) : null}
          <p className="text-sm text-foreground">{bot?.name || 'Unknown'}</p>
        </div>
      </TableCell>
    );

    const actionsCell = (
      <TableCell>
        <button
          onClick={() => handleOpenTranscript(session)}
          className="flex items-center gap-1 text-sm text-info-600 dark:text-info-500 hover:text-info-700 dark:hover:text-info-400"
        >
          <Eye size={14} />
          View
        </button>
      </TableCell>
    );

    switch (activeTab) {
      case 'overview':
        return (
          <>
            {sessionCell}
            {botCell}
            <TableCell>
              <p className="text-sm text-foreground">{session.total_messages}</p>
            </TableCell>
            <TableCell>
              <p className="text-sm text-foreground">{formatDuration(session.session_duration_seconds)}</p>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {getStatusIcon(session)}
                <span className="text-sm text-foreground">{getStatusLabel(session)}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                {getSentimentIcon(session.analysis?.sentiment)}
                <span className="text-sm text-foreground capitalize">
                  {session.analysis?.sentiment || '-'}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <p className="text-sm text-foreground">{formatTimestamp(session.session_started_at)}</p>
            </TableCell>
            {actionsCell}
          </>
        );

      case 'conversations':
        return (
          <>
            {sessionCell}
            {botCell}
            <TableCell>
              <p className="text-sm text-foreground">{session.analysis?.category || '-'}</p>
            </TableCell>
            <TableCell>
              <p className="text-sm text-foreground capitalize">{session.analysis?.session_outcome || '-'}</p>
            </TableCell>
            <TableCell>
              <p className="text-sm text-foreground capitalize">{session.analysis?.engagement_level || '-'}</p>
            </TableCell>
            <TableCell>
              <p className="text-sm text-foreground capitalize">{session.analysis?.conversation_type || '-'}</p>
            </TableCell>
            {actionsCell}
          </>
        );

      case 'questions':
        return (
          <>
            {sessionCell}
            {botCell}
            <TableCell>
              {session.analysis?.questions && session.analysis.questions.length > 0 ? (
                <button
                  onClick={() => {
                    setQuestionsSession(session);
                    setQuestionsType('asked');
                  }}
                  className="text-sm text-info-600 dark:text-info-500 hover:underline text-left"
                >
                  {session.analysis.questions.length} question{session.analysis.questions.length !== 1 ? 's' : ''}
                </button>
              ) : (
                <p className="text-sm text-foreground-tertiary">-</p>
              )}
            </TableCell>
            <TableCell>
              {session.analysis?.unanswered_questions && session.analysis.unanswered_questions.length > 0 ? (
                <button
                  onClick={() => {
                    setQuestionsSession(session);
                    setQuestionsType('unanswered');
                  }}
                  className="text-sm text-warning-600 dark:text-warning-500 hover:underline text-left"
                >
                  {session.analysis.unanswered_questions.length} gap{session.analysis.unanswered_questions.length !== 1 ? 's' : ''}
                </button>
              ) : (
                <p className="text-sm text-foreground-tertiary">-</p>
              )}
            </TableCell>
            <TableCell>
              {session.analysis?.url_links && session.analysis.url_links.length > 0 ? (
                <div className="space-y-1 max-w-[200px]">
                  {session.analysis.url_links.slice(0, 2).map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-info-600 dark:text-info-500 hover:underline truncate"
                    >
                      <ExternalLink size={12} className="flex-shrink-0" />
                      <span className="truncate">{url.replace(/^https?:\/\//, '')}</span>
                    </a>
                  ))}
                  {session.analysis.url_links.length > 2 && (
                    <p className="text-xs text-foreground-tertiary">+{session.analysis.url_links.length - 2} more</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-foreground-tertiary">-</p>
              )}
            </TableCell>
            <TableCell>
              {session.analysis?.email_links && session.analysis.email_links.length > 0 ? (
                <div className="space-y-1 max-w-[200px]">
                  {session.analysis.email_links.slice(0, 2).map((email, i) => (
                    <a
                      key={i}
                      href={`mailto:${email}`}
                      className="flex items-center gap-1 text-sm text-info-600 dark:text-info-500 hover:underline truncate"
                    >
                      <Mail size={12} className="flex-shrink-0" />
                      <span className="truncate">{email}</span>
                    </a>
                  ))}
                  {session.analysis.email_links.length > 2 && (
                    <p className="text-xs text-foreground-tertiary">+{session.analysis.email_links.length - 2} more</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-foreground-tertiary">-</p>
              )}
            </TableCell>
            {actionsCell}
          </>
        );

      case 'audience':
        return (
          <>
            {sessionCell}
            {botCell}
            <TableCell>
              <p className="text-sm text-foreground">{session.visitor_country || '-'}</p>
            </TableCell>
            <TableCell>
              <p className="text-sm text-foreground">{session.analysis?.language || '-'}</p>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                {getDeviceIcon(session.device_type)}
                <span className="text-sm text-foreground capitalize">{session.device_type || '-'}</span>
              </div>
            </TableCell>
            <TableCell>
              <p className="text-sm text-foreground">{session.browser_name || '-'}</p>
            </TableCell>
            {actionsCell}
          </>
        );

      case 'animations':
        // Extract easter egg names from transcript
        const easterEggNames = session.full_transcript
          ?.filter(msg => msg.easter && msg.easter.trim() !== '')
          .map(msg => msg.easter as string) || [];
        const uniqueEasterEggs = [...new Set(easterEggNames)];
        const easterEggCount = session.easter_eggs_triggered || 0;

        return (
          <>
            {sessionCell}
            {botCell}
            <TableCell>
              {uniqueEasterEggs.length > 0 ? (
                <p className="text-sm text-foreground">{uniqueEasterEggs.join(', ')}</p>
              ) : easterEggCount > 0 ? (
                <p className="text-sm text-foreground">{easterEggCount} triggered</p>
              ) : (
                <p className="text-sm text-foreground-tertiary">-</p>
              )}
            </TableCell>
            <TableCell>
              <p className="text-sm text-foreground">
                {session.glb_source === 'cdn_fetch' ? 'New visitor' : session.glb_source === 'memory_cache' ? 'Returning' : '-'}
              </p>
            </TableCell>
            <TableCell>
              <p className="text-sm text-foreground">
                {session.glb_source ? (
                  session.glb_transfer_size ? `${(session.glb_transfer_size / 1024).toFixed(1)} KB` : session.glb_source
                ) : '-'}
              </p>
            </TableCell>
            {actionsCell}
          </>
        );

      case 'costs':
        const analysisCost = session.analysis?.analytics_total_cost_eur || 0;
        const chatCost = session.total_cost_eur || 0;
        const totalCost = chatCost + analysisCost;
        return (
          <>
            {sessionCell}
            {botCell}
            <TableCell>
              <p className="text-sm text-foreground">{session.total_tokens?.toLocaleString() || '-'}</p>
            </TableCell>
            <TableCell>
              <p className="text-sm text-foreground">{formatCost(chatCost)}</p>
            </TableCell>
            <TableCell>
              <p className="text-sm text-foreground">{formatCost(analysisCost)}</p>
            </TableCell>
            <TableCell>
              <p className="text-sm font-medium text-foreground">{formatCost(totalCost)}</p>
            </TableCell>
            {actionsCell}
          </>
        );

      case 'custom':
        return (
          <>
            {sessionCell}
            {botCell}
            <TableCell>
              <p className="text-sm text-foreground-tertiary">-</p>
            </TableCell>
            <TableCell>
              <p className="text-sm text-foreground-tertiary">-</p>
            </TableCell>
            {actionsCell}
          </>
        );

      default:
        return null;
    }
  };

  // Render table
  const renderTable = () => {
    if (loading) {
      return (
        <Card className="flex items-center justify-center py-12">
          <Spinner size="lg" />
          <span className="ml-3 text-foreground-secondary">Loading conversations...</span>
        </Card>
      );
    }

    if (filteredSessions.length === 0) {
      return (
        <EmptyState
          icon={<MessageSquare size={48} />}
          title="No conversations found"
          message={sessions.length === 0 ? "No conversations yet for this time period" : "Try adjusting your search or filters"}
        />
      );
    }

    return (
      <Card padding="none" className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {renderTableHeaders()}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedSessions.map((session) => (
              <TableRow key={session.id}>
                {renderTableRow(session)}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="px-6 py-4 flex items-center justify-between bg-background-secondary border-t border-border">
          <p className="text-sm text-foreground-secondary">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredSessions.length)} of {filteredSessions.length}
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg hover:bg-background-hover disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} className="text-foreground-secondary" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'text-white'
                        : 'text-foreground-secondary hover:bg-background-hover'
                    }`}
                    style={currentPage === page ? { backgroundColor: brandColor } : {}}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg hover:bg-background-hover disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} className="text-foreground-secondary" />
              </button>
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <Page>
      <PageContent>
        <PageHeader
          title="Conversations"
          description="View and manage all customer conversations"
        />

        {/* Filters Bar */}
        <Card className="mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[300px]">
              <Input
                icon={<Search size={20} />}
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select
              fullWidth={false}
              options={workspaceOptions}
              value={selectedWorkspace}
              onChange={(e) => setSelectedWorkspace(e.target.value)}
            />

            <Select
              fullWidth={false}
              options={botOptions}
              value={selectedBot}
              onChange={(e) => setSelectedBot(e.target.value)}
            />

            <Select
              fullWidth={false}
              options={statusOptions}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            />

            <Select
              fullWidth={false}
              options={dateRangeOptions}
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            />

            <Button icon={<Download size={18} />}>
              Export
            </Button>
          </div>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          <Card padding="sm">
            <p className="text-sm text-foreground-secondary mb-1">Total Conversations</p>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          </Card>
          <Card padding="sm">
            <p className="text-sm text-foreground-secondary mb-1">Resolved</p>
            <p className="text-2xl font-bold text-foreground">{stats.resolved}</p>
            <p className="text-xs text-foreground-tertiary mt-1">{stats.resolutionRate.toFixed(0)}% resolution rate</p>
          </Card>
          <Card padding="sm">
            <p className="text-sm text-foreground-secondary mb-1">Avg Duration</p>
            <p className="text-2xl font-bold text-foreground">{stats.avgDuration.toFixed(1)} min</p>
          </Card>
          <Card padding="sm">
            <p className="text-sm text-foreground-secondary mb-1">Sentiment</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-sm">
                <ThumbsUp size={14} className="text-success-600 dark:text-success-500" />
                {stats.sentimentCounts.positive}
              </span>
              <span className="flex items-center gap-1 text-sm">
                <Minus size={14} className="text-foreground-tertiary" />
                {stats.sentimentCounts.neutral}
              </span>
              <span className="flex items-center gap-1 text-sm">
                <ThumbsDown size={14} className="text-error-600 dark:text-error-500" />
                {stats.sentimentCounts.negative}
              </span>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Card className="mb-6 p-0">
          <div className="border-b border-border">
            <nav className="flex space-x-8 px-6 overflow-x-auto" aria-label="Tabs">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'border-interactive text-foreground'
                        : 'border-transparent text-foreground-tertiary hover:text-foreground-secondary hover:border-border'
                    }`}
                    style={activeTab === tab.id ? { borderBottomColor: brandColor } : {}}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </Card>

        {/* Table Content */}
        {renderTable()}

        {/* Transcript Modal */}
        <Modal
          isOpen={!!selectedSession}
          onClose={handleCloseTranscript}
          title="Transcript"
          size="lg"
        >
          {selectedSession && (
            <div className="max-h-[60vh] overflow-y-auto space-y-3">
              {selectedSession.full_transcript?.map((msg, i) => {
                const userTextColor = getContrastTextColor(brandColor);

                return (
                  <div
                    key={i}
                    className={`flex ${msg.author === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                        msg.author === 'user'
                          ? 'rounded-br-md'
                          : 'rounded-bl-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                      }`}
                      style={msg.author === 'user' ? {
                        backgroundColor: brandColor,
                        color: userTextColor,
                      } : undefined}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  </div>
                );
              }) || (
                <p className="text-center text-foreground-tertiary">No transcript available</p>
              )}
            </div>
          )}
        </Modal>

        {/* Questions Modal */}
        <Modal
          isOpen={!!questionsSession}
          onClose={() => setQuestionsSession(null)}
          title={questionsType === 'asked' ? 'Questions Asked' : 'Unanswered Questions'}
          size="md"
        >
          {questionsSession && (
            <div className="max-h-[60vh] overflow-y-auto">
              {(() => {
                const questions = questionsType === 'asked'
                  ? questionsSession.analysis?.questions
                  : questionsSession.analysis?.unanswered_questions;

                if (!questions || questions.length === 0) {
                  return (
                    <p className="text-center text-foreground-tertiary py-4">
                      No {questionsType === 'asked' ? 'questions' : 'unanswered questions'} found
                    </p>
                  );
                }

                return (
                  <ul className="space-y-3">
                    {questions.map((question, i) => (
                      <li
                        key={i}
                        className="flex gap-3 p-3 bg-background-secondary rounded-lg"
                      >
                        <span
                          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
                          style={{
                            backgroundColor: questionsType === 'asked' ? brandColor : '#F59E0B',
                            color: questionsType === 'asked' ? getContrastTextColor(brandColor) : '#000'
                          }}
                        >
                          {i + 1}
                        </span>
                        <p className="text-sm text-foreground">{question}</p>
                      </li>
                    ))}
                  </ul>
                );
              })()}
            </div>
          )}
        </Modal>
      </PageContent>
    </Page>
  );
}
