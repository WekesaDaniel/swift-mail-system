import { Email, Folder } from '@/types/email';
import { 
  ArrowLeft, 
  Star, 
  Trash2, 
  Reply, 
  Forward, 
  MoreHorizontal,
  Archive
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToggleStar, useMoveToTrash, useMarkAsRead } from '@/hooks/useEmails';
import { useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface EmailDetailProps {
  email: Email;
  folders: Folder[];
  onBack: () => void;
  onReply: () => void;
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

export function EmailDetail({ email, folders, onBack, onReply }: EmailDetailProps) {
  const toggleStar = useToggleStar();
  const moveToTrash = useMoveToTrash();
  const markAsRead = useMarkAsRead();

  const trashFolder = folders.find(f => f.name === 'Trash');

  // Mark as read when viewing
  useEffect(() => {
    if (!email.is_read) {
      markAsRead.mutate({ emailId: email.id, isRead: true });
    }
  }, [email.id]);

  const handleStar = () => {
    toggleStar.mutate({ emailId: email.id, isStarred: !email.is_starred });
  };

  const handleTrash = () => {
    if (trashFolder) {
      moveToTrash.mutate({ emailId: email.id, trashFolderId: trashFolder.id });
      onBack();
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return format(new Date(dateString), "EEEE, MMMM d, yyyy 'at' h:mm a");
  };

  return (
    <div className="flex-1 flex flex-col bg-card animate-slide-in-right">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" size="icon" onClick={onBack} className="lg:hidden">
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="flex items-center gap-2 ml-auto">
          <Button variant="ghost" size="icon" onClick={handleStar}>
            <Star className={cn(
              'w-5 h-5',
              email.is_starred && 'fill-warning text-warning'
            )} />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleTrash}>
            <Trash2 className="w-5 h-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="gap-2">
                <Archive className="w-4 h-4" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <Forward className="w-4 h-4" />
                Forward
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Email Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        {/* Subject */}
        <h1 className="text-2xl font-display font-semibold mb-6">
          {email.subject || '(no subject)'}
        </h1>

        {/* Sender Info */}
        <div className="flex items-start gap-4 mb-6">
          <div className={cn(
            'email-avatar w-12 h-12 text-base shrink-0',
            `bg-gradient-to-br ${getAvatarColor(email.from_email)}`
          )}>
            {getInitials(email.from_name, email.from_email)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold">
                {email.from_name || email.from_email}
              </span>
              <span className="text-sm text-muted-foreground">
                &lt;{email.from_email}&gt;
              </span>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              to {email.to_emails.join(', ')}
              {email.cc_emails.length > 0 && (
                <span>, cc: {email.cc_emails.join(', ')}</span>
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {formatDate(email.sent_at || email.created_at)}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap text-foreground leading-relaxed">
            {email.body || '(no content)'}
          </div>
        </div>
      </div>

      {/* Reply Actions */}
      <div className="p-4 border-t">
        <div className="flex gap-3">
          <Button onClick={onReply} className="gap-2">
            <Reply className="w-4 h-4" />
            Reply
          </Button>
          <Button variant="outline" className="gap-2">
            <Forward className="w-4 h-4" />
            Forward
          </Button>
        </div>
      </div>
    </div>
  );
}
