'use client';
import { useState, useEffect } from 'react';
import { clients } from '@/lib/data';
import Sidebar from '@/components/Sidebar';
import AuthGuard from '@/components/AuthGuard';
import { 
  Settings, 
  Building, 
  CreditCard, 
  Bell, 
  Shield, 
  Users, 
  Globe, 
  Mail,
  Key,
  Database,
  Zap,
  FileText,
  Save,
  AlertCircle,
  Check,
  X,
  ChevronRight,
  Upload,
  Download,
  RefreshCw,
  ChevronDown
} from 'lucide-react';

export default function SettingsPage({ params }: { params: { clientId: string } }) {
  const [activeTab, setActiveTab] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  
  const client = clients.find(c => c.id === params.clientId);

  // General settings
  const [generalSettings, setGeneralSettings] = useState({
    companyName: client?.name || '',
    companyEmail: 'contact@' + (client?.slug || 'company') + '.com',
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
    billingEmail: 'billing@' + (client?.slug || 'company') + '.com',
    billingCycle: 'monthly',
    paymentMethod: 'Credit Card',
    cardLast4: '4242',
    nextBilling: '2025-09-01',
    autoRenew: true
  });

  const tabs = [
    { id: 'general', label: 'General', icon: Building },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'api', label: 'API & Webhooks', icon: Zap },
    { id: 'data', label: 'Data & Privacy', icon: Database },
    { id: 'team', label: 'Team Settings', icon: Users }
  ];

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
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
    <AuthGuard clientId={params.clientId}>
      <div className="flex min-h-screen bg-background">
        <Sidebar clientId={params.clientId} />

        <main className="flex-1 lg:ml-16 min-h-screen">
          <div className="max-w-7xl mx-auto p-3 lg:p-8 pt-20 lg:pt-8">
            {/* Header */}
            <div className="mb-6 lg:mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Settings</h1>
                  <p className="text-foreground-secondary">Manage your account settings and preferences</p>
                </div>
                {hasChanges && (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary px-4 py-2 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <RefreshCw size={20} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={20} />
                        Save Changes
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Alert */}
            {showAlert && (
              <div className="alert-success mb-6">
                <Check size={20} className="alert-icon" />
                <span className="alert-title">Settings saved successfully!</span>
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
                <nav className="hidden lg:block card p-2">
                  <div className="flex flex-col gap-1">
                    {tabs.map(tab => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={activeTab === tab.id ? 'nav-item-active' : 'nav-item'}
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
                </nav>
              </div>

              {/* Settings Content */}
              <div className="flex-1">
                {/* General Settings */}
                {activeTab === 'general' && (
                  <div className="settings-panel">
                    <h2 className="settings-title">General Settings</h2>

                    <div className="space-y-4 lg:space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                        <div>
                          <label className="label">Company Name</label>
                          <input
                            type="text"
                            value={generalSettings.companyName}
                            onChange={(e) => handleChange('general', 'companyName', e.target.value)}
                            className="input"
                          />
                        </div>
                        <div>
                          <label className="label">Contact Email</label>
                          <input
                            type="email"
                            value={generalSettings.companyEmail}
                            onChange={(e) => handleChange('general', 'companyEmail', e.target.value)}
                            className="input"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <label className="label">Phone Number</label>
                          <input
                            type="tel"
                            value={generalSettings.companyPhone}
                            onChange={(e) => handleChange('general', 'companyPhone', e.target.value)}
                            className="input"
                          />
                        </div>
                        <div>
                          <label className="label">Timezone</label>
                          <select
                            value={generalSettings.timezone}
                            onChange={(e) => handleChange('general', 'timezone', e.target.value)}
                            className="select"
                          >
                            <option value="America/New_York">Eastern Time</option>
                            <option value="America/Chicago">Central Time</option>
                            <option value="America/Los_Angeles">Pacific Time</option>
                            <option value="Europe/London">London</option>
                            <option value="Europe/Amsterdam">Amsterdam</option>
                            <option value="Asia/Tokyo">Tokyo</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="label">Business Address</label>
                        <textarea
                          rows={3}
                          value={generalSettings.companyAddress}
                          onChange={(e) => handleChange('general', 'companyAddress', e.target.value)}
                          className="textarea"
                        />
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                        <div>
                          <label className="label">Language</label>
                          <select
                            value={generalSettings.language}
                            onChange={(e) => handleChange('general', 'language', e.target.value)}
                            className="select"
                          >
                            <option value="en">English</option>
                            <option value="nl">Dutch</option>
                            <option value="de">German</option>
                            <option value="fr">French</option>
                            <option value="es">Spanish</option>
                          </select>
                        </div>
                        <div>
                          <label className="label">Date Format</label>
                          <select
                            value={generalSettings.dateFormat}
                            onChange={(e) => handleChange('general', 'dateFormat', e.target.value)}
                            className="select"
                          >
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                          </select>
                        </div>
                        <div>
                          <label className="label">Currency</label>
                          <select
                            value={generalSettings.currency}
                            onChange={(e) => handleChange('general', 'currency', e.target.value)}
                            className="select"
                          >
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                            <option value="JPY">JPY (¥)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notification Settings */}
                {activeTab === 'notifications' && (
                  <div className="settings-panel">
                    <h2 className="settings-title">Notification Preferences</h2>

                    <div className="space-y-4 lg:space-y-6">
                      <div>
                        <h3 className="settings-section">Email Notifications</h3>
                        <div className="space-y-3">
                          {[
                            { key: 'emailNewConversations', label: 'New conversations', desc: 'Get notified when new conversations start' },
                            { key: 'emailEscalations', label: 'Escalations', desc: 'When conversations are escalated to human agents' },
                            { key: 'emailDailyReport', label: 'Daily report', desc: 'Summary of daily activity and metrics' },
                            { key: 'emailWeeklyReport', label: 'Weekly report', desc: 'Comprehensive weekly performance report' },
                            { key: 'emailMonthlyReport', label: 'Monthly report', desc: 'Monthly analytics and insights' }
                          ].map(setting => (
                            <label key={setting.key} className="form-group">
                              <input
                                type="checkbox"
                                checked={notifications[setting.key as keyof typeof notifications] as boolean}
                                onChange={(e) => handleChange('notifications', setting.key, e.target.checked)}
                                className="checkbox mt-0.5"
                              />
                              <div className="form-group-content">
                                <span className="form-group-label">{setting.label}</span>
                                <p className="form-group-desc">{setting.desc}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="settings-section">Push Notifications</h3>
                        <div className="space-y-3">
                          {[
                            { key: 'pushNewConversations', label: 'New conversations', desc: 'Browser notifications for new chats' },
                            { key: 'pushEscalations', label: 'Escalations', desc: 'Urgent notifications for escalated conversations' },
                            { key: 'pushBotOffline', label: 'Bot offline', desc: 'Alert when a bot goes offline' }
                          ].map(setting => (
                            <label key={setting.key} className="form-group">
                              <input
                                type="checkbox"
                                checked={notifications[setting.key as keyof typeof notifications] as boolean}
                                onChange={(e) => handleChange('notifications', setting.key, e.target.checked)}
                                className="checkbox mt-0.5"
                              />
                              <div className="form-group-content">
                                <span className="form-group-label">{setting.label}</span>
                                <p className="form-group-desc">{setting.desc}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="settings-section">Slack Integration</h3>
                        <label className="form-group mb-4">
                          <input
                            type="checkbox"
                            checked={notifications.slackIntegration}
                            onChange={(e) => handleChange('notifications', 'slackIntegration', e.target.checked)}
                            className="checkbox mt-0.5"
                          />
                          <div className="form-group-content">
                            <span className="form-group-label">Enable Slack notifications</span>
                            <p className="form-group-desc">Send notifications to your Slack workspace</p>
                          </div>
                        </label>
                        {notifications.slackIntegration && (
                          <div>
                            <label className="label">Webhook URL</label>
                            <input
                              type="text"
                              value={notifications.slackWebhook}
                              onChange={(e) => handleChange('notifications', 'slackWebhook', e.target.value)}
                              placeholder="https://hooks.slack.com/services/..."
                              className="input"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Settings */}
                {activeTab === 'security' && (
                  <div className="settings-panel">
                    <h2 className="settings-title">Security Settings</h2>

                    <div className="space-y-4 lg:space-y-6">
                      <div className="settings-row">
                        <div className="settings-row-content">
                          <h3 className="settings-row-title">Two-Factor Authentication</h3>
                          <p className="settings-row-desc">Require 2FA for all team members</p>
                        </div>
                        <button
                          onClick={() => handleChange('security', 'requireTwoFactor', !security.requireTwoFactor)}
                          className={`toggle ${security.requireTwoFactor ? 'toggle-active' : ''}`}
                        >
                          <span className="toggle-thumb" />
                        </button>
                      </div>

                      <div>
                        <label className="label">Session Timeout</label>
                        <select
                          value={security.sessionTimeout}
                          onChange={(e) => handleChange('security', 'sessionTimeout', e.target.value)}
                          className="select"
                        >
                          <option value="1">1 hour</option>
                          <option value="4">4 hours</option>
                          <option value="8">8 hours</option>
                          <option value="24">24 hours</option>
                          <option value="never">Never</option>
                        </select>
                      </div>

                      <div>
                        <label className="label">Password Policy</label>
                        <select
                          value={security.passwordPolicy}
                          onChange={(e) => handleChange('security', 'passwordPolicy', e.target.value)}
                          className="select"
                        >
                          <option value="low">Low - 6+ characters</option>
                          <option value="medium">Medium - 8+ chars, mixed case</option>
                          <option value="high">High - 10+ chars, mixed case, numbers, symbols</option>
                        </select>
                      </div>

                      <div>
                        <label className="form-group mb-3">
                          <input
                            type="checkbox"
                            checked={security.ipWhitelist}
                            onChange={(e) => handleChange('security', 'ipWhitelist', e.target.checked)}
                            className="checkbox"
                          />
                          <div className="form-group-content">
                            <span className="form-group-label">IP Whitelist</span>
                            <p className="form-group-desc">Restrict access to specific IP addresses</p>
                          </div>
                        </label>
                        {security.ipWhitelist && (
                          <textarea
                            rows={3}
                            value={security.ipAddresses}
                            onChange={(e) => handleChange('security', 'ipAddresses', e.target.value)}
                            placeholder="Enter IP addresses, one per line"
                            className="textarea"
                          />
                        )}
                      </div>

                      <div className="space-y-3">
                        <label className="form-group">
                          <input
                            type="checkbox"
                            checked={security.apiAccess}
                            onChange={(e) => handleChange('security', 'apiAccess', e.target.checked)}
                            className="checkbox"
                          />
                          <div className="form-group-content">
                            <span className="form-group-label">API Access</span>
                            <p className="form-group-desc">Allow API access for integrations</p>
                          </div>
                        </label>

                        <label className="form-group">
                          <input
                            type="checkbox"
                            checked={security.auditLog}
                            onChange={(e) => handleChange('security', 'auditLog', e.target.checked)}
                            className="checkbox"
                          />
                          <div className="form-group-content">
                            <span className="form-group-label">Audit Logging</span>
                            <p className="form-group-desc">Track all security-related events</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Billing Settings */}
                {activeTab === 'billing' && (
                  <div className="settings-panel">
                    <h2 className="settings-title">Billing & Subscription</h2>

                    <div className="space-y-4 lg:space-y-6">
                      <div className="p-4 bg-background-secondary rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-medium text-lg text-foreground">Current Plan: {billing.plan}</h3>
                            <p className="text-sm text-foreground-secondary">Next billing date: {billing.nextBilling}</p>
                          </div>
                          <button className="btn-primary px-4 py-2">
                            Upgrade Plan
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <label className="label">Billing Email</label>
                          <input
                            type="email"
                            value={billing.billingEmail}
                            onChange={(e) => handleChange('billing', 'billingEmail', e.target.value)}
                            className="input"
                          />
                        </div>
                        <div>
                          <label className="label">Billing Cycle</label>
                          <select
                            value={billing.billingCycle}
                            onChange={(e) => handleChange('billing', 'billingCycle', e.target.value)}
                            className="select"
                          >
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly (20% discount)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium text-foreground mb-3">Payment Method</h3>
                        <div className="settings-row">
                          <div className="flex items-center gap-3">
                            <CreditCard size={24} className="text-foreground-tertiary" />
                            <div>
                              <p className="font-medium text-foreground">•••• •••• •••• {billing.cardLast4}</p>
                              <p className="text-sm text-foreground-secondary">Expires 12/2025</p>
                            </div>
                          </div>
                          <button className="btn-secondary px-4 py-2">
                            Update Card
                          </button>
                        </div>
                      </div>

                      <div className="settings-row">
                        <div className="settings-row-content">
                          <h3 className="settings-row-title">Auto-Renew</h3>
                          <p className="settings-row-desc">Automatically renew subscription</p>
                        </div>
                        <button
                          onClick={() => handleChange('billing', 'autoRenew', !billing.autoRenew)}
                          className={`toggle ${billing.autoRenew ? 'toggle-active' : ''}`}
                        >
                          <span className="toggle-thumb" />
                        </button>
                      </div>

                      <div className="flex gap-3">
                        <button className="btn-secondary px-4 py-2">
                          <Download size={16} />
                          Download Invoice
                        </button>
                        <button className="btn-secondary px-4 py-2">
                          <FileText size={16} />
                          Billing History
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* API Settings */}
                {activeTab === 'api' && (
                  <div className="settings-panel">
                    <h2 className="settings-title">API & Webhooks</h2>

                    <div className="space-y-4 lg:space-y-6">
                      <div>
                        <h3 className="font-medium text-foreground mb-3">API Keys</h3>
                        <div className="space-y-3">
                          <div className="settings-row">
                            <div>
                              <p className="font-mono text-sm text-foreground">sk_live_••••••••••••••••••••••••••••••••</p>
                              <p className="text-sm text-foreground-secondary mt-1">Created on Jan 15, 2024</p>
                            </div>
                            <div className="flex gap-2">
                              <button className="p-2 text-foreground-tertiary hover:text-foreground transition-colors">
                                <RefreshCw size={16} />
                              </button>
                              <button className="p-2 text-error-500 hover:text-error-600 transition-colors">
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                        <button className="btn-primary mt-3 px-4 py-2">
                          Generate New API Key
                        </button>
                      </div>

                      <div>
                        <h3 className="font-medium text-foreground mb-3">Webhook Endpoints</h3>
                        <div className="space-y-3">
                          <div className="p-4 border border-border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium text-foreground">Conversation Started</p>
                              <span className="badge bg-success-100 dark:bg-success-700/30 text-success-700 dark:text-success-400">Active</span>
                            </div>
                            <p className="text-sm text-foreground-secondary font-mono">https://your-app.com/webhook/conversation</p>
                          </div>
                          <div className="p-4 border border-border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium text-foreground">Bot Offline Alert</p>
                              <span className="badge bg-success-100 dark:bg-success-700/30 text-success-700 dark:text-success-400">Active</span>
                            </div>
                            <p className="text-sm text-foreground-secondary font-mono">https://your-app.com/webhook/bot-status</p>
                          </div>
                        </div>
                        <button className="btn-secondary mt-3 px-4 py-2">
                          Add Webhook Endpoint
                        </button>
                      </div>

                      <div className="alert-info">
                        <AlertCircle size={20} className="alert-icon flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="alert-title">API Documentation</p>
                          <p className="alert-message mt-1">
                            View our complete API documentation and integration guides at{' '}
                            <a href="#" className="underline link">docs.chatbot-platform.com/api</a>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Other Settings */}
                {(activeTab === 'data' || activeTab === 'team') && (
                  <div className="settings-panel">
                    <h2 className="settings-title capitalize">{activeTab} Settings</h2>
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        {activeTab === 'data' && <Database size={32} className="text-foreground-tertiary" />}
                        {activeTab === 'team' && <Users size={32} className="text-foreground-tertiary" />}
                      </div>
                      <p className="text-foreground-secondary">
                        {activeTab === 'data' && 'Data export and privacy settings will be available soon'}
                        {activeTab === 'team' && 'Team role and permission settings will be available soon'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}