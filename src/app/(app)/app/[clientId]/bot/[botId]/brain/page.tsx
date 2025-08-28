'use client';
import { getClientById, getBotById } from '@/lib/dataService';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { ArrowLeft, Brain, Sliders, BookOpen, MessageSquare, Zap, Shield, Sparkles, GitBranch, Plus, Play, Users, ShoppingCart, GraduationCap, Briefcase, User, ChevronRight, Settings, Copy, Trash2, Edit2, Link2, ExternalLink, CheckCircle, AlertCircle, Bot as BotIcon } from 'lucide-react';
import Link from 'next/link';
import type { Client, Bot } from '@/lib/dataService';

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
  const [selectedPreset, setSelectedPreset] = useState<string>('professional');
  const [customMode, setCustomMode] = useState(false);
  const [customPresets, setCustomPresets] = useState<{[key: string]: {name: string, description: string, icon: string, values: any}}>({});
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');
  
  const personalityPresets = {
    professional: {
      name: 'Professional',
      description: 'Formal, helpful, and business-focused',
      icon: '👔',
      values: { friendly: 50, professional: 90, humorous: 20, empathetic: 70, concise: 80, creative: 40 }
    },
    friendly: {
      name: 'Friendly',
      description: 'Warm, approachable, and conversational',
      icon: '😊',
      values: { friendly: 95, professional: 40, humorous: 70, empathetic: 85, concise: 50, creative: 60 }
    },
    creative: {
      name: 'Creative',
      description: 'Innovative, engaging, and inspiring',
      icon: '🎨',
      values: { friendly: 70, professional: 50, humorous: 80, empathetic: 60, concise: 40, creative: 95 }
    },
    supportive: {
      name: 'Supportive',
      description: 'Patient, understanding, and helpful',
      icon: '🤝',
      values: { friendly: 80, professional: 60, humorous: 30, empathetic: 95, concise: 60, creative: 50 }
    }
  };
  
  const [personality, setPersonality] = useState(personalityPresets.professional.values);

  const [knowledge, setKnowledge] = useState([
    { id: 1, title: 'Product Documentation', items: 245, status: 'active', lastUpdated: '2 hours ago' },
    { id: 2, title: 'FAQ Database', items: 89, status: 'active', lastUpdated: '1 day ago' },
    { id: 3, title: 'Company Policies', items: 34, status: 'active', lastUpdated: '3 days ago' },
    { id: 4, title: 'Technical Support', items: 156, status: 'draft', lastUpdated: '1 week ago' }
  ]);

  useEffect(() => {
    async function loadData() {
      try {
        const [clientData, botData] = await Promise.all([
          getClientById(params.clientId),
          getBotById(params.botId)
        ]);
        setClient(clientData);
        setBot(botData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params.clientId, params.botId]);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }
  
  if (!client || !bot) {
    return <div className="p-6">Bot not found</div>;
  }

  const handleSliderChange = (trait: string, value: number) => {
    setPersonality(prev => ({ ...prev, [trait]: value }));
    if (!customMode) {
      setCustomMode(true);
      setSelectedPreset('custom');
    }
  };

  const handlePresetSelect = (presetKey: string) => {
    setSelectedPreset(presetKey);
    if (presetKey === 'custom') {
      setCustomMode(true);
    } else if (personalityPresets[presetKey as keyof typeof personalityPresets]) {
      setPersonality(personalityPresets[presetKey as keyof typeof personalityPresets].values);
      setCustomMode(false);
    } else if (customPresets[presetKey]) {
      setPersonality(customPresets[presetKey].values);
      setCustomMode(false);
    }
  };

  const handleCustomizePreset = () => {
    setCustomMode(true);
    setSelectedPreset('custom');
  };

  const handleSavePreset = () => {
    if (!presetName.trim()) return;
    
    const presetKey = presetName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const newPreset = {
      name: presetName,
      description: presetDescription || `Custom personality: ${presetName}`,
      icon: '⭐',
      values: { ...personality }
    };
    
    setCustomPresets(prev => ({ ...prev, [presetKey]: newPreset }));
    setSelectedPreset(presetKey);
    setCustomMode(false);
    setShowSaveModal(false);
    setPresetName('');
    setPresetDescription('');
  };

  const handleDeleteCustomPreset = (presetKey: string) => {
    setCustomPresets(prev => {
      const newPresets = { ...prev };
      delete newPresets[presetKey];
      return newPresets;
    });
    if (selectedPreset === presetKey) {
      setSelectedPreset('professional');
      setPersonality(personalityPresets.professional.values);
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
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Brain Studio</h1>
              <p className="text-gray-600">
                {integrationMode === 'builtin' 
                  ? `Configure ${bot.name}'s personality and knowledge base` 
                  : `Connect ${bot.name} to your existing chatbot provider`
                }
              </p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                Test Responses
              </button>
              <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
                Save Changes
              </button>
            </div>
          </div>
          
          {/* Mode Selector */}
          <div className="mb-6 bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold mb-4">Choose Configuration Mode</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                integrationMode === 'builtin' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'
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
                  <Brain size={20} />
                  <p className="font-medium">Built-in AI</p>
                </div>
                <p className="text-sm text-gray-600">Configure personality, knowledge base, and chatflows using our platform</p>
              </label>
              
              <label className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                integrationMode === 'external' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'
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
                  <Link2 size={20} />
                  <p className="font-medium">External Provider</p>
                </div>
                <p className="text-sm text-gray-600">Connect your existing chatbot and use our 3D mascot frontend only</p>
              </label>
            </div>
            
            {integrationMode === 'external' && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>External mode:</strong> Your chatbot provider handles all AI logic. 
                  We only provide the 3D mascot interface and animations.
                </p>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="border-b border-gray-200">
                  <div className="flex gap-6 p-6 overflow-x-auto">
                    <button
                      onClick={() => integrationMode === 'builtin' && setActiveTab('personality')}
                      disabled={integrationMode === 'external'}
                      className={`pb-2 px-1 font-medium transition-colors relative flex items-center gap-2 ${
                        integrationMode === 'external' 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : activeTab === 'personality' 
                            ? 'text-black border-b-2 border-black' 
                            : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Personality
                      {integrationMode === 'external' && <Shield size={14} className="text-gray-300" />}
                    </button>
                    <button
                      onClick={() => integrationMode === 'builtin' && setActiveTab('knowledge')}
                      disabled={integrationMode === 'external'}
                      className={`pb-2 px-1 font-medium transition-colors relative flex items-center gap-2 ${
                        integrationMode === 'external' 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : activeTab === 'knowledge' 
                            ? 'text-black border-b-2 border-black' 
                            : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Knowledge Base
                      {integrationMode === 'external' && <Shield size={14} className="text-gray-300" />}
                    </button>
                    <button
                      onClick={() => integrationMode === 'builtin' && setActiveTab('responses')}
                      disabled={integrationMode === 'external'}
                      className={`pb-2 px-1 font-medium transition-colors relative flex items-center gap-2 ${
                        integrationMode === 'external' 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : activeTab === 'responses' 
                            ? 'text-black border-b-2 border-black' 
                            : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Response Templates
                      {integrationMode === 'external' && <Shield size={14} className="text-gray-300" />}
                    </button>
                    <button
                      onClick={() => integrationMode === 'builtin' && setActiveTab('chatflows')}
                      disabled={integrationMode === 'external'}
                      className={`pb-2 px-1 font-medium transition-colors relative flex items-center gap-2 ${
                        integrationMode === 'external' 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : activeTab === 'chatflows' 
                            ? 'text-black border-b-2 border-black' 
                            : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Chatflows
                      {integrationMode === 'external' && <Shield size={14} className="text-gray-300" />}
                    </button>
                    <button
                      onClick={() => integrationMode === 'external' && setActiveTab('connect-api')}
                      disabled={integrationMode === 'builtin'}
                      className={`pb-2 px-1 font-medium transition-colors relative flex items-center gap-2 ${
                        integrationMode === 'builtin' 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : activeTab === 'connect-api' 
                            ? 'text-black border-b-2 border-black' 
                            : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Connect API
                      {integrationMode === 'external' && <CheckCircle size={14} className="text-green-500" />}
                      {integrationMode === 'builtin' && <Shield size={14} className="text-gray-300" />}
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  {activeTab === 'personality' && integrationMode === 'external' && (
                    <div className="text-center py-12">
                      <Shield size={48} className="mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Personality Managed Externally</h3>
                      <p className="text-gray-600 mb-4">Your external chatbot provider handles personality configuration.</p>
                      <p className="text-sm text-gray-500">Switch to "Built-in AI" mode to configure personality traits here.</p>
                    </div>
                  )}
                  {activeTab === 'personality' && integrationMode === 'builtin' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <Sparkles size={18} />
                          Personality Presets
                        </h3>
                        
                        {/* Preset Selection */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                          {/* Built-in Presets */}
                          {Object.entries(personalityPresets).map(([key, preset]) => (
                            <button
                              key={key}
                              onClick={() => handlePresetSelect(key)}
                              className={`p-4 border-2 rounded-xl text-left transition-all ${
                                selectedPreset === key && !customMode
                                  ? 'border-black bg-gray-50' 
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <div className="text-2xl mb-2">{preset.icon}</div>
                              <h4 className="font-medium mb-1">{preset.name}</h4>
                              <p className="text-sm text-gray-600">{preset.description}</p>
                            </button>
                          ))}
                          
                          {/* Custom Presets */}
                          {Object.entries(customPresets).map(([key, preset]) => (
                            <div key={key} className="relative">
                              <button
                                onClick={() => handlePresetSelect(key)}
                                className={`w-full p-4 border-2 rounded-xl text-left transition-all ${
                                  selectedPreset === key && !customMode
                                    ? 'border-black bg-gray-50' 
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                <div className="text-2xl mb-2">{preset.icon}</div>
                                <h4 className="font-medium mb-1">{preset.name}</h4>
                                <p className="text-sm text-gray-600">{preset.description}</p>
                                <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full mt-2">
                                  Custom
                                </span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCustomPreset(key);
                                }}
                                className="absolute top-2 right-2 w-6 h-6 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center text-sm transition-colors"
                                title="Delete preset"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Custom Option */}
                        <button
                          onClick={() => handlePresetSelect('custom')}
                          className={`w-full p-4 border-2 rounded-xl text-left transition-all ${
                            selectedPreset === 'custom'
                              ? 'border-black bg-gray-50' 
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">⚙️</div>
                            <div>
                              <h4 className="font-medium">Custom Preset</h4>
                              <p className="text-sm text-gray-600">Fine-tune personality traits manually</p>
                            </div>
                          </div>
                        </button>
                      </div>

                      {/* Trait Sliders - shown when preset is selected or in custom mode */}
                      {(selectedPreset || customMode) && (
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold flex items-center gap-2">
                              <Sliders size={18} />
                              Personality Traits
                              {!customMode && (
                                <span className="text-sm font-normal text-gray-500">
                                  ({personalityPresets[selectedPreset as keyof typeof personalityPresets]?.name || customPresets[selectedPreset]?.name})
                                </span>
                              )}
                            </h3>
                            {!customMode && (
                              <button
                                onClick={handleCustomizePreset}
                                className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                              >
                                Customize
                              </button>
                            )}
                          </div>
                          
                          <div className="space-y-6">
                            {Object.entries(personality).map(([trait, value]) => (
                              <div key={trait}>
                                <div className="flex justify-between mb-2">
                                  <label className="text-sm font-medium capitalize">{trait}</label>
                                  <span className="text-sm text-gray-600">{value}%</span>
                                </div>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={value}
                                  onChange={(e) => handleSliderChange(trait, Number(e.target.value))}
                                  disabled={!customMode}
                                  className={`w-full h-2 bg-gray-200 rounded-lg appearance-none slider ${
                                    customMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                                  }`}
                                  style={{
                                    background: `linear-gradient(to right, #000 0%, #000 ${value}%, #e5e7eb ${value}%, #e5e7eb 100%)`
                                  }}
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                  <span>Less</span>
                                  <span>More</span>
                                </div>
                              </div>
                            ))}
                          </div>

                          {customMode && (
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-blue-800">
                                  💡 <strong>Custom mode active:</strong> You're now creating a personalized personality profile.
                                </p>
                                <button
                                  onClick={() => setShowSaveModal(true)}
                                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  Save as Preset
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div>
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <MessageSquare size={18} />
                          Communication Style
                        </h3>
                        <div className="space-y-3">
                          <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input type="radio" name="style" defaultChecked className="text-black" />
                            <div>
                              <p className="font-medium">Conversational</p>
                              <p className="text-sm text-gray-600">Natural, friendly dialogue style</p>
                            </div>
                          </label>
                          <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input type="radio" name="style" className="text-black" />
                            <div>
                              <p className="font-medium">Assistant</p>
                              <p className="text-sm text-gray-600">Helpful and service-oriented</p>
                            </div>
                          </label>
                          <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input type="radio" name="style" className="text-black" />
                            <div>
                              <p className="font-medium">Expert</p>
                              <p className="text-sm text-gray-600">Knowledgeable and authoritative</p>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Save Preset Modal */}
                  {showSaveModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold mb-4">Save Custom Preset</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Preset Name</label>
                            <input
                              type="text"
                              value={presetName}
                              onChange={(e) => setPresetName(e.target.value)}
                              placeholder="e.g., Friendly Sales Bot"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
                            <textarea
                              value={presetDescription}
                              onChange={(e) => setPresetDescription(e.target.value)}
                              placeholder="Describe when to use this personality..."
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                          <button
                            onClick={() => {
                              setShowSaveModal(false);
                              setPresetName('');
                              setPresetDescription('');
                            }}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSavePreset}
                            disabled={!presetName.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Save Preset
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'knowledge' && integrationMode === 'external' && (
                    <div className="text-center py-12">
                      <Shield size={48} className="mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Knowledge Base Managed Externally</h3>
                      <p className="text-gray-600 mb-4">Your external chatbot provider handles knowledge base configuration.</p>
                      <p className="text-sm text-gray-500">Switch to "Built-in AI" mode to manage knowledge sources here.</p>
                    </div>
                  )}
                  {activeTab === 'knowledge' && integrationMode === 'builtin' && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold flex items-center gap-2">
                          <BookOpen size={18} />
                          Knowledge Sources
                        </h3>
                        <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 text-sm">
                          Add Source
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {knowledge.map((source) => (
                          <div key={source.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                <BookOpen size={18} className="text-gray-600" />
                              </div>
                              <div>
                                <p className="font-medium">{source.title}</p>
                                <p className="text-sm text-gray-600">{source.items} items • Updated {source.lastUpdated}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                source.status === 'active' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {source.status}
                              </span>
                              <button className="p-2 hover:bg-gray-100 rounded">
                                <Sliders size={16} className="text-gray-600" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <BookOpen size={32} className="mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600 mb-2">Drop files here or click to browse</p>
                        <p className="text-xs text-gray-500 mb-4">Support for PDF, DOCX, TXT, CSV</p>
                        <button className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200">
                          Upload Documents
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'chatflows' && integrationMode === 'external' && (
                    <div className="text-center py-12">
                      <Shield size={48} className="mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Chatflows Managed Externally</h3>
                      <p className="text-gray-600 mb-4">Your external chatbot provider handles conversation flow configuration.</p>
                      <p className="text-sm text-gray-500">Switch to "Built-in AI" mode to design chatflows here.</p>
                    </div>
                  )}
                  {activeTab === 'chatflows' && integrationMode === 'builtin' && (
                    <div className="space-y-6">
                      {!selectedTemplate ? (
                        <div>
                          <div className="mb-6">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                              <GitBranch size={18} />
                              Select a Flow Template
                            </h3>
                            <p className="text-sm text-gray-600">Choose a pre-built chatflow template to get started quickly</p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                              onClick={() => handleTemplateSelect('university')}
                              className="p-6 border-2 border-gray-200 rounded-xl hover:border-black hover:bg-gray-50 transition-all text-left group"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <GraduationCap size={24} className="text-gray-700" />
                                <ChevronRight size={16} className="text-gray-400 group-hover:text-black transition-colors" />
                              </div>
                              <h4 className="font-semibold mb-1">University</h4>
                              <p className="text-sm text-gray-600">Student inquiries, admissions, course info</p>
                            </button>
                            
                            <button
                              onClick={() => handleTemplateSelect('support')}
                              className="p-6 border-2 border-gray-200 rounded-xl hover:border-black hover:bg-gray-50 transition-all text-left group"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <Users size={24} className="text-gray-700" />
                                <ChevronRight size={16} className="text-gray-400 group-hover:text-black transition-colors" />
                              </div>
                              <h4 className="font-semibold mb-1">Customer Support</h4>
                              <p className="text-sm text-gray-600">Ticketing, FAQs, issue resolution</p>
                            </button>
                            
                            <button
                              onClick={() => handleTemplateSelect('webshop')}
                              className="p-6 border-2 border-gray-200 rounded-xl hover:border-black hover:bg-gray-50 transition-all text-left group"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <ShoppingCart size={24} className="text-gray-700" />
                                <ChevronRight size={16} className="text-gray-400 group-hover:text-black transition-colors" />
                              </div>
                              <h4 className="font-semibold mb-1">Webshop Assistant</h4>
                              <p className="text-sm text-gray-600">Product search, recommendations, checkout</p>
                            </button>
                            
                            <button
                              onClick={() => handleTemplateSelect('employee')}
                              className="p-6 border-2 border-gray-200 rounded-xl hover:border-black hover:bg-gray-50 transition-all text-left group"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <Briefcase size={24} className="text-gray-700" />
                                <ChevronRight size={16} className="text-gray-400 group-hover:text-black transition-colors" />
                              </div>
                              <h4 className="font-semibold mb-1">Employee Journey</h4>
                              <p className="text-sm text-gray-600">Onboarding, HR queries, internal help</p>
                            </button>
                            
                            <button
                              onClick={() => handleTemplateSelect('personal')}
                              className="p-6 border-2 border-gray-200 rounded-xl hover:border-black hover:bg-gray-50 transition-all text-left group"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <User size={24} className="text-gray-700" />
                                <ChevronRight size={16} className="text-gray-400 group-hover:text-black transition-colors" />
                              </div>
                              <h4 className="font-semibold mb-1">Personal Assistant</h4>
                              <p className="text-sm text-gray-600">Calendar, tasks, personal queries</p>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={handleBackToTemplates}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                              >
                                <ArrowLeft size={18} />
                              </button>
                              <div>
                                <h3 className="font-semibold flex items-center gap-2">
                                  <GitBranch size={18} />
                                  {selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)} Flow
                                </h3>
                                <p className="text-sm text-gray-600">Drag nodes to reposition • Click to select and edit</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button className="p-2 hover:bg-gray-100 rounded-lg" title="Add Node">
                                <Plus size={18} />
                              </button>
                              <button className="p-2 hover:bg-gray-100 rounded-lg" title="Test Flow">
                                <Play size={18} />
                              </button>
                              <button className="p-2 hover:bg-gray-100 rounded-lg" title="Duplicate">
                                <Copy size={18} />
                              </button>
                              <button className="p-2 hover:bg-gray-100 rounded-lg" title="Delete">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                          
                          <div className="border-2 border-gray-200 rounded-xl bg-gray-50 relative" style={{ height: '400px' }}>
                            <svg className="absolute inset-0 w-full h-full">
                              <defs>
                                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                  <circle cx="1" cy="1" r="1" fill="#e5e7eb" />
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
                                  selectedNode?.id === node.id ? 'ring-2 ring-black' : ''
                                }`}
                                style={{
                                  left: `${node.x}px`,
                                  top: `${node.y}px`,
                                  width: '120px'
                                }}
                              >
                                <div className={`px-3 py-2 rounded-lg text-sm font-medium text-center shadow-sm border ${
                                  node.type === 'start' ? 'bg-green-100 border-green-300 text-green-900' :
                                  node.type === 'end' ? 'bg-red-100 border-red-300 text-red-900' :
                                  node.type === 'menu' ? 'bg-blue-100 border-blue-300 text-blue-900' :
                                  'bg-white border-gray-300 text-gray-900'
                                }`}>
                                  {node.label}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {selectedNode && (
                            <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium flex items-center gap-2">
                                  <Settings size={16} />
                                  Node Settings
                                </h4>
                                <button
                                  onClick={() => setSelectedNode(null)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  ×
                                </button>
                              </div>
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-sm font-medium mb-1">Label</label>
                                  <input
                                    type="text"
                                    value={selectedNode.label}
                                    onChange={(e) => {
                                      setFlowNodes(nodes =>
                                        nodes.map(n => n.id === selectedNode.id ? { ...n, label: e.target.value } : n)
                                      );
                                      setSelectedNode({ ...selectedNode, label: e.target.value });
                                    }}
                                    className="w-full px-3 py-1 border border-gray-200 rounded-lg text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-1">Type</label>
                                  <select className="w-full px-3 py-1 border border-gray-200 rounded-lg text-sm">
                                    <option value="start">Start Node</option>
                                    <option value="menu">Menu Node</option>
                                    <option value="action">Action Node</option>
                                    <option value="end">End Node</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-1">Response</label>
                                  <textarea
                                    className="w-full px-3 py-1 border border-gray-200 rounded-lg text-sm resize-none"
                                    rows={2}
                                    placeholder="Enter bot response..."
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {activeTab === 'responses' && integrationMode === 'external' && (
                    <div className="text-center py-12">
                      <Shield size={48} className="mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Response Templates Managed Externally</h3>
                      <p className="text-gray-600 mb-4">Your external chatbot provider handles response template configuration.</p>
                      <p className="text-sm text-gray-500">Switch to "Built-in AI" mode to configure response templates here.</p>
                    </div>
                  )}
                  {activeTab === 'responses' && integrationMode === 'builtin' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <Zap size={18} />
                          Quick Responses
                        </h3>
                        <div className="space-y-4">
                          <div className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <p className="font-medium">Greeting</p>
                              <button className="text-sm text-gray-600 hover:text-gray-900">Edit</button>
                            </div>
                            <p className="text-sm text-gray-600">Hello! I'm {bot.name}, your virtual assistant. How can I help you today?</p>
                          </div>
                          
                          <div className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <p className="font-medium">Fallback</p>
                              <button className="text-sm text-gray-600 hover:text-gray-900">Edit</button>
                            </div>
                            <p className="text-sm text-gray-600">I'm not sure I understand. Could you please rephrase your question?</p>
                          </div>
                          
                          <div className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <p className="font-medium">Transfer to Human</p>
                              <button className="text-sm text-gray-600 hover:text-gray-900">Edit</button>
                            </div>
                            <p className="text-sm text-gray-600">I'll connect you with a human agent who can better assist you. One moment please...</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <Shield size={18} />
                          Response Guidelines
                        </h3>
                        <div className="space-y-3">
                          <label className="flex items-center gap-3">
                            <input type="checkbox" defaultChecked className="rounded" />
                            <span className="text-sm">Always maintain a positive tone</span>
                          </label>
                          <label className="flex items-center gap-3">
                            <input type="checkbox" defaultChecked className="rounded" />
                            <span className="text-sm">Avoid technical jargon when possible</span>
                          </label>
                          <label className="flex items-center gap-3">
                            <input type="checkbox" defaultChecked className="rounded" />
                            <span className="text-sm">Provide sources when sharing information</span>
                          </label>
                          <label className="flex items-center gap-3">
                            <input type="checkbox" className="rounded" />
                            <span className="text-sm">Use emojis in responses</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'connect-api' && integrationMode === 'builtin' && (
                    <div className="text-center py-12">
                      <Shield size={48} className="mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">API Connection Not Needed</h3>
                      <p className="text-gray-600 mb-4">You're using our built-in AI, so no external API connection is required.</p>
                      <p className="text-sm text-gray-500">Switch to "External Provider" mode to connect external chatbot APIs.</p>
                    </div>
                  )}
                  {activeTab === 'connect-api' && integrationMode === 'external' && (
                    <div className="space-y-6">
                      <div className="mb-6">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <Link2 size={18} />
                          Connect External Chatbot
                        </h3>
                        <p className="text-sm text-gray-600">Use your existing chatbot provider with our 3D mascot frontend</p>
                      </div>
                      
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <AlertCircle size={18} className="text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-blue-900">How it works</p>
                            <p className="text-sm text-blue-700 mt-1">
                              Connect your existing chatbot API and we'll handle the 3D mascot frontend. 
                              Your chatbot logic stays the same, but gets a premium visual experience.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-4">Choose Your Chatbot Partner</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 border-2 border-gray-200 rounded-xl hover:border-black hover:bg-gray-50 transition-all cursor-pointer group">
                            <div className="flex items-center justify-between mb-3">
                              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <MessageSquare size={20} className="text-orange-600" />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Partner</span>
                                <ChevronRight size={16} className="text-gray-400 group-hover:text-black" />
                              </div>
                            </div>
                            <h5 className="font-semibold mb-1">Chatfuel</h5>
                            <p className="text-sm text-gray-600 mb-3">Facebook Messenger & Instagram chatbot platform</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <CheckCircle size={12} className="text-green-500" />
                              <span>Webhook Integration</span>
                            </div>
                          </div>
                          
                          <div className="p-4 border-2 border-gray-200 rounded-xl hover:border-black hover:bg-gray-50 transition-all cursor-pointer group">
                            <div className="flex items-center justify-between mb-3">
                              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <BotIcon size={20} className="text-blue-600" />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Partner</span>
                                <ChevronRight size={16} className="text-gray-400 group-hover:text-black" />
                              </div>
                            </div>
                            <h5 className="font-semibold mb-1">ManyChat</h5>
                            <p className="text-sm text-gray-600 mb-3">Multi-channel chatbot automation platform</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <CheckCircle size={12} className="text-green-500" />
                              <span>API Integration</span>
                            </div>
                          </div>
                          
                          <div className="p-4 border-2 border-gray-200 rounded-xl hover:border-black hover:bg-gray-50 transition-all cursor-pointer group">
                            <div className="flex items-center justify-between mb-3">
                              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Zap size={20} className="text-purple-600" />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Partner</span>
                                <ChevronRight size={16} className="text-gray-400 group-hover:text-black" />
                              </div>
                            </div>
                            <h5 className="font-semibold mb-1">Botpress</h5>
                            <p className="text-sm text-gray-600 mb-3">Open-source conversational AI platform</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <CheckCircle size={12} className="text-green-500" />
                              <span>Webhook Integration</span>
                            </div>
                          </div>
                          
                          <div className="p-4 border-2 border-gray-200 rounded-xl hover:border-black hover:bg-gray-50 transition-all cursor-pointer group">
                            <div className="flex items-center justify-between mb-3">
                              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <Settings size={20} className="text-green-600" />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">Custom</span>
                                <ChevronRight size={16} className="text-gray-400 group-hover:text-black" />
                              </div>
                            </div>
                            <h5 className="font-semibold mb-1">Custom API</h5>
                            <p className="text-sm text-gray-600 mb-3">Connect your own chatbot API or webhook</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Settings size={12} className="text-gray-500" />
                              <span>Custom Integration</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                        <Link2 size={32} className="mx-auto mb-4 text-gray-400" />
                        <h4 className="font-medium text-gray-900 mb-2">Don't see your provider?</h4>
                        <p className="text-sm text-gray-600 mb-4">
                          We're always adding new partners. Contact us to discuss integrating your chatbot provider.
                        </p>
                        <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 text-sm font-medium flex items-center gap-2 mx-auto">
                          <ExternalLink size={14} />
                          Request Integration
                        </button>
                      </div>
                      
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Sparkles size={18} className="text-yellow-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-yellow-900">Benefits of API Integration</p>
                            <ul className="text-sm text-yellow-800 mt-2 space-y-1">
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
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Sparkles size={18} />
                  Test Playground
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Test Input</label>
                    <textarea
                      className="w-full p-3 border border-gray-200 rounded-lg resize-none"
                      rows={3}
                      placeholder="Type a message to test..."
                    />
                  </div>
                  
                  <button className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
                    Generate Response
                  </button>
                  
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium mb-1">Bot Response:</p>
                    <p className="text-sm text-gray-600">Response will appear here...</p>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-amber-50 rounded-lg">
                  <p className="text-sm text-amber-900 font-medium mb-1">Remember</p>
                  <p className="text-sm text-amber-700">
                    Changes to personality traits will affect all future conversations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}