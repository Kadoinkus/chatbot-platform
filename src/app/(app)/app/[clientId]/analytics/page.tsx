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
    return <div className="p-6">Loading...</div>;
  }

  if (!client) {
    return <div className="p-6">Client not found</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar clientId={client.id} />
      
      <main className="flex-1 lg:ml-16">
        <div className="container max-w-7xl mx-auto p-4 lg:p-8 pt-20 lg:pt-8">
          <div className="mb-6 lg:mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold mb-2">Analytics Dashboard</h1>
                <p className="text-gray-600">
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
                    <span className="text-sm font-medium text-gray-700">Workspace:</span>
                  </div>
                  <select
                    value={selectedWorkspace}
                    onChange={(e) => setSelectedWorkspace(e.target.value)}
                    className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black min-w-[180px]"
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
                    <span className="text-sm font-medium text-gray-700">Bot Selection:</span>
                  </div>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px] justify-between"
                  >
                    <span className="truncate font-medium text-blue-900">{getSelectionLabel()}</span>
                    <ChevronDown size={16} className={`transition-transform text-blue-600 ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {dropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <div className="p-3 border-b">
                        <h4 className="font-medium text-sm text-gray-700">Select Bots to Compare</h4>
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        <label className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedBots.includes('all') || selectedBots.length === 0}
                            onChange={() => handleBotToggle('all')}
                            className="rounded border-gray-300 text-black focus:ring-black"
                          />
                          <span className="text-sm font-medium">All Bots</span>
                        </label>
                        <hr className="mx-3" />
                        {selectedWorkspace === 'all' ? (
                          // Group by workspace when "All Workspaces" is selected
                          workspaces.map(workspace => {
                            const workspaceBots = bots.filter(bot => bot.workspaceId === workspace.id);
                            if (workspaceBots.length === 0) return null;
                            
                            return (
                              <div key={workspace.id}>
                                <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-t">
                                  {workspace.name}
                                </div>
                                {workspaceBots.map(bot => {
                                  const botSessions = sessions.filter(s => s.bot_id === bot.id);
                                  return (
                                    <label key={bot.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={selectedBots.includes(bot.id)}
                                        onChange={() => handleBotToggle(bot.id)}
                                        className="rounded border-gray-300 text-black focus:ring-black"
                                      />
                                      <img 
                                        src={bot.image} 
                                        alt={bot.name} 
                                        className="w-6 h-6 rounded-full" 
                                        style={{ backgroundColor: getClientBrandColor(bot.clientId) }}
                                      />
                                      <div className="flex-1">
                                        <span className="text-sm font-medium">{bot.name}</span>
                                        <div className="text-xs text-gray-500">{botSessions.length} sessions</div>
                                      </div>
                                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        bot.status === 'Live' ? 'bg-green-100 text-green-700' :
                                        bot.status === 'Paused' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
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
                              <label key={bot.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedBots.includes(bot.id)}
                                  onChange={() => handleBotToggle(bot.id)}
                                  className="rounded border-gray-300 text-black focus:ring-black"
                                />
                                <img 
                                  src={bot.image} 
                                  alt={bot.name} 
                                  className="w-6 h-6 rounded-full" 
                                  style={{ backgroundColor: getClientBrandColor(bot.clientId) }}
                                />
                                <div className="flex-1">
                                  <span className="text-sm font-medium">{bot.name}</span>
                                  <div className="text-xs text-gray-500">{botSessions.length} sessions</div>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  bot.status === 'Live' ? 'bg-green-100 text-green-700' :
                                  bot.status === 'Paused' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
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
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="today">Today</option>
                  <option value="7days">Last 7 days</option>
                  <option value="30days">Last 30 days</option>
                  <option value="90days">Last 90 days</option>
                  <option value="custom">Custom range</option>
                </select>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <Filter size={20} />
                  Filters
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
                  <Download size={20} />
                  Export Report
                </button>
              </div>

            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-black text-black'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon 
                        size={20} 
                        className={`mr-2 ${
                          activeTab === tab.id ? 'text-black' : 'text-gray-400 group-hover:text-gray-500'
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
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Selected Bots Comparison</h2>
              <p className="text-sm text-gray-600 mt-1">
                {filteredBots.length === 0 ? 'No bots selected' : 
                 selectedBots.includes('all') || selectedBots.length === 0 ? `All ${filteredBots.length} bots` : 
                 `Comparing ${filteredBots.length} selected bots`}
              </p>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Bot</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Status</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Sessions</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Response Time</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Resolution Rate</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">CSAT</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Trend</th>
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
                    <tr key={bot.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={bot.image} 
                            alt={bot.name} 
                            className="w-8 h-8 rounded-full" 
                            style={{ backgroundColor: getClientBrandColor(bot.clientId) }}
                          />
                          <span className="font-medium">{bot.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          bot.status === 'Live' ? 'bg-green-100 text-green-700' :
                          bot.status === 'Paused' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {bot.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">{botMetrics.conversations}</td>
                      <td className="px-6 py-4">{botMetrics.avgResponseTime.toFixed(1)}s</td>
                      <td className="px-6 py-4">{botMetrics.resolutionRate.toFixed(0)}%</td>
                      <td className="px-6 py-4 flex items-center gap-1">
                        <span>{botMetrics.csat.toFixed(1)}</span>
                        <Star size={14} className="text-yellow-500" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-green-600">
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
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <MessageSquare size={24} className="text-blue-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">+12%</span>
            </div>
            <h3 className="text-2xl font-bold">{metrics.totalConversations.toLocaleString()}</h3>
            <p className="text-gray-600 text-sm">Total Sessions</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle size={24} className="text-green-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">+5%</span>
            </div>
            <h3 className="text-2xl font-bold">{metrics.avgResolutionRate.toFixed(0)}%</h3>
            <p className="text-gray-600 text-sm">Resolution Rate</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock size={24} className="text-yellow-600" />
              </div>
              <span className="text-sm text-red-600 font-medium">-0.2s</span>
            </div>
            <h3 className="text-2xl font-bold">{metrics.avgResponseTime.toFixed(1)}s</h3>
            <p className="text-gray-600 text-sm">Avg Response Time</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Star size={24} className="text-purple-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">+0.3</span>
            </div>
            <h3 className="text-2xl font-bold">{metrics.avgCsat.toFixed(1)}</h3>
            <p className="text-gray-600 text-sm">Customer Satisfaction</p>
          </div>
        </div>

        {/* Overview Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-6">Bot Performance Ranking</h2>
            <div className="space-y-4">
              {filteredBots.map((bot, index) => {
                const botSessions = sessions.filter(s => s.bot_id === bot.id);
                const resolutionRate = botSessions.length > 0 
                  ? ((botSessions.filter(s => s.resolution_type === 'self_service' || s.completion_status === 'completed').length / botSessions.length) * 100)
                  : 0;
                
                return (
                  <div key={bot.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
                    <img 
                      src={bot.image} 
                      alt={bot.name} 
                      className="w-10 h-10 rounded-full" 
                      style={{ backgroundColor: getClientBrandColor(bot.clientId) }}
                    />
                    <div className="flex-1">
                      <div className="font-semibold">{bot.name}</div>
                      <div className="text-sm text-gray-600">{botSessions.length} sessions</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">{resolutionRate.toFixed(0)}%</div>
                      <div className="text-sm text-gray-600">Resolution</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-6">Sessions by Bot</h2>
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
                        <span className="text-sm font-medium">{bot.name}</span>
                        <span className="text-sm text-gray-600">{botSessions.length} ({percentage.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
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
    }).filter(Boolean);

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
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock size={24} className="text-blue-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">-0.2s</span>
            </div>
            <h3 className="text-2xl font-bold">{metrics.avgResponseTime.toFixed(1)}s</h3>
            <p className="text-gray-600 text-sm">Avg Response Time</p>
            <p className="text-xs text-gray-500 mt-1">Across all selected bots</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle size={24} className="text-green-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">+3%</span>
            </div>
            <h3 className="text-2xl font-bold">{metrics.avgResolutionRate.toFixed(0)}%</h3>
            <p className="text-gray-600 text-sm">Resolution Rate</p>
            <p className="text-xs text-gray-500 mt-1">Average across bots</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Star size={24} className="text-purple-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">+0.2</span>
            </div>
            <h3 className="text-2xl font-bold">{metrics.avgCsat.toFixed(1)}</h3>
            <p className="text-gray-600 text-sm">Customer Satisfaction</p>
            <p className="text-xs text-gray-500 mt-1">Average CSAT score</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <AlertTriangle size={24} className="text-orange-600" />
              </div>
              <span className="text-sm text-red-600 font-medium">+1.2%</span>
            </div>
            <h3 className="text-2xl font-bold">{advancedMetrics.handoffRate}%</h3>
            <p className="text-gray-600 text-sm">Handoff Rate</p>
            <p className="text-xs text-gray-500 mt-1">Escalated to humans</p>
          </div>
        </div>

        {/* Performance Trend Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-6">Resolution Rate Trends (30 Days)</h2>
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

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-6">Response Time Trends (30 Days)</h2>
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
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-6">CSAT Score Trends (30 Days)</h2>
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

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-6">Handoff Rate Trends (30 Days)</h2>
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
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-6">Performance Leaderboard</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Rank</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Bot</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Overall Score</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Response Time</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Resolution</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">CSAT</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Sessions</th>
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
                      <tr key={bot.botId} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                              index === 0 ? 'bg-yellow-500' : 
                              index === 1 ? 'bg-gray-400' : 
                              index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                            }`}>
                              {index + 1}
                            </div>
                            {index === 0 && <span className="text-xs text-yellow-600 font-medium">Best</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={bot.botImage} 
                              alt={bot.botName} 
                              className="w-8 h-8 rounded-full" 
                              style={{ backgroundColor: getClientBrandColor(client.id) }}
                            />
                            <span className="font-medium">{bot.botName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold">{overallScore.toFixed(0)}/100</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`${bot.avgResponseTime <= 1 ? 'text-green-600' : bot.avgResponseTime <= 2 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {bot.avgResponseTime.toFixed(1)}s
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-green-600">{bot.resolutionRate.toFixed(0)}%</span>
                        </td>
                        <td className="px-6 py-4 flex items-center gap-1">
                          <span>{bot.csat.toFixed(1)}</span>
                          <Star size={14} className="text-yellow-500" />
                        </td>
                        <td className="px-6 py-4 text-gray-600">{bot.totalSessions}</td>
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
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-6">User Journey Analysis Coming Soon</h2>
          <p className="text-gray-600">User journey comparison across selected bots will be implemented here.</p>
        </div>
      </div>
    );
  }

  function renderBusinessImpactTab() {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-6">Business Impact Analysis Coming Soon</h2>
          <p className="text-gray-600">ROI and business impact comparison will be implemented here.</p>
        </div>
      </div>
    );
  }

  function renderOperationsTab() {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-6">Operations Analytics Coming Soon</h2>
          <p className="text-gray-600">Operational efficiency comparison will be implemented here.</p>
        </div>
      </div>
    );
  }

  function renderReportsTab() {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-6">Reports & Export Coming Soon</h2>
          <p className="text-gray-600">Advanced reporting and export features will be implemented here.</p>
        </div>
      </div>
    );
  }
}