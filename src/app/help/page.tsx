'use client';
import { useState } from 'react';
import {
  HelpCircle, Search, Book, MessageCircle, Bot, Settings,
  CreditCard, Store, BarChart3, Users, ChevronDown, ChevronRight,
  ExternalLink, Mail, Phone, Clock, CheckCircle, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { Page, PageContent, Card, Input, EmptyState } from '@/components/ui';

type HelpCategory = 'getting-started' | 'bots' | 'marketplace' | 'billing' | 'integrations' | 'troubleshooting';

const helpCategories = [
  { id: 'getting-started' as HelpCategory, label: 'Getting Started', icon: Book },
  { id: 'bots' as HelpCategory, label: 'Bot Management', icon: Bot },
  { id: 'marketplace' as HelpCategory, label: 'Marketplace', icon: Store },
  { id: 'billing' as HelpCategory, label: 'Billing & Plans', icon: CreditCard },
  { id: 'integrations' as HelpCategory, label: 'Integrations', icon: Settings },
  { id: 'troubleshooting' as HelpCategory, label: 'Troubleshooting', icon: HelpCircle },
];

const faqData = {
  'getting-started': [
    {
      question: 'How do I create my first bot?',
      answer: 'Navigate to your dashboard and click "Create New Bot". Choose from our marketplace templates or start from scratch. Configure your bot\'s personality in Brain Studio, customize its appearance in Mascot Studio, and deploy it to your website.'
    },
    {
      question: 'What\'s the difference between Brain Studio and Mascot Studio?',
      answer: 'Brain Studio is where you configure your bot\'s personality, knowledge base, and conversation flows. Mascot Studio is where you customize the visual appearance, colors, and chat interface design.'
    },
    {
      question: 'How do I add knowledge to my bot?',
      answer: 'In Brain Studio, go to the Knowledge Base tab. You can upload documents (PDF, DOCX, TXT, CSV), add FAQ entries, or connect to external knowledge sources. The bot will use this information to answer user questions.'
    }
  ],
  'bots': [
    {
      question: 'How many bots can I create?',
      answer: 'The number of bots depends on your plan. Starter plan allows 3 bots, Pro plan allows 10 bots, and Enterprise has unlimited bots. You can upgrade your plan anytime in the billing section.'
    },
    {
      question: 'Can I duplicate an existing bot?',
      answer: 'Yes! Click the three-dot menu on any bot card and select "Duplicate". This copies all settings, knowledge, and appearance to a new bot that you can modify independently.'
    },
    {
      question: 'How do I train my bot with custom responses?',
      answer: 'In Brain Studio, use the Response Templates tab to set up greeting messages, fallback responses, and escalation flows. You can also use the Chatflows tab to create complex conversation paths.'
    }
  ],
  'marketplace': [
    {
      question: 'Are marketplace templates free?',
      answer: 'Some templates are free, while others are premium. Free templates include basic functionality. Premium templates (starting at $19/month) include advanced features, integrations, and specialized knowledge bases.'
    },
    {
      question: 'Can I customize marketplace templates?',
      answer: 'Absolutely! After purchasing a template, you can fully customize it in Brain Studio and Mascot Studio. Templates are starting points that you can modify to fit your specific needs.'
    },
    {
      question: 'What happens after I purchase a template?',
      answer: 'The template is automatically added to your dashboard within 5 minutes. You can then customize its appearance, knowledge base, and personality. All purchases include 30-day money-back guarantee.'
    }
  ],
  'billing': [
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for enterprise customers. All payments are processed securely through Stripe.'
    },
    {
      question: 'How does prepaid credits work?',
      answer: 'Prepaid credits let you pay upfront for bot usage. Add credits to your wallet and they\'re automatically deducted based on conversations, API calls, and features used. Great for predictable budgeting.'
    },
    {
      question: 'Can I change my billing plan?',
      answer: 'Yes, you can upgrade or downgrade your plan anytime. Upgrades take effect immediately. Downgrades take effect at the next billing cycle. You won\'t lose any data when changing plans.'
    }
  ],
  'integrations': [
    {
      question: 'How do I add my bot to my website?',
      answer: 'Copy the JavaScript snippet from your bot\'s settings page and paste it before the closing </body> tag on your website. The chat widget will appear automatically. You can customize the position and appearance in Mascot Studio.'
    },
    {
      question: 'Does the platform have an API?',
      answer: 'Yes! We provide REST APIs for creating bots, sending messages, retrieving conversation history, and managing users. API documentation is available in your dashboard under Integrations.'
    },
    {
      question: 'Can I integrate with my CRM?',
      answer: 'We support integrations with popular CRMs like Salesforce, HubSpot, and Zendesk. Premium plans also include webhook support for custom integrations. Contact our team for specific integration requirements.'
    }
  ],
  'troubleshooting': [
    {
      question: 'My bot isn\'t responding correctly',
      answer: 'Check your bot\'s knowledge base and ensure it has relevant information. Test different phrasings in the Brain Studio playground. If issues persist, review the conversation logs in your analytics dashboard.'
    },
    {
      question: 'The chat widget isn\'t appearing on my website',
      answer: 'Verify the JavaScript snippet is correctly placed before the closing </body> tag. Check browser console for errors. Ensure your website allows JavaScript execution and doesn\'t have conflicting scripts.'
    },
    {
      question: 'I\'m hitting usage limits',
      answer: 'Check your current usage in the billing dashboard. You can increase limits by upgrading your plan or purchasing additional credits. Set up usage alerts to avoid interruptions.'
    }
  ]
};

export default function HelpPage() {
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory>('getting-started');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const currentFaqs = faqData[selectedCategory] || [];
  
  const filteredFaqs = searchQuery 
    ? currentFaqs.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : currentFaqs;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <Page>
        <PageContent>
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/app"
            className="inline-flex items-center gap-2 text-foreground-secondary hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">Help Center</h1>
            <p className="text-xl text-foreground-secondary mb-8">Get answers to your questions and learn how to make the most of our platform</p>

            {/* Search */}
            <div className="max-w-2xl mx-auto">
              <Input
                icon={<Search size={20} />}
                placeholder="Search help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="py-4 text-lg"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <h3 className="font-semibold text-foreground mb-4">Categories</h3>
              <nav className="space-y-2">
                {helpCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-interactive text-foreground-inverse'
                          : 'hover:bg-background-hover text-foreground-secondary'
                      }`}
                    >
                      <Icon size={18} />
                      {category.label}
                    </button>
                  );
                })}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="p-0">
              {/* Category Header */}
              <div className="border-b border-border p-6">
                <div className="flex items-center gap-3">
                  {(() => {
                    const category = helpCategories.find(c => c.id === selectedCategory);
                    const Icon = category?.icon || HelpCircle;
                    return <Icon size={24} className="text-foreground" />;
                  })()}
                  <h2 className="text-2xl font-bold text-foreground">
                    {helpCategories.find(c => c.id === selectedCategory)?.label}
                  </h2>
                </div>
              </div>

              {/* FAQ Content */}
              <div className="p-6">
                {filteredFaqs.length === 0 ? (
                  <EmptyState
                    icon={<HelpCircle size={48} />}
                    title="No results found"
                    message="Try adjusting your search or browse different categories"
                  />
                ) : (
                  <div className="space-y-4">
                    {filteredFaqs.map((faq, index) => (
                      <div key={index} className="border border-border rounded-lg">
                        <button
                          onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-background-hover transition-colors"
                        >
                          <h3 className="font-medium text-foreground pr-4">{faq.question}</h3>
                          {expandedFaq === index ? (
                            <ChevronDown size={20} className="text-foreground-tertiary flex-shrink-0" />
                          ) : (
                            <ChevronRight size={20} className="text-foreground-tertiary flex-shrink-0" />
                          )}
                        </button>
                        {expandedFaq === index && (
                          <div className="px-4 pb-4 border-t border-border">
                            <p className="text-foreground-secondary pt-4">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Quick Actions */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-info-100 dark:bg-info-700/30 rounded-full flex items-center justify-center">
                    <MessageCircle size={24} className="text-info-600 dark:text-info-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Contact Support</h3>
                    <p className="text-sm text-foreground-secondary">Get help from our team</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <a
                    href="mailto:support@example.com"
                    className="flex items-center gap-2 text-foreground-secondary hover:text-foreground transition-colors"
                  >
                    <Mail size={16} />
                    support@example.com
                  </a>
                  <a
                    href="tel:+1234567890"
                    className="flex items-center gap-2 text-foreground-secondary hover:text-foreground transition-colors"
                  >
                    <Phone size={16} />
                    +1 (234) 567-8900
                  </a>
                  <div className="flex items-center gap-2 text-foreground-secondary">
                    <Clock size={16} />
                    Mon-Fri 9AM-6PM EST
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-success-100 dark:bg-success-700/30 rounded-full flex items-center justify-center">
                    <Book size={24} className="text-success-600 dark:text-success-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Documentation</h3>
                    <p className="text-sm text-foreground-secondary">Detailed guides and tutorials</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <a
                    href="#"
                    className="flex items-center justify-between text-foreground-secondary hover:text-foreground transition-colors"
                  >
                    <span>API Documentation</span>
                    <ExternalLink size={16} />
                  </a>
                  <a
                    href="#"
                    className="flex items-center justify-between text-foreground-secondary hover:text-foreground transition-colors"
                  >
                    <span>Integration Guides</span>
                    <ExternalLink size={16} />
                  </a>
                  <a
                    href="#"
                    className="flex items-center justify-between text-foreground-secondary hover:text-foreground transition-colors"
                  >
                    <span>Video Tutorials</span>
                    <ExternalLink size={16} />
                  </a>
                </div>
              </Card>
            </div>

            {/* Status */}
            <Card className="mt-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                <h3 className="font-semibold text-foreground">System Status</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2">
                  <span className="text-foreground-secondary">API Services</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-success-500" />
                    <span className="text-success-600 dark:text-success-500 font-medium">Operational</span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-foreground-secondary">Chat Widgets</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-success-500" />
                    <span className="text-success-600 dark:text-success-500 font-medium">Operational</span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-foreground-secondary">Dashboard</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-success-500" />
                    <span className="text-success-600 dark:text-success-500 font-medium">Operational</span>
                  </div>
                </div>
              </div>
              <a
                href="#"
                className="link inline-flex items-center gap-2 mt-4 text-sm"
              >
                View detailed status
                <ExternalLink size={14} />
              </a>
            </Card>
          </div>
        </div>
        </PageContent>
      </Page>
    </div>
  );
}