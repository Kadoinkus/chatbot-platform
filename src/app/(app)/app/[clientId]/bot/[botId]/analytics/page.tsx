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
import dynamic from 'next/dynamic';

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

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

  // Jumbo color palette: yellow, black, grey tints only
  const colorPalette = useMemo(() => {
    return {
      primary: brandColor,     // Jumbo yellow
      black: '#000000',        // Pure black
      grey900: '#111827',      // Very dark grey
      grey700: '#374151',      // Dark grey
      grey600: '#4B5563',      // Medium-dark grey
      grey500: '#6B7280',      // Medium grey
      grey400: '#9CA3AF',      // Light grey
      grey300: '#D1D5DB',      // Very light grey
      grey200: '#E5E7EB',      // Ultra light grey
      grey100: '#F3F4F6'       // Nearly white
    };
  }, [brandColor]);

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
      return acc + (end.getTime() - start.getTime()) / 1000;
    }, 0) / totalSessions;

    const avgResponseTime = filteredSessions.reduce((acc, s) => acc + s.avg_response_time, 0) / totalSessions / 1000;

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

  // Prepare chart data and options
  const chartData = useMemo(() => {
    if (!filteredSessions.length) return {
      sessionsOverTime: { series: [], options: {} },
      resolutionVsEscalation: { series: [], options: {} },
      sentimentDistribution: { series: [], options: {} },
      sessionsByCountry: { series: [], options: {} },
      sessionsByCategory: { series: [], options: {} },
      topQuestions: { series: [], options: {} }
    };

    // Base chart styling
    const baseOptions = {
      chart: {
        fontFamily: 'Inter, sans-serif',
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
          animateGradually: {
            enabled: true,
            delay: 150
          },
          dynamicAnimation: {
            enabled: true,
            speed: 350
          }
        }
      },
      grid: {
        borderColor: '#f1f5f9',
        strokeDashArray: 3,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: true } },
        padding: { top: 0, right: 0, bottom: 0, left: 0 }
      },
      colors: [colorPalette.primary],
      dataLabels: { enabled: false },
      tooltip: {
        theme: 'light',
        style: {
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif'
        },
        x: { show: true },
        marker: { show: true },
        fillSeriesColor: false
      }
    };

    // Sessions over time (Area Chart)
    const sessionsByDate = filteredSessions.reduce((acc, session) => {
      const date = new Date(session.start_time).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sessionsOverTimeData = Object.entries(sessionsByDate)
      .map(([date, count]) => ({ x: date, y: count }))
      .sort((a, b) => new Date(a.x).getTime() - new Date(b.x).getTime());

    const sessionsOverTime = {
      series: [{
        name: 'Sessions',
        data: sessionsOverTimeData
      }],
      options: {
        ...baseOptions,
        chart: {
          ...baseOptions.chart,
          type: 'area',
          height: 280
        },
        stroke: {
          curve: 'smooth',
          width: 3
        },
        fill: {
          type: 'gradient',
          gradient: {
            shade: 'light',
            type: 'vertical',
            shadeIntensity: 0.1,
            gradientToColors: [colorPalette.grey200],
            inverseColors: false,
            opacityFrom: 0.8,
            opacityTo: 0.3,
            stops: [0, 100]
          }
        },
        xaxis: {
          type: 'datetime',
          labels: {
            style: { colors: '#64748b', fontSize: '12px' }
          },
          axisBorder: { show: false },
          axisTicks: { show: false }
        },
        yaxis: {
          labels: {
            style: { colors: '#64748b', fontSize: '12px' }
          }
        }
      }
    };

    // Resolution vs Escalation (Stacked Bar)
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

    const weeklyDataArray = Object.values(weeklyData)
      .sort((a: any, b: any) => new Date(a.week).getTime() - new Date(b.week).getTime());

    const resolutionVsEscalation = {
      series: [
        {
          name: 'Resolved',
          data: weeklyDataArray.map((item: any) => item.resolved)
        },
        {
          name: 'Escalated',
          data: weeklyDataArray.map((item: any) => item.escalated)
        }
      ],
      options: {
        ...baseOptions,
        chart: {
          ...baseOptions.chart,
          type: 'bar',
          height: 280,
          stacked: true
        },
        colors: [colorPalette.primary, colorPalette.black],
        plotOptions: {
          bar: {
            horizontal: false,
            borderRadius: 6,
            borderRadiusApplication: 'end'
          }
        },
        xaxis: {
          categories: weeklyDataArray.map((item: any) => new Date(item.week).toLocaleDateString()),
          labels: {
            style: { colors: '#64748b', fontSize: '12px' }
          },
          axisBorder: { show: false },
          axisTicks: { show: false }
        },
        yaxis: {
          labels: {
            style: { colors: '#64748b', fontSize: '12px' }
          }
        },
        legend: {
          position: 'top',
          horizontalAlign: 'right',
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif',
          markers: { width: 8, height: 8, radius: 4 }
        }
      }
    };

    // Sentiment Distribution (Donut)
    const sentimentCounts = filteredSessions.reduce((acc, session) => {
      acc[session.sentiment] = (acc[session.sentiment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sentimentDistribution = {
      series: [
        sentimentCounts.positive || 0,
        sentimentCounts.neutral || 0,
        sentimentCounts.negative || 0
      ],
      options: {
        ...baseOptions,
        chart: {
          ...baseOptions.chart,
          type: 'donut',
          height: 280
        },
        colors: [colorPalette.primary, colorPalette.black, colorPalette.grey300],
        labels: ['Positive', 'Neutral', 'Negative'],
        plotOptions: {
          pie: {
            donut: {
              size: '60%',
              labels: {
                show: true,
                name: {
                  show: true,
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif',
                  color: '#374151'
                },
                value: {
                  show: true,
                  fontSize: '20px',
                  fontFamily: 'Inter, sans-serif',
                  color: '#111827',
                  fontWeight: 600
                },
                total: {
                  show: true,
                  showAlways: false,
                  label: 'Total',
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif',
                  color: '#6B7280'
                }
              }
            }
          }
        },
        legend: {
          position: 'bottom',
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif',
          markers: { width: 8, height: 8, radius: 4 }
        }
      }
    };

    // Sessions by Country (Bar)
    const countryCounts = filteredSessions.reduce((acc, session) => {
      acc[session.country] = (acc[session.country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const countryData = Object.entries(countryCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    const sessionsByCountry = {
      series: [{
        name: 'Sessions',
        data: countryData.map(([,count]) => count)
      }],
      options: {
        ...baseOptions,
        chart: {
          ...baseOptions.chart,
          type: 'bar',
          height: 280,
          events: {
            dataPointSelection: (event: any, chartContext: any, config: any) => {
              const country = countryData[config.dataPointIndex][0];
              window.location.href = `/app/${client?.id}/conversations?country=${country}&dateRange=${dateRange}`;
            }
          }
        },
        plotOptions: {
          bar: {
            horizontal: false,
            borderRadius: 6,
            borderRadiusApplication: 'end'
          }
        },
        xaxis: {
          categories: countryData.map(([country]) => country),
          labels: {
            style: { colors: '#64748b', fontSize: '12px' }
          },
          axisBorder: { show: false },
          axisTicks: { show: false }
        },
        yaxis: {
          labels: {
            style: { colors: '#64748b', fontSize: '12px' }
          }
        },
        colors: [colorPalette.primary, colorPalette.black, colorPalette.grey200, colorPalette.grey300, colorPalette.grey400, colorPalette.grey500, colorPalette.grey600, colorPalette.grey700, colorPalette.grey900],
        fill: {
          colors: [colorPalette.primary, colorPalette.black, colorPalette.grey200, colorPalette.grey300, colorPalette.grey400, colorPalette.grey500, colorPalette.grey600, colorPalette.grey700, colorPalette.grey900]
        }
      }
    };

    // Sessions by Category (Horizontal Bar)
    const categoryCounts = filteredSessions.reduce((acc, session) => {
      acc[session.category] = (acc[session.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const categoryData = Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8); // Show top 8 categories

    const sessionsByCategory = {
      series: [{
        name: 'Sessions',
        data: categoryData.map(([category, count]) => ({
          x: category,
          y: count
        }))
      }],
      options: {
        ...baseOptions,
        chart: {
          ...baseOptions.chart,
          type: 'bar',
          height: 300,
          events: {
            dataPointSelection: (event: any, chartContext: any, config: any) => {
              const category = categoryData[config.dataPointIndex][0];
              window.location.href = `/app/${client?.id}/conversations?category=${encodeURIComponent(category)}&dateRange=${dateRange}`;
            }
          }
        },
        plotOptions: {
          bar: {
            horizontal: true,
            borderRadius: 6,
            borderRadiusApplication: 'end'
          }
        },
        xaxis: {
          labels: {
            style: { colors: '#64748b', fontSize: '12px' }
          }
        },
        yaxis: {
          labels: {
            style: { colors: '#64748b', fontSize: '10px' }
          }
        },
        colors: [colorPalette.primary, colorPalette.black, colorPalette.grey200, colorPalette.grey300, colorPalette.grey400, colorPalette.grey500, colorPalette.grey600, colorPalette.grey700],
        fill: {
          colors: [colorPalette.primary, colorPalette.black, colorPalette.grey200, colorPalette.grey300, colorPalette.grey400, colorPalette.grey500, colorPalette.grey600, colorPalette.grey700]
        }
      }
    };

    // Top 5 Questions (Horizontal Bar)
    const questionCounts = filteredSessions.reduce((acc, session) => {
      session.questions.forEach(question => {
        acc[question] = (acc[question] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const questionData = Object.entries(questionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([question, count]) => [
        question.length > 40 ? question.substring(0, 40) + '...' : question,
        count
      ]);

    const topQuestions = {
      series: [{
        name: 'Count',
        data: questionData.map(([question, count]) => ({
          x: question,
          y: count
        }))
      }],
      options: {
        ...baseOptions,
        chart: {
          ...baseOptions.chart,
          type: 'bar',
          height: 240
        },
        plotOptions: {
          bar: {
            horizontal: true,
            borderRadius: 6,
            borderRadiusApplication: 'end'
          }
        },
        xaxis: {
          labels: {
            style: { colors: '#64748b', fontSize: '12px' }
          }
        },
        yaxis: {
          labels: {
            style: { colors: '#64748b', fontSize: '9px' }
          }
        },
        colors: [colorPalette.primary, colorPalette.black, colorPalette.grey200, colorPalette.grey300, colorPalette.grey400],
        fill: {
          colors: [colorPalette.primary, colorPalette.black, colorPalette.grey200, colorPalette.grey300, colorPalette.grey400]
        }
      }
    };

    return {
      sessionsOverTime,
      resolutionVsEscalation,
      sentimentDistribution,
      sessionsByCountry,
      sessionsByCategory,
      topQuestions
    };
  }, [filteredSessions, brandColor, client?.id, dateRange]);

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
              <Chart
                options={chartData.sessionsOverTime.options}
                series={chartData.sessionsOverTime.series}
                type="area"
                height={280}
              />
            </div>
            
            {/* Resolution vs Escalation */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold mb-4">Resolution vs Escalation</h2>
              <Chart
                options={chartData.resolutionVsEscalation.options}
                series={chartData.resolutionVsEscalation.series}
                type="bar"
                height={280}
              />
            </div>
            
            {/* Sentiment Distribution */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold mb-4">Sentiment Distribution</h2>
              <Chart
                options={chartData.sentimentDistribution.options}
                series={chartData.sentimentDistribution.series}
                type="donut"
                height={280}
              />
            </div>
            
            {/* Sessions by Country */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold mb-4">Sessions by Country</h2>
              <Chart
                options={chartData.sessionsByCountry.options}
                series={chartData.sessionsByCountry.series}
                type="bar"
                height={280}
              />
            </div>
          </div>
          
          {/* Sessions by Category */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="font-semibold mb-4">Sessions by Category</h2>
            <Chart
              options={chartData.sessionsByCategory.options}
              series={chartData.sessionsByCategory.series}
              type="bar"
              height={300}
            />
          </div>
          
          {/* Top 5 Questions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold mb-4">Top 5 Questions</h2>
            <Chart
              options={chartData.topQuestions.options}
              series={chartData.topQuestions.series}
              type="bar"
              height={240}
            />
          </div>
        </div>
      </main>
    </div>
  );
}