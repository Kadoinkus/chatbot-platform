'use client';
import { getClientById, getBotById } from '@/lib/dataService';
import { useState, useEffect, useMemo } from 'react';
import StatusBadge from '@/components/StatusBadge';
import { ArrowLeft, Brain, Sliders, BookOpen, MessageSquare, Zap, Shield, Sparkles, GitBranch, Plus, Play, Users, ShoppingCart, GraduationCap, Briefcase, User, ChevronRight, Settings, Copy, Trash2, Edit2, Link2, ExternalLink, CheckCircle, AlertCircle, Bot as BotIcon } from 'lucide-react';
import Link from 'next/link';
import { getClientBrandColor } from '@/lib/brandColors';
import type { Client, Bot } from '@/lib/dataService';
import { Page, PageContent, PageHeader, Card, Button, Input, Select, Textarea, Modal, Spinner, EmptyState } from '@/components/ui';

export default function BrainStudioPage({ params }: { params: { clientId: string; botId: string } }) {
  const [client, setClient] = useState<Client | undefined>();
  const [bot, setBot] = useState<Bot | undefined>();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personality');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [flowNodes, setFlowNodes] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [integrationMode, setIntegrationMode] = useState<'builtin' | 'external'>('builtin');
  const [botName, setBotName] = useState('Assistant');
  const [botAgeGroup, setBotAgeGroup] = useState('professional');
  const [botBackstory, setBotBackstory] = useState('I am a helpful AI assistant created to provide support and answer questions.');
  const [selectedPersonality, setSelectedPersonality] = useState('professional');
  const [customPersonalityDesc, setCustomPersonalityDesc] = useState('');
  const [responseFreedom, setResponseFreedom] = useState(25); // Default to professional level
  const [customPersonalityTypes, setCustomPersonalityTypes] = useState<{[key: string]: {name: string, description: string, values: any, responseFreedom?: number}}>({});
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savePresetName, setSavePresetName] = useState('');
  const [savePresetDescription, setSavePresetDescription] = useState('');
  const [hasCustomChanges, setHasCustomChanges] = useState(false);
  
  const ageGroups = {
    young: { label: 'Young Adult (18-25)', description: 'Energetic, uses modern language, familiar with latest trends' },
    professional: { label: 'Professional (26-40)', description: 'Mature, business-focused, balanced approach' },
    experienced: { label: 'Experienced (41-55)', description: 'Wise, authoritative, draws from experience' },
    senior: { label: 'Senior Expert (55+)', description: 'Highly knowledgeable, patient, mentor-like' }
  };

  const personalityTypes = {
    professional: {
      name: 'Professional',
      description: 'Formal, helpful, and business-focused',
      values: { communicationStyle: 20, responseApproach: 30, interactionTone: 25, supportStyle: 40 },
      responseFreedom: 25
    },
    friendly: {
      name: 'Friendly',
      description: 'Warm, approachable, and conversational',
      values: { communicationStyle: 70, responseApproach: 60, interactionTone: 65, supportStyle: 75 },
      responseFreedom: 55
    },
    creative: {
      name: 'Creative',
      description: 'Innovative, engaging, and inspiring',
      values: { communicationStyle: 75, responseApproach: 80, interactionTone: 85, supportStyle: 60 },
      responseFreedom: 85
    },
    supportive: {
      name: 'Supportive',
      description: 'Patient, understanding, and helpful',
      values: { communicationStyle: 60, responseApproach: 75, interactionTone: 45, supportStyle: 85 },
      responseFreedom: 45
    },
    expert: {
      name: 'Expert',
      description: 'Knowledgeable, authoritative, and detailed',
      values: { communicationStyle: 25, responseApproach: 20, interactionTone: 30, supportStyle: 35 },
      responseFreedom: 20
    },
    casual: {
      name: 'Casual',
      description: 'Relaxed, informal, and easy-going',
      values: { communicationStyle: 80, responseApproach: 65, interactionTone: 75, supportStyle: 70 },
      responseFreedom: 70
    }
  };

  const [personality, setPersonality] = useState(personalityTypes.professional.values);

  const personalitySpectrums = {
    communicationStyle: {
      name: 'Communication Style',
      left: { label: 'Professional', description: 'Formal language, business terminology' },
      right: { label: 'Casual', description: 'Relaxed tone, conversational' }
    },
    responseApproach: {
      name: 'Response Approach',
      left: { label: 'Concise', description: 'Brief, to-the-point answers' },
      right: { label: 'Detailed', description: 'Comprehensive explanations' }
    },
    interactionTone: {
      name: 'Interaction Tone',
      left: { label: 'Serious', description: 'Focus on facts, straightforward' },
      right: { label: 'Playful', description: 'Uses humor, engaging personality' }
    },
    supportStyle: {
      name: 'Support Style',
      left: { label: 'Direct', description: 'Task-focused, efficient solutions' },
      right: { label: 'Empathetic', description: 'Understanding, supportive' }
    }
  };
  

  const [knowledge, setKnowledge] = useState([
    { id: 1, title: 'Product Documentation', items: 245, status: 'active', lastUpdated: '2 hours ago' },
    { id: 2, title: 'FAQ Database', items: 89, status: 'active', lastUpdated: '1 day ago' },
    { id: 3, title: 'Company Policies', items: 34, status: 'active', lastUpdated: '3 days ago' },
    { id: 4, title: 'Technical Support', items: 156, status: 'draft', lastUpdated: '1 week ago' }
  ]);

  const brandColor = useMemo(() => {
    return bot ? getClientBrandColor(bot.clientId) : '#6B7280';
  }, [bot]);

  useEffect(() => {
    async function loadData() {
      try {
        const [clientData, botData] = await Promise.all([
          getClientById(params.clientId),
          getBotById(params.botId)
        ]);
        setClient(clientData);
        setBot(botData);
        setBotName(botData?.name || 'Assistant'); // Initialize with actual bot name or fallback
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params.clientId, params.botId]);

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

  const handleSliderChange = (trait: string, value: number) => {
    setPersonality(prev => ({ ...prev, [trait]: value }));
    
    // Check if current values differ from the selected personality type
    const currentType = personalityTypes[selectedPersonality as keyof typeof personalityTypes] || customPersonalityTypes[selectedPersonality];
    if (currentType) {
      const newValues = { ...personality, [trait]: value };
      const hasPersonalityChanges = Object.keys(newValues).some(key => newValues[key as keyof typeof newValues] !== currentType.values[key as keyof typeof currentType.values]);
      const hasResponseFreedomChanges = responseFreedom !== currentType.responseFreedom;
      setHasCustomChanges(hasPersonalityChanges || hasResponseFreedomChanges);
    }
  };

  const handleResponseFreedomChange = (value: number) => {
    setResponseFreedom(value);
    
    // Check if response freedom differs from the selected personality type
    const currentType = personalityTypes[selectedPersonality as keyof typeof personalityTypes] || customPersonalityTypes[selectedPersonality];
    if (currentType) {
      const hasPersonalityChanges = Object.keys(personality).some(key => personality[key as keyof typeof personality] !== currentType.values[key as keyof typeof currentType.values]);
      const hasResponseFreedomChanges = value !== currentType.responseFreedom;
      setHasCustomChanges(hasPersonalityChanges || hasResponseFreedomChanges);
    }
  };

  const handlePersonalityTypeChange = (typeKey: string) => {
    setSelectedPersonality(typeKey);
    setHasCustomChanges(false);
    if (personalityTypes[typeKey as keyof typeof personalityTypes]) {
      setPersonality(personalityTypes[typeKey as keyof typeof personalityTypes].values);
      setResponseFreedom(personalityTypes[typeKey as keyof typeof personalityTypes].responseFreedom);
    } else if (customPersonalityTypes[typeKey]) {
      setPersonality(customPersonalityTypes[typeKey].values);
      // For custom personalities, use saved response freedom or default to balanced
      setResponseFreedom(customPersonalityTypes[typeKey].responseFreedom || 50);
    }
  };

  const handleSaveCustomPersonality = () => {
    if (!savePresetName.trim()) return;
    
    const presetKey = `custom_${savePresetName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const newCustomType = {
      name: savePresetName,
      description: savePresetDescription || `Custom personality: ${savePresetName}`,
      values: { ...personality },
      responseFreedom: responseFreedom
    };
    
    setCustomPersonalityTypes(prev => ({ ...prev, [presetKey]: newCustomType }));
    setSelectedPersonality(presetKey);
    setHasCustomChanges(false);
    setShowSaveModal(false);
    setSavePresetName('');
    setSavePresetDescription('');
  };

  const handleDeleteCustomPersonality = (typeKey: string) => {
    setCustomPersonalityTypes(prev => {
      const newTypes = { ...prev };
      delete newTypes[typeKey];
      return newTypes;
    });
    if (selectedPersonality === typeKey) {
      setSelectedPersonality('professional');
      setPersonality(personalityTypes.professional.values);
      setHasCustomChanges(false);
    }
  };

  const handleBotNameChange = (newName: string) => {
    setBotName(newName);
    // Also update the bot object in state so the header shows the new name immediately
    if (bot) {
      setBot({ ...bot, name: newName });
    }
  };


  const handleTemplateSelect = (templateType: string) => {
    setSelectedTemplate(templateType);
    
    switch (templateType) {
      case 'university':
        setFlowNodes([
          { id: '1', type: 'start', label: 'Welcome', x: 50, y: 100 },
          { id: '2', type: 'menu', label: 'Main Menu', x: 200, y: 100 },
          { id: '3', type: 'action', label: 'Admissions', x: 350, y: 50 },
          { id: '4', type: 'action', label: 'Courses', x: 350, y: 150 },
          { id: '5', type: 'action', label: 'Campus Info', x: 350, y: 250 },
          { id: '6', type: 'end', label: 'Contact Advisor', x: 500, y: 150 }
        ]);
        setConnections([
          { from: '1', to: '2' },
          { from: '2', to: '3' },
          { from: '2', to: '4' },
          { from: '2', to: '5' },
          { from: '3', to: '6' },
          { from: '4', to: '6' },
          { from: '5', to: '6' }
        ]);
        break;
      case 'support':
        setFlowNodes([
          { id: '1', type: 'start', label: 'Greeting', x: 50, y: 100 },
          { id: '2', type: 'menu', label: 'Issue Type', x: 200, y: 100 },
          { id: '3', type: 'action', label: 'Technical', x: 350, y: 50 },
          { id: '4', type: 'action', label: 'Billing', x: 350, y: 150 },
          { id: '5', type: 'action', label: 'General', x: 350, y: 250 },
          { id: '6', type: 'end', label: 'Create Ticket', x: 500, y: 150 }
        ]);
        setConnections([
          { from: '1', to: '2' },
          { from: '2', to: '3' },
          { from: '2', to: '4' },
          { from: '2', to: '5' },
          { from: '3', to: '6' },
          { from: '4', to: '6' },
          { from: '5', to: '6' }
        ]);
        break;
      case 'webshop':
        setFlowNodes([
          { id: '1', type: 'start', label: 'Welcome', x: 50, y: 100 },
          { id: '2', type: 'menu', label: 'Shop Menu', x: 200, y: 100 },
          { id: '3', type: 'action', label: 'Browse Products', x: 350, y: 50 },
          { id: '4', type: 'action', label: 'Order Status', x: 350, y: 150 },
          { id: '5', type: 'action', label: 'Cart', x: 350, y: 250 },
          { id: '6', type: 'end', label: 'Checkout', x: 500, y: 150 }
        ]);
        setConnections([
          { from: '1', to: '2' },
          { from: '2', to: '3' },
          { from: '2', to: '4' },
          { from: '2', to: '5' },
          { from: '3', to: '6' },
          { from: '5', to: '6' }
        ]);
        break;
      case 'employee':
        setFlowNodes([
          { id: '1', type: 'start', label: 'HR Portal', x: 50, y: 100 },
          { id: '2', type: 'menu', label: 'Employee Menu', x: 200, y: 100 },
          { id: '3', type: 'action', label: 'Leave Request', x: 350, y: 50 },
          { id: '4', type: 'action', label: 'Policies', x: 350, y: 150 },
          { id: '5', type: 'action', label: 'Benefits', x: 350, y: 250 },
          { id: '6', type: 'end', label: 'Submit Request', x: 500, y: 150 }
        ]);
        setConnections([
          { from: '1', to: '2' },
          { from: '2', to: '3' },
          { from: '2', to: '4' },
          { from: '2', to: '5' },
          { from: '3', to: '6' }
        ]);
        break;
      case 'personal':
        setFlowNodes([
          { id: '1', type: 'start', label: 'Hi there!', x: 50, y: 100 },
          { id: '2', type: 'menu', label: 'How can I help?', x: 200, y: 100 },
          { id: '3', type: 'action', label: 'Schedule', x: 350, y: 50 },
          { id: '4', type: 'action', label: 'Reminders', x: 350, y: 150 },
          { id: '5', type: 'action', label: 'Tasks', x: 350, y: 250 },
          { id: '6', type: 'end', label: 'Done', x: 500, y: 150 }
        ]);
        setConnections([
          { from: '1', to: '2' },
          { from: '2', to: '3' },
          { from: '2', to: '4' },
          { from: '2', to: '5' },
          { from: '3', to: '6' },
          { from: '4', to: '6' },
          { from: '5', to: '6' }
        ]);
        break;
    }
  };

  const handleBackToTemplates = () => {
    setSelectedTemplate(null);
    setFlowNodes([]);
    setConnections([]);
    setSelectedNode(null);
  };

  return (
    <Page>
      <PageContent>
          <PageHeader
            title="Brain Studio"
            description="Configure personality and knowledge base"
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

          {/* Bot Header */}
          <Card className="mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={bot.image}
                  alt={bot.name}
                  className="w-16 h-16 rounded-full"
                  style={{ backgroundColor: brandColor }}
                />
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl font-bold text-foreground">{bot.name}</h1>
                    <StatusBadge status={bot.status} />
                  </div>
                  <p className="text-foreground-secondary mb-1">
                    {integrationMode === 'builtin'
                      ? 'Configure personality and knowledge base'
                      : 'Connect to your existing chatbot provider'
                    }
                  </p>
                  <p className="text-sm text-foreground-tertiary">Client: {client.name}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="secondary">
                  Test Responses
                </Button>
                <Button>
                  Save Changes
                </Button>
              </div>
            </div>
          </Card>

          {/* Mode Selector */}
          <Card className="mb-6">
            <h3 className="font-semibold text-foreground mb-4">Choose Configuration Mode</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                integrationMode === 'builtin' ? 'border-interactive bg-background-secondary' : 'border-border hover:border-border-secondary'
              }`}>
                <input
                  type="radio"
                  name="mode"
                  value="builtin"
                  checked={integrationMode === 'builtin'}
                  onChange={() => {
                    setIntegrationMode('builtin');
                    setActiveTab('personality');
                  }}
                  className="sr-only"
                />
                <div className="flex items-center gap-3 mb-2">
                  <Brain size={20} className="text-foreground" />
                  <p className="font-medium text-foreground">Built-in AI</p>
                </div>
                <p className="text-sm text-foreground-secondary">Configure personality, knowledge base, and chatflows using our platform</p>
              </label>

              <label className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                integrationMode === 'external' ? 'border-interactive bg-background-secondary' : 'border-border hover:border-border-secondary'
              }`}>
                <input
                  type="radio"
                  name="mode"
                  value="external"
                  checked={integrationMode === 'external'}
                  onChange={() => {
                    setIntegrationMode('external');
                    setActiveTab('connect-api');
                  }}
                  className="sr-only"
                />
                <div className="flex items-center gap-3 mb-2">
                  <Link2 size={20} className="text-foreground" />
                  <p className="font-medium text-foreground">External Provider</p>
                </div>
                <p className="text-sm text-foreground-secondary">Connect your existing chatbot and use our 3D mascot frontend only</p>
              </label>
            </div>

            {integrationMode === 'external' && (
              <div className="alert-info mt-4">
                <p className="text-sm">
                  <strong>External mode:</strong> Your chatbot provider handles all AI logic.
                  We only provide the 3D mascot interface and animations.
                </p>
              </div>
            )}
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="p-0">
                <div className="border-b border-border">
                  <div className="flex gap-6 p-6 overflow-x-auto">
                    <button
                      onClick={() => integrationMode === 'builtin' && setActiveTab('personality')}
                      disabled={integrationMode === 'external'}
                      className={`pb-2 px-1 font-medium transition-colors relative flex items-center gap-2 ${
                        integrationMode === 'external'
                          ? 'text-foreground-disabled cursor-not-allowed'
                          : activeTab === 'personality'
                            ? 'text-foreground border-b-2 border-foreground'
                            : 'text-foreground-secondary hover:text-foreground'
                      }`}
                    >
                      Personality
                      {integrationMode === 'external' && <Shield size={14} className="text-foreground-disabled" />}
                    </button>
                    <button
                      onClick={() => integrationMode === 'builtin' && setActiveTab('knowledge')}
                      disabled={integrationMode === 'external'}
                      className={`pb-2 px-1 font-medium transition-colors relative flex items-center gap-2 ${
                        integrationMode === 'external'
                          ? 'text-foreground-disabled cursor-not-allowed'
                          : activeTab === 'knowledge'
                            ? 'text-foreground border-b-2 border-foreground'
                            : 'text-foreground-secondary hover:text-foreground'
                      }`}
                    >
                      Knowledge Base
                      {integrationMode === 'external' && <Shield size={14} className="text-foreground-disabled" />}
                    </button>
                    <button
                      onClick={() => integrationMode === 'builtin' && setActiveTab('responses')}
                      disabled={integrationMode === 'external'}
                      className={`pb-2 px-1 font-medium transition-colors relative flex items-center gap-2 ${
                        integrationMode === 'external'
                          ? 'text-foreground-disabled cursor-not-allowed'
                          : activeTab === 'responses'
                            ? 'text-foreground border-b-2 border-foreground'
                            : 'text-foreground-secondary hover:text-foreground'
                      }`}
                    >
                      Response Templates
                      {integrationMode === 'external' && <Shield size={14} className="text-foreground-disabled" />}
                    </button>
                    <button
                      onClick={() => integrationMode === 'builtin' && setActiveTab('chatflows')}
                      disabled={integrationMode === 'external'}
                      className={`pb-2 px-1 font-medium transition-colors relative flex items-center gap-2 ${
                        integrationMode === 'external'
                          ? 'text-foreground-disabled cursor-not-allowed'
                          : activeTab === 'chatflows'
                            ? 'text-foreground border-b-2 border-foreground'
                            : 'text-foreground-secondary hover:text-foreground'
                      }`}
                    >
                      Chatflows
                      {integrationMode === 'external' && <Shield size={14} className="text-foreground-disabled" />}
                    </button>
                    <button
                      onClick={() => integrationMode === 'external' && setActiveTab('connect-api')}
                      disabled={integrationMode === 'builtin'}
                      className={`pb-2 px-1 font-medium transition-colors relative flex items-center gap-2 ${
                        integrationMode === 'builtin'
                          ? 'text-foreground-disabled cursor-not-allowed'
                          : activeTab === 'connect-api'
                            ? 'text-foreground border-b-2 border-foreground'
                            : 'text-foreground-secondary hover:text-foreground'
                      }`}
                    >
                      Connect API
                      {integrationMode === 'external' && <CheckCircle size={14} className="text-success-500" />}
                      {integrationMode === 'builtin' && <Shield size={14} className="text-foreground-disabled" />}
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  {activeTab === 'personality' && integrationMode === 'external' && (
                    <div className="text-center py-12">
                      <Shield size={48} className="mx-auto text-foreground-disabled mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">Personality Managed Externally</h3>
                      <p className="text-foreground-secondary mb-4">Your external chatbot provider handles personality configuration.</p>
                      <p className="text-sm text-foreground-tertiary">Switch to "Built-in AI" mode to configure personality traits here.</p>
                    </div>
                  )}
                  {activeTab === 'personality' && integrationMode === 'builtin' && (
                    <div className="space-y-6">
                      {/* Bot Identity */}
                      <div>
                        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                          <User size={18} />
                          Bot Identity
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Bot Name */}
                          <Input
                            label="Bot Name"
                            value={botName}
                            onChange={(e) => handleBotNameChange(e.target.value)}
                            placeholder="e.g., Alex, Sarah, Support Bot"
                          />

                          {/* Age Group */}
                          <div>
                            <Select
                              label="Age Group"
                              value={botAgeGroup}
                              onChange={(e) => setBotAgeGroup(e.target.value)}
                              options={Object.entries(ageGroups).map(([key, group]) => ({
                                value: key,
                                label: group.label
                              }))}
                            />
                            <p className="text-xs text-foreground-tertiary mt-1">{ageGroups[botAgeGroup as keyof typeof ageGroups]?.description}</p>
                          </div>
                        </div>

                        {/* Backstory */}
                        <div className="mt-4">
                          <Textarea
                            label="Backstory & Role"
                            value={botBackstory}
                            onChange={(e) => setBotBackstory(e.target.value)}
                            placeholder="e.g., I am a customer service representative with 3 years of experience helping customers with technical issues. I work for TechCorp and specialize in software troubleshooting..."
                            rows={3}
                          />
                        </div>
                      </div>

                      {/* Personality Type */}
                      <div>
                        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                          <Sparkles size={18} />
                          Personality Type
                        </h3>
                        <Select
                          value={selectedPersonality}
                          onChange={(e) => handlePersonalityTypeChange(e.target.value)}
                          className="mb-2"
                          options={[
                            ...Object.entries(personalityTypes).map(([key, type]) => ({
                              value: key,
                              label: type.name
                            })),
                            ...Object.entries(customPersonalityTypes).map(([key, type]) => ({
                              value: key,
                              label: `⭐ ${type.name}`
                            }))
                          ]}
                        />
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-foreground-secondary">
                            {personalityTypes[selectedPersonality as keyof typeof personalityTypes]?.description ||
                             customPersonalityTypes[selectedPersonality]?.description}
                          </p>
                          {selectedPersonality.startsWith('custom_') && (
                            <button
                              onClick={() => handleDeleteCustomPersonality(selectedPersonality)}
                              className="ml-2 p-1 text-error-600 hover:text-error-700 hover:bg-error-50 dark:hover:bg-error-700/20 rounded"
                              title="Delete custom personality"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Fine-tune Personality */}
                      <div>
                        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                          <Sliders size={18} />
                          Fine-tune Personality
                        </h3>
                        <p className="text-sm text-foreground-secondary mb-4">Adjust the personality balance to perfectly match your needs.</p>

                        <div className="bg-background-secondary p-4 rounded-lg border border-border">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            {Object.entries(personalitySpectrums).map(([spectrumKey, spectrum]) => (
                              <div key={spectrumKey} className="space-y-2">
                                {/* Compact title with percentage */}
                                <div className="flex items-center justify-between">
                                  <label className="text-sm font-semibold text-foreground">{spectrum.name}</label>
                                  <span className="text-xs font-medium text-foreground-secondary bg-surface-elevated px-2 py-0.5 rounded">
                                    {Math.round(personality[spectrumKey as keyof typeof personality] || 50)}%
                                  </span>
                                </div>

                                {/* Slider with inline labels */}
                                <div className="relative">
                                  <div className="flex justify-between text-xs text-foreground-secondary mb-1">
                                    <span>{spectrum.left.label}</span>
                                    <span>{spectrum.right.label}</span>
                                  </div>
                                  <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={personality[spectrumKey as keyof typeof personality] || 50}
                                    onChange={(e) => handleSliderChange(spectrumKey, Number(e.target.value))}
                                    className="w-full h-2 bg-background-tertiary rounded-lg appearance-none cursor-pointer"
                                    style={{
                                      background: `linear-gradient(to right, var(--text-primary) 0%, var(--text-primary) ${personality[spectrumKey as keyof typeof personality] || 50}%, var(--bg-tertiary) ${personality[spectrumKey as keyof typeof personality] || 50}%, var(--bg-tertiary) 100%)`
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Save Custom Personality */}
                        {hasCustomChanges && (
                          <div className="mt-4 p-3 bg-info-50 dark:bg-info-700/30 border border-info-200 dark:border-info-700 rounded-lg">
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-info-800 dark:text-info-300">
                                💡 <strong>Custom changes detected:</strong> Save this as a new personality template?
                              </p>
                              <button
                                onClick={() => setShowSaveModal(true)}
                                className="px-3 py-1 bg-info-600 text-white text-sm rounded-lg hover:bg-info-700 transition-colors"
                              >
                                Save as Template
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Response Freedom */}
                      <div>
                        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                          <Shield size={18} />
                          Response Freedom
                        </h3>
                        <p className="text-sm text-foreground-secondary mb-4">
                          Control how creative vs conservative your bot should be with its responses.
                        </p>

                        <div className="p-4 bg-background-secondary rounded-lg border border-border">
                          <div className="mb-3">
                            <span className="text-sm font-medium text-foreground">Response Style</span>
                          </div>

                          <div className="mb-4">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={responseFreedom || 50}
                              onChange={(e) => handleResponseFreedomChange(Number(e.target.value))}
                              className="w-full h-2 bg-background-tertiary rounded-lg appearance-none cursor-pointer"
                              style={{
                                background: `linear-gradient(to right, var(--text-primary) 0%, var(--text-primary) ${responseFreedom || 50}%, var(--bg-tertiary) ${responseFreedom || 50}%, var(--bg-tertiary) 100%)`
                              }}
                            />
                          </div>

                          <div className="flex justify-between text-xs text-foreground-tertiary">
                            <div className="text-center">
                              <div className="font-medium text-foreground-secondary">Conservative</div>
                              <div className="text-foreground-tertiary mt-1">Sticks to knowledge base</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium text-foreground-secondary">Balanced</div>
                              <div className="text-foreground-tertiary mt-1">Some flexibility</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium text-foreground-secondary">Creative</div>
                              <div className="text-foreground-tertiary mt-1">More spontaneous</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Save Custom Personality Modal */}
                  <Modal
                    isOpen={showSaveModal}
                    onClose={() => {
                      setShowSaveModal(false);
                      setSavePresetName('');
                      setSavePresetDescription('');
                    }}
                    title="Save Custom Personality"
                    footer={
                      <div className="flex justify-end gap-3">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setShowSaveModal(false);
                            setSavePresetName('');
                            setSavePresetDescription('');
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveCustomPersonality}
                          disabled={!savePresetName.trim()}
                        >
                          Save Template
                        </Button>
                      </div>
                    }
                  >
                    <div className="space-y-4">
                      <Input
                        label="Template Name"
                        value={savePresetName}
                        onChange={(e) => setSavePresetName(e.target.value)}
                        placeholder="e.g., Friendly Sales Expert"
                      />
                      <Textarea
                        label="Description (optional)"
                        value={savePresetDescription}
                        onChange={(e) => setSavePresetDescription(e.target.value)}
                        placeholder="Describe when to use this personality..."
                        rows={3}
                      />
                    </div>
                  </Modal>

                  
                  {activeTab === 'knowledge' && integrationMode === 'external' && (
                    <div className="text-center py-12">
                      <Shield size={48} className="mx-auto text-foreground-disabled mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">Knowledge Base Managed Externally</h3>
                      <p className="text-foreground-secondary mb-4">Your external chatbot provider handles knowledge base configuration.</p>
                      <p className="text-sm text-foreground-tertiary">Switch to "Built-in AI" mode to manage knowledge sources here.</p>
                    </div>
                  )}
                  {activeTab === 'knowledge' && integrationMode === 'builtin' && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                          <BookOpen size={18} />
                          Knowledge Sources
                        </h3>
                        <Button size="sm">
                          Add Source
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {knowledge.map((source) => (
                          <div key={source.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-background-hover transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-background-tertiary rounded-lg flex items-center justify-center">
                                <BookOpen size={18} className="text-foreground-secondary" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{source.title}</p>
                                <p className="text-sm text-foreground-secondary">{source.items} items • Updated {source.lastUpdated}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                source.status === 'active'
                                  ? 'bg-success-100 dark:bg-success-700/30 text-success-700 dark:text-success-500'
                                  : 'bg-background-tertiary text-foreground-secondary'
                              }`}>
                                {source.status}
                              </span>
                              <button className="p-2 hover:bg-background-hover rounded">
                                <Sliders size={16} className="text-foreground-secondary" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                        <BookOpen size={32} className="mx-auto mb-2 text-foreground-tertiary" />
                        <p className="text-sm text-foreground-secondary mb-2">Drop files here or click to browse</p>
                        <p className="text-xs text-foreground-tertiary mb-4">Support for PDF, DOCX, TXT, CSV</p>
                        <Button variant="secondary" size="sm">
                          Upload Documents
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'chatflows' && integrationMode === 'external' && (
                    <div className="text-center py-12">
                      <Shield size={48} className="mx-auto text-foreground-disabled mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">Chatflows Managed Externally</h3>
                      <p className="text-foreground-secondary mb-4">Your external chatbot provider handles conversation flow configuration.</p>
                      <p className="text-sm text-foreground-tertiary">Switch to "Built-in AI" mode to design chatflows here.</p>
                    </div>
                  )}
                  {activeTab === 'chatflows' && integrationMode === 'builtin' && (
                    <div className="space-y-6">
                      {!selectedTemplate ? (
                        <div>
                          <div className="mb-6">
                            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                              <GitBranch size={18} />
                              Select a Flow Template
                            </h3>
                            <p className="text-sm text-foreground-secondary">Choose a pre-built chatflow template to get started quickly</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                              onClick={() => handleTemplateSelect('university')}
                              className="p-6 border-2 border-border rounded-xl hover:border-foreground hover:bg-background-hover transition-all text-left group"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <GraduationCap size={24} className="text-foreground-secondary" />
                                <ChevronRight size={16} className="text-foreground-tertiary group-hover:text-foreground transition-colors" />
                              </div>
                              <h4 className="font-semibold text-foreground mb-1">University</h4>
                              <p className="text-sm text-foreground-secondary">Student inquiries, admissions, course info</p>
                            </button>

                            <button
                              onClick={() => handleTemplateSelect('support')}
                              className="p-6 border-2 border-border rounded-xl hover:border-foreground hover:bg-background-hover transition-all text-left group"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <Users size={24} className="text-foreground-secondary" />
                                <ChevronRight size={16} className="text-foreground-tertiary group-hover:text-foreground transition-colors" />
                              </div>
                              <h4 className="font-semibold text-foreground mb-1">Customer Support</h4>
                              <p className="text-sm text-foreground-secondary">Ticketing, FAQs, issue resolution</p>
                            </button>

                            <button
                              onClick={() => handleTemplateSelect('webshop')}
                              className="p-6 border-2 border-border rounded-xl hover:border-foreground hover:bg-background-hover transition-all text-left group"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <ShoppingCart size={24} className="text-foreground-secondary" />
                                <ChevronRight size={16} className="text-foreground-tertiary group-hover:text-foreground transition-colors" />
                              </div>
                              <h4 className="font-semibold text-foreground mb-1">Webshop Assistant</h4>
                              <p className="text-sm text-foreground-secondary">Product search, recommendations, checkout</p>
                            </button>

                            <button
                              onClick={() => handleTemplateSelect('employee')}
                              className="p-6 border-2 border-border rounded-xl hover:border-foreground hover:bg-background-hover transition-all text-left group"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <Briefcase size={24} className="text-foreground-secondary" />
                                <ChevronRight size={16} className="text-foreground-tertiary group-hover:text-foreground transition-colors" />
                              </div>
                              <h4 className="font-semibold text-foreground mb-1">Employee Journey</h4>
                              <p className="text-sm text-foreground-secondary">Onboarding, HR queries, internal help</p>
                            </button>

                            <button
                              onClick={() => handleTemplateSelect('personal')}
                              className="p-6 border-2 border-border rounded-xl hover:border-foreground hover:bg-background-hover transition-all text-left group"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <User size={24} className="text-foreground-secondary" />
                                <ChevronRight size={16} className="text-foreground-tertiary group-hover:text-foreground transition-colors" />
                              </div>
                              <h4 className="font-semibold text-foreground mb-1">Personal Assistant</h4>
                              <p className="text-sm text-foreground-secondary">Calendar, tasks, personal queries</p>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={handleBackToTemplates}
                                className="p-2 hover:bg-background-hover rounded-lg text-foreground"
                              >
                                <ArrowLeft size={18} />
                              </button>
                              <div>
                                <h3 className="font-semibold text-foreground flex items-center gap-2">
                                  <GitBranch size={18} />
                                  {selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)} Flow
                                </h3>
                                <p className="text-sm text-foreground-secondary">Drag nodes to reposition • Click to select and edit</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button className="p-2 hover:bg-background-hover rounded-lg text-foreground-secondary hover:text-foreground" title="Add Node">
                                <Plus size={18} />
                              </button>
                              <button className="p-2 hover:bg-background-hover rounded-lg text-foreground-secondary hover:text-foreground" title="Test Flow">
                                <Play size={18} />
                              </button>
                              <button className="p-2 hover:bg-background-hover rounded-lg text-foreground-secondary hover:text-foreground" title="Duplicate">
                                <Copy size={18} />
                              </button>
                              <button className="p-2 hover:bg-background-hover rounded-lg text-foreground-secondary hover:text-foreground" title="Delete">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>

                          <div className="border-2 border-border rounded-xl bg-background-secondary relative" style={{ height: '400px' }}>
                            <svg className="absolute inset-0 w-full h-full">
                              <defs>
                                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                  <circle cx="1" cy="1" r="1" className="fill-border" />
                                </pattern>
                              </defs>
                              <rect width="100%" height="100%" fill="url(#grid)" />

                              {connections.map((conn, idx) => {
                                const fromNode = flowNodes.find(n => n.id === conn.from);
                                const toNode = flowNodes.find(n => n.id === conn.to);
                                if (!fromNode || !toNode) return null;
                                return (
                                  <line
                                    key={idx}
                                    x1={fromNode.x + 60}
                                    y1={fromNode.y + 20}
                                    x2={toNode.x}
                                    y2={toNode.y + 20}
                                    stroke="#9ca3af"
                                    strokeWidth="2"
                                    markerEnd="url(#arrowhead)"
                                  />
                                );
                              })}

                              <defs>
                                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                  <polygon points="0 0, 10 3.5, 0 7" fill="#9ca3af" />
                                </marker>
                              </defs>
                            </svg>

                            {flowNodes.map((node) => (
                              <div
                                key={node.id}
                                onClick={() => setSelectedNode(node)}
                                className={`absolute cursor-pointer transition-all ${
                                  selectedNode?.id === node.id ? 'ring-2 ring-foreground' : ''
                                }`}
                                style={{
                                  left: `${node.x}px`,
                                  top: `${node.y}px`,
                                  width: '120px'
                                }}
                              >
                                <div className={`px-3 py-2 rounded-lg text-sm font-medium text-center shadow-sm border ${
                                  node.type === 'start' ? 'bg-success-100 dark:bg-success-700/30 border-success-300 dark:border-success-700 text-success-900 dark:text-success-300' :
                                  node.type === 'end' ? 'bg-error-100 dark:bg-error-700/30 border-error-300 dark:border-error-700 text-error-900 dark:text-error-300' :
                                  node.type === 'menu' ? 'bg-info-100 dark:bg-info-700/30 border-info-300 dark:border-info-700 text-info-900 dark:text-info-300' :
                                  'bg-surface-elevated border-border text-foreground'
                                }`}>
                                  {node.label}
                                </div>
                              </div>
                            ))}
                          </div>

                          {selectedNode && (
                            <div className="mt-6 p-4 bg-surface-elevated border border-border rounded-lg">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium text-foreground flex items-center gap-2">
                                  <Settings size={16} />
                                  Node Settings
                                </h4>
                                <button
                                  onClick={() => setSelectedNode(null)}
                                  className="text-foreground-tertiary hover:text-foreground"
                                >
                                  ×
                                </button>
                              </div>
                              <div className="space-y-3">
                                <Input
                                  label="Label"
                                  value={selectedNode.label}
                                  onChange={(e) => {
                                    setFlowNodes(nodes =>
                                      nodes.map(n => n.id === selectedNode.id ? { ...n, label: e.target.value } : n)
                                    );
                                    setSelectedNode({ ...selectedNode, label: e.target.value });
                                  }}
                                  className="text-sm"
                                />
                                <Select
                                  label="Type"
                                  className="text-sm"
                                  options={[
                                    { value: 'start', label: 'Start Node' },
                                    { value: 'menu', label: 'Menu Node' },
                                    { value: 'action', label: 'Action Node' },
                                    { value: 'end', label: 'End Node' },
                                  ]}
                                />
                                <Textarea
                                  label="Response"
                                  className="text-sm"
                                  rows={2}
                                  placeholder="Enter bot response..."
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {activeTab === 'responses' && integrationMode === 'external' && (
                    <div className="text-center py-12">
                      <Shield size={48} className="mx-auto text-foreground-disabled mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">Response Templates Managed Externally</h3>
                      <p className="text-foreground-secondary mb-4">Your external chatbot provider handles response template configuration.</p>
                      <p className="text-sm text-foreground-tertiary">Switch to "Built-in AI" mode to configure response templates here.</p>
                    </div>
                  )}
                  {activeTab === 'responses' && integrationMode === 'builtin' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                          <Zap size={18} />
                          Quick Responses
                        </h3>
                        <div className="space-y-4">
                          <div className="p-4 border border-border rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <p className="font-medium text-foreground">Greeting</p>
                              <button className="text-sm text-foreground-secondary hover:text-foreground">Edit</button>
                            </div>
                            <p className="text-sm text-foreground-secondary">Hello! I'm {bot.name}, your virtual assistant. How can I help you today?</p>
                          </div>

                          <div className="p-4 border border-border rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <p className="font-medium text-foreground">Fallback</p>
                              <button className="text-sm text-foreground-secondary hover:text-foreground">Edit</button>
                            </div>
                            <p className="text-sm text-foreground-secondary">I'm not sure I understand. Could you please rephrase your question?</p>
                          </div>

                          <div className="p-4 border border-border rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <p className="font-medium text-foreground">Transfer to Human</p>
                              <button className="text-sm text-foreground-secondary hover:text-foreground">Edit</button>
                            </div>
                            <p className="text-sm text-foreground-secondary">I'll connect you with a human agent who can better assist you. One moment please...</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                          <Shield size={18} />
                          Response Guidelines
                        </h3>
                        <div className="space-y-3">
                          <label className="flex items-center gap-3">
                            <input type="checkbox" defaultChecked className="rounded border-border" />
                            <span className="text-sm text-foreground">Always maintain a positive tone</span>
                          </label>
                          <label className="flex items-center gap-3">
                            <input type="checkbox" defaultChecked className="rounded border-border" />
                            <span className="text-sm text-foreground">Avoid technical jargon when possible</span>
                          </label>
                          <label className="flex items-center gap-3">
                            <input type="checkbox" defaultChecked className="rounded border-border" />
                            <span className="text-sm text-foreground">Provide sources when sharing information</span>
                          </label>
                          <label className="flex items-center gap-3">
                            <input type="checkbox" className="rounded border-border" />
                            <span className="text-sm text-foreground">Use emojis in responses</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'connect-api' && integrationMode === 'builtin' && (
                    <div className="text-center py-12">
                      <Shield size={48} className="mx-auto text-foreground-disabled mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">API Connection Not Needed</h3>
                      <p className="text-foreground-secondary mb-4">You're using our built-in AI, so no external API connection is required.</p>
                      <p className="text-sm text-foreground-tertiary">Switch to "External Provider" mode to connect external chatbot APIs.</p>
                    </div>
                  )}
                  {activeTab === 'connect-api' && integrationMode === 'external' && (
                    <div className="space-y-6">
                      <div className="mb-6">
                        <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                          <Link2 size={18} />
                          Connect External Chatbot
                        </h3>
                        <p className="text-sm text-foreground-secondary">Use your existing chatbot provider with our 3D mascot frontend</p>
                      </div>

                      <div className="p-4 bg-info-50 dark:bg-info-700/30 border border-info-200 dark:border-info-700 rounded-lg">
                        <div className="flex items-start gap-3">
                          <AlertCircle size={18} className="text-info-600 dark:text-info-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-info-900 dark:text-info-300">How it works</p>
                            <p className="text-sm text-info-700 dark:text-info-400 mt-1">
                              Connect your existing chatbot API and we'll handle the 3D mascot frontend.
                              Your chatbot logic stays the same, but gets a premium visual experience.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-foreground mb-4">Choose Your Chatbot Partner</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 border-2 border-border rounded-xl hover:border-foreground hover:bg-background-hover transition-all cursor-pointer group">
                            <div className="flex items-center justify-between mb-3">
                              <div className="w-12 h-12 bg-warning-100 dark:bg-warning-700/30 rounded-lg flex items-center justify-center">
                                <MessageSquare size={20} className="text-warning-600 dark:text-warning-500" />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-1 bg-success-100 dark:bg-success-700/30 text-success-700 dark:text-success-500 rounded text-xs font-medium">Partner</span>
                                <ChevronRight size={16} className="text-foreground-tertiary group-hover:text-foreground" />
                              </div>
                            </div>
                            <h5 className="font-semibold text-foreground mb-1">Chatfuel</h5>
                            <p className="text-sm text-foreground-secondary mb-3">Facebook Messenger & Instagram chatbot platform</p>
                            <div className="flex items-center gap-2 text-xs text-foreground-tertiary">
                              <CheckCircle size={12} className="text-success-500" />
                              <span>Webhook Integration</span>
                            </div>
                          </div>

                          <div className="p-4 border-2 border-border rounded-xl hover:border-foreground hover:bg-background-hover transition-all cursor-pointer group">
                            <div className="flex items-center justify-between mb-3">
                              <div className="w-12 h-12 bg-info-100 dark:bg-info-700/30 rounded-lg flex items-center justify-center">
                                <BotIcon size={20} className="text-info-600 dark:text-info-500" />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-1 bg-success-100 dark:bg-success-700/30 text-success-700 dark:text-success-500 rounded text-xs font-medium">Partner</span>
                                <ChevronRight size={16} className="text-foreground-tertiary group-hover:text-foreground" />
                              </div>
                            </div>
                            <h5 className="font-semibold text-foreground mb-1">ManyChat</h5>
                            <p className="text-sm text-foreground-secondary mb-3">Multi-channel chatbot automation platform</p>
                            <div className="flex items-center gap-2 text-xs text-foreground-tertiary">
                              <CheckCircle size={12} className="text-success-500" />
                              <span>API Integration</span>
                            </div>
                          </div>

                          <div className="p-4 border-2 border-border rounded-xl hover:border-foreground hover:bg-background-hover transition-all cursor-pointer group">
                            <div className="flex items-center justify-between mb-3">
                              <div className="w-12 h-12 bg-plan-premium-bg rounded-lg flex items-center justify-center">
                                <Zap size={20} className="text-plan-premium-text" />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-1 bg-success-100 dark:bg-success-700/30 text-success-700 dark:text-success-500 rounded text-xs font-medium">Partner</span>
                                <ChevronRight size={16} className="text-foreground-tertiary group-hover:text-foreground" />
                              </div>
                            </div>
                            <h5 className="font-semibold text-foreground mb-1">Botpress</h5>
                            <p className="text-sm text-foreground-secondary mb-3">Open-source conversational AI platform</p>
                            <div className="flex items-center gap-2 text-xs text-foreground-tertiary">
                              <CheckCircle size={12} className="text-success-500" />
                              <span>Webhook Integration</span>
                            </div>
                          </div>

                          <div className="p-4 border-2 border-border rounded-xl hover:border-foreground hover:bg-background-hover transition-all cursor-pointer group">
                            <div className="flex items-center justify-between mb-3">
                              <div className="w-12 h-12 bg-success-100 dark:bg-success-700/30 rounded-lg flex items-center justify-center">
                                <Settings size={20} className="text-success-600 dark:text-success-500" />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-1 bg-background-tertiary text-foreground-secondary rounded text-xs font-medium">Custom</span>
                                <ChevronRight size={16} className="text-foreground-tertiary group-hover:text-foreground" />
                              </div>
                            </div>
                            <h5 className="font-semibold text-foreground mb-1">Custom API</h5>
                            <p className="text-sm text-foreground-secondary mb-3">Connect your own chatbot API or webhook</p>
                            <div className="flex items-center gap-2 text-xs text-foreground-tertiary">
                              <Settings size={12} className="text-foreground-tertiary" />
                              <span>Custom Integration</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                        <Link2 size={32} className="mx-auto mb-4 text-foreground-tertiary" />
                        <h4 className="font-medium text-foreground mb-2">Don't see your provider?</h4>
                        <p className="text-sm text-foreground-secondary mb-4">
                          We're always adding new partners. Contact us to discuss integrating your chatbot provider.
                        </p>
                        <Button size="sm" className="flex items-center gap-2 mx-auto">
                          <ExternalLink size={14} />
                          Request Integration
                        </Button>
                      </div>

                      <div className="bg-warning-50 dark:bg-warning-700/30 border border-warning-200 dark:border-warning-700 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Sparkles size={18} className="text-warning-600 dark:text-warning-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-warning-900 dark:text-warning-300">Benefits of API Integration</p>
                            <ul className="text-sm text-warning-800 dark:text-warning-400 mt-2 space-y-1">
                              <li>• Keep your existing chatbot logic and flows</li>
                              <li>• Add premium 3D mascot experience</li>
                              <li>• Easy setup - just connect your API</li>
                              <li>• Your customers get enhanced visual interaction</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Sparkles size={18} />
                  Test Playground
                </h3>
                <div className="space-y-4">
                  <Textarea
                    label="Test Input"
                    rows={3}
                    placeholder="Type a message to test..."
                  />

                  <Button className="w-full">
                    Generate Response
                  </Button>

                  <div className="p-3 bg-background-secondary rounded-lg">
                    <p className="text-sm font-medium text-foreground mb-1">Bot Response:</p>
                    <p className="text-sm text-foreground-secondary">Response will appear here...</p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-warning-50 dark:bg-warning-700/30 border border-warning-200 dark:border-warning-700 rounded-lg">
                  <p className="text-sm text-warning-900 dark:text-warning-300 font-medium mb-1">Remember</p>
                  <p className="text-sm text-warning-700 dark:text-warning-400">
                    Changes to personality traits will affect all future conversations.
                  </p>
                </div>
              </Card>
            </div>
          </div>
      </PageContent>
    </Page>
  );
}