'use client';
import { getClientById, getBotById } from '@/lib/dataService';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { ArrowLeft, Palette, Sparkles, Image, Type, Monitor, Smartphone, User, Eye, Smile, ShirtIcon as Shirt, HardHat, ShoppingCart, Lock, Crown, Zap, Package } from 'lucide-react';
import Link from 'next/link';
import type { Client, Bot } from '@/lib/dataService';

export default function MascotStudioPage({ params }: { params: { clientId: string; botId: string } }) {
  const [client, setClient] = useState<Client | undefined>();
  const [bot, setBot] = useState<Bot | undefined>();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('appearance');
  const [primaryColor, setPrimaryColor] = useState('#000000');
  const [accentColor, setAccentColor] = useState('#0066FF');
  const [chatTheme, setChatTheme] = useState('modern');
  
  // 3D Mascot Customization State
  const [selectedTemplate, setSelectedTemplate] = useState('neo');
  const [selectedSubTemplate, setSelectedSubTemplate] = useState('basic');
  const [activeCustomizationTab, setActiveCustomizationTab] = useState('head');
  const [selectedSubCategory, setSelectedSubCategory] = useState('hair');
  const [selectedOptions, setSelectedOptions] = useState({
    hair: 'classic',
    facialHair: 'none',
    eyes: 'round',
    ears: 'medium',
    nose: 'straight',
    mouth: 'neutral',
    body: 'average',
    tops: 'tshirt',
    bottoms: 'jeans',
    shoes: 'sneakers',
    accessories: 'none'
  });
  const [optionSettings, setOptionSettings] = useState({});
  const [ownedStudioPacks, setOwnedStudioPacks] = useState(['basic']);

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

  // Template and Studio Pack Configuration
  const mascotTemplates = {
    neo: {
      name: 'Neo',
      type: 'Humanoid Sitting',
      price: 29.99,
      description: 'Modern humanoid character perfect for professional and casual use',
      image: '/templates/neo.jpg'
    },
    aria: {
      name: 'Aria',
      type: 'Humanoid Standing',
      price: 34.99,
      description: 'Elegant standing character with professional appeal',
      image: '/templates/aria.jpg'
    },
    blob: {
      name: 'Bubble',
      type: 'Abstract Blob',
      price: 24.99,
      description: 'Friendly abstract character with smooth animations',
      image: '/templates/bubble.jpg'
    }
  };

  const studioPacks = {
    basic: {
      name: 'Basic Pack',
      price: 0,
      description: 'Included with template',
      icon: '📦',
      assets: {
        hair: ['classic', 'short', 'medium'],
        facialHair: ['none', 'stubble', 'beard'],
        eyes: ['round', 'almond', 'square'],
        ears: ['small', 'medium', 'large'],
        nose: ['button', 'straight', 'wide'],
        mouth: ['neutral', 'smile', 'serious'],
        body: ['slim', 'average', 'athletic'],
        tops: ['tshirt', 'polo', 'buttonup'],
        bottoms: ['jeans', 'chinos', 'shorts'],
        shoes: ['sneakers', 'dress', 'sandals'],
        accessories: ['none', 'glasses', 'cap']
      }
    },
    berlin: {
      name: 'Studio Berlin',
      price: 19.99,
      description: 'Avant-garde street fashion and edgy styles',
      icon: '🎨',
      assets: {
        hair: ['punk', 'undercut', 'mohawk'],
        facialHair: ['goatee', 'soul_patch', 'full_beard'],
        tops: ['leather_jacket', 'tank_top', 'hoodie'],
        bottoms: ['ripped_jeans', 'cargo_pants', 'leather_pants'],
        shoes: ['boots', 'high_tops', 'combat_boots'],
        accessories: ['beanie', 'chain', 'piercing']
      }
    },
    kawaii: {
      name: 'Kawaii Pack',
      price: 14.99,
      description: 'Cute anime-inspired styles and expressions',
      icon: '🌸',
      assets: {
        eyes: ['big_sparkle', 'cat_eyes', 'star_eyes'],
        mouth: ['cat_smile', 'pout', 'blush'],
        tops: ['sailor_top', 'crop_top', 'kawaii_dress'],
        accessories: ['cat_ears', 'bow', 'heart_glasses']
      }
    },
    corporate: {
      name: 'Corporate Pro',
      price: 9.99,
      description: 'Professional business attire and styles',
      icon: '💼',
      assets: {
        hair: ['side_part', 'slicked_back', 'professional_bob'],
        tops: ['suit_jacket', 'blazer', 'dress_shirt'],
        bottoms: ['dress_pants', 'pencil_skirt', 'suit_pants'],
        shoes: ['oxfords', 'heels', 'loafers'],
        accessories: ['tie', 'briefcase', 'watch']
      }
    }
  };

  const customizationCategories = {
    head: {
      name: 'Head',
      icon: User,
      subCategories: ['hair', 'facialHair', 'eyes', 'ears', 'nose', 'mouth']
    },
    body: {
      name: 'Body',
      icon: User,
      subCategories: ['body']
    },
    tops: {
      name: 'Tops',
      icon: Shirt,
      subCategories: ['tops']
    },
    bottoms: {
      name: 'Bottoms',
      icon: Package,
      subCategories: ['bottoms']
    },
    shoes: {
      name: 'Shoes',
      icon: Package,
      subCategories: ['shoes']
    },
    accessories: {
      name: 'Accessories',
      icon: HardHat,
      subCategories: ['accessories']
    }
  };

  const handleOptionSelect = (category: string, option: string) => {
    setSelectedOptions(prev => ({ ...prev, [category]: option }));
  };

  const handleSettingChange = (category: string, setting: string, value: any) => {
    setOptionSettings(prev => ({
      ...prev,
      [`${category}_${selectedOptions[category as keyof typeof selectedOptions]}`]: {
        ...prev[`${category}_${selectedOptions[category as keyof typeof selectedOptions]}` as keyof typeof prev],
        [setting]: value
      }
    }));
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
              <h1 className="text-3xl font-bold mb-2">Mascot Studio</h1>
              <p className="text-gray-600">Customize {bot.name}'s appearance and chat interface</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                Preview
              </button>
              <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
                Save Changes
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="border-b border-gray-200">
                  <div className="flex gap-6 p-6">
                    <button
                      onClick={() => setActiveTab('appearance')}
                      className={`pb-2 px-1 font-medium transition-colors relative ${
                        activeTab === 'appearance' 
                          ? 'text-black border-b-2 border-black' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      3D Mascot
                    </button>
                    <button
                      onClick={() => setActiveTab('colors')}
                      className={`pb-2 px-1 font-medium transition-colors relative ${
                        activeTab === 'colors' 
                          ? 'text-black border-b-2 border-black' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Colors & Branding
                    </button>
                    <button
                      onClick={() => setActiveTab('chat')}
                      className={`pb-2 px-1 font-medium transition-colors relative ${
                        activeTab === 'chat' 
                          ? 'text-black border-b-2 border-black' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Chat Interface
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  {activeTab === 'appearance' && (
                    <div className="space-y-6">
                      {/* Template Selection */}
                      <div>
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <Sparkles size={18} />
                          Current Template
                        </h3>
                        <div className="p-4 border border-gray-200 rounded-lg bg-white">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"></div>
                              <div>
                                <h4 className="font-medium">{mascotTemplates[selectedTemplate as keyof typeof mascotTemplates].name}</h4>
                                <p className="text-sm text-gray-600">{mascotTemplates[selectedTemplate as keyof typeof mascotTemplates].type}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-semibold">${mascotTemplates[selectedTemplate as keyof typeof mascotTemplates].price}</p>
                              <p className="text-sm text-green-600">✓ Owned</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Studio Pack Selection */}
                      <div>
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <Crown size={18} />
                          Studio Packs
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(studioPacks).map(([key, pack]) => {
                            const isOwned = ownedStudioPacks.includes(key);
                            const isSelected = selectedSubTemplate === key;
                            return (
                              <div
                                key={key}
                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                  isSelected 
                                    ? 'border-black bg-gray-50' 
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => isOwned && setSelectedSubTemplate(key)}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-3">
                                    <span className="text-2xl">{pack.icon}</span>
                                    <div>
                                      <h4 className="font-medium flex items-center gap-2">
                                        {pack.name}
                                        {!isOwned && <Lock size={14} className="text-gray-400" />}
                                      </h4>
                                      <p className="text-sm text-gray-600">{pack.description}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    {pack.price === 0 ? (
                                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                        FREE
                                      </span>
                                    ) : (
                                      <div>
                                        <p className="font-semibold">${pack.price}</p>
                                        {!isOwned && (
                                          <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 mt-1">
                                            Buy
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* 3D Preview */}
                      <div className="bg-gray-100 rounded-lg p-8 text-center">
                        <div className="w-48 h-48 bg-gradient-to-br from-gray-300 to-gray-400 rounded-lg mx-auto mb-4 flex items-center justify-center">
                          <div className="text-center text-gray-600">
                            <User size={48} className="mx-auto mb-2" />
                            <p className="text-sm">3D Model Preview</p>
                            <p className="text-xs text-gray-500">Template: {mascotTemplates[selectedTemplate as keyof typeof mascotTemplates].name}</p>
                          </div>
                        </div>
                      </div>

                      {/* Customization Categories */}
                      <div>
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <Zap size={18} />
                          Customize Parts
                        </h3>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                          {Object.entries(customizationCategories).map(([key, category]) => {
                            const Icon = category.icon;
                            return (
                              <button
                                key={key}
                                onClick={() => {
                                  setActiveCustomizationTab(key);
                                  setSelectedSubCategory(category.subCategories[0]);
                                }}
                                className={`p-4 border-2 rounded-lg transition-all ${
                                  activeCustomizationTab === key
                                    ? 'border-black bg-gray-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <Icon size={24} className="mx-auto mb-2" />
                                <p className="text-sm font-medium">{category.name}</p>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Sub-Category Navigation */}
                      {customizationCategories[activeCustomizationTab as keyof typeof customizationCategories]?.subCategories.length > 1 && (
                        <div>
                          <h4 className="font-medium mb-3">Select Part</h4>
                          <div className="flex gap-2 overflow-x-auto pb-2">
                            {customizationCategories[activeCustomizationTab as keyof typeof customizationCategories].subCategories.map((subCat) => (
                              <button
                                key={subCat}
                                onClick={() => setSelectedSubCategory(subCat)}
                                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                                  selectedSubCategory === subCat
                                    ? 'bg-black text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {subCat.charAt(0).toUpperCase() + subCat.slice(1).replace(/([A-Z])/g, ' $1')}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Option Selection */}
                      <div>
                        <h4 className="font-medium mb-3">Choose Style</h4>
                        <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                          {(() => {
                            const availableOptions = [];
                            // Get options from owned packs
                            ownedStudioPacks.forEach(packKey => {
                              const pack = studioPacks[packKey as keyof typeof studioPacks];
                              const categoryOptions = pack.assets[selectedSubCategory as keyof typeof pack.assets];
                              if (categoryOptions) {
                                availableOptions.push(...categoryOptions.map(option => ({ option, pack: packKey })));
                              }
                            });

                            return availableOptions.map(({ option, pack }, index) => (
                              <div
                                key={`${pack}-${option}`}
                                className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                  selectedOptions[selectedSubCategory as keyof typeof selectedOptions] === option
                                    ? 'border-black bg-gray-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => handleOptionSelect(selectedSubCategory, option)}
                              >
                                <div className="w-full h-20 bg-gray-200 rounded mb-2 flex items-center justify-center">
                                  <span className="text-xs text-gray-500">{option}</span>
                                </div>
                                <p className="text-sm font-medium capitalize">{option.replace(/_/g, ' ')}</p>
                                <p className="text-xs text-gray-500">{studioPacks[pack as keyof typeof studioPacks].name}</p>
                              </div>
                            ));
                          })()}
                          
                          {/* Show locked options from unowned packs */}
                          {Object.entries(studioPacks).map(([packKey, pack]) => {
                            if (ownedStudioPacks.includes(packKey)) return null;
                            const categoryOptions = pack.assets[selectedSubCategory as keyof typeof pack.assets];
                            if (!categoryOptions) return null;

                            return categoryOptions.slice(0, 2).map(option => (
                              <div
                                key={`locked-${packKey}-${option}`}
                                className="p-3 border-2 border-gray-200 rounded-lg opacity-60 cursor-pointer hover:opacity-80 transition-all"
                              >
                                <div className="w-full h-20 bg-gray-200 rounded mb-2 flex items-center justify-center relative">
                                  <Lock size={16} className="text-gray-400" />
                                </div>
                                <p className="text-sm font-medium capitalize">{option.replace(/_/g, ' ')}</p>
                                <div className="flex items-center justify-between mt-1">
                                  <p className="text-xs text-gray-500">{pack.name}</p>
                                  <button className="text-xs text-blue-600 hover:text-blue-700">
                                    ${pack.price}
                                  </button>
                                </div>
                              </div>
                            ));
                          })}
                        </div>
                      </div>

                      {/* Option Settings */}
                      <div>
                        <h4 className="font-medium mb-3">Adjust Settings</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Color Setting */}
                          <div>
                            <label className="block text-sm font-medium mb-2">Color</label>
                            <div className="flex gap-2">
                              <input
                                type="color"
                                className="h-10 w-16 border border-gray-200 rounded cursor-pointer"
                                onChange={(e) => handleSettingChange(selectedSubCategory, 'color', e.target.value)}
                              />
                              <input
                                type="text"
                                placeholder="#000000"
                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                              />
                            </div>
                          </div>

                          {/* Scale Setting */}
                          <div>
                            <label className="block text-sm font-medium mb-2">Scale</label>
                            <input
                              type="range"
                              min="80"
                              max="120"
                              defaultValue="100"
                              className="w-full"
                              onChange={(e) => handleSettingChange(selectedSubCategory, 'scale', e.target.value)}
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>80%</span>
                              <span>100%</span>
                              <span>120%</span>
                            </div>
                          </div>

                          {/* Position Setting */}
                          <div>
                            <label className="block text-sm font-medium mb-2">Position</label>
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="range"
                                min="-10"
                                max="10"
                                defaultValue="0"
                                className="w-full"
                                onChange={(e) => handleSettingChange(selectedSubCategory, 'x', e.target.value)}
                              />
                              <input
                                type="range"
                                min="-10"
                                max="10"
                                defaultValue="0"
                                className="w-full"
                                onChange={(e) => handleSettingChange(selectedSubCategory, 'y', e.target.value)}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>X-axis</span>
                              <span>Y-axis</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'colors' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <Palette size={18} />
                          Brand Colors
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Primary Color</label>
                            <div className="flex gap-3">
                              <input
                                type="color"
                                value={primaryColor}
                                onChange={(e) => setPrimaryColor(e.target.value)}
                                className="h-10 w-20 border border-gray-200 rounded cursor-pointer"
                              />
                              <input
                                type="text"
                                value={primaryColor}
                                onChange={(e) => setPrimaryColor(e.target.value)}
                                className="flex-1 p-2 border border-gray-200 rounded-lg"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Accent Color</label>
                            <div className="flex gap-3">
                              <input
                                type="color"
                                value={accentColor}
                                onChange={(e) => setAccentColor(e.target.value)}
                                className="h-10 w-20 border border-gray-200 rounded cursor-pointer"
                              />
                              <input
                                type="text"
                                value={accentColor}
                                onChange={(e) => setAccentColor(e.target.value)}
                                className="flex-1 p-2 border border-gray-200 rounded-lg"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <Image size={18} />
                          Logo & Branding
                        </h3>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                          <Image size={32} className="mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-600 mb-2">Drop your logo here or click to browse</p>
                          <button className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200">
                            Upload Logo
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'chat' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <Monitor size={18} />
                          Chat Widget Theme
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                          {['modern', 'classic', 'minimal'].map((theme) => (
                            <button
                              key={theme}
                              onClick={() => setChatTheme(theme)}
                              className={`p-4 border-2 rounded-lg transition-all ${
                                chatTheme === theme 
                                  ? 'border-black bg-gray-50' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="bg-gray-200 rounded h-20 mb-2" />
                              <p className="text-sm font-medium capitalize">{theme}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <Type size={18} />
                          Typography
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Font Family</label>
                            <select className="w-full p-2 border border-gray-200 rounded-lg">
                              <option>Inter</option>
                              <option>Roboto</option>
                              <option>Open Sans</option>
                              <option>Lato</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Message Style</label>
                            <select className="w-full p-2 border border-gray-200 rounded-lg">
                              <option>Chat Bubbles</option>
                              <option>Cards</option>
                              <option>Minimal</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <Smartphone size={18} />
                          Widget Position
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <button className="p-4 border-2 border-black rounded-lg bg-gray-50">
                            <p className="text-sm font-medium">Bottom Right</p>
                          </button>
                          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300">
                            <p className="text-sm font-medium">Bottom Left</p>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6">
                <h3 className="font-semibold mb-4">Live Preview</h3>
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
                    <div className="flex items-center gap-3 mb-3">
                      <img 
                        src={bot.image} 
                        alt={bot.name}
                        className="w-8 h-8 rounded-full"
                        style={{ borderColor: primaryColor, borderWidth: 2 }}
                      />
                      <span className="font-medium">{bot.name}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="bg-gray-100 rounded-lg p-2 max-w-[80%]">
                        <p className="text-sm">Hello! How can I help you today?</p>
                      </div>
                      <div 
                        className="text-white rounded-lg p-2 max-w-[80%] ml-auto"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <p className="text-sm">I have a question about your product</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <button 
                      className="px-4 py-2 text-white rounded-full text-sm"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Start Conversation
                    </button>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900 font-medium mb-1">Pro Tip</p>
                  <p className="text-sm text-blue-700">
                    Keep your mascot's appearance consistent with your brand identity for better recognition.
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