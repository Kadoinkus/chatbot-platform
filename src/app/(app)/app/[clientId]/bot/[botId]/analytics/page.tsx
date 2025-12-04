'use client';
import { getClientById, getBotById, getBotSessionsByBotId } from '@/lib/dataService';
import { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Users,
  Clock,
  TrendingUp,
  DollarSign,
  Calendar,
  Filter,
  Download,
  ChevronDown,
  BarChart3,
  Activity,
  Target,
  Route,
  Settings,
  FileText,
  Zap,
  ThumbsUp,
  AlertTriangle,
  CheckCircle,
  Percent,
  Bot as BotIcon
} from 'lucide-react';
import Link from 'next/link';
import { getClientBrandColor } from '@/lib/brandColors';
import type { Client, Bot, BotSession } from '@/lib/dataService';
import type { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';
import { Page, PageContent, PageHeader, Card, Button, Input, Spinner, EmptyState } from '@/components/ui';

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
  const [activeTab, setActiveTab] = useState('overview');
  const [customDateRange, setCustomDateRange] = useState<{start: string; end: string}>({
    start: '',
    end: ''
  });
  const [useCustomRange, setUseCustomRange] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'performance', label: 'Performance', icon: Activity },
    { id: 'user-journey', label: 'User Journey', icon: Route },
    { id: 'business-impact', label: 'Business Impact', icon: Target },
    { id: 'operations', label: 'Operations', icon: Settings },
    { id: 'reports', label: 'Reports', icon: FileText }
  ];

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
        let startDate: Date, endDate: Date;

        if (useCustomRange && customDateRange.start && customDateRange.end) {
          startDate = new Date(customDateRange.start);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(customDateRange.end);
          endDate.setHours(23, 59, 59, 999);
        } else {
          endDate = new Date();
          endDate.setHours(23, 59, 59, 999);
          startDate = new Date();
          startDate.setDate(startDate.getDate() - dateRange);
          startDate.setHours(0, 0, 0, 0);
        }

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
  }, [params.clientId, params.botId, dateRange, useCustomRange, customDateRange]);

  // Calculate comprehensive KPIs
  const kpis = useMemo(() => {
    if (!filteredSessions.length) return {
      // Basic metrics
      totalSessions: 0,
      avgDuration: 0,
      avgResponseTime: 0,
      escalationRate: 0,
      avgCost: 0,
      // Enterprise metrics
      resolutionRate: 0,
      csatScore: 0,
      intentAccuracy: 0,
      firstContactResolution: 0,
      completionRate: 0,
      costSavings: 0,
      userReturnRate: 0,
      peakUtilization: 0
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
    const resolutionRate = ((totalSessions - escalatedCount) / totalSessions) * 100;

    const avgCost = filteredSessions.reduce((acc, s) => acc + s.tokens_eur, 0) / totalSessions;

    // Enterprise metrics
    const avgRating = filteredSessions.reduce((acc, s) => acc + (s.user_rating || 0), 0) / totalSessions;
    const csatScore = (avgRating / 5) * 100; // Convert to percentage

    const positiveCount = filteredSessions.filter(s => s.sentiment === 'positive').length;
    const intentAccuracy = (positiveCount / totalSessions) * 100;

    const completedSessions = filteredSessions.filter(s => s.messages_sent >= 2).length;
    const completionRate = (completedSessions / totalSessions) * 100;

    const firstContactResolution = ((totalSessions - escalatedCount) / totalSessions) * 100;

    // Assume cost savings vs human agent at €15/hour, avg 20min per issue
    const humanCost = (avgDuration / 3600) * 15; // €15/hour
    const costSavings = humanCost - avgCost;

    // Calculate user return rate (simplified)
    const uniqueUsers = new Set(filteredSessions.map(s => s.ip_address)).size;
    const userReturnRate = ((totalSessions - uniqueUsers) / totalSessions) * 100;

    // Peak utilization (simplified - sessions per hour during peak)
    const sessionsByHour = filteredSessions.reduce((acc, s) => {
      const hour = new Date(s.start_time).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    const peakUtilization = Math.max(...Object.values(sessionsByHour)) || 0;

    return {
      // Basic metrics
      totalSessions,
      avgDuration,
      avgResponseTime,
      escalationRate,
      avgCost,
      // Enterprise metrics
      resolutionRate,
      csatScore,
      intentAccuracy,
      firstContactResolution,
      completionRate,
      costSavings,
      userReturnRate,
      peakUtilization
    };
  }, [filteredSessions]);

  // Prepare chart data and options
  const chartData = useMemo(() => {
    const createEmptyChartData = () => ({
      series: [] as { name: string; data: number[] }[],
      options: {} as ApexOptions
    });

    if (!filteredSessions.length) {
      return {
        sessionsOverTime: createEmptyChartData(),
        resolutionVsEscalation: createEmptyChartData(),
        sentimentDistribution: createEmptyChartData(),
        sessionsByCountry: createEmptyChartData(),
        sessionsByCategory: createEmptyChartData(),
        topQuestions: createEmptyChartData()
      };
    }

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
          type: 'area' as const,
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
      } as ApexOptions
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
          type: 'bar' as const,
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
      } as ApexOptions
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
          type: 'donut' as const,
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
      } as ApexOptions
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
          type: 'bar' as const,
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
      } as ApexOptions
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
          type: 'bar' as const,
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
      } as ApexOptions
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
          type: 'bar' as const,
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
      } as ApexOptions
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
    return (
      <Page className="flex items-center justify-center">
        <Spinner size="lg" />
      </Page>
    );
  }

  if (!client || !bot) {
    return (
      <Page>
        <PageContent>
          <EmptyState
            icon={<BotIcon size={48} />}
            title="Bot not found"
            message="The requested bot could not be found."
          />
        </PageContent>
      </Page>
    );
  }

  return (
    <Page>
      <PageContent>
          <PageHeader
            title={`${bot.name} Analytics`}
            description={bot.description}
            backLink={
              <Link
                href={`/app/${client.id}`}
                className="inline-flex items-center gap-2 text-foreground-secondary hover:text-foreground"
              >
                <ArrowLeft size={16} />
                Back to bots
              </Link>
            }
          />

          {/* Header */}
          <Card className="mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <img
                  src={bot.image}
                  alt={bot.name}
                  className="w-16 h-16 rounded-full"
                  style={{ backgroundColor: brandColor }}
                />
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{bot.name} Analytics</h1>
                  <p className="text-foreground-secondary">{bot.description}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter size={16} />
                  Filters
                  <ChevronDown size={16} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </Button>
                <Button variant="secondary">
                  <Download size={16} />
                  Export
                </Button>
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <Calendar size={16} className="text-foreground-tertiary" />
                <span className="text-sm font-medium text-foreground-secondary">Time Period:</span>

                {/* Quick Select Buttons */}
                <div className="flex gap-1 bg-background-tertiary p-1 rounded-lg">
                  <button
                    onClick={() => {setUseCustomRange(false); setDateRange(7);}}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      !useCustomRange && dateRange === 7
                        ? 'bg-surface-elevated text-foreground shadow-sm'
                        : 'text-foreground-secondary hover:text-foreground hover:bg-background-hover'
                    }`}
                    style={!useCustomRange && dateRange === 7 ? {
                      backgroundColor: 'var(--surface-elevated)',
                      color: brandColor,
                      boxShadow: `0 0 0 1px ${brandColor}20`
                    } : {}}
                  >
                    Last 7 days
                  </button>
                  <button
                    onClick={() => {setUseCustomRange(false); setDateRange(30);}}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      !useCustomRange && dateRange === 30
                        ? 'bg-surface-elevated text-foreground shadow-sm'
                        : 'text-foreground-secondary hover:text-foreground hover:bg-background-hover'
                    }`}
                    style={!useCustomRange && dateRange === 30 ? {
                      backgroundColor: 'var(--surface-elevated)',
                      color: brandColor,
                      boxShadow: `0 0 0 1px ${brandColor}20`
                    } : {}}
                  >
                    Last 30 days
                  </button>
                  <button
                    onClick={() => {setUseCustomRange(false); setDateRange(90);}}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      !useCustomRange && dateRange === 90
                        ? 'bg-surface-elevated text-foreground shadow-sm'
                        : 'text-foreground-secondary hover:text-foreground hover:bg-background-hover'
                    }`}
                    style={!useCustomRange && dateRange === 90 ? {
                      backgroundColor: 'var(--surface-elevated)',
                      color: brandColor,
                      boxShadow: `0 0 0 1px ${brandColor}20`
                    } : {}}
                  >
                    Last 90 days
                  </button>
                </div>

                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
                    useCustomRange || showDatePicker
                      ? 'text-white shadow-sm'
                      : 'bg-surface-elevated text-foreground-secondary border-border hover:bg-background-hover'
                  }`}
                  style={useCustomRange || showDatePicker ? {
                    backgroundColor: brandColor,
                    borderColor: brandColor
                  } : {}}
                >
                  Custom Range
                </button>
              </div>

              {/* Current Range Display */}
              <div className="flex items-center gap-2 text-sm text-foreground-tertiary bg-background-secondary px-3 py-2 rounded-lg">
                <BarChart3 size={14} className="text-foreground-tertiary" />
                {useCustomRange && customDateRange.start && customDateRange.end
                  ? `${new Date(customDateRange.start).toLocaleDateString()} - ${new Date(customDateRange.end).toLocaleDateString()}`
                  : `Showing last ${dateRange} days`}
              </div>
            </div>

            {/* Custom Date Picker */}
            {showDatePicker && (
              <div className="bg-background-secondary rounded-lg p-4 border border-border mt-4">
                <h4 className="font-medium text-foreground mb-3">Select Custom Date Range</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Start Date"
                    type="date"
                    value={customDateRange.start}
                    onChange={(e) => setCustomDateRange(prev => ({...prev, start: e.target.value}))}
                    max={customDateRange.end || new Date().toISOString().split('T')[0]}
                  />
                  <Input
                    label="End Date"
                    type="date"
                    value={customDateRange.end}
                    onChange={(e) => setCustomDateRange(prev => ({...prev, end: e.target.value}))}
                    min={customDateRange.start}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="flex gap-2">
                    {/* Quick Presets */}
                    <button
                      onClick={() => {
                        const end = new Date().toISOString().split('T')[0];
                        const start = new Date();
                        start.setDate(start.getDate() - 7);
                        setCustomDateRange({start: start.toISOString().split('T')[0], end});
                      }}
                      className="px-2 py-1 text-xs bg-surface-elevated border border-border rounded hover:bg-background-hover text-foreground-secondary"
                    >
                      Last Week
                    </button>
                    <button
                      onClick={() => {
                        const end = new Date().toISOString().split('T')[0];
                        const start = new Date();
                        start.setMonth(start.getMonth() - 1);
                        setCustomDateRange({start: start.toISOString().split('T')[0], end});
                      }}
                      className="px-2 py-1 text-xs bg-surface-elevated border border-border rounded hover:bg-background-hover text-foreground-secondary"
                    >
                      Last Month
                    </button>
                    <button
                      onClick={() => {
                        const end = new Date().toISOString().split('T')[0];
                        const start = new Date();
                        start.setMonth(start.getMonth() - 3);
                        setCustomDateRange({start: start.toISOString().split('T')[0], end});
                      }}
                      className="px-2 py-1 text-xs bg-surface-elevated border border-border rounded hover:bg-background-hover text-foreground-secondary"
                    >
                      Last Quarter
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setShowDatePicker(false);
                        setUseCustomRange(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (customDateRange.start && customDateRange.end) {
                          setUseCustomRange(true);
                          setShowDatePicker(false);
                        }
                      }}
                      disabled={!customDateRange.start || !customDateRange.end}
                    >
                      Apply Range
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Tab Navigation */}
          <Card className="mb-6 p-0">
            <div className="border-b border-border">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {tabs.map((tab) => {
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

          {/* Tab Content */}
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'performance' && renderPerformanceTab()}
          {activeTab === 'user-journey' && renderUserJourneyTab()}
          {activeTab === 'business-impact' && renderBusinessImpactTab()}
          {activeTab === 'operations' && renderOperationsTab()}
          {activeTab === 'reports' && renderReportsTab()}
      </PageContent>
    </Page>
  );

  // Tab render functions
  function renderOverviewTab() {
    return (
      <>
        {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-2 text-foreground-secondary mb-2">
                <Users size={16} />
                <span className="text-sm">Sessions</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{kpis.totalSessions}</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 text-foreground-secondary mb-2">
                <Clock size={16} />
                <span className="text-sm">Avg Duration</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{formatDuration(kpis.avgDuration)}</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 text-foreground-secondary mb-2">
                <Clock size={16} />
                <span className="text-sm">Avg Response Time</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{kpis.avgResponseTime.toFixed(1)}s</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 text-foreground-secondary mb-2">
                <TrendingUp size={16} />
                <span className="text-sm">Escalation Rate</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{kpis.escalationRate.toFixed(1)}%</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 text-foreground-secondary mb-2">
                <DollarSign size={16} />
                <span className="text-sm">Avg Session Cost</span>
              </div>
              <p className="text-2xl font-bold text-foreground">€{kpis.avgCost.toFixed(2)}</p>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Sessions over time */}
            <Card>
              <h2 className="font-semibold text-foreground mb-4">Sessions Over Time</h2>
              <Chart
                options={chartData.sessionsOverTime.options}
                series={chartData.sessionsOverTime.series}
                type="area"
                height={280}
              />
            </Card>

            {/* Resolution vs Escalation */}
            <Card>
              <h2 className="font-semibold text-foreground mb-4">Resolution vs Escalation</h2>
              <Chart
                options={chartData.resolutionVsEscalation.options}
                series={chartData.resolutionVsEscalation.series}
                type="bar"
                height={280}
              />
            </Card>

            {/* Sentiment Distribution */}
            <Card>
              <h2 className="font-semibold text-foreground mb-4">Sentiment Distribution</h2>
              <Chart
                options={chartData.sentimentDistribution.options}
                series={chartData.sentimentDistribution.series}
                type="donut"
                height={280}
              />
            </Card>

            {/* Sessions by Country */}
            <Card>
              <h2 className="font-semibold text-foreground mb-4">Sessions by Country</h2>
              <Chart
                options={chartData.sessionsByCountry.options}
                series={chartData.sessionsByCountry.series}
                type="bar"
                height={280}
              />
            </Card>
          </div>

          {/* Sessions by Category */}
          <Card className="mb-6">
            <h2 className="font-semibold text-foreground mb-4">Sessions by Category</h2>
            <Chart
              options={chartData.sessionsByCategory.options}
              series={chartData.sessionsByCategory.series}
              type="bar"
              height={300}
            />
          </Card>

          {/* Top 5 Questions */}
          <Card>
            <h2 className="font-semibold text-foreground mb-4">Top 5 Questions</h2>
            <Chart
              options={chartData.topQuestions.options}
              series={chartData.topQuestions.series}
              type="bar"
              height={240}
            />
          </Card>
        </>
    );
  }

  function renderPerformanceTab() {
    return (
      <div className="space-y-6">
        {/* Performance KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 text-foreground-secondary mb-2">
              <CheckCircle size={16} />
              <span className="text-sm">Resolution Rate</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{kpis.resolutionRate.toFixed(1)}%</p>
            <p className="text-sm text-success-600 dark:text-success-500 mt-1">+2.3% vs last period</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 text-foreground-secondary mb-2">
              <ThumbsUp size={16} />
              <span className="text-sm">CSAT Score</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{kpis.csatScore.toFixed(1)}%</p>
            <p className="text-sm text-success-600 dark:text-success-500 mt-1">+1.5% vs last period</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 text-foreground-secondary mb-2">
              <Target size={16} />
              <span className="text-sm">Intent Accuracy</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{kpis.intentAccuracy.toFixed(1)}%</p>
            <p className="text-sm text-warning-600 dark:text-warning-500 mt-1">-0.5% vs last period</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 text-foreground-secondary mb-2">
              <Zap size={16} />
              <span className="text-sm">FCR Rate</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{kpis.firstContactResolution.toFixed(1)}%</p>
            <p className="text-sm text-success-600 dark:text-success-500 mt-1">+3.1% vs last period</p>
          </Card>
        </div>

        {/* Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="font-semibold text-foreground mb-4">Response Time Trends</h2>
            <Chart
              options={getResponseTimeTrendsChart()}
              series={getResponseTimeTrendsData()}
              type="line"
              height={280}
            />
          </Card>

          <Card>
            <h2 className="font-semibold text-foreground mb-4">Intent Confidence Distribution</h2>
            <Chart
              options={getIntentConfidenceChart()}
              series={getIntentConfidenceData()}
              type="bar"
              height={280}
            />
          </Card>
        </div>
      </div>
    );
  }

  function renderUserJourneyTab() {
    return (
      <div className="space-y-6">
        {/* User Journey KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 text-foreground-secondary mb-2">
              <Percent size={16} />
              <span className="text-sm">Completion Rate</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{kpis.completionRate.toFixed(1)}%</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 text-foreground-secondary mb-2">
              <Users size={16} />
              <span className="text-sm">Return Users</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{kpis.userReturnRate.toFixed(1)}%</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 text-foreground-secondary mb-2">
              <Activity size={16} />
              <span className="text-sm">Peak Usage</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{kpis.peakUtilization}</p>
            <p className="text-sm text-foreground-tertiary mt-1">sessions/hour</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 text-foreground-secondary mb-2">
              <Clock size={16} />
              <span className="text-sm">Avg Duration</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{formatDuration(kpis.avgDuration)}</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="font-semibold text-foreground mb-4">User Journey Funnel</h2>
            <Chart
              options={getUserJourneyFunnelChart()}
              series={getUserJourneyFunnelData()}
              type="bar"
              height={280}
            />
          </Card>

          <Card>
            <h2 className="font-semibold text-foreground mb-4">Channel Performance</h2>
            <Chart
              options={getChannelPerformanceChart()}
              series={getChannelPerformanceData()}
              type="donut"
              height={280}
            />
          </Card>
        </div>
      </div>
    );
  }

  function renderBusinessImpactTab() {
    return (
      <div className="space-y-6">
        {/* Business Impact KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 text-foreground-secondary mb-2">
              <DollarSign size={16} />
              <span className="text-sm">Cost Savings</span>
            </div>
            <p className="text-2xl font-bold text-foreground">€{kpis.costSavings.toFixed(2)}</p>
            <p className="text-sm text-foreground-tertiary mt-1">per session vs human</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 text-foreground-secondary mb-2">
              <TrendingUp size={16} />
              <span className="text-sm">ROI</span>
            </div>
            <p className="text-2xl font-bold text-foreground">342%</p>
            <p className="text-sm text-success-600 dark:text-success-500 mt-1">vs human agents</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 text-foreground-secondary mb-2">
              <Clock size={16} />
              <span className="text-sm">Time Saved</span>
            </div>
            <p className="text-2xl font-bold text-foreground">847h</p>
            <p className="text-sm text-foreground-tertiary mt-1">this period</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 text-foreground-secondary mb-2">
              <Users size={16} />
              <span className="text-sm">FTE Equivalent</span>
            </div>
            <p className="text-2xl font-bold text-foreground">2.1</p>
            <p className="text-sm text-foreground-tertiary mt-1">full-time agents</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="font-semibold text-foreground mb-4">Cost Savings Analysis</h2>
            <Chart
              options={getCostSavingsChart()}
              series={getCostSavingsData()}
              type="area"
              height={280}
            />
          </Card>

          <Card>
            <h2 className="font-semibold text-foreground mb-4">Automation vs Human Costs</h2>
            <Chart
              options={getAutomationVsHumanChart()}
              series={getAutomationVsHumanData()}
              type="bar"
              height={280}
            />
          </Card>
        </div>
      </div>
    );
  }

  function renderOperationsTab() {
    return (
      <div className="space-y-6">
        <Card>
          <h2 className="font-semibold text-foreground mb-4">System Health</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <div className="text-3xl font-bold text-success-600 dark:text-success-500 mb-2">99.8%</div>
              <div className="text-sm text-foreground-secondary">Uptime</div>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl font-bold text-warning-600 dark:text-warning-500 mb-2">1.2s</div>
              <div className="text-sm text-foreground-secondary">Avg Response</div>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl font-bold text-info-600 dark:text-info-500 mb-2">0.02%</div>
              <div className="text-sm text-foreground-secondary">Error Rate</div>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold text-foreground mb-4">Training Recommendations</h2>
          <div className="space-y-3">
            <div className="p-3 bg-warning-50 dark:bg-warning-700/30 rounded-lg border border-warning-200 dark:border-warning-700">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-warning-600 dark:text-warning-500" />
                <span className="font-medium text-warning-800 dark:text-warning-300">Low confidence detected</span>
              </div>
              <p className="text-sm text-warning-700 dark:text-warning-400 mt-1">Consider adding training data for "Sick Leave & Recovery" category</p>
            </div>

            <div className="p-3 bg-info-50 dark:bg-info-700/30 rounded-lg border border-info-200 dark:border-info-700">
              <div className="flex items-center gap-2">
                <Target size={16} className="text-info-600 dark:text-info-500" />
                <span className="font-medium text-info-800 dark:text-info-300">Intent accuracy improvement</span>
              </div>
              <p className="text-sm text-info-700 dark:text-info-400 mt-1">Review and improve responses for "Personal Questions" category</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  function renderReportsTab() {
    return (
      <div className="space-y-6">
        <Card>
          <h2 className="font-semibold text-foreground mb-4">Scheduled Reports</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <div className="font-medium text-foreground">Weekly Performance Summary</div>
                <div className="text-sm text-foreground-secondary">Every Monday at 9:00 AM</div>
              </div>
              <button className="px-3 py-1 text-sm bg-background-tertiary hover:bg-background-hover rounded text-foreground-secondary">
                Configure
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <div className="font-medium text-foreground">Monthly Business Impact</div>
                <div className="text-sm text-foreground-secondary">First day of each month</div>
              </div>
              <button className="px-3 py-1 text-sm bg-background-tertiary hover:bg-background-hover rounded text-foreground-secondary">
                Configure
              </button>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold text-foreground mb-4">Export Data</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <button className="p-4 border border-border rounded-lg hover:bg-background-hover text-left transition-colors">
              <div className="font-medium text-foreground mb-1">Session Data</div>
              <div className="text-sm text-foreground-secondary">Export raw session data as CSV</div>
            </button>

            <button className="p-4 border border-border rounded-lg hover:bg-background-hover text-left transition-colors">
              <div className="font-medium text-foreground mb-1">Performance Report</div>
              <div className="text-sm text-foreground-secondary">Comprehensive performance metrics</div>
            </button>

            <button className="p-4 border border-border rounded-lg hover:bg-background-hover text-left transition-colors">
              <div className="font-medium text-foreground mb-1">Business Impact</div>
              <div className="text-sm text-foreground-secondary">ROI and cost analysis report</div>
            </button>
          </div>
        </Card>
      </div>
    );
  }

  // Chart helper functions for Performance Tab
  function getResponseTimeTrendsData() {
    const responseTimesByDay = filteredSessions.reduce((acc, session) => {
      const date = new Date(session.start_time).toLocaleDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(session.avg_response_time / 1000); // Convert to seconds
      return acc;
    }, {} as Record<string, number[]>);

    return [{
      name: 'Avg Response Time',
      data: Object.entries(responseTimesByDay)
        .map(([date, times]) => ({
          x: date,
          y: times.reduce((sum, time) => sum + time, 0) / times.length
        }))
        .sort((a, b) => new Date(a.x).getTime() - new Date(b.x).getTime())
    }];
  }

  function getResponseTimeTrendsChart(): ApexOptions {
    return {
      chart: { type: 'line' as const, height: 280, toolbar: { show: false } },
      colors: [colorPalette.primary],
      stroke: { curve: 'smooth', width: 3 },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'vertical',
          shadeIntensity: 0.1,
          gradientToColors: [colorPalette.grey200],
          opacityFrom: 0.8,
          opacityTo: 0.3
        }
      },
      xaxis: {
        type: 'datetime',
        labels: { style: { colors: '#64748b', fontSize: '12px' } }
      },
      yaxis: {
        labels: { 
          style: { colors: '#64748b', fontSize: '12px' },
          formatter: function (value: number) {
            return value.toFixed(2);
          }
        },
        title: { text: 'Seconds', style: { color: '#64748b' } }
      },
      grid: { borderColor: '#f1f5f9' }
    };
  }

  function getIntentConfidenceData() {
    const confidenceRanges = {
      'High (90-100%)': filteredSessions.filter(s => s.intent_confidence >= 0.9).length,
      'Medium (70-89%)': filteredSessions.filter(s => s.intent_confidence >= 0.7 && s.intent_confidence < 0.9).length,
      'Low (50-69%)': filteredSessions.filter(s => s.intent_confidence >= 0.5 && s.intent_confidence < 0.7).length,
      'Very Low (<50%)': filteredSessions.filter(s => s.intent_confidence < 0.5).length
    };

    return [{
      name: 'Sessions',
      data: Object.entries(confidenceRanges).map(([range, count]) => ({
        x: range,
        y: count
      }))
    }];
  }

  function getIntentConfidenceChart(): ApexOptions {
    return {
      chart: { type: 'bar' as const, height: 280, toolbar: { show: false } },
      colors: [colorPalette.primary, colorPalette.black, colorPalette.grey400, colorPalette.grey600],
      fill: { colors: [colorPalette.primary, colorPalette.black, colorPalette.grey400, colorPalette.grey600] },
      plotOptions: {
        bar: { horizontal: true, borderRadius: 6 }
      },
      xaxis: { labels: { style: { colors: '#64748b', fontSize: '12px' } } },
      yaxis: { labels: { style: { colors: '#64748b', fontSize: '10px' } } },
      grid: { borderColor: '#f1f5f9' }
    };
  }

  // Chart helper functions for User Journey Tab
  function getUserJourneyFunnelData() {
    const totalStarted = filteredSessions.length;
    const completedStep2 = filteredSessions.filter(s => s.session_steps >= 2).length;
    const completedStep5 = filteredSessions.filter(s => s.session_steps >= 5).length;
    const goalAchieved = filteredSessions.filter(s => s.goal_achieved).length;
    const completed = filteredSessions.filter(s => s.completion_status === 'completed').length;

    return [{
      name: 'Sessions',
      data: [
        { x: 'Started', y: totalStarted },
        { x: 'Engaged (2+ steps)', y: completedStep2 },
        { x: 'Deep Engagement (5+ steps)', y: completedStep5 },
        { x: 'Goal Achieved', y: goalAchieved },
        { x: 'Completed', y: completed }
      ]
    }];
  }

  function getUserJourneyFunnelChart(): ApexOptions {
    return {
      chart: { type: 'bar' as const, height: 280, toolbar: { show: false } },
      colors: [colorPalette.primary, colorPalette.black, colorPalette.grey300, colorPalette.grey500, colorPalette.grey600],
      fill: { colors: [colorPalette.primary, colorPalette.black, colorPalette.grey300, colorPalette.grey500, colorPalette.grey600] },
      plotOptions: { bar: { horizontal: true, borderRadius: 6 } },
      xaxis: { labels: { style: { colors: '#64748b', fontSize: '12px' } } },
      yaxis: { labels: { style: { colors: '#64748b', fontSize: '10px' } } },
      grid: { borderColor: '#f1f5f9' }
    };
  }

  function getChannelPerformanceData() {
    const channelCounts = filteredSessions.reduce((acc, session) => {
      acc[session.channel] = (acc[session.channel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.values(channelCounts);
  }

  function getChannelPerformanceChart(): ApexOptions {
    const channelCounts = filteredSessions.reduce((acc, session) => {
      acc[session.channel] = (acc[session.channel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      chart: { type: 'donut' as const, height: 280 },
      colors: [colorPalette.primary, colorPalette.black, colorPalette.grey400, colorPalette.grey600],
      labels: Object.keys(channelCounts).map(channel => channel.charAt(0).toUpperCase() + channel.slice(1)),
      plotOptions: {
        pie: {
          donut: {
            size: '60%',
            labels: {
              show: true,
              total: { show: true, label: 'Total Sessions' }
            }
          }
        }
      },
      legend: { position: 'bottom' }
    };
  }

  // Chart helper functions for Business Impact Tab
  function getCostSavingsData() {
    const savingsByDay = filteredSessions.reduce((acc, session) => {
      const date = new Date(session.start_time).toLocaleDateString();
      acc[date] = (acc[date] || 0) + session.automation_saving;
      return acc;
    }, {} as Record<string, number>);

    return [{
      name: 'Cost Savings (€)',
      data: Object.entries(savingsByDay)
        .map(([date, savings]) => ({ x: date, y: parseFloat(savings.toFixed(2)) }))
        .sort((a, b) => new Date(a.x).getTime() - new Date(b.x).getTime())
    }];
  }

  function getCostSavingsChart(): ApexOptions {
    return {
      chart: { type: 'area' as const, height: 280, toolbar: { show: false } },
      colors: [colorPalette.primary],
      stroke: { curve: 'smooth', width: 3 },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'vertical',
          gradientToColors: [colorPalette.grey200],
          opacityFrom: 0.8,
          opacityTo: 0.3
        }
      },
      xaxis: {
        type: 'datetime',
        labels: { style: { colors: '#64748b' } }
      },
      yaxis: {
        labels: { 
          style: { colors: '#64748b' },
          formatter: function (value: number) {
            return Math.round(value).toString();
          }
        },
        title: { text: 'Euros (€)', style: { color: '#64748b' } }
      },
      grid: { borderColor: '#f1f5f9' }
    };
  }

  function getAutomationVsHumanData() {
    const totalAutomationCost = filteredSessions.reduce((sum, s) => sum + s.tokens_eur, 0);
    const totalHumanCost = filteredSessions.reduce((sum, s) => sum + s.human_cost_equivalent, 0);
    const totalSavings = filteredSessions.reduce((sum, s) => sum + s.automation_saving, 0);

    return [
      {
        name: 'Bot Cost',
        data: [{ x: 'Total Cost', y: parseFloat(totalAutomationCost.toFixed(2)) }]
      },
      {
        name: 'Human Equivalent Cost',
        data: [{ x: 'Total Cost', y: parseFloat(totalHumanCost.toFixed(2)) }]
      },
      {
        name: 'Savings',
        data: [{ x: 'Total Cost', y: parseFloat(totalSavings.toFixed(2)) }]
      }
    ];
  }

  function getAutomationVsHumanChart(): ApexOptions {
    return {
      chart: { type: 'bar' as const, height: 280, toolbar: { show: false } },
      colors: [colorPalette.primary, colorPalette.grey500, colorPalette.black],
      plotOptions: {
        bar: { horizontal: false, borderRadius: 6 }
      },
      xaxis: { labels: { style: { colors: '#64748b' } } },
      yaxis: {
        labels: { style: { colors: '#64748b' } },
        title: { text: 'Cost (€)', style: { color: '#64748b' } }
      },
      legend: { position: 'top' },
      grid: { borderColor: '#f1f5f9' }
    };
  }
}
