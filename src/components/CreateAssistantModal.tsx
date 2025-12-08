'use client';
import { useState } from 'react';
import { Upload, Bot, Zap, MessageSquare } from 'lucide-react';
import Modal from './Modal';

interface CreateAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (assistantData: any) => void;
}

export default function CreateAssistantModal({ isOpen, onClose, onCreate }: CreateAssistantModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    personality: 'professional',
    category: 'customer-service',
    avatar: '',
    welcomeMessage: '',
    fallbackMessage: "I&apos;m not sure I understand. Could you please rephrase that?",
    language: 'english'
  });

  const personalities = [
    { id: 'professional', name: 'Professional', desc: 'Formal and business-focused' },
    { id: 'friendly', name: 'Friendly', desc: 'Warm and approachable' },
    { id: 'casual', name: 'Casual', desc: 'Relaxed and conversational' },
    { id: 'playful', name: 'Playful', desc: 'Fun and energetic' }
  ];

  const categories = [
    { id: 'customer-service', name: 'Customer Service', icon: MessageSquare, desc: 'Handle support inquiries' },
    { id: 'sales', name: 'Sales Assistant', icon: Zap, desc: 'Generate leads and sales' },
    { id: 'technical', name: 'Technical Support', icon: Bot, desc: 'Provide technical help' },
    { id: 'general', name: 'General Purpose', icon: MessageSquare, desc: 'Multi-purpose assistant' }
  ];

  const handleSubmit = () => {
    onCreate({
      ...formData,
      id: `assistant_${Date.now()}`,
      status: 'Draft',
      conversations: 0,
      image: formData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`
    });
    onClose();
    setCurrentStep(1);
    setFormData({
      name: '',
      description: '',
      personality: 'professional',
      category: 'customer-service',
      avatar: '',
      welcomeMessage: '',
      fallbackMessage: "I&apos;m not sure I understand. Could you please rephrase that?",
      language: 'english'
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Create AI Assistant - Step ${currentStep} of 3`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Progress Bar */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map(step => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step ? 'bg-interactive-primary text-background dark:text-background' : 'bg-background-tertiary text-foreground-secondary'
              }`}>
                {step}
              </div>
              {step < 3 && (
                <div className={`w-16 h-0.5 ${currentStep > step ? 'bg-interactive-primary' : 'bg-background-tertiary'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground-secondary mb-2">Assistant Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Customer Support Assistant"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-border-focus bg-background text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground-secondary mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe what this assistant does..."
                rows={3}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-border-focus bg-background text-foreground resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground-secondary mb-3">Category</label>
              <div className="grid grid-cols-2 gap-3">
                {categories.map(category => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setFormData({...formData, category: category.id})}
                      className={`p-4 border-2 rounded-lg text-left transition-colors ${
                        formData.category === category.id
                          ? 'border-interactive-primary bg-interactive-primary text-background dark:text-background'
                          : 'border-border hover:border-border-secondary text-foreground'
                      }`}
                    >
                      <Icon size={24} className="mb-2" />
                      <h3 className="font-medium">{category.name}</h3>
                      <p className="text-sm opacity-80">{category.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground-secondary mb-2">Avatar</label>
              <div className="flex items-center gap-4">
                {formData.avatar && (
                  <img
                    src={formData.avatar}
                    alt="Assistant avatar"
                    className="w-16 h-16 rounded-full"
                  />
                )}
                <button className="flex items-center gap-2 px-4 py-2 border border-border-secondary rounded-lg hover:bg-background-hover text-foreground">
                  <Upload size={16} />
                  Upload Image
                </button>
                <span className="text-sm text-foreground-tertiary">Or leave empty for auto-generated avatar</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Personality */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground-secondary mb-3">Personality</label>
              <div className="grid grid-cols-2 gap-3">
                {personalities.map(personality => (
                  <button
                    key={personality.id}
                    onClick={() => setFormData({...formData, personality: personality.id})}
                    className={`p-4 border-2 rounded-lg text-left transition-colors ${
                      formData.personality === personality.id
                        ? 'border-interactive-primary bg-interactive-primary text-background dark:text-background'
                        : 'border-border hover:border-border-secondary text-foreground'
                    }`}
                  >
                    <h3 className="font-medium">{personality.name}</h3>
                    <p className="text-sm opacity-80">{personality.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground-secondary mb-2">Welcome Message</label>
              <textarea
                value={formData.welcomeMessage}
                onChange={(e) => setFormData({...formData, welcomeMessage: e.target.value})}
                placeholder={`Hi! I&apos;m ${formData.name || 'your assistant'}. How can I help you today?`}
                rows={3}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-border-focus bg-background text-foreground resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground-secondary mb-2">Fallback Message</label>
              <textarea
                value={formData.fallbackMessage}
                onChange={(e) => setFormData({...formData, fallbackMessage: e.target.value})}
                rows={3}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-border-focus bg-background text-foreground resize-none"
              />
              <p className="text-sm text-foreground-tertiary mt-1">Message shown when the assistant doesn't understand</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground-secondary mb-2">Language</label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({...formData, language: e.target.value})}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-border-focus bg-background text-foreground"
              >
                <option value="english">English</option>
                <option value="spanish">Spanish</option>
                <option value="french">French</option>
                <option value="german">German</option>
                <option value="dutch">Dutch</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="bg-background-tertiary rounded-lg p-6">
              <h3 className="font-semibold mb-4 text-foreground">Review Your AI Assistant</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <img
                    src={formData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`}
                    alt="Assistant avatar"
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h4 className="font-medium text-foreground">{formData.name}</h4>
                    <p className="text-sm text-foreground-secondary">{formData.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div>
                    <p className="text-sm text-foreground-secondary">Category</p>
                    <p className="font-medium capitalize text-foreground">{categories.find(c => c.id === formData.category)?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground-secondary">Personality</p>
                    <p className="font-medium capitalize text-foreground">{personalities.find(p => p.id === formData.personality)?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground-secondary">Language</p>
                    <p className="font-medium capitalize text-foreground">{formData.language}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-info-50 dark:bg-info-900/30 rounded-lg">
              <h4 className="font-medium text-info-900 dark:text-info-300 mb-2">What happens next?</h4>
              <ul className="text-sm text-info-700 dark:text-info-400 space-y-1">
                <li>• Your AI assistant will be created with "Draft" status</li>
                <li>• You can add knowledge base content and train responses</li>
                <li>• Test conversations before activating the agent</li>
                <li>• Configure integrations and channels</li>
              </ul>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t border-border">
          <button
            onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : onClose()}
            className="px-4 py-2 border border-border rounded-lg hover:bg-background-hover text-foreground"
          >
            {currentStep === 1 ? 'Cancel' : 'Previous'}
          </button>

          <button
            onClick={() => {
              if (currentStep < 3) {
                setCurrentStep(currentStep + 1);
              } else {
                handleSubmit();
              }
            }}
            disabled={currentStep === 1 && !formData.name}
            className="px-6 py-2 bg-interactive-primary text-background dark:text-background rounded-lg hover:bg-interactive-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentStep === 3 ? 'Create AI Assistant' : 'Next'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
