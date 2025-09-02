'use client';
import { useState, useMemo, useEffect, useRef } from 'react';
import { getClientById, getBotsByClientId, getBotSessionsByClientId, getWorkspacesByClientId } from '@/lib/dataService';
import type { Client, Bot, BotSession, Workspace } from '@/lib/dataService';
import { getClientBrandColor } from '@/lib/brandColors';
import Sidebar from '@/components/Sidebar';
import { UsageLine, IntentBars } from '@/components/Charts';
import { Calendar, Download, Filter, TrendingUp, MessageSquare, Clock, Star, Users, AlertTriangle, CheckCircle, ChevronDown, X } from 'lucide-react';

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

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6 lg:mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <MessageSquare size={24} className="text-blue-600" />
                </div>
                <span className="text-sm text-green-600 font-medium">+12%</span>
              </div>
              <h3 className="text-2xl font-bold">{metrics.totalConversations.toLocaleString()}</h3>
              <p className="text-gray-600 text-sm">Total Conversations</p>
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

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 lg:mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Conversation Volume</h2>
                <select
                  value={metric}
                  onChange={(e) => setMetric(e.target.value)}
                  className="px-3 py-1 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="conversations">Conversations</option>
                  <option value="resolved">Resolved</option>
                  <option value="escalated">Escalated</option>
                </select>
              </div>
              <UsageLine data={filteredSessions.length > 0 ? [{ date: '2025-09-01', conversations: filteredSessions.length, resolved: filteredSessions.filter(s => s.resolution_type === 'self_service').length }] : []} />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-6">Top Intents</h2>
              <IntentBars data={filteredSessions.length > 0 ? Object.entries(filteredSessions.reduce((acc, s) => { acc[s.category] = (acc[s.category] || 0) + 1; return acc; }, {} as Record<string, number>)).map(([intent, count]) => ({ intent, count })).slice(0, 5) : []} />
            </div>
          </div>

          {/* Advanced Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 lg:mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Bot Performance</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Containment Rate</span>
                  <span className="font-semibold">{advancedMetrics.containmentRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${advancedMetrics.containmentRate}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Handoff Rate</span>
                  <span className="font-semibold">{advancedMetrics.handoffRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full" 
                    style={{ width: `${advancedMetrics.handoffRate}%` }}
                  ></div>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg Conversation Length</span>
                    <span className="font-semibold">{advancedMetrics.avgConversationLength} msgs</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Channel Distribution</h3>
              <div className="space-y-4">
                {advancedMetrics.topChannels.map(channel => (
                  <div key={channel.name}>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">{channel.name}</span>
                      <span className="font-semibold">{channel.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${channel.percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500">{channel.count.toLocaleString()} conversations</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Sentiment Analysis</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">Positive</span>
                  </div>
                  <span className="font-semibold">{advancedMetrics.sentimentAnalysis.positive}%</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span className="text-gray-600">Neutral</span>
                  </div>
                  <span className="font-semibold">{advancedMetrics.sentimentAnalysis.neutral}%</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-gray-600">Negative</span>
                  </div>
                  <span className="font-semibold">{advancedMetrics.sentimentAnalysis.negative}%</span>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-sm text-gray-600">Peak Hours</p>
                  <p className="font-semibold">{advancedMetrics.peakHours.join(', ')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bot Comparison Table - Only show selected bots */}
          {!selectedBots.includes('all') && filteredBots.length > 1 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">Selected Bots Comparison</h2>
                <p className="text-sm text-gray-600 mt-1">Comparing {filteredBots.length} selected bots</p>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Bot</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Status</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Conversations</th>
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
          )}

          {/* All Bots Overview Table - Show when 'All Bots' is selected */}
          {selectedBots.includes('all') && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">All Bots Performance</h2>
                <p className="text-sm text-gray-600 mt-1">Overview of all {bots.length} bots</p>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Bot</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Status</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Conversations</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Response Time</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Resolution Rate</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">CSAT</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {bots.map(bot => {
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
          )}

          {/* Weekly Comparison */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-6">Weekly Comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 text-sm font-medium text-gray-700">Period</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-700">Conversations</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-700">Resolved</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-700">Resolution Rate</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-700">CSAT</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-700">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {weeklyComparison.map((week, idx) => (
                    <tr key={week.period} className="border-b hover:bg-gray-50">
                      <td className="py-3 font-medium">{week.period}</td>
                      <td className="py-3">{week.conversations.toLocaleString()}</td>
                      <td className="py-3">{week.resolved.toLocaleString()}</td>
                      <td className="py-3">{Math.round((week.resolved / week.conversations) * 100)}%</td>
                      <td className="py-3">{week.csat}</td>
                      <td className="py-3">
                        {idx === 0 ? (
                          <span className="text-green-600 text-sm">Current</span>
                        ) : (
                          <span className="text-gray-500 text-sm">
                            {idx === 1 ? '+9%' : idx === 2 ? '+18%' : '+23%'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}