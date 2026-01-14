import { Email } from '@/types/email';
import { cn } from '@/lib/utils';
import { Star, Paperclip } from 'lucide-react';
import { useToggleStar } from '@/hooks/useEmails';
import { formatDistanceToNow, format, isToday, isYesterday, isThisYear } from 'date-fns';

interface EmailListProps {
  emails: Email[];
  selectedEmailId: string | null;
  onEmailSelect: (email: Email) => void;
  isLoading?: boolean;
}

function formatEmailDate(dateString: string | null) {
  if (!dateString) return '';
  const date = new Date(dateString);
  
  if (isToday(date)) {
    return format(date, 'h:mm a');
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else if (isThisYear(date)) {
    return format(date, 'MMM d');
  } else {
    return format(date, 'MMM d, yyyy');
  }
}

function getInitials(name: string | null, email: string) {
  if (name) {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  return email.slice(0, 2).toUpperCase();
}

function getAvatarColor(email: string) {
  const colors = [
    'from-blue-500 to-blue-600',
    'from-purple-500 to-purple-600',
    'from-green-500 to-green-600',
    'from-orange-500 to-orange-600',
    'from-pink-500 to-pink-600',
    'from-teal-500 to-teal-600',
    'from-indigo-500 to-indigo-600',
    'from-rose-500 to-rose-600',
  ];
  const hash = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

export function EmailList({ emails, selectedEmailId, onEmailSelect, isLoading }: EmailListProps) {
  const toggleStar = useToggleStar();

  const handleStarClick = (e: React.MouseEvent, email: Email) => {
    e.stopPropagation();
    toggleStar.mutate({ emailId: email.id, isStarred: !email.is_starred });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full p-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-4 p-4 bg-muted rounded-lg">
              <div className="w-10 h-10 rounded-full bg-muted-foreground/20" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted-foreground/20 rounded w-1/4" />
                <div className="h-3 bg-muted-foreground/20 rounded w-3/4" />
                <div className="h-3 bg-muted-foreground/20 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-lg font-medium">No emails yet</p>
        <p className="text-sm">Messages will appear here</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      {emails.map((email) => (
        <div
          key={email.id}
          onClick={() => onEmailSelect(email)}
          className={cn(
            'email-item group',
            email.is_read ? 'read' : 'unread',
            selectedEmailId === email.id && 'selected'
          )}
        >
          {/* Avatar */}
          <div className={cn(
            'email-avatar shrink-0',
            `bg-gradient-to-br ${getAvatarColor(email.from_email)}`
          )}>
            {getInitials(email.from_name, email.from_email)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn(
                'email-sender truncate',
                !email.is_read && 'font-semibold text-foreground'
              )}>
                {email.from_name || email.from_email}
              </span>
              <span className="text-xs text-muted-foreground shrink-0 ml-auto">
                {formatEmailDate(email.sent_at || email.created_at)}
              </span>
            </div>
            <p className={cn(
              'text-sm truncate mb-1',
              !email.is_read ? 'text-foreground font-medium' : 'text-muted-foreground'
            )}>
              {email.subject || '(no subject)'}
            </p>
            <p className="text-sm text-muted-foreground truncate">
              {email.body?.slice(0, 100) || '(no content)'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => handleStarClick(e, email)}
              className="p-1 rounded hover:bg-muted transition-colors"
            >
              <Star
                className={cn(
                  'w-4 h-4',
                  email.is_starred ? 'fill-warning text-warning' : 'text-muted-foreground'
                )}
              />
            </button>
          </div>

          {/* Star indicator (always visible if starred) */}
          {email.is_starred && (
            <Star className="w-4 h-4 fill-warning text-warning shrink-0 group-hover:hidden" />
          )}
        </div>
      ))}
    </div>
  );
}
