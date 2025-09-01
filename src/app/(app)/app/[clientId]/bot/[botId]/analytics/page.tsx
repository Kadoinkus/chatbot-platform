'use client';
import { getClientById, getBotById, getBotSessionsByBotId } from '@/lib/dataService';
import { useState, useEffect, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
  ArrowLeft, 
  Users, 
  Clock, 
  TrendingUp, 
  DollarSign,
  Calendar,
  Filter,
  Download,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { getClientBrandColor } from '@/lib/brandColors';
import type { Client, Bot, BotSession } from '@/lib/dataService';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const CATEGORIES = [
  'Schedule & Hours',
  'Leave & Vacation',
  'Sick Leave & Recovery',
  'Salary & Compensation',
  'Contract & Hours',
  'Onboarding',
  'Offboarding',
  'Workwear & Staff Pass',
  'Team & Contacts',
  'Personal Questions',
  'Access & Login',
  'Social Questions',
  'Unrecognized / Other'
];

const SENTIMENT_COLORS = {
  positive: '#10B981',
  neutral: '#6B7280',
  negative: '#EF4444'
};

export default function BotAnalyticsPage({ params }: { params: { clientId: string; botId: string } }) {
  const [client, setClient] = useState<Client | undefined>();
  const [bot, setBot] = useState<Bot | undefined>();
  const [sessions, setSessions] = useState<BotSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<BotSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(30); // days
  const [showFilters, setShowFilters] = useState(false);

  const brandColor = useMemo(() => {
    return bot ? getClientBrandColor(bot.clientId) : '#6B7280';
  }, [bot]);

  useEffect(() => {
    async function loadData() {
      try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - dateRange);

        const [clientData, botData, sessionData] = await Promise.all([
          getClientById(params.clientId),
          getBotById(params.botId),
          getBotSessionsByBotId(params.botId, { start: startDate, end: endDate })
        ]);
        
        setClient(clientData);
        setBot(botData);
        setSessions(sessionData);
        setFilteredSessions(sessionData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params.clientId, params.botId, dateRange]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    if (!filteredSessions.length) return {
      totalSessions: 0,
      avgDuration: 0,
      avgResponseTime: 0,
      escalationRate: 0,
      avgCost: 0
    };

    const totalSessions = filteredSessions.length;
    
    const avgDuration = filteredSessions.reduce((acc, s) => {
      const start = new Date(s.start_time);
      const end = new Date(s.end_time);
      return acc + (end.getTime() - start.getTime()) / 1000; // seconds
    }, 0) / totalSessions;

    const avgResponseTime = filteredSessions.reduce((acc, s) => acc + s.avg_response_time, 0) / totalSessions / 1000; // convert to seconds

    const escalatedCount = filteredSessions.filter(s => s.escalated === 'Yes').length;
    const escalationRate = (escalatedCount / totalSessions) * 100;

    const avgCost = filteredSessions.reduce((acc, s) => acc + s.tokens_eur, 0) / totalSessions;

    return {
      totalSessions,
      avgDuration,
      avgResponseTime,
      escalationRate,
      avgCost
    };
  }, [filteredSessions]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!filteredSessions.length) return {
      sessionsOverTime: [],
      resolutionVsEscalation: [],
      sentimentDistribution: [],
      sessionsByCountry: [],
      sessionsByCategory: [],
      topQuestions: []
    };

    // Sessions over time
    const sessionsByDate = filteredSessions.reduce((acc, session) => {
      const date = new Date(session.start_time).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sessionsOverTime = Object.entries(sessionsByDate)
      .map(([date, count]) => ({ date, sessions: count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Resolution vs Escalation by week
    const weeklyData = filteredSessions.reduce((acc, session) => {
      const date = new Date(session.start_time);
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay())).toLocaleDateString();
      
      if (!acc[weekStart]) {
        acc[weekStart] = { week: weekStart, resolved: 0, escalated: 0 };
      }
      
      if (session.escalated === 'Yes') {
        acc[weekStart].escalated++;
      } else {
        acc[weekStart].resolved++;
      }
      
      return acc;
    }, {} as Record<string, any>);

    const resolutionVsEscalation = Object.values(weeklyData)
      .sort((a: any, b: any) => new Date(a.week).getTime() - new Date(b.week).getTime());

    // Sentiment distribution
    const sentimentCounts = filteredSessions.reduce((acc, session) => {
      acc[session.sentiment] = (acc[session.sentiment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sentimentDistribution = Object.entries(sentimentCounts)
      .map(([sentiment, count]) => ({ 
        name: sentiment.charAt(0).toUpperCase() + sentiment.slice(1), 
        value: count,
        color: SENTIMENT_COLORS[sentiment as keyof typeof SENTIMENT_COLORS]
      }));

    // Sessions by country
    const countryCounts = filteredSessions.reduce((acc, session) => {
      acc[session.country] = (acc[session.country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sessionsByCountry = Object.entries(countryCounts)
      .map(([country, count]) => ({ country, sessions: count }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 10);

    // Sessions by category
    const categoryCounts = filteredSessions.reduce((acc, session) => {
      acc[session.category] = (acc[session.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sessionsByCategory = Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, sessions: count }))
      .sort((a, b) => b.sessions - a.sessions);

    // Top 5 questions
    const questionCounts = filteredSessions.reduce((acc, session) => {
      session.questions.forEach(question => {
        acc[question] = (acc[question] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const topQuestions = Object.entries(questionCounts)
      .map(([question, count]) => ({ question, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      sessionsOverTime,
      resolutionVsEscalation,
      sentimentDistribution,
      sessionsByCountry,
      sessionsByCategory,
      topQuestions
    };
  }, [filteredSessions]);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }
  
  if (!client || !bot) {
    return <div className="p-6">Bot not found</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar clientId={client.id} />
      
      <main className="flex-1 lg:ml-16">
        <div className="container max-w-7xl mx-auto p-4 lg:p-8 pt-20 lg:pt-8">
          <Link 
            href={`/app/${client.id}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft size={16} />
            Back to bots
          </Link>
          
          {/* Header */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <img 
                  src={bot.image} 
                  alt={bot.name}
                  className="w-16 h-16 rounded-full"
                  style={{ backgroundColor: brandColor }}
                />
                <div>
                  <h1 className="text-2xl font-bold">{bot.name} Analytics</h1>
                  <p className="text-gray-600">{bot.description}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <Filter size={16} />
                  Filters
                  <ChevronDown size={16} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
                <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Download size={16} />
                  Export
                </button>
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="flex items-center gap-4">
              <Calendar size={16} className="text-gray-500" />
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(Number(e.target.value))}
                className="px-3 py-1 border border-gray-200 rounded-lg"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>
          </div>
          
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Users size={16} />
                <span className="text-sm">Sessions</span>
              </div>
              <p className="text-2xl font-bold">{kpis.totalSessions}</p>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Clock size={16} />
                <span className="text-sm">Avg Duration</span>
              </div>
              <p className="text-2xl font-bold">{formatDuration(kpis.avgDuration)}</p>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Clock size={16} />
                <span className="text-sm">Avg Response Time</span>
              </div>
              <p className="text-2xl font-bold">{kpis.avgResponseTime.toFixed(1)}s</p>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <TrendingUp size={16} />
                <span className="text-sm">Escalation Rate</span>
              </div>
              <p className="text-2xl font-bold">{kpis.escalationRate.toFixed(1)}%</p>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <DollarSign size={16} />
                <span className="text-sm">Avg Session Cost</span>
              </div>
              <p className="text-2xl font-bold">€{kpis.avgCost.toFixed(3)}</p>
            </div>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Sessions over time */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold mb-4">Sessions Over Time</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData.sessionsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="sessions" 
                    stroke={brandColor} 
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: brandColor }}
                    activeDot={{ r: 6, strokeWidth: 0, fill: brandColor }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* Resolution vs Escalation */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold mb-4">Resolution vs Escalation</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData.resolutionVsEscalation}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="resolved" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="escalated" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Sentiment Distribution */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold mb-4">Sentiment Distribution</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={chartData.sentimentDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    innerRadius={30}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.sentimentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Sessions by Country */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold mb-4">Sessions by Country</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData.sessionsByCountry}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="country" />
                  <YAxis />
                  <Tooltip />
                  <Bar 
                    dataKey="sessions" 
                    fill={brandColor}
                    radius={[4, 4, 0, 0]}
                    onClick={(data) => {
                      // Navigate to conversations page with country filter
                      window.location.href = `/app/${client.id}/conversations?country=${data.country}&dateRange=${dateRange}`;
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Sessions by Category */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="font-semibold mb-4">Sessions by Category</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.sessionsByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="sessions" 
                  fill={brandColor}
                  radius={[4, 4, 0, 0]}
                  onClick={(data) => {
                    // Navigate to conversations page with category filter
                    window.location.href = `/app/${client.id}/conversations?category=${encodeURIComponent(data.category)}&dateRange=${dateRange}`;
                  }}
                  style={{ cursor: 'pointer' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Top 5 Questions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold mb-4">Top 5 Questions</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart 
                data={chartData.topQuestions} 
                layout="horizontal"
                margin={{ left: 200 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="question" type="category" width={180} />
                <Tooltip />
                <Bar dataKey="count" fill={brandColor} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}