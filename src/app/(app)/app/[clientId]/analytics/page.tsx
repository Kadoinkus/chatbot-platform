'use client';
import { useState, useMemo, useEffect, useRef } from 'react';
import { getClientById, getBotsByClientId, getBotSessionsByClientId, getWorkspacesByClientId } from '@/lib/dataService';
import type { Client, Bot, BotSession, Workspace } from '@/lib/dataService';
import { getClientBrandColor } from '@/lib/brandColors';
import Sidebar from '@/components/Sidebar';
import { UsageLine, IntentBars, MultiLineChart } from '@/components/Charts';
import { Calendar, Download, Filter, TrendingUp, MessageSquare, Clock, Star, Users, AlertTriangle, CheckCircle, ChevronDown, X, BarChart3, Target, Settings, FileText } from 'lucide-react';

export default function AnalyticsDashboardPage({ params }: { params: { clientId: string } }) {
  const [client, setClient] = useState<Client | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [bots, setBots] = useState<Bot[]>([]);
  const [sessions, setSessions] = useState<BotSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7days');
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('all');
  const [selectedBots, setSelectedBots] = useState<string[]>(['all']);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [metric, setMetric] = useState('conversations');
  const [activeTab, setActiveTab] = useState('overview');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load data
  useEffect(() => {
    async function loadData() {
      try {
        const clientData = await getClientById(params.clientId);
        const workspacesData = await getWorkspacesByClientId(params.clientId);
        const botsData = await getBotsByClientId(params.clientId);
        const sessionsData = await getBotSessionsByClientId(params.clientId);
        
        setClient(clientData || null);
        setWorkspaces(workspacesData);
        setBots(botsData);
        setSessions(sessionsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params.clientId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter bots and sessions based on workspace and bot selection
  const { filteredBots, filteredSessions } = useMemo(() => {
    if (!bots.length) return { filteredBots: [], filteredSessions: [] };
    
    // First filter by workspace
    const workspaceFilteredBots = selectedWorkspace === 'all' 
      ? bots 
      : bots.filter(bot => bot.workspaceId === selectedWorkspace);
    
    // Then filter by bot selection within workspace
    const selectedBotsList = selectedBots.includes('all') || selectedBots.length === 0
      ? workspaceFilteredBots 
      : workspaceFilteredBots.filter(bot => selectedBots.includes(bot.id));
    
    const selectedBotIds = selectedBotsList.map(bot => bot.id);
    const filteredSessionsList = sessions.filter(session => selectedBotIds.includes(session.bot_id));
    
    return { filteredBots: selectedBotsList, filteredSessions: filteredSessionsList };
  }, [bots, sessions, selectedWorkspace, selectedBots]);

  // Reset bot selection when workspace changes
  useEffect(() => {
    setSelectedBots(['all']);
  }, [selectedWorkspace]);

  // Calculate metrics from sessions
  const metrics = useMemo(() => {
    if (!filteredSessions.length) {
      return {
        totalConversations: 0,
        avgResponseTime: 0,
        avgResolutionRate: 0,
        avgCsat: 0
      };
    }

    const totalConversations = filteredSessions.length;
    const avgResponseTime = filteredSessions.reduce((sum, s) => sum + s.avg_response_time, 0) / filteredSessions.length / 1000; // Convert to seconds
    const resolvedSessions = filteredSessions.filter(s => s.resolution_type === 'self_service' || s.completion_status === 'completed').length;
    const avgResolutionRate = (resolvedSessions / totalConversations) * 100;
    const avgCsat = filteredSessions.reduce((sum, s) => sum + s.user_rating, 0) / filteredSessions.length;

    return {
      totalConversations,
      avgResponseTime,
      avgResolutionRate,
      avgCsat
    };
  }, [filteredSessions]);

  // Bot selection handlers
  const handleBotToggle = (botId: string) => {
    if (botId === 'all') {
      // Toggle "All Bots" selection
      if (selectedBots.includes('all') || selectedBots.length === 0) {
        // If "All Bots" is currently selected, deselect it (go to no selection)
        setSelectedBots([]);
      } else {
        // If individual bots are selected, switch to "All Bots"
        setSelectedBots(['all']);
      }
    } else {
      setSelectedBots(prev => {
        // Remove 'all' if it's selected and we're selecting individual bots
        const withoutAll = prev.filter(id => id !== 'all');
        
        if (prev.includes(botId)) {
          // Deselect the bot
          return withoutAll.filter(id => id !== botId);
        } else {
          // Select the bot
          return [...withoutAll, botId];
        }
      });
    }
  };

  const getSelectionLabel = () => {
    const workspaceFilteredBots = bots.filter(bot => 
      selectedWorkspace === 'all' || bot.workspaceId === selectedWorkspace
    );
      
    if (selectedBots.includes('all') || selectedBots.length === 0) {
      return 'All Bots';
    }
    if (selectedBots.length === 1) {
      const bot = workspaceFilteredBots.find(b => b.id === selectedBots[0]);
      return bot?.name || 'Select Bots';
    }
    return `${selectedBots.length} Bots Selected`;
  };

  // Calculate real advanced metrics from session data
  const advancedMetrics = useMemo(() => {
    if (!filteredSessions.length) {
      return {
        containmentRate: 0,
        handoffRate: 0,
        avgConversationLength: 0,
        peakHours: [],
        topChannels: [],
        sentimentAnalysis: { positive: 0, neutral: 0, negative: 0 }
      };
    }

    // Containment rate (sessions NOT handed off to humans)
    const handoffSessions = filteredSessions.filter(s => s.bot_handoff === true).length;
    const containmentRate = Math.round(((filteredSessions.length - handoffSessions) / filteredSessions.length) * 100);
    const handoffRate = Math.round((handoffSessions / filteredSessions.length) * 100);

    // Average conversation length (messages per session)
    const avgConversationLength = parseFloat((filteredSessions.reduce((sum, s) => sum + s.messages_sent, 0) / filteredSessions.length).toFixed(1));

    // Peak hours analysis
    const hourCounts = filteredSessions.reduce((acc, session) => {
      const hour = new Date(session.start_time).getHours();
      const timeSlot = hour < 12 ? `${hour}AM` : hour === 12 ? '12PM' : `${hour - 12}PM`;
      acc[timeSlot] = (acc[timeSlot] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const peakHours = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => hour);

    // Channel distribution from real session data
    const channelCounts = filteredSessions.reduce((acc, session) => {
      const channel = session.channel || 'webchat';
      acc[channel] = (acc[channel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const totalSessions = filteredSessions.length;
    const topChannels = Object.entries(channelCounts)
      .map(([name, count]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        percentage: Math.round((count / totalSessions) * 100),
        count
      }))
      .sort((a, b) => b.count - a.count);

    // Sentiment analysis from real session data
    const sentimentCounts = filteredSessions.reduce((acc, session) => {
      const sentiment = session.sentiment || 'neutral';
      acc[sentiment] = (acc[sentiment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const sentimentAnalysis = {
      positive: Math.round(((sentimentCounts.positive || 0) / totalSessions) * 100),
      neutral: Math.round(((sentimentCounts.neutral || 0) / totalSessions) * 100),
      negative: Math.round(((sentimentCounts.negative || 0) / totalSessions) * 100)
    };

    return {
      containmentRate,
      handoffRate,
      avgConversationLength,
      peakHours,
      topChannels,
      sentimentAnalysis
    };
  }, [filteredSessions]);

  // Calculate weekly comparison from real session data
  const weeklyComparison = useMemo(() => {
    if (!filteredSessions.length) return [];

    const now = new Date();
    const weeklyData = [];

    for (let weekOffset = 0; weekOffset < 4; weekOffset++) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (weekOffset * 7) - now.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const weekSessions = filteredSessions.filter(session => {
        const sessionDate = new Date(session.start_time);
        return sessionDate >= weekStart && sessionDate <= weekEnd;
      });

      const resolvedSessions = weekSessions.filter(s => 
        s.resolution_type === 'self_service' || s.completion_status === 'completed'
      );

      const avgCsat = weekSessions.length > 0 
        ? parseFloat((weekSessions.reduce((sum, s) => sum + s.user_rating, 0) / weekSessions.length).toFixed(1))
        : 0;

      const periodLabel = weekOffset === 0 ? 'This Week' : 
                         weekOffset === 1 ? 'Last Week' : 
                         `${weekOffset} Weeks Ago`;

      weeklyData.push({
        period: periodLabel,
        conversations: weekSessions.length,
        resolved: resolvedSessions.length,
        csat: avgCsat
      });
    }

    return weeklyData;
  }, [filteredSessions]);

  // Tab configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'user-journey', label: 'User Journey', icon: Users },
    { id: 'business-impact', label: 'Business Impact', icon: Target },
    { id: 'operations', label: 'Operations', icon: Settings },
    { id: 'reports', label: 'Reports', icon: FileText }
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar clientId={params.clientId} />
        <main className="flex-1 lg:ml-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground"></div>
        </main>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar clientId={params.clientId} />
        <main className="flex-1 lg:ml-16 p-6">
          <p className="text-foreground-secondary">Client not found</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar clientId={client.id} />

      <main className="flex-1 lg:ml-16 min-h-screen">
        <div className="container max-w-7xl mx-auto p-4 lg:p-8 pt-20 lg:pt-8">
          <div className="mb-6 lg:mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Analytics Dashboard</h1>
                <p className="text-foreground-secondary">
                  {selectedWorkspace === 'all'
                    ? `Comprehensive insights for ${client.name}`
                    : `${workspaces.find(w => w.id === selectedWorkspace)?.name || 'Workspace'} - ${client.name}`
                  }
                </p>
              </div>
              <div className="flex gap-3 flex-wrap items-end">
                {/* Workspace Selector */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-foreground-secondary">Workspace:</span>
                  </div>
                  <select
                    value={selectedWorkspace}
                    onChange={(e) => setSelectedWorkspace(e.target.value)}
                    className="select min-w-[180px]"
                  >
                    <option value="all">All Workspaces</option>
                    {workspaces.map(workspace => (
                      <option key={workspace.id} value={workspace.id}>
                        {workspace.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bot Selection Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-foreground-secondary">Bot Selection:</span>
                  </div>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 h-11 px-4 bg-info-100 dark:bg-info-700/30 border-2 border-info-500/30 rounded-xl hover:bg-info-100/80 dark:hover:bg-info-700/40 focus:outline-none focus:ring-2 focus:ring-info-500 min-w-[200px] justify-between"
                  >
                    <span className="truncate font-medium text-info-700 dark:text-info-500">{getSelectionLabel()}</span>
                    <ChevronDown size={16} className={`transition-transform text-info-600 dark:text-info-500 ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-72 bg-surface-elevated border border-border rounded-lg shadow-lg z-50">
                      <div className="p-3 border-b border-border">
                        <h4 className="font-medium text-sm text-foreground-secondary">Select Bots to Compare</h4>
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        <label className="flex items-center gap-3 p-3 hover:bg-background-hover cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedBots.includes('all') || selectedBots.length === 0}
                            onChange={() => handleBotToggle('all')}
                            className="rounded border-border text-interactive focus:ring-interactive"
                          />
                          <span className="text-sm font-medium text-foreground">All Bots</span>
                        </label>
                        <hr className="mx-3 border-border" />
                        {selectedWorkspace === 'all' ? (
                          // Group by workspace when "All Workspaces" is selected
                          workspaces.map(workspace => {
                            const workspaceBots = bots.filter(bot => bot.workspaceId === workspace.id);
                            if (workspaceBots.length === 0) return null;

                            return (
                              <div key={workspace.id}>
                                <div className="px-3 py-2 text-xs font-medium text-foreground-tertiary bg-background-secondary border-t border-border">
                                  {workspace.name}
                                </div>
                                {workspaceBots.map(bot => {
                                  const botSessions = sessions.filter(s => s.bot_id === bot.id);
                                  return (
                                    <label key={bot.id} className="flex items-center gap-3 p-3 hover:bg-background-hover cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={selectedBots.includes(bot.id)}
                                        onChange={() => handleBotToggle(bot.id)}
                                        className="rounded border-border text-interactive focus:ring-interactive"
                                      />
                                      <img
                                        src={bot.image}
                                        alt={bot.name}
                                        className="w-6 h-6 rounded-full"
                                        style={{ backgroundColor: getClientBrandColor(bot.clientId) }}
                                      />
                                      <div className="flex-1">
                                        <span className="text-sm font-medium text-foreground">{bot.name}</span>
                                        <div className="text-xs text-foreground-tertiary">{botSessions.length} sessions</div>
                                      </div>
                                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        bot.status === 'Live' ? 'bg-success-100 dark:bg-success-700/30 text-success-700 dark:text-success-500' :
                                        bot.status === 'Paused' ? 'bg-warning-100 dark:bg-warning-700/30 text-warning-700 dark:text-warning-500' :
                                        'bg-error-100 dark:bg-error-700/30 text-error-700 dark:text-error-500'
                                      }`}>
                                        {bot.status}
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                            );
                          })
                        ) : (
                          // Show bots from selected workspace only
                          bots.filter(bot => bot.workspaceId === selectedWorkspace).map(bot => {
                            const botSessions = sessions.filter(s => s.bot_id === bot.id);
                            return (
                              <label key={bot.id} className="flex items-center gap-3 p-3 hover:bg-background-hover cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedBots.includes(bot.id)}
                                  onChange={() => handleBotToggle(bot.id)}
                                  className="rounded border-border text-interactive focus:ring-interactive"
                                />
                                <img
                                  src={bot.image}
                                  alt={bot.name}
                                  className="w-6 h-6 rounded-full"
                                  style={{ backgroundColor: getClientBrandColor(bot.clientId) }}
                                />
                                <div className="flex-1">
                                  <span className="text-sm font-medium text-foreground">{bot.name}</span>
                                  <div className="text-xs text-foreground-tertiary">{botSessions.length} sessions</div>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  bot.status === 'Live' ? 'bg-success-100 dark:bg-success-700/30 text-success-700 dark:text-success-500' :
                                  bot.status === 'Paused' ? 'bg-warning-100 dark:bg-warning-700/30 text-warning-700 dark:text-warning-500' :
                                  'bg-error-100 dark:bg-error-700/30 text-error-700 dark:text-error-500'
                                }`}>
                                  {bot.status}
                                </span>
                              </label>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="select min-w-[140px]"
                >
                  <option value="today">Today</option>
                  <option value="7days">Last 7 days</option>
                  <option value="30days">Last 30 days</option>
                  <option value="90days">Last 90 days</option>
                  <option value="custom">Custom range</option>
                </select>
                <button className="btn-secondary">
                  <Filter size={18} />
                  Filters
                </button>
                <button className="btn-primary">
                  <Download size={18} />
                  Export Report
                </button>
              </div>

            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6">
            <div className="border-b border-border">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-foreground text-foreground'
                          : 'border-transparent text-foreground-tertiary hover:text-foreground-secondary hover:border-border-secondary'
                      }`}
                    >
                      <Icon
                        size={20}
                        className={`mr-2 ${
                          activeTab === tab.id ? 'text-foreground' : 'text-foreground-tertiary group-hover:text-foreground-secondary'
                        }`}
                      />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'performance' && renderPerformanceTab()}
          {activeTab === 'user-journey' && renderUserJourneyTab()}
          {activeTab === 'business-impact' && renderBusinessImpactTab()}
          {activeTab === 'operations' && renderOperationsTab()}
          {activeTab === 'reports' && renderReportsTab()}

          {/* Always Visible: Selected Bots Comparison Table */}
          <div className="card overflow-hidden mb-8">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">Selected Bots Comparison</h2>
              <p className="text-sm text-foreground-secondary mt-1">
                {filteredBots.length === 0 ? 'No bots selected' :
                 selectedBots.includes('all') || selectedBots.length === 0 ? `All ${filteredBots.length} bots` :
                 `Comparing ${filteredBots.length} selected bots`}
              </p>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bot</th>
                  <th>Status</th>
                  <th>Sessions</th>
                  <th>Response Time</th>
                  <th>Resolution Rate</th>
                  <th>CSAT</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                {filteredBots.map(bot => {
                  const botSessions = sessions.filter(s => s.bot_id === bot.id);
                  const botMetrics = {
                    conversations: botSessions.length,
                    avgResponseTime: botSessions.length > 0 ? (botSessions.reduce((sum, s) => sum + s.avg_response_time, 0) / botSessions.length / 1000) : 0,
                    resolutionRate: botSessions.length > 0 ? ((botSessions.filter(s => s.resolution_type === 'self_service' || s.completion_status === 'completed').length / botSessions.length) * 100) : 0,
                    csat: botSessions.length > 0 ? (botSessions.reduce((sum, s) => sum + s.user_rating, 0) / botSessions.length) : 0
                  };

                  return (
                    <tr key={bot.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <img
                            src={bot.image}
                            alt={bot.name}
                            className="w-8 h-8 rounded-full"
                            style={{ backgroundColor: getClientBrandColor(bot.clientId) }}
                          />
                          <span className="font-medium text-foreground">{bot.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          bot.status === 'Live' ? 'bg-success-100 dark:bg-success-700/30 text-success-700 dark:text-success-500' :
                          bot.status === 'Paused' ? 'bg-warning-100 dark:bg-warning-700/30 text-warning-700 dark:text-warning-500' :
                          'bg-error-100 dark:bg-error-700/30 text-error-700 dark:text-error-500'
                        }`}>
                          {bot.status}
                        </span>
                      </td>
                      <td className="font-medium text-foreground">{botMetrics.conversations}</td>
                      <td className="text-foreground-secondary">{botMetrics.avgResponseTime.toFixed(1)}s</td>
                      <td className="text-foreground-secondary">{botMetrics.resolutionRate.toFixed(0)}%</td>
                      <td className="flex items-center gap-1">
                        <span className="text-foreground">{botMetrics.csat.toFixed(1)}</span>
                        <Star size={14} className="text-warning-500" />
                      </td>
                      <td>
                        <div className="flex items-center gap-1 text-success-600 dark:text-success-500">
                          <TrendingUp size={14} />
                          <span className="text-sm">+8%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );

  // Tab render functions
  function renderOverviewTab() {
    return (
      <div className="space-y-6">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-info-100 dark:bg-info-700/30 rounded-lg">
                <MessageSquare size={24} className="text-info-600 dark:text-info-500" />
              </div>
              <span className="text-sm text-success-600 dark:text-success-500 font-medium">+12%</span>
            </div>
            <h3 className="text-2xl font-bold text-foreground">{metrics.totalConversations.toLocaleString()}</h3>
            <p className="text-foreground-secondary text-sm">Total Sessions</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-success-100 dark:bg-success-700/30 rounded-lg">
                <CheckCircle size={24} className="text-success-600 dark:text-success-500" />
              </div>
              <span className="text-sm text-success-600 dark:text-success-500 font-medium">+5%</span>
            </div>
            <h3 className="text-2xl font-bold text-foreground">{metrics.avgResolutionRate.toFixed(0)}%</h3>
            <p className="text-foreground-secondary text-sm">Resolution Rate</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-warning-100 dark:bg-warning-700/30 rounded-lg">
                <Clock size={24} className="text-warning-600 dark:text-warning-500" />
              </div>
              <span className="text-sm text-error-600 dark:text-error-500 font-medium">-0.2s</span>
            </div>
            <h3 className="text-2xl font-bold text-foreground">{metrics.avgResponseTime.toFixed(1)}s</h3>
            <p className="text-foreground-secondary text-sm">Avg Response Time</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-plan-premium-bg rounded-lg">
                <Star size={24} className="text-plan-premium-text" />
              </div>
              <span className="text-sm text-success-600 dark:text-success-500 font-medium">+0.3</span>
            </div>
            <h3 className="text-2xl font-bold text-foreground">{metrics.avgCsat.toFixed(1)}</h3>
            <p className="text-foreground-secondary text-sm">Customer Satisfaction</p>
          </div>
        </div>

        {/* Overview Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Bot Performance Ranking</h2>
            <div className="space-y-4">
              {filteredBots.map((bot, index) => {
                const botSessions = sessions.filter(s => s.bot_id === bot.id);
                const resolutionRate = botSessions.length > 0
                  ? ((botSessions.filter(s => s.resolution_type === 'self_service' || s.completion_status === 'completed').length / botSessions.length) * 100)
                  : 0;

                return (
                  <div key={bot.id} className="flex items-center gap-4 p-4 bg-background-secondary rounded-lg">
                    <div className="text-2xl font-bold text-foreground-tertiary">#{index + 1}</div>
                    <img
                      src={bot.image}
                      alt={bot.name}
                      className="w-10 h-10 rounded-full"
                      style={{ backgroundColor: getClientBrandColor(bot.clientId) }}
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-foreground">{bot.name}</div>
                      <div className="text-sm text-foreground-secondary">{botSessions.length} sessions</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-success-600 dark:text-success-500">{resolutionRate.toFixed(0)}%</div>
                      <div className="text-sm text-foreground-secondary">Resolution</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Sessions by Bot</h2>
            <div className="space-y-3">
              {filteredBots.map(bot => {
                const botSessions = sessions.filter(s => s.bot_id === bot.id);
                const percentage = sessions.length > 0 ? (botSessions.length / filteredSessions.length) * 100 : 0;

                return (
                  <div key={bot.id} className="flex items-center gap-3">
                    <img
                      src={bot.image}
                      alt={bot.name}
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: getClientBrandColor(bot.clientId) }}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">{bot.name}</span>
                        <span className="text-sm text-foreground-secondary">{botSessions.length} ({percentage.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full bg-background-tertiary rounded-full h-2">
                        <div
                          className="bg-info-500 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderPerformanceTab() {
    // Calculate performance metrics for each bot
    const botPerformanceData = filteredBots.map(bot => {
      const botSessions = sessions.filter(s => s.bot_id === bot.id);
      if (botSessions.length === 0) return null;
      
      const avgResponseTime = botSessions.reduce((sum, s) => sum + s.avg_response_time, 0) / botSessions.length / 1000;
      const resolutionRate = (botSessions.filter(s => s.resolution_type === 'self_service' || s.completion_status === 'completed').length / botSessions.length) * 100;
      const csat = botSessions.reduce((sum, s) => sum + s.user_rating, 0) / botSessions.length;
      const handoffRate = (botSessions.filter(s => s.bot_handoff === true).length / botSessions.length) * 100;
      
      return {
        botName: bot.name,
        botImage: bot.image,
        botId: bot.id,
        avgResponseTime,
        resolutionRate,
        csat,
        handoffRate,
        totalSessions: botSessions.length
      };
    }).filter((item): item is NonNullable<typeof item> => item !== null);

    // Generate time-series data for trends (last 30 days)
    const generateTrendData = () => {
      const days = [];
      const now = new Date();
      
      // Generate last 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        days.push({
          date: date.toISOString().split('T')[0],
          displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        });
      }

      // Build data structure for charts - each day has all bot metrics
      const chartData = days.map(day => {
        const dayData: any = { date: day.displayDate };
        
        filteredBots.forEach(bot => {
          const botSessions = sessions.filter(s => {
            const sessionDate = new Date(s.start_time).toISOString().split('T')[0];
            return s.bot_id === bot.id && sessionDate === day.date;
          });

          if (botSessions.length === 0) {
            dayData[`${bot.name}_resolutionRate`] = null;
            dayData[`${bot.name}_responseTime`] = null;
            dayData[`${bot.name}_csat`] = null;
            dayData[`${bot.name}_handoffRate`] = null;
          } else {
            // Resolution Rate
            const resolved = botSessions.filter(s => 
              s.resolution_type === 'self_service' || s.completion_status === 'completed'
            ).length;
            dayData[`${bot.name}_resolutionRate`] = Math.round((resolved / botSessions.length) * 100);

            // Response Time
            const avgTime = botSessions.reduce((sum, s) => sum + s.avg_response_time, 0) / botSessions.length / 1000;
            dayData[`${bot.name}_responseTime`] = parseFloat(avgTime.toFixed(1));

            // CSAT
            const avgCsat = botSessions.reduce((sum, s) => sum + s.user_rating, 0) / botSessions.length;
            dayData[`${bot.name}_csat`] = parseFloat(avgCsat.toFixed(1));

            // Handoff Rate
            const handoffs = botSessions.filter(s => s.bot_handoff === true).length;
            dayData[`${bot.name}_handoffRate`] = Math.round((handoffs / botSessions.length) * 100);
          }
        });

        return dayData;
      });

      // Create series configurations for each metric
      const seriesConfig = {
        resolutionRate: filteredBots.map(bot => ({ name: bot.name, dataKey: `${bot.name}_resolutionRate` })),
        responseTime: filteredBots.map(bot => ({ name: bot.name, dataKey: `${bot.name}_responseTime` })),
        csat: filteredBots.map(bot => ({ name: bot.name, dataKey: `${bot.name}_csat` })),
        handoffRate: filteredBots.map(bot => ({ name: bot.name, dataKey: `${bot.name}_handoffRate` }))
      };

      return { chartData, seriesConfig };
    };

    const { chartData, seriesConfig } = generateTrendData();

    return (
      <div className="space-y-6">
        {/* Performance Metrics Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-info-100 dark:bg-info-700/30 rounded-lg">
                <Clock size={24} className="text-info-600 dark:text-info-500" />
              </div>
              <span className="text-sm text-success-600 dark:text-success-500 font-medium">-0.2s</span>
            </div>
            <h3 className="text-2xl font-bold text-foreground">{metrics.avgResponseTime.toFixed(1)}s</h3>
            <p className="text-foreground-secondary text-sm">Avg Response Time</p>
            <p className="text-xs text-foreground-tertiary mt-1">Across all selected bots</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-success-100 dark:bg-success-700/30 rounded-lg">
                <CheckCircle size={24} className="text-success-600 dark:text-success-500" />
              </div>
              <span className="text-sm text-success-600 dark:text-success-500 font-medium">+3%</span>
            </div>
            <h3 className="text-2xl font-bold text-foreground">{metrics.avgResolutionRate.toFixed(0)}%</h3>
            <p className="text-foreground-secondary text-sm">Resolution Rate</p>
            <p className="text-xs text-foreground-tertiary mt-1">Average across bots</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-plan-premium-bg rounded-lg">
                <Star size={24} className="text-plan-premium-text" />
              </div>
              <span className="text-sm text-success-600 dark:text-success-500 font-medium">+0.2</span>
            </div>
            <h3 className="text-2xl font-bold text-foreground">{metrics.avgCsat.toFixed(1)}</h3>
            <p className="text-foreground-secondary text-sm">Customer Satisfaction</p>
            <p className="text-xs text-foreground-tertiary mt-1">Average CSAT score</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-warning-100 dark:bg-warning-700/30 rounded-lg">
                <AlertTriangle size={24} className="text-warning-600 dark:text-warning-500" />
              </div>
              <span className="text-sm text-error-600 dark:text-error-500 font-medium">+1.2%</span>
            </div>
            <h3 className="text-2xl font-bold text-foreground">{advancedMetrics.handoffRate}%</h3>
            <p className="text-foreground-secondary text-sm">Handoff Rate</p>
            <p className="text-xs text-foreground-tertiary mt-1">Escalated to humans</p>
          </div>
        </div>

        {/* Performance Trend Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Resolution Rate Trends (30 Days)</h2>
            <div className="h-80">
              <MultiLineChart
                data={chartData}
                series={seriesConfig.resolutionRate}
                xAxisKey="date"
                yAxisLabel="Resolution Rate (%)"
                height={300}
              />
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Response Time Trends (30 Days)</h2>
            <div className="h-80">
              <MultiLineChart
                data={chartData}
                series={seriesConfig.responseTime}
                xAxisKey="date"
                yAxisLabel="Response Time (s)"
                height={300}
              />
            </div>
          </div>
        </div>

        {/* CSAT and Handoff Rate Trend Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">CSAT Score Trends (30 Days)</h2>
            <div className="h-80">
              <MultiLineChart
                data={chartData}
                series={seriesConfig.csat}
                xAxisKey="date"
                yAxisLabel="CSAT Score"
                height={300}
              />
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Handoff Rate Trends (30 Days)</h2>
            <div className="h-80">
              <MultiLineChart
                data={chartData}
                series={seriesConfig.handoffRate}
                xAxisKey="date"
                yAxisLabel="Handoff Rate (%)"
                height={300}
              />
            </div>
          </div>
        </div>

        {/* Performance Trends */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">Performance Leaderboard</h2>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Bot</th>
                  <th>Overall Score</th>
                  <th>Response Time</th>
                  <th>Resolution</th>
                  <th>CSAT</th>
                  <th>Sessions</th>
                </tr>
              </thead>
              <tbody>
                {botPerformanceData
                  .sort((a, b) => {
                    // Calculate overall score based on multiple factors
                    const scoreA = (a.resolutionRate * 0.4) + (a.csat * 20 * 0.3) + ((5 - Math.min(a.avgResponseTime, 5)) * 20 * 0.2) + ((100 - a.handoffRate) * 0.1);
                    const scoreB = (b.resolutionRate * 0.4) + (b.csat * 20 * 0.3) + ((5 - Math.min(b.avgResponseTime, 5)) * 20 * 0.2) + ((100 - b.handoffRate) * 0.1);
                    return scoreB - scoreA;
                  })
                  .map((bot, index) => {
                    const overallScore = (bot.resolutionRate * 0.4) + (bot.csat * 20 * 0.3) + ((5 - Math.min(bot.avgResponseTime, 5)) * 20 * 0.2) + ((100 - bot.handoffRate) * 0.1);

                    return (
                      <tr key={bot.botId}>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                              index === 0 ? 'bg-warning-500' :
                              index === 1 ? 'bg-foreground-tertiary' :
                              index === 2 ? 'bg-warning-600' : 'bg-foreground-disabled'
                            }`}>
                              {index + 1}
                            </div>
                            {index === 0 && <span className="text-xs text-warning-600 dark:text-warning-500 font-medium">Best</span>}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-3">
                            <img
                              src={bot.botImage}
                              alt={bot.botName}
                              className="w-8 h-8 rounded-full"
                              style={{ backgroundColor: getClientBrandColor(client?.id ?? '') }}
                            />
                            <span className="font-medium text-foreground">{bot.botName}</span>
                          </div>
                        </td>
                        <td>
                          <span className="font-semibold text-foreground">{overallScore.toFixed(0)}/100</span>
                        </td>
                        <td>
                          <span className={`${bot.avgResponseTime <= 1 ? 'text-success-600 dark:text-success-500' : bot.avgResponseTime <= 2 ? 'text-warning-600 dark:text-warning-500' : 'text-error-600 dark:text-error-500'}`}>
                            {bot.avgResponseTime.toFixed(1)}s
                          </span>
                        </td>
                        <td>
                          <span className="text-success-600 dark:text-success-500">{bot.resolutionRate.toFixed(0)}%</span>
                        </td>
                        <td className="flex items-center gap-1">
                          <span className="text-foreground">{bot.csat.toFixed(1)}</span>
                          <Star size={14} className="text-warning-500" />
                        </td>
                        <td className="text-foreground-secondary">{bot.totalSessions}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  function renderUserJourneyTab() {
    // Calculate user journey metrics for each bot
    const botJourneyData = filteredBots.map(bot => {
      const botSessions = sessions.filter(s => s.bot_id === bot.id);
      if (botSessions.length === 0) return null;

      // Journey completion analysis
      const completedJourneys = botSessions.filter(s => s.completion_status === 'completed').length;
      const partialJourneys = botSessions.filter(s => s.completion_status === 'partial').length;
      const escalatedJourneys = botSessions.filter(s => s.completion_status === 'escalated').length;
      const incompleteJourneys = botSessions.filter(s => s.completion_status === 'incomplete').length;

      // Journey step analysis
      const avgSteps = botSessions.reduce((sum, s) => sum + s.session_steps, 0) / botSessions.length;
      const avgMessages = botSessions.reduce((sum, s) => sum + s.messages_sent, 0) / botSessions.length;

      // User type analysis
      const newUsers = botSessions.filter(s => s.user_type === 'new').length;
      const returningUsers = botSessions.filter(s => s.user_type === 'returning').length;
      const existingUsers = botSessions.filter(s => s.user_type === 'existing').length;

      // Goal achievement
      const goalsAchieved = botSessions.filter(s => s.goal_achieved === true).length;
      const goalAchievementRate = (goalsAchieved / botSessions.length) * 100;

      return {
        botName: bot.name,
        botImage: bot.image,
        botId: bot.id,
        totalSessions: botSessions.length,
        completionRates: {
          completed: Math.round((completedJourneys / botSessions.length) * 100),
          partial: Math.round((partialJourneys / botSessions.length) * 100),
          escalated: Math.round((escalatedJourneys / botSessions.length) * 100),
          incomplete: Math.round((incompleteJourneys / botSessions.length) * 100)
        },
        avgSteps: parseFloat(avgSteps.toFixed(1)),
        avgMessages: parseFloat(avgMessages.toFixed(1)),
        userTypes: {
          new: Math.round((newUsers / botSessions.length) * 100),
          returning: Math.round((returningUsers / botSessions.length) * 100),
          existing: Math.round((existingUsers / botSessions.length) * 100)
        },
        goalAchievementRate: Math.round(goalAchievementRate)
      };
    }).filter((item): item is NonNullable<typeof item> => item !== null);

    // Generate journey flow data (completion funnel)
    const generateJourneyFlowData = () => {
      const flowData = filteredBots.map(bot => {
        const botSessions = sessions.filter(s => s.bot_id === bot.id);
        if (botSessions.length === 0) return null;

        return {
          botName: bot.name,
          started: botSessions.length,
          engaged: botSessions.filter(s => s.messages_sent >= 3).length,
          progressed: botSessions.filter(s => s.session_steps >= 5).length,
          completed: botSessions.filter(s => s.completion_status === 'completed').length,
          goalAchieved: botSessions.filter(s => s.goal_achieved === true).length
        };
      }).filter((item): item is NonNullable<typeof item> => item !== null);

      return flowData;
    };

    // Generate user journey time-series data
    const generateJourneyTrends = () => {
      const days = [];
      const now = new Date();
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        days.push({
          date: date.toISOString().split('T')[0],
          displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        });
      }

      const chartData = days.map(day => {
        const dayData: any = { date: day.displayDate };
        
        filteredBots.forEach(bot => {
          const botSessions = sessions.filter(s => {
            const sessionDate = new Date(s.start_time).toISOString().split('T')[0];
            return s.bot_id === bot.id && sessionDate === day.date;
          });

          if (botSessions.length === 0) {
            dayData[`${bot.name}_completion`] = null;
            dayData[`${bot.name}_avgSteps`] = null;
            dayData[`${bot.name}_goalAchievement`] = null;
          } else {
            const completed = botSessions.filter(s => s.completion_status === 'completed').length;
            dayData[`${bot.name}_completion`] = Math.round((completed / botSessions.length) * 100);

            const avgSteps = botSessions.reduce((sum, s) => sum + s.session_steps, 0) / botSessions.length;
            dayData[`${bot.name}_avgSteps`] = parseFloat(avgSteps.toFixed(1));

            const goalAchieved = botSessions.filter(s => s.goal_achieved === true).length;
            dayData[`${bot.name}_goalAchievement`] = Math.round((goalAchieved / botSessions.length) * 100);
          }
        });

        return dayData;
      });

      const seriesConfig = {
        completion: filteredBots.map(bot => ({ name: bot.name, dataKey: `${bot.name}_completion` })),
        avgSteps: filteredBots.map(bot => ({ name: bot.name, dataKey: `${bot.name}_avgSteps` })),
        goalAchievement: filteredBots.map(bot => ({ name: bot.name, dataKey: `${bot.name}_goalAchievement` }))
      };

      return { chartData, seriesConfig };
    };

    const journeyFlowData = generateJourneyFlowData();
    const { chartData: journeyChartData, seriesConfig: journeySeriesConfig } = generateJourneyTrends();

    return (
      <div className="space-y-6">
        {/* Journey Metrics Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-info-100 dark:bg-info-700/30 rounded-lg">
                <Users size={24} className="text-info-600 dark:text-info-500" />
              </div>
              <span className="text-sm text-success-600 dark:text-success-500 font-medium">+5%</span>
            </div>
            <h3 className="text-2xl font-bold text-foreground">
              {Math.round(botJourneyData.reduce((sum, bot) => sum + bot.completionRates.completed, 0) / botJourneyData.length)}%
            </h3>
            <p className="text-foreground-secondary text-sm">Avg Completion Rate</p>
            <p className="text-xs text-foreground-tertiary mt-1">Across selected bots</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-success-100 dark:bg-success-700/30 rounded-lg">
                <Target size={24} className="text-success-600 dark:text-success-500" />
              </div>
              <span className="text-sm text-success-600 dark:text-success-500 font-medium">+8%</span>
            </div>
            <h3 className="text-2xl font-bold text-foreground">
              {Math.round(botJourneyData.reduce((sum, bot) => sum + bot.goalAchievementRate, 0) / botJourneyData.length)}%
            </h3>
            <p className="text-foreground-secondary text-sm">Goal Achievement</p>
            <p className="text-xs text-foreground-tertiary mt-1">Users reaching their goal</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-plan-premium-bg rounded-lg">
                <MessageSquare size={24} className="text-plan-premium-text" />
              </div>
              <span className="text-sm text-error-600 dark:text-error-500 font-medium">+0.3</span>
            </div>
            <h3 className="text-2xl font-bold text-foreground">
              {(botJourneyData.reduce((sum, bot) => sum + bot.avgSteps, 0) / botJourneyData.length).toFixed(1)}
            </h3>
            <p className="text-foreground-secondary text-sm">Avg Journey Steps</p>
            <p className="text-xs text-foreground-tertiary mt-1">Steps per session</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-warning-100 dark:bg-warning-700/30 rounded-lg">
                <TrendingUp size={24} className="text-warning-600 dark:text-warning-500" />
              </div>
              <span className="text-sm text-error-600 dark:text-error-500 font-medium">+2%</span>
            </div>
            <h3 className="text-2xl font-bold text-foreground">
              {Math.round(botJourneyData.reduce((sum, bot) => sum + bot.completionRates.escalated, 0) / botJourneyData.length)}%
            </h3>
            <p className="text-foreground-secondary text-sm">Escalation Rate</p>
            <p className="text-xs text-foreground-tertiary mt-1">Journeys escalated</p>
          </div>
        </div>

        {/* Journey Completion Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Journey Completion Trends (30 Days)</h2>
            <div className="h-80">
              <MultiLineChart
                data={journeyChartData}
                series={journeySeriesConfig.completion}
                xAxisKey="date"
                yAxisLabel="Completion Rate (%)"
                height={300}
              />
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Goal Achievement Trends (30 Days)</h2>
            <div className="h-80">
              <MultiLineChart
                data={journeyChartData}
                series={journeySeriesConfig.goalAchievement}
                xAxisKey="date"
                yAxisLabel="Goal Achievement (%)"
                height={300}
              />
            </div>
          </div>
        </div>

        {/* Journey Flow Analysis */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">User Journey Funnel Comparison</h2>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bot</th>
                  <th>Started</th>
                  <th>Engaged (3+ msgs)</th>
                  <th>Progressed (5+ steps)</th>
                  <th>Completed</th>
                  <th>Goal Achieved</th>
                  <th>Conversion Rate</th>
                </tr>
              </thead>
              <tbody>
                {journeyFlowData.map(flow => {
                  const conversionRate = Math.round((flow.goalAchieved / flow.started) * 100);
                  return (
                    <tr key={flow.botName}>
                      <td className="font-medium text-foreground">{flow.botName}</td>
                      <td className="text-foreground-secondary">{flow.started.toLocaleString()}</td>
                      <td>
                        <span className="text-info-600 dark:text-info-500">{flow.engaged.toLocaleString()}</span>
                        <span className="text-xs text-foreground-tertiary ml-1">
                          ({Math.round((flow.engaged / flow.started) * 100)}%)
                        </span>
                      </td>
                      <td>
                        <span className="text-plan-premium-text">{flow.progressed.toLocaleString()}</span>
                        <span className="text-xs text-foreground-tertiary ml-1">
                          ({Math.round((flow.progressed / flow.started) * 100)}%)
                        </span>
                      </td>
                      <td>
                        <span className="text-success-600 dark:text-success-500">{flow.completed.toLocaleString()}</span>
                        <span className="text-xs text-foreground-tertiary ml-1">
                          ({Math.round((flow.completed / flow.started) * 100)}%)
                        </span>
                      </td>
                      <td>
                        <span className="text-warning-600 dark:text-warning-500 font-semibold">{flow.goalAchieved.toLocaleString()}</span>
                        <span className="text-xs text-foreground-tertiary ml-1">
                          ({Math.round((flow.goalAchieved / flow.started) * 100)}%)
                        </span>
                      </td>
                      <td>
                        <span className={`font-semibold ${
                          conversionRate >= 80 ? 'text-success-600 dark:text-success-500' :
                          conversionRate >= 60 ? 'text-warning-600 dark:text-warning-500' : 'text-error-600 dark:text-error-500'
                        }`}>
                          {conversionRate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Type Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">User Type Distribution</h2>
            <div className="space-y-4">
              {botJourneyData.map(bot => (
                <div key={bot.botId} className="space-y-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={bot.botImage}
                      alt={bot.botName}
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: getClientBrandColor(client?.id ?? '') }}
                    />
                    <span className="font-medium text-foreground">{bot.botName}</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-background-tertiary rounded-full h-3 overflow-hidden">
                      <div className="flex h-full">
                        <div
                          className="bg-success-500"
                          style={{ width: `${bot.userTypes.new}%` }}
                          title={`New Users: ${bot.userTypes.new}%`}
                        />
                        <div
                          className="bg-info-500"
                          style={{ width: `${bot.userTypes.returning}%` }}
                          title={`Returning Users: ${bot.userTypes.returning}%`}
                        />
                        <div
                          className="bg-plan-premium-text"
                          style={{ width: `${bot.userTypes.existing}%` }}
                          title={`Existing Users: ${bot.userTypes.existing}%`}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-foreground-secondary">
                    <span>New: {bot.userTypes.new}%</span>
                    <span>Returning: {bot.userTypes.returning}%</span>
                    <span>Existing: {bot.userTypes.existing}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Journey Complexity</h2>
            <div className="h-80">
              <MultiLineChart
                data={journeyChartData}
                series={journeySeriesConfig.avgSteps}
                xAxisKey="date"
                yAxisLabel="Average Steps"
                height={300}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderBusinessImpactTab() {
    // Calculate business impact metrics for each bot
    const botBusinessData = filteredBots.map(bot => {
      const botSessions = sessions.filter(s => s.bot_id === bot.id);
      if (botSessions.length === 0) return null;

      // Cost savings calculation
      const totalSessions = botSessions.length;
      const automationSavings = botSessions.reduce((sum, s) => sum + s.automation_saving, 0);
      const humanCostEquivalent = botSessions.reduce((sum, s) => sum + s.human_cost_equivalent, 0);
      const tokensCost = botSessions.reduce((sum, s) => sum + s.tokens_eur, 0);

      // ROI calculation
      const operationalCost = tokensCost + (totalSessions * 0.05); // Estimate operational costs
      const roi = ((automationSavings - operationalCost) / operationalCost) * 100;

      // Efficiency metrics
      const avgAutomationSaving = automationSavings / totalSessions;
      const costPerSession = operationalCost / totalSessions;
      const savingsPerSession = automationSavings / totalSessions;

      // Volume metrics
      const completedSessions = botSessions.filter(s => s.completion_status === 'completed').length;
      const escalatedSessions = botSessions.filter(s => s.completion_status === 'escalated').length;
      const containmentRate = ((totalSessions - escalatedSessions) / totalSessions) * 100;

      return {
        botName: bot.name,
        botImage: bot.image,
        botId: bot.id,
        totalSessions,
        automationSavings: Math.round(automationSavings),
        humanCostEquivalent: Math.round(humanCostEquivalent),
        operationalCost: Math.round(operationalCost),
        netSavings: Math.round(automationSavings - operationalCost),
        roi: Math.round(roi),
        avgAutomationSaving: parseFloat(avgAutomationSaving.toFixed(2)),
        costPerSession: parseFloat(costPerSession.toFixed(2)),
        savingsPerSession: parseFloat(savingsPerSession.toFixed(2)),
        containmentRate: Math.round(containmentRate),
        completedSessions,
        escalatedSessions
      };
    }).filter((item): item is NonNullable<typeof item> => item !== null);

    // Generate business impact time-series data
    const generateBusinessTrends = () => {
      const days = [];
      const now = new Date();
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        days.push({
          date: date.toISOString().split('T')[0],
          displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        });
      }

      const chartData = days.map(day => {
        const dayData: any = { date: day.displayDate };
        
        filteredBots.forEach(bot => {
          const botSessions = sessions.filter(s => {
            const sessionDate = new Date(s.start_time).toISOString().split('T')[0];
            return s.bot_id === bot.id && sessionDate === day.date;
          });

          if (botSessions.length === 0) {
            dayData[`${bot.name}_savings`] = null;
            dayData[`${bot.name}_cost`] = null;
            dayData[`${bot.name}_roi`] = null;
            dayData[`${bot.name}_volume`] = null;
          } else {
            const dailySavings = botSessions.reduce((sum, s) => sum + s.automation_saving, 0);
            const dailyCost = botSessions.reduce((sum, s) => sum + s.tokens_eur, 0) + (botSessions.length * 0.05);
            const dailyROI = dailyCost > 0 ? ((dailySavings - dailyCost) / dailyCost) * 100 : 0;

            dayData[`${bot.name}_savings`] = Math.round(dailySavings);
            dayData[`${bot.name}_cost`] = Math.round(dailyCost);
            dayData[`${bot.name}_roi`] = Math.round(dailyROI);
            dayData[`${bot.name}_volume`] = botSessions.length;
          }
        });

        return dayData;
      });

      const seriesConfig = {
        savings: filteredBots.map(bot => ({ name: bot.name, dataKey: `${bot.name}_savings` })),
        cost: filteredBots.map(bot => ({ name: bot.name, dataKey: `${bot.name}_cost` })),
        roi: filteredBots.map(bot => ({ name: bot.name, dataKey: `${bot.name}_roi` })),
        volume: filteredBots.map(bot => ({ name: bot.name, dataKey: `${bot.name}_volume` }))
      };

      return { chartData, seriesConfig };
    };

    const { chartData: businessChartData, seriesConfig: businessSeriesConfig } = generateBusinessTrends();

    // Calculate totals across all bots
    const totalMetrics = {
      totalSavings: botBusinessData.reduce((sum, bot) => sum + bot.automationSavings, 0),
      totalCost: botBusinessData.reduce((sum, bot) => sum + bot.operationalCost, 0),
      totalSessions: botBusinessData.reduce((sum, bot) => sum + bot.totalSessions, 0),
      avgROI: botBusinessData.reduce((sum, bot) => sum + bot.roi, 0) / botBusinessData.length
    };

    return (
      <div className="space-y-6">
        {/* Business Impact Metrics Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-success-100 dark:bg-success-700/30 rounded-lg">
                <TrendingUp size={24} className="text-success-600 dark:text-success-500" />
              </div>
              <span className="text-sm text-success-600 dark:text-success-500 font-medium">+15%</span>
            </div>
            <h3 className="text-2xl font-bold text-foreground">€{totalMetrics.totalSavings.toLocaleString()}</h3>
            <p className="text-foreground-secondary text-sm">Total Cost Savings</p>
            <p className="text-xs text-foreground-tertiary mt-1">Automation benefits</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-info-100 dark:bg-info-700/30 rounded-lg">
                <Target size={24} className="text-info-600 dark:text-info-500" />
              </div>
              <span className="text-sm text-success-600 dark:text-success-500 font-medium">+{Math.round(totalMetrics.avgROI)}%</span>
            </div>
            <h3 className="text-2xl font-bold text-foreground">{Math.round(totalMetrics.avgROI)}%</h3>
            <p className="text-foreground-secondary text-sm">Average ROI</p>
            <p className="text-xs text-foreground-tertiary mt-1">Return on investment</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-plan-premium-bg rounded-lg">
                <MessageSquare size={24} className="text-plan-premium-text" />
              </div>
              <span className="text-sm text-error-600 dark:text-error-500 font-medium">€{totalMetrics.totalCost.toLocaleString()}</span>
            </div>
            <h3 className="text-2xl font-bold text-foreground">€{(totalMetrics.totalSavings - totalMetrics.totalCost).toLocaleString()}</h3>
            <p className="text-foreground-secondary text-sm">Net Profit</p>
            <p className="text-xs text-foreground-tertiary mt-1">Savings minus costs</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-warning-100 dark:bg-warning-700/30 rounded-lg">
                <Users size={24} className="text-warning-600 dark:text-warning-500" />
              </div>
              <span className="text-sm text-success-600 dark:text-success-500 font-medium">+12%</span>
            </div>
            <h3 className="text-2xl font-bold text-foreground">{totalMetrics.totalSessions.toLocaleString()}</h3>
            <p className="text-foreground-secondary text-sm">Total Sessions</p>
            <p className="text-xs text-foreground-tertiary mt-1">Automated interactions</p>
          </div>
        </div>

        {/* Business Impact Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Daily Cost Savings (30 Days)</h2>
            <div className="h-80">
              <MultiLineChart
                data={businessChartData}
                series={businessSeriesConfig.savings}
                xAxisKey="date"
                yAxisLabel="Savings (€)"
                height={300}
              />
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">ROI Trends (30 Days)</h2>
            <div className="h-80">
              <MultiLineChart
                data={businessChartData}
                series={businessSeriesConfig.roi}
                xAxisKey="date"
                yAxisLabel="ROI (%)"
                height={300}
              />
            </div>
          </div>
        </div>

        {/* Cost vs Savings Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Operational Cost Trends (30 Days)</h2>
            <div className="h-80">
              <MultiLineChart
                data={businessChartData}
                series={businessSeriesConfig.cost}
                xAxisKey="date"
                yAxisLabel="Cost (€)"
                height={300}
              />
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Session Volume Trends (30 Days)</h2>
            <div className="h-80">
              <MultiLineChart
                data={businessChartData}
                series={businessSeriesConfig.volume}
                xAxisKey="date"
                yAxisLabel="Daily Sessions"
                height={300}
              />
            </div>
          </div>
        </div>

        {/* Business Impact Comparison Table */}
        <div className="card overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">Business Impact Comparison</h2>
            <p className="text-sm text-foreground-secondary mt-1">Financial performance across selected bots</p>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bot</th>
                  <th>Sessions</th>
                  <th>Cost Savings</th>
                  <th>Operational Cost</th>
                  <th>Net Profit</th>
                  <th>ROI</th>
                  <th>Cost/Session</th>
                  <th>Containment</th>
                </tr>
              </thead>
              <tbody>
                {botBusinessData
                  .sort((a, b) => b.netSavings - a.netSavings)
                  .map(bot => (
                    <tr key={bot.botId}>
                      <td>
                        <div className="flex items-center gap-3">
                          <img
                            src={bot.botImage}
                            alt={bot.botName}
                            className="w-8 h-8 rounded-full"
                            style={{ backgroundColor: getClientBrandColor(client?.id ?? '') }}
                          />
                          <span className="font-medium text-foreground">{bot.botName}</span>
                        </div>
                      </td>
                      <td className="text-foreground-secondary">{bot.totalSessions.toLocaleString()}</td>
                      <td className="text-success-600 dark:text-success-500 font-semibold">€{bot.automationSavings.toLocaleString()}</td>
                      <td className="text-error-600 dark:text-error-500">€{bot.operationalCost.toLocaleString()}</td>
                      <td>
                        <span className={`font-semibold ${bot.netSavings > 0 ? 'text-success-600 dark:text-success-500' : 'text-error-600 dark:text-error-500'}`}>
                          €{bot.netSavings.toLocaleString()}
                        </span>
                      </td>
                      <td>
                        <span className={`font-semibold ${bot.roi > 0 ? 'text-success-600 dark:text-success-500' : 'text-error-600 dark:text-error-500'}`}>
                          {bot.roi}%
                        </span>
                      </td>
                      <td className="text-foreground-secondary">€{bot.costPerSession}</td>
                      <td>
                        <span className={`${bot.containmentRate >= 80 ? 'text-success-600 dark:text-success-500' : bot.containmentRate >= 60 ? 'text-warning-600 dark:text-warning-500' : 'text-error-600 dark:text-error-500'}`}>
                          {bot.containmentRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
              <tfoot className="bg-background-secondary font-semibold">
                <tr>
                  <td className="text-foreground">Total</td>
                  <td className="text-foreground">{totalMetrics.totalSessions.toLocaleString()}</td>
                  <td className="text-success-600 dark:text-success-500">€{totalMetrics.totalSavings.toLocaleString()}</td>
                  <td className="text-error-600 dark:text-error-500">€{totalMetrics.totalCost.toLocaleString()}</td>
                  <td className="text-success-600 dark:text-success-500">€{(totalMetrics.totalSavings - totalMetrics.totalCost).toLocaleString()}</td>
                  <td className="text-success-600 dark:text-success-500">{Math.round(totalMetrics.avgROI)}%</td>
                  <td className="text-foreground-secondary">€{(totalMetrics.totalCost / totalMetrics.totalSessions).toFixed(2)}</td>
                  <td className="text-foreground-secondary">-</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Value Proposition Summary */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">Business Value Summary</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-success-100 dark:bg-success-700/30 rounded-lg">
              <div className="text-3xl font-bold text-success-600 dark:text-success-500 mb-2">
                €{Math.round((totalMetrics.totalSavings - totalMetrics.totalCost) / totalMetrics.totalSessions * 365).toLocaleString()}
              </div>
              <div className="text-sm font-medium text-success-700 dark:text-success-500">Annual Projected Savings</div>
              <div className="text-xs text-foreground-secondary mt-1">Based on current performance</div>
            </div>

            <div className="text-center p-4 bg-info-100 dark:bg-info-700/30 rounded-lg">
              <div className="text-3xl font-bold text-info-600 dark:text-info-500 mb-2">
                {Math.round(totalMetrics.totalSessions * 365 / 30).toLocaleString()}
              </div>
              <div className="text-sm font-medium text-info-700 dark:text-info-500">Annual Sessions Projected</div>
              <div className="text-xs text-foreground-secondary mt-1">Estimated yearly volume</div>
            </div>

            <div className="text-center p-4 bg-plan-premium-bg rounded-lg">
              <div className="text-3xl font-bold text-plan-premium-text mb-2">
                {Math.round(totalMetrics.totalSavings / totalMetrics.totalCost * 100) / 100}x
              </div>
              <div className="text-sm font-medium text-plan-premium-text">Cost Efficiency Ratio</div>
              <div className="text-xs text-foreground-secondary mt-1">Savings vs operational cost</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderOperationsTab() {
    return (
      <div className="space-y-6">
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">Operations Analytics Coming Soon</h2>
          <p className="text-foreground-secondary">Operational efficiency comparison will be implemented here.</p>
        </div>
      </div>
    );
  }

  function renderReportsTab() {
    return (
      <div className="space-y-6">
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">Reports & Export Coming Soon</h2>
          <p className="text-foreground-secondary">Advanced reporting and export features will be implemented here.</p>
        </div>
      </div>
    );
  }
}