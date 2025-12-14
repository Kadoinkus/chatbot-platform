"use client";
import { useState, useEffect, use } from "react";
import { getClientById } from '@/lib/dataService';
import type { Client } from '@/types';
import {
  Settings,
  Building,
  CreditCard,
  Bell,
  Shield,
  Users,
  Database,
  Zap,
  FileText,
  Save,
  AlertCircle,
  Check,
  X,
  ChevronRight,
  Download,
  RefreshCw,
  ChevronDown,
  UserPlus,
  Crown,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import {
  Page,
  PageContent,
  PageHeader,
  Button,
  Input,
  Select,
  Textarea,
  Toggle,
  Card,
  Alert,
  EmptyState,
} from '@/components/ui';

export default function SettingsPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = use(params);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

  useEffect(() => {
    async function loadClient() {
      try {
        setError(null);
        const data = await getClientById(clientId);
        setClient(data ?? null);
      } catch (err) {
        console.error('Failed to load client:', err);
        setError('Failed to load settings. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    loadClient();
  }, [clientId]);

  // General settings
  const [generalSettings, setGeneralSettings] = useState({
    companyName: '',
    companyEmail: '',
    companyPhone: '+1 (555) 123-4567',
    companyAddress: '123 Business Ave, New York, NY 10001',
    timezone: 'America/New_York',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD'
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNewConversations: true,
    emailEscalations: true,
    emailDailyReport: false,
    emailWeeklyReport: true,
    emailMonthlyReport: true,
    pushNewConversations: true,
    pushEscalations: true,
    pushBotOffline: true,
    slackIntegration: false,
    slackWebhook: ''
  });

  // Security settings
  const [security, setSecurity] = useState({
    requireTwoFactor: false,
    sessionTimeout: '8',
    ipWhitelist: false,
    ipAddresses: '',
    passwordPolicy: 'medium',
    ssoEnabled: false,
    ssoProvider: 'none',
    apiAccess: true,
    auditLog: true
  });

  // Billing settings
  const [billing, setBilling] = useState({
    plan: 'Professional',
    billingEmail: '',
    billingCycle: 'monthly',
    paymentMethod: 'Credit Card',
    cardLast4: '4242',
    nextBilling: '2025-09-01',
    autoRenew: true
  });

  // Update form values when client loads
  useEffect(() => {
    if (client) {
      setGeneralSettings(prev => ({
        ...prev,
        companyName: client.name || '',
        companyEmail: 'contact@' + (client.slug || 'company') + '.com',
      }));
      setBilling(prev => ({
        ...prev,
        billingEmail: 'billing@' + (client.slug || 'company') + '.com',
      }));
    }
  }, [client]);

  const tabs = [
    { id: 'general', label: 'General', icon: Building },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'api', label: 'API & Webhooks', icon: Zap },
    { id: 'data', label: 'Data & Privacy', icon: Database },
    { id: 'team', label: 'Team Settings', icon: Users }
  ];

  const timezoneOptions = [
    { value: 'America/New_York', label: 'Eastern Time' },
    { value: 'America/Chicago', label: 'Central Time' },
    { value: 'America/Los_Angeles', label: 'Pacific Time' },
    { value: 'Europe/London', label: 'London' },
    { value: 'Europe/Amsterdam', label: 'Amsterdam' },
    { value: 'Asia/Tokyo', label: 'Tokyo' },
  ];

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'nl', label: 'Dutch' },
    { value: 'de', label: 'German' },
    { value: 'fr', label: 'French' },
    { value: 'es', label: 'Spanish' },
  ];

  const dateFormatOptions = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
  ];

  const currencyOptions = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
    { value: 'JPY', label: 'JPY (¥)' },
  ];

  const sessionTimeoutOptions = [
    { value: '1', label: '1 hour' },
    { value: '4', label: '4 hours' },
    { value: '8', label: '8 hours' },
    { value: '24', label: '24 hours' },
    { value: 'never', label: 'Never' },
  ];

  const passwordPolicyOptions = [
    { value: 'low', label: 'Low - 6+ characters' },
    { value: 'medium', label: 'Medium - 8+ chars, mixed case' },
    { value: 'high', label: 'High - 10+ chars, mixed case, numbers, symbols' },
  ];

  const billingCycleOptions = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly (20% discount)' },
  ];

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSaving(false);
    setHasChanges(false);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleChange = (section: string, field: string, value: any) => {
    switch(section) {
      case 'general':
        setGeneralSettings(prev => ({ ...prev, [field]: value }));
        break;
      case 'notifications':
        setNotifications(prev => ({ ...prev, [field]: value }));
        break;
      case 'security':
        setSecurity(prev => ({ ...prev, [field]: value }));
        break;
      case 'billing':
        setBilling(prev => ({ ...prev, [field]: value }));
        break;
    }
    setHasChanges(true);
  };

  if (loading) {
    return (
      <Page>
        <PageContent>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground" />
          </div>
        </PageContent>
      </Page>
    );
  }

  if (error) {
    return (
      <Page>
        <PageContent>
          <EmptyState
            icon={<AlertCircle size={48} />}
            title="Error loading settings"
            message={error}
            action={
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            }
          />
        </PageContent>
      </Page>
    );
  }

  if (!client) {
    return (
      <Page>
        <PageContent>
          <EmptyState
            icon={<Settings size={48} />}
            title="Client not found"
            message="The requested client could not be found."
          />
        </PageContent>
      </Page>
    );
  }

  return (
    <Page>
      <PageContent>
            <PageHeader
              title="Settings"
              description="Manage your account settings and preferences"
              actions={
                hasChanges ? (
                  <Button onClick={handleSave} loading={saving} icon={saving ? undefined : <Save size={20} />}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                ) : null
              }
            />

            {/* Alert */}
            {showAlert && (
              <div className="mb-6">
                <Alert variant="success">Settings saved successfully!</Alert>
              </div>
            )}

            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
              {/* Responsive Tabs Navigation */}
              <div className="w-full lg:w-64">
                {/* Mobile Dropdown */}
                <div className="lg:hidden relative">
                  <button
                    onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-surface-elevated border border-border rounded-lg text-left"
                  >
                    <div className="flex items-center gap-3 text-foreground">
                      {(() => {
                        const activeTabData = tabs.find(t => t.id === activeTab);
                        const Icon = activeTabData?.icon || Settings;
                        return (
                          <>
                            <Icon size={18} />
                            <span className="font-medium">{activeTabData?.label || 'Settings'}</span>
                          </>
                        );
                      })()}
                    </div>
                    <ChevronDown size={16} className={`text-foreground-tertiary transition-transform ${mobileDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {mobileDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-surface-elevated border border-border rounded-lg shadow-lg z-10">
                      {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => {
                              setActiveTab(tab.id);
                              setMobileDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-background-hover first:rounded-t-lg last:rounded-b-lg ${
                              activeTab === tab.id ? 'bg-background-hover text-foreground font-medium' : 'text-foreground-secondary'
                            }`}
                          >
                            <Icon size={18} />
                            <span>{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Desktop Sidebar */}
                <Card padding="sm" className="hidden lg:block">
                  <div className="flex flex-col gap-1">
                    {tabs.map(tab => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                            activeTab === tab.id
                              ? 'bg-interactive text-foreground-inverse'
                              : 'text-foreground-secondary hover:bg-background-hover hover:text-foreground'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon size={18} />
                            <span className="font-medium">{tab.label}</span>
                          </div>
                          <ChevronRight size={14} className={activeTab === tab.id ? 'text-foreground-inverse' : 'text-foreground-tertiary'} />
                        </button>
                      );
                    })}
                  </div>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="flex-1">
                {/* General Settings */}
                {activeTab === 'general' && (
                  <Card>
                    <h2 className="text-xl font-semibold text-foreground mb-6">General Settings</h2>

                    <div className="space-y-4 lg:space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                        <Input
                          label="Company Name"
                          value={generalSettings.companyName}
                          onChange={(e) => handleChange('general', 'companyName', e.target.value)}
                        />
                        <Input
                          label="Contact Email"
                          type="email"
                          value={generalSettings.companyEmail}
                          onChange={(e) => handleChange('general', 'companyEmail', e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Input
                          label="Phone Number"
                          type="tel"
                          value={generalSettings.companyPhone}
                          onChange={(e) => handleChange('general', 'companyPhone', e.target.value)}
                        />
                        <Select
                          label="Timezone"
                          options={timezoneOptions}
                          value={generalSettings.timezone}
                          onChange={(e) => handleChange('general', 'timezone', e.target.value)}
                        />
                      </div>

                      <Textarea
                        label="Business Address"
                        rows={3}
                        value={generalSettings.companyAddress}
                        onChange={(e) => handleChange('general', 'companyAddress', e.target.value)}
                      />

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                        <Select
                          label="Language"
                          options={languageOptions}
                          value={generalSettings.language}
                          onChange={(e) => handleChange('general', 'language', e.target.value)}
                        />
                        <Select
                          label="Date Format"
                          options={dateFormatOptions}
                          value={generalSettings.dateFormat}
                          onChange={(e) => handleChange('general', 'dateFormat', e.target.value)}
                        />
                        <Select
                          label="Currency"
                          options={currencyOptions}
                          value={generalSettings.currency}
                          onChange={(e) => handleChange('general', 'currency', e.target.value)}
                        />
                      </div>
                    </div>
                  </Card>
                )}

                {/* Notification Settings */}
                {activeTab === 'notifications' && (
                  <Card>
                    <h2 className="text-xl font-semibold text-foreground mb-6">Notification Preferences</h2>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wide mb-4">Email Notifications</h3>
                        <div className="space-y-4">
                          <Toggle
                            label="New conversations"
                            description="Get notified when new conversations start"
                            checked={notifications.emailNewConversations}
                            onChange={(checked) => handleChange('notifications', 'emailNewConversations', checked)}
                          />
                          <Toggle
                            label="Escalations"
                            description="When conversations are escalated to human agents"
                            checked={notifications.emailEscalations}
                            onChange={(checked) => handleChange('notifications', 'emailEscalations', checked)}
                          />
                          <Toggle
                            label="Daily report"
                            description="Summary of daily activity and metrics"
                            checked={notifications.emailDailyReport}
                            onChange={(checked) => handleChange('notifications', 'emailDailyReport', checked)}
                          />
                          <Toggle
                            label="Weekly report"
                            description="Comprehensive weekly performance report"
                            checked={notifications.emailWeeklyReport}
                            onChange={(checked) => handleChange('notifications', 'emailWeeklyReport', checked)}
                          />
                          <Toggle
                            label="Monthly report"
                            description="Monthly analytics and insights"
                            checked={notifications.emailMonthlyReport}
                            onChange={(checked) => handleChange('notifications', 'emailMonthlyReport', checked)}
                          />
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wide mb-4">Push Notifications</h3>
                        <div className="space-y-4">
                          <Toggle
                            label="New conversations"
                            description="Browser notifications for new chats"
                            checked={notifications.pushNewConversations}
                            onChange={(checked) => handleChange('notifications', 'pushNewConversations', checked)}
                          />
                          <Toggle
                            label="Escalations"
                            description="Urgent notifications for escalated conversations"
                            checked={notifications.pushEscalations}
                            onChange={(checked) => handleChange('notifications', 'pushEscalations', checked)}
                          />
                          <Toggle
                            label="Bot offline"
                            description="Alert when a bot goes offline"
                            checked={notifications.pushBotOffline}
                            onChange={(checked) => handleChange('notifications', 'pushBotOffline', checked)}
                          />
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wide mb-4">Slack Integration</h3>
                        <Toggle
                          label="Enable Slack notifications"
                          description="Send notifications to your Slack workspace"
                          checked={notifications.slackIntegration}
                          onChange={(checked) => handleChange('notifications', 'slackIntegration', checked)}
                        />
                        {notifications.slackIntegration && (
                          <div className="mt-4">
                            <Input
                              label="Webhook URL"
                              value={notifications.slackWebhook}
                              onChange={(e) => handleChange('notifications', 'slackWebhook', e.target.value)}
                              placeholder="https://hooks.slack.com/services/..."
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                )}

                {/* Security Settings */}
                {activeTab === 'security' && (
                  <Card>
                    <h2 className="text-xl font-semibold text-foreground mb-6">Security Settings</h2>

                    <div className="space-y-6">
                      <Toggle
                        label="Two-Factor Authentication"
                        description="Require 2FA for all team members"
                        checked={security.requireTwoFactor}
                        onChange={(checked) => handleChange('security', 'requireTwoFactor', checked)}
                      />

                      <Select
                        label="Session Timeout"
                        options={sessionTimeoutOptions}
                        value={security.sessionTimeout}
                        onChange={(e) => handleChange('security', 'sessionTimeout', e.target.value)}
                      />

                      <Select
                        label="Password Policy"
                        options={passwordPolicyOptions}
                        value={security.passwordPolicy}
                        onChange={(e) => handleChange('security', 'passwordPolicy', e.target.value)}
                      />

                      <div>
                        <Toggle
                          label="IP Whitelist"
                          description="Restrict access to specific IP addresses"
                          checked={security.ipWhitelist}
                          onChange={(checked) => handleChange('security', 'ipWhitelist', checked)}
                        />
                        {security.ipWhitelist && (
                          <div className="mt-4">
                            <Textarea
                              rows={3}
                              value={security.ipAddresses}
                              onChange={(e) => handleChange('security', 'ipAddresses', e.target.value)}
                              placeholder="Enter IP addresses, one per line"
                            />
                          </div>
                        )}
                      </div>

                      <Toggle
                        label="API Access"
                        description="Allow API access for integrations"
                        checked={security.apiAccess}
                        onChange={(checked) => handleChange('security', 'apiAccess', checked)}
                      />

                      <Toggle
                        label="Audit Logging"
                        description="Track all security-related events"
                        checked={security.auditLog}
                        onChange={(checked) => handleChange('security', 'auditLog', checked)}
                      />
                    </div>
                  </Card>
                )}

                {/* Billing Settings */}
                {activeTab === 'billing' && (
                  <Card>
                    <h2 className="text-xl font-semibold text-foreground mb-6">Billing & Subscription</h2>

                    <div className="space-y-6">
                      <div className="p-4 bg-background-secondary rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-medium text-lg text-foreground">Current Plan: {billing.plan}</h3>
                            <p className="text-sm text-foreground-secondary">Next billing date: {billing.nextBilling}</p>
                          </div>
                          <div className="flex gap-2">
                            <Link href={`/app/${clientId}/plans`}>
                              <Button variant="secondary">View Plans</Button>
                            </Link>
                            <Link href={`/app/${clientId}/plans`}>
                              <Button>Upgrade Plan</Button>
                            </Link>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Input
                          label="Billing Email"
                          type="email"
                          value={billing.billingEmail}
                          onChange={(e) => handleChange('billing', 'billingEmail', e.target.value)}
                        />
                        <Select
                          label="Billing Cycle"
                          options={billingCycleOptions}
                          value={billing.billingCycle}
                          onChange={(e) => handleChange('billing', 'billingCycle', e.target.value)}
                        />
                      </div>

                      <div>
                        <h3 className="font-medium text-foreground mb-3">Payment Method</h3>
                        <div className="flex items-center justify-between p-4 bg-background-secondary rounded-lg">
                          <div className="flex items-center gap-3">
                            <CreditCard size={24} className="text-foreground-tertiary" />
                            <div>
                              <p className="font-medium text-foreground">•••• •••• •••• {billing.cardLast4}</p>
                              <p className="text-sm text-foreground-secondary">Expires 12/2025</p>
                            </div>
                          </div>
                          <Button variant="secondary">Update Card</Button>
                        </div>
                      </div>

                      <Toggle
                        label="Auto-Renew"
                        description="Automatically renew subscription"
                        checked={billing.autoRenew}
                        onChange={(checked) => handleChange('billing', 'autoRenew', checked)}
                      />

                      <div className="flex flex-wrap gap-3">
                        <Link href={`/app/${clientId}/billing`}>
                          <Button icon={<CreditCard size={16} />}>Billing & Workspaces</Button>
                        </Link>
                        <Button variant="secondary" icon={<Download size={16} />}>Download Invoice</Button>
                        <Button variant="secondary" icon={<FileText size={16} />}>Billing History</Button>
                      </div>
                    </div>
                  </Card>
                )}

                {/* API Settings */}
                {activeTab === 'api' && (
                  <Card>
                    <h2 className="text-xl font-semibold text-foreground mb-6">API & Webhooks</h2>

                    <div className="space-y-6">
                      <div>
                        <h3 className="font-medium text-foreground mb-3">API Keys</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-4 bg-background-secondary rounded-lg">
                            <div>
                              <p className="font-mono text-sm text-foreground">sk_live_••••••••••••••••••••••••••••••••</p>
                              <p className="text-sm text-foreground-secondary mt-1">Created on Jan 15, 2024</p>
                            </div>
                            <div className="flex gap-2">
                              <button className="p-2 text-foreground-tertiary hover:text-foreground transition-colors" aria-label="Regenerate">
                                <RefreshCw size={16} />
                              </button>
                              <button className="p-2 text-error-500 hover:text-error-600 transition-colors" aria-label="Delete">
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                        <Button className="mt-3">Generate New API Key</Button>
                      </div>

                      <div>
                        <h3 className="font-medium text-foreground mb-3">Webhook Endpoints</h3>
                        <div className="space-y-3">
                          <div className="p-4 border border-border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium text-foreground">Conversation Started</p>
                              <span className="px-2 py-1 bg-success-100 dark:bg-success-700/30 text-success-700 dark:text-success-400 text-xs rounded">Active</span>
                            </div>
                            <p className="text-sm text-foreground-secondary font-mono">https://your-app.com/webhook/conversation</p>
                          </div>
                          <div className="p-4 border border-border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium text-foreground">Bot Offline Alert</p>
                              <span className="px-2 py-1 bg-success-100 dark:bg-success-700/30 text-success-700 dark:text-success-400 text-xs rounded">Active</span>
                            </div>
                            <p className="text-sm text-foreground-secondary font-mono">https://your-app.com/webhook/bot-status</p>
                          </div>
                        </div>
                        <Button variant="secondary" className="mt-3">Add Webhook Endpoint</Button>
                      </div>

                      <Alert variant="info" title="API Documentation">
                        View our complete API documentation and integration guides at{' '}
                        <a href="#" className="underline text-info-600 dark:text-info-500">docs.chatbot-platform.com/api</a>
                      </Alert>
                    </div>
                  </Card>
                )}

                {/* Team Settings */}
                {activeTab === 'team' && (
                  <Card>
                    <h2 className="text-xl font-semibold text-foreground mb-6">Team Management</h2>

                    <div className="space-y-6">
                      {/* Quick Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-background-secondary rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-info-100 dark:bg-info-700/30 rounded-lg flex items-center justify-center">
                              <Users size={20} className="text-info-600 dark:text-info-500" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-foreground">5</p>
                              <p className="text-sm text-foreground-secondary">Team Members</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 bg-background-secondary rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-success-100 dark:bg-success-700/30 rounded-lg flex items-center justify-center">
                              <Activity size={20} className="text-success-600 dark:text-success-500" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-foreground">4</p>
                              <p className="text-sm text-foreground-secondary">Active Now</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 bg-background-secondary rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-plan-premium-bg rounded-lg flex items-center justify-center">
                              <Crown size={20} className="text-plan-premium-text" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-foreground">2</p>
                              <p className="text-sm text-foreground-secondary">Admins</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex flex-wrap gap-3">
                        <Link href={`/app/${clientId}/team`}>
                          <Button icon={<Users size={18} />}>Manage Team</Button>
                        </Link>
                        <Button variant="secondary" icon={<UserPlus size={18} />}>Invite Member</Button>
                      </div>

                      {/* Role Permissions Overview */}
                      <div>
                        <h3 className="font-medium text-foreground mb-3">Role Permissions</h3>
                        <div className="space-y-3">
                          <div className="p-4 border border-border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Crown size={18} className="text-plan-premium-text" />
                                <div>
                                  <p className="font-medium text-foreground">Owner</p>
                                  <p className="text-sm text-foreground-secondary">Full access to all features</p>
                                </div>
                              </div>
                              <span className="text-sm text-foreground-tertiary">1 member</span>
                            </div>
                          </div>
                          <div className="p-4 border border-border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Shield size={18} className="text-info-600 dark:text-info-500" />
                                <div>
                                  <p className="font-medium text-foreground">Admin</p>
                                  <p className="text-sm text-foreground-secondary">Manage bots, users, and settings</p>
                                </div>
                              </div>
                              <span className="text-sm text-foreground-tertiary">1 member</span>
                            </div>
                          </div>
                          <div className="p-4 border border-border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Activity size={18} className="text-success-600 dark:text-success-500" />
                                <div>
                                  <p className="font-medium text-foreground">Agent</p>
                                  <p className="text-sm text-foreground-secondary">Handle conversations and support</p>
                                </div>
                              </div>
                              <span className="text-sm text-foreground-tertiary">2 members</span>
                            </div>
                          </div>
                          <div className="p-4 border border-border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Users size={18} className="text-foreground-tertiary" />
                                <div>
                                  <p className="font-medium text-foreground">Viewer</p>
                                  <p className="text-sm text-foreground-secondary">View analytics and reports only</p>
                                </div>
                              </div>
                              <span className="text-sm text-foreground-tertiary">1 member</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Alert variant="info" title="Team Seats">
                        Your plan includes 7 team seats. You have 2 seats available.{' '}
                        <Link href={`/app/${clientId}/settings?tab=billing`} className="underline text-info-600 dark:text-info-500">
                          Upgrade for more
                        </Link>
                      </Alert>
                    </div>
                  </Card>
                )}

                {/* Data & Privacy Settings */}
                {activeTab === 'data' && (
                  <Card>
                    <h2 className="text-xl font-semibold text-foreground mb-6">Data & Privacy</h2>
                    <EmptyState
                      icon={<Database size={48} />}
                      title="Coming Soon"
                      message="Data export and privacy settings will be available shortly"
                    />
                  </Card>
                )}
              </div>
            </div>
      </PageContent>
    </Page>
  );
}
