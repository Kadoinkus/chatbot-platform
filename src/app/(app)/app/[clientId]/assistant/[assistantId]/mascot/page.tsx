"use client";
import { getClientById, getAssistantById } from '@/lib/dataService';
import { useState, useEffect, use } from "react";
import StatusBadge from '@/components/StatusBadge';
import { ArrowLeft, Palette, Sparkles, Image, Type, Monitor, Smartphone, User, Eye, Smile, ShirtIcon as Shirt, HardHat, ShoppingCart, Lock, Crown, Zap, Package, Bot as BotIcon } from 'lucide-react';
import Link from 'next/link';
import type { Client, Assistant } from '@/lib/dataService';
import { getMascotColor } from '@/lib/brandColors';
import { useCart } from '@/contexts/CartContext';
import { Page, PageContent, PageHeader, Card, Button, Input, Select, Modal, Spinner, EmptyState } from '@/components/ui';

export default function MascotStudioPage({ params }: { params: Promise<{ clientId: string; assistantId: string }> }) {
  const { clientId, assistantId } = use(params);
  const [client, setClient] = useState<Client | undefined>();
  const [assistant, setAssistant] = useState<Assistant | undefined>();
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
  const [showPackSelector, setShowPackSelector] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState('');
  const { addItem, toggleCart } = useCart();

  useEffect(() => {
    async function loadData() {
      try {
        const [clientData, assistantData] = await Promise.all([
          getClientById(clientId),
          getAssistantById(assistantId, clientId)
        ]);
        setClient(clientData);
        setAssistant(assistantData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [clientId, assistantId]);

  if (loading) {
    return (
      <Page className="flex items-center justify-center">
        <Spinner size="lg" />
      </Page>
    );
  }

  if (!client || !assistant) {
    return (
      <Page>
        <PageContent>
          <EmptyState
            icon={<BotIcon size={48} />}
            title="AI Assistant not found"
            message="The requested AI assistant could not be found."
          />
        </PageContent>
      </Page>
    );
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
    setOptionSettings(prev => {
      const key = `${category}_${selectedOptions[category as keyof typeof selectedOptions]}`;
      const existing = prev[key as keyof typeof prev] || {};
      return {
        ...prev,
        [key]: {
          ...(typeof existing === 'object' ? existing : {}),
          [setting]: value
        }
      };
    });
  };

  const handlePurchaseStudioPack = (packKey: string) => {
    const pack = studioPacks[packKey as keyof typeof studioPacks];
    if (!pack || pack.price === 0) return;

    // Add to cart
    addItem({
      id: `studio-pack-${packKey}`,
      type: 'addon',
      name: pack.name,
      description: pack.description,
      price: pack.price,
      image: '', // You might want to add image URLs to your studioPacks data
      category: 'Studio Pack',
      originalData: { packKey, type: 'studio-pack' }
    });

    // Mark as owned (simulate purchase)
    setOwnedStudioPacks(prev => [...prev, packKey]);

    // Close any open modals/prompts
    setShowUpgradePrompt('');
    setShowPackSelector(false);

    // Open cart to show the addition
    toggleCart();
  };

  return (
    <Page>
      <PageContent>
          <PageHeader
            title={assistant.name}
            description="Customize appearance and chat interface"
            backLink={
              <Link
                href={`/app/${client.slug}`}
                className="inline-flex items-center gap-2 text-foreground-secondary hover:text-foreground"
              >
                <ArrowLeft size={16} />
                Back to AI Assistants
              </Link>
            }
          />

          {/* AI Assistant Header */}
          <Card className="mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={assistant.image}
                  alt={assistant.name}
                  className="w-16 h-16 rounded-full"
                  style={{ backgroundColor: getMascotColor(assistant.id, assistant.clientId, 'primary', assistant.colors, client.brandColors) }}
                />
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl font-bold text-foreground">{assistant.name}</h1>
                    <StatusBadge status={assistant.status} />
                  </div>
                  <p className="text-foreground-secondary mb-1">Customize appearance and chat interface</p>
                  <p className="text-sm text-foreground-tertiary">Client: {client.name}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="secondary">
                  Preview
                </Button>
                <Button>
                  Save Changes
                </Button>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="p-0">
                <div className="border-b border-border">
                  <div className="flex gap-6 p-6">
                    <button
                      onClick={() => setActiveTab('appearance')}
                      className={`pb-2 px-1 font-medium transition-colors relative ${
                        activeTab === 'appearance'
                          ? 'text-foreground border-b-2 border-foreground'
                          : 'text-foreground-secondary hover:text-foreground'
                      }`}
                    >
                      3D Mascot
                    </button>
                    <button
                      onClick={() => setActiveTab('colors')}
                      className={`pb-2 px-1 font-medium transition-colors relative ${
                        activeTab === 'colors'
                          ? 'text-foreground border-b-2 border-foreground'
                          : 'text-foreground-secondary hover:text-foreground'
                      }`}
                    >
                      Colors & Branding
                    </button>
                    <button
                      onClick={() => setActiveTab('chat')}
                      className={`pb-2 px-1 font-medium transition-colors relative ${
                        activeTab === 'chat'
                          ? 'text-foreground border-b-2 border-foreground'
                          : 'text-foreground-secondary hover:text-foreground'
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
                        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                          <Sparkles size={18} />
                          Current Template
                        </h3>
                        <div className="p-4 border border-border rounded-lg bg-surface-elevated">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-info-500 to-plan-premium-text rounded-lg"></div>
                              <div>
                                <h4 className="font-medium text-foreground">{mascotTemplates[selectedTemplate as keyof typeof mascotTemplates].name}</h4>
                                <p className="text-sm text-foreground-secondary">{mascotTemplates[selectedTemplate as keyof typeof mascotTemplates].type}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-semibold text-foreground">${mascotTemplates[selectedTemplate as keyof typeof mascotTemplates].price}</p>
                              <p className="text-sm text-success-600 dark:text-success-500">✓ Owned</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Active Studio Pack Indicator */}
                      <div>
                        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                          <Package size={18} />
                          Active Style Pack
                        </h3>
                        <div className="p-3 border border-border rounded-lg bg-background-secondary flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{studioPacks[selectedSubTemplate as keyof typeof studioPacks].icon}</span>
                            <div>
                              <h4 className="font-medium text-foreground">{studioPacks[selectedSubTemplate as keyof typeof studioPacks].name}</h4>
                              <p className="text-xs text-foreground-secondary">
                                {studioPacks[selectedSubTemplate as keyof typeof studioPacks].price === 0 ? 'Included with template' : `$${studioPacks[selectedSubTemplate as keyof typeof studioPacks].price} • Active for all customizations`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {studioPacks[selectedSubTemplate as keyof typeof studioPacks].price === 0 ? (
                              <span className="px-2 py-1 bg-success-100 dark:bg-success-700/30 text-success-700 dark:text-success-500 rounded-full text-xs font-medium">
                                FREE
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-info-100 dark:bg-info-700/30 text-info-700 dark:text-info-500 rounded-full text-xs font-medium">
                                ${studioPacks[selectedSubTemplate as keyof typeof studioPacks].price}
                              </span>
                            )}
                            <button
                              onClick={() => setShowPackSelector(!showPackSelector)}
                              className="px-3 py-1 text-sm text-info-600 dark:text-info-500 hover:text-info-700 dark:hover:text-info-400 font-medium"
                            >
                              Change
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* 3D Preview */}
                      <div className="bg-background-tertiary rounded-lg p-8 text-center">
                        <div className="w-48 h-48 bg-gradient-to-br from-foreground-tertiary/30 to-foreground-tertiary/50 rounded-lg mx-auto mb-4 flex items-center justify-center">
                          <div className="text-center text-foreground-secondary">
                            <User size={48} className="mx-auto mb-2" />
                            <p className="text-sm">3D Model Preview</p>
                            <p className="text-xs text-foreground-tertiary">Template: {mascotTemplates[selectedTemplate as keyof typeof mascotTemplates].name}</p>
                          </div>
                        </div>
                      </div>

                      {/* Customization Categories */}
                      <div>
                        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
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
                                    ? 'border-interactive bg-background-secondary'
                                    : 'border-border hover:border-border-secondary'
                                }`}
                              >
                                <Icon size={24} className="mx-auto mb-2 text-foreground" />
                                <p className="text-sm font-medium text-foreground">{category.name}</p>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Sub-Category Navigation */}
                      {customizationCategories[activeCustomizationTab as keyof typeof customizationCategories]?.subCategories.length > 1 && (
                        <div>
                          <h4 className="font-medium text-foreground mb-3">Select Part</h4>
                          <div className="flex gap-2 overflow-x-auto pb-2">
                            {customizationCategories[activeCustomizationTab as keyof typeof customizationCategories].subCategories.map((subCat) => (
                              <button
                                key={subCat}
                                onClick={() => setSelectedSubCategory(subCat)}
                                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                                  selectedSubCategory === subCat
                                    ? 'bg-interactive text-foreground-inverse'
                                    : 'bg-background-tertiary text-foreground-secondary hover:bg-background-hover'
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
                        <h4 className="font-medium text-foreground mb-3">Choose Style</h4>
                        <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                          {(() => {
                            const availableOptions: { option: string; pack: string }[] = [];
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
                                    ? 'border-interactive bg-background-secondary'
                                    : 'border-border hover:border-border-secondary'
                                }`}
                                onClick={() => handleOptionSelect(selectedSubCategory, option)}
                              >
                                <div className="w-full h-20 bg-background-tertiary rounded mb-2 flex items-center justify-center">
                                  <span className="text-xs text-foreground-tertiary">{option}</span>
                                </div>
                                <p className="text-sm font-medium text-foreground capitalize">{option.replace(/_/g, ' ')}</p>
                                <p className="text-xs text-foreground-tertiary">{studioPacks[pack as keyof typeof studioPacks].name}</p>
                              </div>
                            ));
                          })()}

                          {/* Show locked options from unowned packs */}
                          {Object.entries(studioPacks).map(([packKey, pack]) => {
                            if (ownedStudioPacks.includes(packKey)) return null;
                            const categoryOptions = pack.assets[selectedSubCategory as keyof typeof pack.assets];
                            if (!categoryOptions) return null;

                            const previewCount = Math.min(2, categoryOptions.length);

                            return categoryOptions.slice(0, previewCount).map((option, index) => (
                              <div
                                key={`locked-${packKey}-${option}`}
                                className="p-3 border-2 border-dashed border-border rounded-lg opacity-75 cursor-pointer hover:opacity-90 transition-all group"
                                onClick={() => setShowUpgradePrompt(packKey)}
                              >
                                <div className="w-full h-20 bg-gradient-to-br from-background-secondary to-background-tertiary rounded mb-2 flex items-center justify-center relative">
                                  <Lock size={14} className="text-foreground-tertiary" />
                                  <div className="absolute inset-0 bg-surface-overlay rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-xs text-foreground-inverse bg-interactive px-2 py-1 rounded">Preview</span>
                                  </div>
                                </div>
                                <p className="text-sm font-medium capitalize text-foreground-secondary">{option.replace(/_/g, ' ')}</p>
                                <div className="flex items-center justify-between mt-1">
                                  <p className="text-xs text-foreground-tertiary flex items-center gap-1">
                                    <Crown size={10} className="text-warning-500" />
                                    {pack.name}
                                  </p>
                                  {index === previewCount - 1 && categoryOptions.length > previewCount ? (
                                    <span className="text-xs text-info-600 dark:text-info-500">+{categoryOptions.length - previewCount} more</span>
                                  ) : (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handlePurchaseStudioPack(packKey);
                                      }}
                                      className="text-xs text-info-600 dark:text-info-500 hover:text-info-700 dark:hover:text-info-400 font-medium"
                                    >
                                      ${pack.price}
                                    </button>
                                  )}
                                </div>
                              </div>
                            ));
                          })}
                        </div>

                        {/* Contextual upgrade prompt */}
                        {showUpgradePrompt && (
                          <div className="mt-4 p-4 bg-info-100 dark:bg-info-700/30 border border-info-300 dark:border-info-700 rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-info-200 dark:bg-info-600/30 rounded-full flex items-center justify-center flex-shrink-0">
                                  <Crown size={16} className="text-info-600 dark:text-info-500" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-info-900 dark:text-info-300">
                                    Get Premium {selectedSubCategory.charAt(0).toUpperCase() + selectedSubCategory.slice(1)} Styles
                                  </h4>
                                  <p className="text-sm text-info-700 dark:text-info-400 mb-3">
                                    Get {studioPacks[showUpgradePrompt as keyof typeof studioPacks].name} for ${studioPacks[showUpgradePrompt as keyof typeof studioPacks].price} and unlock premium {selectedSubCategory} styles.
                                  </p>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handlePurchaseStudioPack(showUpgradePrompt)}
                                    >
                                      Add to Cart - ${studioPacks[showUpgradePrompt as keyof typeof studioPacks].price}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setShowUpgradePrompt('')}
                                    >
                                      Maybe Later
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => setShowUpgradePrompt('')}
                                className="text-info-400 hover:text-info-600 dark:hover:text-info-300"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Option Settings */}
                      <div>
                        <h4 className="font-medium text-foreground mb-3">Adjust Settings</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Color Setting */}
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Color</label>
                            <div className="flex gap-2">
                              <input
                                type="color"
                                className="h-10 w-16 border border-border rounded cursor-pointer"
                                onChange={(e) => handleSettingChange(selectedSubCategory, 'color', e.target.value)}
                              />
                              <Input
                                placeholder="#000000"
                                className="flex-1 text-sm"
                              />
                            </div>
                          </div>

                          {/* Scale Setting */}
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Scale</label>
                            <input
                              type="range"
                              min="80"
                              max="120"
                              defaultValue="100"
                              className="w-full"
                              onChange={(e) => handleSettingChange(selectedSubCategory, 'scale', e.target.value)}
                            />
                            <div className="flex justify-between text-xs text-foreground-tertiary mt-1">
                              <span>80%</span>
                              <span>100%</span>
                              <span>120%</span>
                            </div>
                          </div>

                          {/* Position Setting */}
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Position</label>
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
                            <div className="flex justify-between text-xs text-foreground-tertiary mt-1">
                              <span>X-axis</span>
                              <span>Y-axis</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Full Studio Pack Selector Modal */}
                      <Modal
                        isOpen={showPackSelector}
                        onClose={() => setShowPackSelector(false)}
                        title="Choose Style Pack"
                        description="Style packs provide themed assets for all customization categories"
                        size="lg"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(studioPacks).map(([key, pack]) => {
                            const isOwned = ownedStudioPacks.includes(key);
                            const isSelected = selectedSubTemplate === key;
                            return (
                              <div
                                key={key}
                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                  isSelected
                                    ? 'border-interactive bg-background-secondary'
                                    : 'border-border hover:border-border-secondary'
                                } ${!isOwned && 'opacity-75'}`}
                                onClick={() => {
                                  if (isOwned) {
                                    setSelectedSubTemplate(key);
                                    setShowPackSelector(false);
                                  }
                                }}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-3">
                                    <span className="text-2xl">{pack.icon}</span>
                                    <div>
                                      <h4 className="font-medium text-foreground flex items-center gap-2">
                                        {pack.name}
                                        {!isOwned && <Lock size={14} className="text-foreground-tertiary" />}
                                      </h4>
                                      <p className="text-sm text-foreground-secondary">{pack.description}</p>
                                      <p className="text-xs text-foreground-tertiary mt-1">
                                        {Object.values(pack.assets).reduce((total, category) =>
                                          total + Object.values(category).reduce((catTotal, subCat) =>
                                            catTotal + subCat.length, 0), 0
                                        )} total assets
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    {pack.price === 0 ? (
                                      <span className="px-2 py-1 bg-success-100 dark:bg-success-700/30 text-success-700 dark:text-success-500 rounded-full text-xs font-medium">
                                        INCLUDED
                                      </span>
                                    ) : (
                                      <div>
                                        <p className="font-semibold text-foreground">${pack.price}</p>
                                        {!isOwned && (
                                          <Button
                                            size="sm"
                                            className="mt-1 w-full"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handlePurchaseStudioPack(key);
                                            }}
                                          >
                                            Add to Cart
                                          </Button>
                                        )}
                                        {isOwned && (
                                          <span className="text-xs text-success-600 dark:text-success-500">✓ Owned</span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </Modal>
                    </div>
                  )}

                  {activeTab === 'colors' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                          <Palette size={18} />
                          Brand Colors
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Primary Color</label>
                            <div className="flex gap-3">
                              <input
                                type="color"
                                value={primaryColor}
                                onChange={(e) => setPrimaryColor(e.target.value)}
                                className="h-10 w-20 border border-border rounded cursor-pointer"
                              />
                              <Input
                                value={primaryColor}
                                onChange={(e) => setPrimaryColor(e.target.value)}
                                className="flex-1"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Accent Color</label>
                            <div className="flex gap-3">
                              <input
                                type="color"
                                value={accentColor}
                                onChange={(e) => setAccentColor(e.target.value)}
                                className="h-10 w-20 border border-border rounded cursor-pointer"
                              />
                              <Input
                                value={accentColor}
                                onChange={(e) => setAccentColor(e.target.value)}
                                className="flex-1"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                          <Image size={18} />
                          Logo & Branding
                        </h3>
                        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                          <Image size={32} className="mx-auto mb-2 text-foreground-tertiary" />
                          <p className="text-sm text-foreground-secondary mb-2">Drop your logo here or click to browse</p>
                          <Button variant="secondary" size="sm">
                            Upload Logo
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'chat' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
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
                                  ? 'border-interactive bg-background-secondary'
                                  : 'border-border hover:border-border-secondary'
                              }`}
                            >
                              <div className="bg-background-tertiary rounded h-20 mb-2" />
                              <p className="text-sm font-medium text-foreground capitalize">{theme}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                          <Type size={18} />
                          Typography
                        </h3>
                        <div className="space-y-4">
                          <Select
                            label="Font Family"
                            options={[
                              { value: 'inter', label: 'Inter' },
                              { value: 'roboto', label: 'Roboto' },
                              { value: 'open-sans', label: 'Open Sans' },
                              { value: 'lato', label: 'Lato' },
                            ]}
                          />
                          <Select
                            label="Message Style"
                            options={[
                              { value: 'bubbles', label: 'Chat Bubbles' },
                              { value: 'cards', label: 'Cards' },
                              { value: 'minimal', label: 'Minimal' },
                            ]}
                          />
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                          <Smartphone size={18} />
                          Widget Position
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <button className="p-4 border-2 border-interactive rounded-lg bg-background-secondary">
                            <p className="text-sm font-medium text-foreground">Bottom Right</p>
                          </button>
                          <button className="p-4 border-2 border-border rounded-lg hover:border-border-secondary">
                            <p className="text-sm font-medium text-foreground">Bottom Left</p>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <h3 className="font-semibold text-foreground mb-4">Live Preview</h3>
                <div className="bg-background-tertiary rounded-lg p-4">
                  <div className="bg-surface-elevated rounded-lg shadow-sm p-4 mb-3">
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={assistant.image}
                        alt={assistant.name}
                        className="w-8 h-8 rounded-full"
                        style={{ borderColor: primaryColor, borderWidth: 2 }}
                      />
                      <span className="font-medium text-foreground">{assistant.name}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="bg-background-tertiary rounded-lg p-2 max-w-[80%]">
                        <p className="text-sm text-foreground">Hello! How can I help you today?</p>
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

                <div className="mt-6 p-4 bg-info-100 dark:bg-info-700/30 rounded-lg">
                  <p className="text-sm text-info-900 dark:text-info-300 font-medium mb-1">Pro Tip</p>
                  <p className="text-sm text-info-700 dark:text-info-400">
                    Keep your mascot's appearance consistent with your brand identity for better recognition.
                  </p>
                </div>
              </Card>
            </div>
        </div>
      </PageContent>
    </Page>
  );
}
