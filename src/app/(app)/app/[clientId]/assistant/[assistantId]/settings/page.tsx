'use client';
import { useEffect, useState } from 'react';
import { getClientById, getAssistantById } from '@/lib/dataService';
import type { Client, Assistant } from '@/types';
import { ArrowLeft, Save, Key, Clock, Shield, Bell, AlertTriangle, Database, Webhook, Download, CreditCard, Settings as SettingsIcon } from 'lucide-react';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import {
  Page,
  PageContent,
  PageHeader,
  Button,
  Card,
  Input,
  Select,
  Textarea,
  Toggle,
  EmptyState,
} from '@/components/ui';

export default function AssistantSettingsPage({ params }: { params: { clientId: string; assistantId: string } }) {
  const [client, setClient] = useState<Client | null>(null);
  const [assistant, setAssistant] = useState<Assistant | null>(null);
  const [activeTab, setActiveTab] = useState('api');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    async function loadData() {
      const [clientData, assistantData] = await Promise.all([
        getClientById(params.clientId),
        getAssistantById(params.assistantId),
      ]);
      setClient(clientData ?? null);
      setAssistant(assistantData ?? null);
    }
    loadData();
  }, [params.clientId, params.assistantId]);

  // Form states for administrative settings
  const [apiSettings, setApiSettings] = useState({
    apiKey: 'sk-live-xxx...xxx',
    webhookUrl: '',
    rateLimit: 1000,
  });

  const [businessHours, setBusinessHours] = useState({
    enabled: true,
    timezone: 'America/New_York',
    schedule: {
      monday: { enabled: true, start: '09:00', end: '17:00' },
      tuesday: { enabled: true, start: '09:00', end: '17:00' },
      wednesday: { enabled: true, start: '09:00', end: '17:00' },
      thursday: { enabled: true, start: '09:00', end: '17:00' },
      friday: { enabled: true, start: '09:00', end: '17:00' },
      saturday: { enabled: false, start: '09:00', end: '17:00' },
      sunday: { enabled: false, start: '09:00', end: '17:00' },
    }
  });

  const [securitySettings, setSecuritySettings] = useState({
    allowedDomains: '',
    ipWhitelist: '',
    encryption: true,
    dataRetention: 30
  });

  if (!client || !assistant) {
    return (
      <Page>
        <PageContent>
          <EmptyState
            icon={<SettingsIcon size={48} />}
            title="AI Assistant not found"
            message="The requested AI Assistant could not be found."
          />
        </PageContent>
      </Page>
    );
  }

  const tabs = [
    { id: 'api', label: 'API & Keys', icon: Key },
    { id: 'availability', label: 'Availability', icon: Clock },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook },
    { id: 'billing', label: 'Billing & Usage', icon: CreditCard },
    { id: 'data', label: 'Data & Export', icon: Database },
    { id: 'advanced', label: 'Advanced', icon: AlertTriangle },
  ];

  const handleSave = () => {
    // Mock save functionality
    setHasChanges(false);
    alert('Settings saved successfully!');
  };

  return (
    <Page>
      <PageContent>
            <PageHeader
              title={`${assistant.name} Settings`}
              description="Technical configuration and administration"
              backLink={
                <Link
                  href={`/app/${client.id}`}
                  className="inline-flex items-center gap-2 text-foreground-secondary hover:text-foreground"
                >
                  <ArrowLeft size={16} />
                  Back to AI Assistants
                </Link>
              }
              actions={hasChanges && (
                <Button onClick={handleSave} icon={<Save size={18} />}>
                  Save Changes
                </Button>
              )}
            />

            {/* AI Assistant Header */}
            <Card className="mb-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={assistant.image}
                    alt={assistant.name}
                    className="w-16 h-16 rounded-full bg-background-tertiary"
                  />
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h1 className="text-2xl font-bold text-foreground">{assistant.name}</h1>
                      <StatusBadge status={assistant.status} />
                    </div>
                    <p className="text-foreground-secondary mb-1">Technical configuration and administration</p>
                    <p className="text-sm text-foreground-tertiary">Client: {client.name}</p>
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex gap-6">
              {/* Sidebar Navigation */}
              <div className="w-64">
                <Card padding="sm">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-interactive text-foreground-inverse'
                          : 'hover:bg-background-hover text-foreground-secondary'
                      }`}
                    >
                      <Icon size={18} />
                      {tab.label}
                    </button>
                  );
                })}
                </Card>
              </div>

              {/* Settings Content */}
              <div className="flex-1">
                {activeTab === 'api' && (
                  <Card>
                  <h2 className="text-xl font-semibold text-foreground mb-6">API Configuration</h2>

                  <div className="space-y-6">
                    <div>
                      <div className="flex gap-2">
                        <Input
                          label="API Key"
                          value={apiSettings.apiKey}
                          readOnly
                          className="flex-1 font-mono text-sm"
                          helperText="Use this key to authenticate API requests"
                        />
                        <div className="flex items-end pb-6">
                          <Button variant="secondary">Regenerate</Button>
                        </div>
                      </div>
                    </div>

                    <Input
                      label="Widget ID"
                      value={`widget-${assistant.id}`}
                      readOnly
                      className="font-mono text-sm"
                      helperText="Unique identifier for embedding the chat widget"
                    />

                    <div>
                      <div className="flex items-end gap-4">
                        <Input
                          label="Rate Limiting"
                          type="number"
                          value={apiSettings.rateLimit.toString()}
                          onChange={(e) => {
                            setApiSettings({...apiSettings, rateLimit: parseInt(e.target.value)});
                            setHasChanges(true);
                          }}
                          className="w-32"
                        />
                        <span className="text-sm text-foreground-secondary pb-2">requests per hour</span>
                      </div>
                    </div>

                    <Textarea
                      label="Embed Code"
                      readOnly
                      rows={4}
                      value={`<script src="https://api.chatbot.com/widget.js"\n  data-bot-id="${assistant.id}"\n  data-client-id="${client.id}">\n</script>`}
                      className="font-mono text-sm"
                    />
                    <Button variant="secondary">Copy Code</Button>
                  </div>
                  </Card>
                )}

                {activeTab === 'security' && (
                  <Card>
                  <h2 className="text-xl font-semibold text-foreground mb-6">Security Settings</h2>

                  <div className="space-y-6">
                    <Textarea
                      label="Allowed Domains"
                      value={securitySettings.allowedDomains}
                      onChange={(e) => {
                        setSecuritySettings({...securitySettings, allowedDomains: e.target.value});
                        setHasChanges(true);
                      }}
                      rows={3}
                      className="font-mono text-sm"
                      placeholder="example.com&#10;app.example.com"
                      helperText="One domain per line. Widget will only load on these domains."
                    />

                    <Textarea
                      label="IP Whitelist"
                      value={securitySettings.ipWhitelist}
                      onChange={(e) => {
                        setSecuritySettings({...securitySettings, ipWhitelist: e.target.value});
                        setHasChanges(true);
                      }}
                      rows={3}
                      className="font-mono text-sm"
                      placeholder="192.168.1.1&#10;10.0.0.0/8"
                      helperText="Restrict API access to specific IP addresses or ranges"
                    />

                    <Toggle
                      label="End-to-end encryption"
                      description="Encrypt all messages between users and the AI Assistant"
                      checked={securitySettings.encryption}
                      onChange={(e) => {
                        setSecuritySettings({...securitySettings, encryption: e.target.checked});
                        setHasChanges(true);
                      }}
                    />

                    <div>
                      <div className="flex items-end gap-4">
                        <Input
                          label="Data Retention Period"
                          type="number"
                          value={securitySettings.dataRetention.toString()}
                          onChange={(e) => {
                            setSecuritySettings({...securitySettings, dataRetention: parseInt(e.target.value)});
                            setHasChanges(true);
                          }}
                          className="w-32"
                        />
                        <span className="text-sm text-foreground-secondary pb-2">days</span>
                      </div>
                      <p className="text-sm text-foreground-tertiary mt-1">
                        Automatically delete conversation data after this period
                      </p>
                    </div>
                  </div>
                  </Card>
                )}

                {activeTab === 'availability' && (
                  <Card>
                  <h2 className="text-xl font-semibold text-foreground mb-6">Availability Settings</h2>

                  <div className="space-y-6">
                    <div>
                      <Toggle
                        label="Enable business hours"
                        checked={businessHours.enabled}
                        onChange={(e) => {
                          setBusinessHours({...businessHours, enabled: e.target.checked});
                          setHasChanges(true);
                        }}
                        className="mb-4"
                      />

                      {businessHours.enabled && (
                        <>
                          <Select
                            label="Timezone"
                            value={businessHours.timezone}
                            onChange={(e) => {
                              setBusinessHours({...businessHours, timezone: e.target.value});
                              setHasChanges(true);
                            }}
                            options={[
                              { value: 'America/New_York', label: 'Eastern Time (ET)' },
                              { value: 'America/Chicago', label: 'Central Time (CT)' },
                              { value: 'America/Denver', label: 'Mountain Time (MT)' },
                              { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
                              { value: 'Europe/London', label: 'London (GMT)' },
                              { value: 'Europe/Amsterdam', label: 'Amsterdam (CET)' },
                            ]}
                            className="mb-4"
                          />

                          <div className="space-y-3">
                            {Object.entries(businessHours.schedule).map(([day, hours]) => (
                              <div key={day} className="flex items-center gap-4">
                                <label className="flex items-center gap-2 w-32">
                                  <input
                                    type="checkbox"
                                    checked={hours.enabled}
                                    onChange={() => setHasChanges(true)}
                                    className="w-4 h-4 rounded border-border"
                                  />
                                  <span className="text-sm text-foreground capitalize">{day}</span>
                                </label>
                                {hours.enabled && (
                                  <>
                                    <Input
                                      type="time"
                                      value={hours.start}
                                      onChange={() => setHasChanges(true)}
                                      className="w-auto"
                                    />
                                    <span className="text-foreground-tertiary">to</span>
                                    <Input
                                      type="time"
                                      value={hours.end}
                                      onChange={() => setHasChanges(true)}
                                      className="w-auto"
                                    />
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    <Textarea
                      label="After-hours message"
                      rows={3}
                      placeholder="Message shown outside business hours"
                      defaultValue="Thanks for reaching out! We're currently closed but will respond as soon as we're back online."
                      onChange={() => setHasChanges(true)}
                    />

                    <Toggle
                      label="Allow users to leave messages when offline"
                      defaultChecked
                      onChange={() => setHasChanges(true)}
                    />
                  </div>
                  </Card>
                )}

                {activeTab === 'webhooks' && (
                  <Card>
                  <h2 className="text-xl font-semibold text-foreground mb-6">Webhook Configuration</h2>

                  <div className="space-y-6">
                    <Input
                      label="Webhook URL"
                      type="url"
                      value={apiSettings.webhookUrl}
                      onChange={(e) => {
                        setApiSettings({...apiSettings, webhookUrl: e.target.value});
                        setHasChanges(true);
                      }}
                      placeholder="https://your-server.com/webhook"
                      helperText="Receive real-time updates when events occur"
                    />

                    <div>
                      <label className="block text-sm font-medium text-foreground-secondary mb-2">
                        Events to Subscribe
                      </label>
                      <div className="space-y-2">
                        {['New conversation', 'Message received', 'Conversation ended', 'Human handoff requested', 'Error occurred'].map(event => (
                          <Toggle
                            key={event}
                            label={event}
                            defaultChecked
                            onChange={() => setHasChanges(true)}
                          />
                        ))}
                      </div>
                    </div>

                    <Input
                      label="Secret Key"
                      value="whsec_xxx...xxx"
                      readOnly
                      className="font-mono text-sm"
                      helperText="Use this to verify webhook signatures"
                    />
                  </div>
                  </Card>
                )}

                {activeTab === 'billing' && (
                  <Card>
                  <h2 className="text-xl font-semibold text-foreground mb-6">Billing & Usage</h2>

                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border border-border rounded-lg p-4 bg-background-secondary">
                        <p className="text-sm text-foreground-secondary mb-1">Current Plan</p>
                        <p className="text-xl font-semibold text-foreground">Pro Plan</p>
                        <p className="text-sm text-foreground-tertiary">$299/month</p>
                      </div>
                      <div className="border border-border rounded-lg p-4 bg-background-secondary">
                        <p className="text-sm text-foreground-secondary mb-1">Usage This Month</p>
                        <p className="text-xl font-semibold text-foreground">823 / 1,000</p>
                        <p className="text-sm text-foreground-tertiary">Bundle loads</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground-secondary mb-2">
                        Usage Alerts
                      </label>
                      <div className="space-y-2">
                        <Toggle label="Alert when usage reaches 80%" defaultChecked />
                        <Toggle label="Alert when usage reaches 100%" defaultChecked />
                      </div>
                    </div>

                    <div>
                      <Link href={`/app/${client.id}/billing`}>
                        <Button variant="secondary" icon={<CreditCard size={16} />}>
                          Manage Billing
                        </Button>
                      </Link>
                    </div>
                  </div>
                  </Card>
                )}

                {activeTab === 'data' && (
                  <Card>
                  <h2 className="text-xl font-semibold text-foreground mb-6">Data & Export</h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground-secondary mb-4">
                        Export Data
                      </label>
                      <div className="space-y-3">
                        <Button variant="secondary" fullWidth className="justify-between" iconRight={<Download size={16} />}>
                          Export conversations (CSV)
                        </Button>
                        <Button variant="secondary" fullWidth className="justify-between" iconRight={<Download size={16} />}>
                          Export training data (JSON)
                        </Button>
                        <Button variant="secondary" fullWidth className="justify-between" iconRight={<Download size={16} />}>
                          Export analytics report (PDF)
                        </Button>
                      </div>
                    </div>

                    <Select
                      label="Backup Schedule"
                      options={[
                        { value: 'daily', label: 'Daily' },
                        { value: 'weekly', label: 'Weekly' },
                        { value: 'monthly', label: 'Monthly' },
                        { value: 'disabled', label: 'Disabled' },
                      ]}
                    />

                    <div className="border-t border-border pt-6">
                      <h3 className="text-sm font-medium text-error-600 dark:text-error-500 mb-4">Danger Zone</h3>
                      <Button variant="danger">
                        Delete All Data
                      </Button>
                    </div>
                  </div>
                  </Card>
                )}

                {activeTab === 'advanced' && (
                  <Card>
                  <h2 className="text-xl font-semibold text-foreground mb-6">Advanced Settings</h2>

                  <div className="space-y-6">
                    <Toggle
                      label="Debug Mode"
                      description="Enable detailed logging for troubleshooting"
                    />

                    <Toggle
                      label="Beta Features"
                      description="Try experimental features before they're released"
                    />

                    <Textarea
                      label="Custom CSS"
                      rows={5}
                      className="font-mono text-sm"
                      placeholder="/* Add custom styles for the chat widget */"
                    />
                  </div>
                  </Card>
                )}
              </div>
          </div>
      </PageContent>
    </Page>
  );
}
