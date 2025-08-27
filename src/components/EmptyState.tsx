import { ReactNode } from 'react';
import { Bot, MessageSquare, Users, BarChart3, Settings, Database } from 'lucide-react';

interface EmptyStateProps {
  type?: 'bots' | 'conversations' | 'team' | 'analytics' | 'integrations' | 'knowledge' | 'custom';
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: ReactNode;
  className?: string;
}

export default function EmptyState({
  type = 'custom',
  title,
  description,
  actionText,
  onAction,
  icon,
  className = ''
}: EmptyStateProps) {
  const getDefaultContent = () => {
    switch (type) {
      case 'bots':
        return {
          icon: <Bot size={48} className="text-gray-400" />,
          title: 'No bots created yet',
          description: 'Create your first AI assistant to start automating customer conversations.',
          actionText: 'Create Your First Bot'
        };
      case 'conversations':
        return {
          icon: <MessageSquare size={48} className="text-gray-400" />,
          title: 'No conversations yet',
          description: 'Once customers start chatting with your bots, conversations will appear here.',
          actionText: undefined
        };
      case 'team':
        return {
          icon: <Users size={48} className="text-gray-400" />,
          title: 'No team members',
          description: 'Invite colleagues to collaborate on your chatbot projects.',
          actionText: 'Invite Team Member'
        };
      case 'analytics':
        return {
          icon: <BarChart3 size={48} className="text-gray-400" />,
          title: 'No data available',
          description: 'Analytics will appear once your bots start having conversations.',
          actionText: undefined
        };
      case 'integrations':
        return {
          icon: <Settings size={48} className="text-gray-400" />,
          title: 'No integrations connected',
          description: 'Connect your favorite tools to enhance your chatbot workflow.',
          actionText: 'Browse Integrations'
        };
      case 'knowledge':
        return {
          icon: <Database size={48} className="text-gray-400" />,
          title: 'No knowledge base content',
          description: 'Add Q&A pairs and training data to improve your bot responses.',
          actionText: 'Add Q&A Pair'
        };
      default:
        return {
          icon: icon || <MessageSquare size={48} className="text-gray-400" />,
          title: title || 'No data found',
          description: description || 'There\'s nothing to show here yet.',
          actionText: actionText
        };
    }
  };

  const content = getDefaultContent();

  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="mb-4 flex justify-center">
        {content.icon}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title || content.title}
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {description || content.description}
      </p>
      {(actionText || content.actionText) && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          {actionText || content.actionText}
        </button>
      )}
    </div>
  );
}

// Specific empty states for common use cases
export function EmptyBots({ onCreateBot }: { onCreateBot: () => void }) {
  return (
    <EmptyState
      type="bots"
      onAction={onCreateBot}
    />
  );
}

export function EmptyConversations() {
  return (
    <EmptyState type="conversations" />
  );
}

export function EmptyTeam({ onInviteMember }: { onInviteMember: () => void }) {
  return (
    <EmptyState
      type="team"
      onAction={onInviteMember}
    />
  );
}

export function EmptyKnowledge({ onAddKnowledge }: { onAddKnowledge: () => void }) {
  return (
    <EmptyState
      type="knowledge"
      onAction={onAddKnowledge}
    />
  );
}