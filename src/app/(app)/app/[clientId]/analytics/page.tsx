'use client';
import { useState, useMemo, useEffect, useRef } from 'react';
import { clients } from '@/lib/data';
import Sidebar from '@/components/Sidebar';
import { UsageLine, IntentBars } from '@/components/Charts';
import { Calendar, Download, Filter, TrendingUp, MessageSquare, Clock, Star, Users, AlertTriangle, CheckCircle, ChevronDown, X } from 'lucide-react';

export default function AnalyticsDashboardPage({ params }: { params: { clientId: string } }) {
  const client = clients.find(c => c.id === params.clientId);
  const [dateRange, setDateRange] = useState('7days');
  const [selectedBots, setSelectedBots] = useState<string[]>(['all']);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [metric, setMetric] = useState('conversations');
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  if (!client) {
    return <div className="p-6">Client not found</div>;
  }

  // Filter bots based on selection
  const filteredBots = useMemo(() => {
    if (selectedBots.includes('all')) {
      return client.mascots;
    }
    return client.mascots.filter(bot => selectedBots.includes(bot.id));
  }, [client.mascots, selectedBots]);

  // Calculate metrics for selected bots
  const totalConversations = filteredBots.reduce((acc, bot) => acc + bot.conversations, 0);
  const avgResponseTime = filteredBots.length > 0 ? filteredBots.reduce((acc, bot) => acc + bot.metrics.responseTime, 0) / filteredBots.length : 0;
  const avgResolutionRate = filteredBots.length > 0 ? filteredBots.reduce((acc, bot) => acc + bot.metrics.resolutionRate, 0) / filteredBots.length : 0;
  const avgCsat = filteredBots.length > 0 ? filteredBots.reduce((acc, bot) => acc + bot.metrics.csat, 0) / filteredBots.length : 0;

  // Bot selection handlers
  const handleBotToggle = (botId: string) => {
    if (botId === 'all') {
      setSelectedBots(['all']);
    } else {
      setSelectedBots(prev => {
        const newSelection = prev.filter(id => id !== 'all');
        if (prev.includes(botId)) {
          const filtered = newSelection.filter(id => id !== botId);
          return filtered.length === 0 ? ['all'] : filtered;
        } else {
          return [...newSelection, botId];
        }
      });
    }
  };

  const getSelectionLabel = () => {
    if (selectedBots.includes('all')) {
      return 'All Bots';
    }
    if (selectedBots.length === 1) {
      const bot = client.mascots.find(b => b.id === selectedBots[0]);
      return bot?.name || 'Select Bots';
    }
    return `${selectedBots.length} Bots Selected`;
  };

  // Mock advanced metrics
  const advancedMetrics = {
    containmentRate: 78,
    handoffRate: 22,
    avgConversationLength: 4.2,
    peakHours: ['9AM', '2PM', '7PM'],
    topChannels: [
      { name: 'Website', percentage: 65, count: 1243 },
      { name: 'Mobile App', percentage: 28, count: 535 },
      { name: 'Social Media', percentage: 7, count: 134 }
    ],
    sentimentAnalysis: {
      positive: 68,
      neutral: 25,
      negative: 7
    }
  };

  // Weekly comparison data
  const weeklyComparison = [
    { period: 'This Week', conversations: 850, resolved: 612, csat: 4.5 },
    { period: 'Last Week', conversations: 780, resolved: 546, csat: 4.3 },
    { period: '2 Weeks Ago', conversations: 720, resolved: 504, csat: 4.2 },
    { period: '3 Weeks Ago', conversations: 690, resolved: 483, csat: 4.1 }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar clientId={client.id} />
      
      <main className="flex-1 lg:ml-16">
        <div className="container max-w-7xl mx-auto p-4 lg:p-8 pt-20 lg:pt-8">
          <div className="mb-6 lg:mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold mb-2">Analytics Dashboard</h1>
                <p className="text-gray-600">Comprehensive insights for {client.name}</p>
              </div>
              <div className="flex gap-3 flex-wrap items-end">
                {/* Bot Selection Dropdown - Most Prominent */}
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
                            checked={selectedBots.includes('all')}
                            onChange={() => handleBotToggle('all')}
                            className="rounded border-gray-300 text-black focus:ring-black"
                          />
                          <span className="text-sm font-medium">All Bots</span>
                        </label>
                        <hr className="mx-3" />
                        {client.mascots.map(bot => (
                          <label key={bot.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedBots.includes(bot.id)}
                              onChange={() => handleBotToggle(bot.id)}
                              className="rounded border-gray-300 text-black focus:ring-black"
                              disabled={selectedBots.includes('all')}
                            />
                            <img src={bot.image} alt={bot.name} className="w-6 h-6 rounded-full" />
                            <div className="flex-1">
                              <span className="text-sm font-medium">{bot.name}</span>
                              <div className="text-xs text-gray-500">{bot.conversations} conversations</div>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              bot.status === 'Live' ? 'bg-green-100 text-green-700' :
                              bot.status === 'Paused' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {bot.status}
                            </span>
                          </label>
                        ))}
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

              {/* Selected Bots Indicator */}
              {!selectedBots.includes('all') && selectedBots.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="text-sm text-gray-600">Analyzing:</span>
                  {selectedBots.map(botId => {
                    const bot = client.mascots.find(b => b.id === botId);
                    if (!bot) return null;
                    return (
                      <div key={botId} className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm">
                        <img src={bot.image} alt={bot.name} className="w-4 h-4 rounded-full" />
                        <span>{bot.name}</span>
                        <button 
                          onClick={() => handleBotToggle(botId)}
                          className="hover:bg-blue-200 rounded-full p-0.5"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
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
              <h3 className="text-2xl font-bold">{totalConversations.toLocaleString()}</h3>
              <p className="text-gray-600 text-sm">Total Conversations</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle size={24} className="text-green-600" />
                </div>
                <span className="text-sm text-green-600 font-medium">+5%</span>
              </div>
              <h3 className="text-2xl font-bold">{avgResolutionRate.toFixed(0)}%</h3>
              <p className="text-gray-600 text-sm">Resolution Rate</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock size={24} className="text-yellow-600" />
                </div>
                <span className="text-sm text-red-600 font-medium">-0.2s</span>
              </div>
              <h3 className="text-2xl font-bold">{avgResponseTime.toFixed(1)}s</h3>
              <p className="text-gray-600 text-sm">Avg Response Time</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Star size={24} className="text-purple-600" />
                </div>
                <span className="text-sm text-green-600 font-medium">+0.3</span>
              </div>
              <h3 className="text-2xl font-bold">{avgCsat.toFixed(1)}</h3>
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
              <UsageLine data={client.metrics.usageByDay} />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-6">Top Intents</h2>
              <IntentBars data={client.metrics.topIntents} />
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
                  {filteredBots.map(bot => (
                    <tr key={bot.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={bot.image} alt={bot.name} className="w-8 h-8 rounded-full" />
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
                      <td className="px-6 py-4 font-medium">{bot.conversations}</td>
                      <td className="px-6 py-4">{bot.metrics.responseTime}s</td>
                      <td className="px-6 py-4">{bot.metrics.resolutionRate}%</td>
                      <td className="px-6 py-4 flex items-center gap-1">
                        <span>{bot.metrics.csat}</span>
                        <Star size={14} className="text-yellow-500" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-green-600">
                          <TrendingUp size={14} />
                          <span className="text-sm">+8%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* All Bots Overview Table - Show when 'All Bots' is selected */}
          {selectedBots.includes('all') && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">All Bots Performance</h2>
                <p className="text-sm text-gray-600 mt-1">Overview of all {client.mascots.length} bots</p>
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
                  {client.mascots.map(bot => (
                    <tr key={bot.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={bot.image} alt={bot.name} className="w-8 h-8 rounded-full" />
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
                      <td className="px-6 py-4 font-medium">{bot.conversations}</td>
                      <td className="px-6 py-4">{bot.metrics.responseTime}s</td>
                      <td className="px-6 py-4">{bot.metrics.resolutionRate}%</td>
                      <td className="px-6 py-4 flex items-center gap-1">
                        <span>{bot.metrics.csat}</span>
                        <Star size={14} className="text-yellow-500" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-green-600">
                          <TrendingUp size={14} />
                          <span className="text-sm">+8%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
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