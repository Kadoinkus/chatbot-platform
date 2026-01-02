"use client";
import { useState, useEffect, use } from "react";
import { getClientById } from '@/lib/dataService';
import { useCart } from '@/contexts/CartContext';
import { Star, Zap, MessageCircle, Heart, ShoppingCart, CheckCircle, Plus, Search } from 'lucide-react';
import type { Client } from '@/lib/dataService';
import {
  Page,
  PageContent,
  PageHeader,
  Button,
  Input,
  Card,
  Spinner,
  EmptyState,
} from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { canAccessFeature } from '@/config/featureAccess';

type BotTemplate = {
  id: string;
  name: string;
  appearance: string;
  studio: string;
  description: string;
  image: string;
  rating: number;
  reviews: number;
  animations: number;
  expressions: number;
  features: string[];
  price: 'Free' | number;
  popular: boolean;
  new: boolean;
};

const botTemplates: BotTemplate[] = [
  {
    id: 'template-1',
    name: 'Maya Professional',
    appearance: 'Humanoid',
    studio: 'Notso (In-house)',
    description: 'Elegant humanoid mascot with professional business attire and warm expressions',
    image: '/images/marketplace/mascots/maya-professional.png',
    rating: 4.8,
    reviews: 2847,
    animations: 35,
    expressions: 24,
    features: ['Business Attire', '24 Expressions', 'Hand Gestures', '4K Textures'],
    price: 'Free',
    popular: true,
    new: false
  },
  {
    id: 'template-2',
    name: 'Zara Blob Companion',
    appearance: 'Blob',
    studio: 'Berlin Studio',
    description: 'Friendly blob mascot with smooth morphing animations and playful expressions',
    image: '/images/marketplace/mascots/zara-blob-companion.png',
    rating: 4.9,
    reviews: 1923,
    animations: 28,
    expressions: 16,
    features: ['Morphing Animations', 'Bounce Physics', 'Color Shifting', 'Cute Expressions'],
    price: 39,
    popular: true,
    new: false
  },
  {
    id: 'template-3',
    name: 'Geometric Navigator',
    appearance: 'Geometric',
    studio: 'Notso (In-house)',
    description: 'Abstract geometric mascot with crystalline structure and dynamic transformations',
    image: '/images/marketplace/mascots/geometric-navigator.png',
    rating: 4.7,
    reviews: 3421,
    animations: 42,
    expressions: 12,
    features: ['Crystal Transforms', 'Light Refraction', 'Faceted Design', 'Holographic Effects'],
    price: 'Free',
    popular: false,
    new: false
  },
  {
    id: 'template-4',
    name: 'Rex the Retriever',
    appearance: 'Animal (4-legged)',
    studio: 'Animation Works',
    description: 'Adorable golden retriever mascot with realistic fur and tail wagging animations',
    image: '/images/marketplace/mascots/rex-the-retriever.png',
    rating: 4.6,
    reviews: 892,
    animations: 22,
    expressions: 18,
    features: ['Fur Physics', 'Tail Wagging', 'Panting Animation', 'Playful Gestures'],
    price: 25,
    popular: false,
    new: true
  },
  {
    id: 'template-5',
    name: 'Phoenix the Firebird',
    appearance: 'Fantasy',
    studio: 'Pixel Dreams',
    description: 'Majestic phoenix with flame particles and soaring flight animations',
    image: '/images/marketplace/mascots/phoenix-the-firebird.png',
    rating: 4.9,
    reviews: 1567,
    animations: 31,
    expressions: 20,
    features: ['Particle Effects', 'Wing Flapping', 'Fire Trails', 'Mythical Presence'],
    price: 49,
    popular: false,
    new: true
  },
  {
    id: 'template-6',
    name: 'Pip the Penguin',
    appearance: 'Animal (2-legged)',
    studio: 'Creative Labs',
    description: 'Cheerful penguin mascot with sliding animations and winter-themed expressions',
    image: '/images/marketplace/mascots/pip-the-penguin.png',
    rating: 4.8,
    reviews: 2156,
    animations: 45,
    expressions: 26,
    features: ['Ice Sliding', 'Flipper Gestures', 'Snow Effects', 'Waddle Walk'],
    price: 35,
    popular: true,
    new: false
  },
  {
    id: 'template-7',
    name: 'Orion Mech Unit',
    appearance: 'Robot/Mech',
    studio: 'Digital Mascots Co',
    description: 'Futuristic robot mascot with LED displays and mechanical transformation sequences',
    image: '/images/marketplace/mascots/orion-mech-unit.png',
    rating: 4.5,
    reviews: 743,
    animations: 26,
    expressions: 14,
    features: ['LED Displays', 'Mechanical Sounds', 'Transformation', 'Holographic UI'],
    price: 19,
    popular: false,
    new: false
  },
  {
    id: 'template-8',
    name: 'Flux Abstract Form',
    appearance: 'Abstract',
    studio: 'Berlin Studio',
    description: 'Flowing abstract mascot with liquid-like movements and color-shifting properties',
    image: '/images/marketplace/mascots/flux-abstract-form.png',
    rating: 4.7,
    reviews: 1834,
    animations: 38,
    expressions: 10,
    features: ['Fluid Dynamics', 'Color Morphing', 'Abstract Forms', 'Particle Systems'],
    price: 32,
    popular: false,
    new: true
  }
];

const appearanceTypes = [
  'All Types',
  'Humanoid',
  'Blob',
  'Abstract',
  'Animal (4-legged)',
  'Animal (2-legged)',
  'Robot/Mech',
  'Fantasy',
  'Geometric'
];

const studioFilters = [
  'All Studios',
  'Notso (In-house)',
  'Berlin Studio',
  'Animation Works',
  'Pixel Dreams',
  'Creative Labs',
  'Digital Mascots Co'
];

const pricingFilters = [
  'All Pricing',
  'Free',
  'Premium'
];

export default function MarketplacePage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = use(params);
  const [client, setClient] = useState<Client | undefined>();
  const [loading, setLoading] = useState(true);
  const [selectedAppearance, setSelectedAppearance] = useState('All Types');
  const [selectedStudio, setSelectedStudio] = useState('All Studios');
  const [selectedPricing, setSelectedPricing] = useState('All Pricing');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());

  const { addItem } = useCart();
  const { session, isLoading } = useAuth();
  const canViewMarketplace = canAccessFeature('marketplace', { role: session?.role, isSuperadmin: session?.isSuperadmin });
  const canUseCart = canAccessFeature('cart', { role: session?.role, isSuperadmin: session?.isSuperadmin });

  useEffect(() => {
    if (!canViewMarketplace) {
      setLoading(false);
      return;
    }
    async function loadData() {
      try {
        const clientData = await getClientById(clientId);
        setClient(clientData);
      } catch (error) {
        console.error('Error loading client:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [clientId, canViewMarketplace]);

  const filteredTemplates = botTemplates.filter(template => {
    const matchesAppearance = selectedAppearance === 'All Types' || template.appearance === selectedAppearance;
    const matchesStudio = selectedStudio === 'All Studios' || template.studio === selectedStudio;
    const matchesPricing = selectedPricing === 'All Pricing' ||
      (selectedPricing === 'Free' && template.price === 'Free') ||
      (selectedPricing === 'Premium' && template.price !== 'Free');
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAppearance && matchesStudio && matchesPricing && matchesSearch;
  });

  if (!isLoading && !canViewMarketplace) {
    return (
      <Page>
        <PageContent>
          <EmptyState
            icon={<Store size={48} />}
            title="Marketplace coming soon"
            message="This section is only visible to superadmins while we finish it."
          />
        </PageContent>
      </Page>
    );
  }

  if (loading) {
    return (
      <Page className="flex items-center justify-center">
        <Spinner size="lg" />
      </Page>
    );
  }

  if (!client) {
    return (
      <Page>
        <PageContent>
          <EmptyState
            icon={<MessageCircle size={48} />}
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
              title="3D Mascot Marketplace"
              description="Choose from our collection of animated 3D mascots for your chatbots"
            />

            {/* Search and Filters */}
            <div className="space-y-4 mb-6">
              {/* Search Bar */}
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex-1 max-w-md">
                  <Input
                    icon={<Search size={20} />}
                    placeholder="Search 3D mascot templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Filter Categories */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Appearance Filter */}
                <div>
                  <label className="block text-sm font-medium text-foreground-secondary mb-2">Appearance</label>
                  <div className="flex gap-2 flex-wrap">
                    {appearanceTypes.map(type => (
                      <button
                        key={type}
                        onClick={() => setSelectedAppearance(type)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedAppearance === type
                            ? 'bg-info-600 text-white'
                            : 'bg-background-tertiary text-foreground-secondary hover:bg-background-hover'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Studio Filter */}
                <div>
                  <label className="block text-sm font-medium text-foreground-secondary mb-2">Studio</label>
                  <div className="flex gap-2 flex-wrap">
                    {studioFilters.map(studio => (
                      <button
                        key={studio}
                        onClick={() => setSelectedStudio(studio)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedStudio === studio
                            ? 'bg-success-600 text-white'
                            : 'bg-background-tertiary text-foreground-secondary hover:bg-background-hover'
                        }`}
                      >
                        {studio}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pricing Filter */}
                <div>
                  <label className="block text-sm font-medium text-foreground-secondary mb-2">Pricing</label>
                  <div className="flex gap-2 flex-wrap">
                    {pricingFilters.map(pricing => (
                      <button
                        key={pricing}
                        onClick={() => setSelectedPricing(pricing)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedPricing === pricing
                            ? 'bg-plan-premium-text text-white'
                            : 'bg-background-tertiary text-foreground-secondary hover:bg-background-hover'
                        }`}
                      >
                        {pricing}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Template Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {filteredTemplates.map(template => (
                <Card key={template.id} hover padding="none" className="overflow-hidden flex flex-col h-full">
                  {/* Header with badges */}
                  <div className="relative">
                    <div className="absolute top-3 left-3 flex gap-2 z-10">
                      {template.popular && (
                        <span className="bg-gradient-to-r from-warning-500 to-error-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          Popular
                        </span>
                      )}
                      {template.new && (
                        <span className="bg-gradient-to-r from-success-500 to-info-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          New
                        </span>
                      )}
                    </div>

                    {/* Large Avatar */}
                    <div className="p-6 pt-10">
                      <div className="w-20 h-20 mx-auto">
                        <img
                          src={template.image}
                          alt={template.name}
                          className="w-full h-full rounded-full bg-background-tertiary border-4 border-surface-elevated shadow-lg"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 pt-2 flex-1 flex flex-col">
                    {/* Top Content */}
                    <div className="flex-1">
                      <div className="text-center mb-3">
                        <h3 className="font-bold text-lg text-foreground mb-1">{template.name}</h3>
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <span className="text-xs bg-info-100 dark:bg-info-700/30 text-info-700 dark:text-info-500 px-2 py-1 rounded">{template.appearance}</span>
                          <span className="text-xs bg-success-100 dark:bg-success-700/30 text-success-700 dark:text-success-500 px-2 py-1 rounded">{template.studio}</span>
                        </div>
                        <p className="text-sm text-foreground-secondary line-clamp-2">{template.description}</p>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center justify-center gap-1 mb-3">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              className={`${
                                i < Math.floor(template.rating)
                                  ? 'text-warning-500 fill-current'
                                  : 'text-foreground-tertiary'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-foreground">{template.rating}</span>
                        <span className="text-xs text-foreground-tertiary">({template.reviews.toLocaleString()})</span>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="flex items-center gap-1 text-xs">
                          <Zap size={12} className="text-info-500" />
                          <span className="text-foreground-secondary">{template.animations} animations</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <Heart size={12} className="text-error-500" />
                          <span className="text-foreground-secondary">{template.expressions} expressions</span>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {template.features.slice(0, 2).map(feature => (
                            <span key={feature} className="px-2 py-0.5 bg-background-tertiary text-foreground-secondary text-xs rounded-full">
                              {feature}
                            </span>
                          ))}
                          {template.features.length > 2 && (
                            <span className="text-xs text-foreground-tertiary">
                              +{template.features.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Price and Action - Always at bottom */}
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div>
                        {template.price === 'Free' ? (
                          <span className="text-lg font-bold text-success-600 dark:text-success-500">Free</span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className="text-lg font-bold text-foreground">€{template.price}</span>
                            <span className="text-sm text-foreground-tertiary">/month</span>
                          </div>
                        )}
                      </div>
                      {addedItems.has(template.id) ? (
                        <Button size="sm" disabled className="bg-success-600">
                          <CheckCircle size={14} />
                          Added
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          icon={template.price === 'Free' ? <Plus size={14} /> : <ShoppingCart size={14} />}
                          onClick={() => {
                            if (!canUseCart) return;
                            addItem({
                              id: template.id,
                              type: 'template',
                              name: template.name,
                              description: template.description,
                              price: template.price,
                              image: template.image,
                              originalData: template
                            });
                            setAddedItems(prev => new Set(prev).add(template.id));
                            setTimeout(() => {
                              setAddedItems(prev => {
                                const newSet = new Set(prev);
                                newSet.delete(template.id);
                                return newSet;
                              });
                            }, 2000);
                          }}
                        >
                          {template.price === 'Free' ? 'Install' : 'Add to Cart'}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <EmptyState
                icon={<MessageCircle size={48} />}
                title="No templates found"
                message="Try adjusting your search or filter criteria"
              />
            )}
      </PageContent>
    </Page>
  );
}
