import { useFolders, useEmails } from '@/hooks/useEmails';
import { Folder } from '@/types/email';
import { 
  Inbox, 
  Send, 
  FileText, 
  Trash2, 
  Star, 
  Plus, 
  Mail,
  Settings,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SidebarProps {
  selectedFolderId: string | null;
  onFolderSelect: (folderId: string) => void;
  onCompose: () => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  inbox: Inbox,
  send: Send,
  'file-text': FileText,
  'trash-2': Trash2,
  star: Star,
};

export function Sidebar({ selectedFolderId, onFolderSelect, onCompose }: SidebarProps) {
  const { data: folders = [] } = useFolders();
  const { data: allEmails = [] } = useEmails();
  const { user, signOut } = useAuth();

  // Remove duplicate folder names (keep first occurrence)
  const uniqueFolders = Array.from(
    new Map(folders.map(f => [f.name.toLowerCase(), f])).values()
  );

  const getUnreadCount = (folderId: string) => {
    return allEmails.filter(e => e.folder_id === folderId && !e.is_read).length;
  };

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName] || Inbox;
    return IconComponent;
  };

  const getUserInitials = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.slice(0, 2).toUpperCase() || 'FM';
  };

  return (
    <aside className="w-64 h-screen bg-sidebar flex flex-col">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
          <Mail className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="font-display text-xl font-bold text-sidebar-foreground">FastMail</span>
      </div>

      {/* Compose Button */}
      <div className="px-4 mb-6">
        <button 
          onClick={onCompose}
          className="compose-btn w-full flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>Compose</span>
        </button>
      </div>

      {/* Folders */}
      <nav className="flex-1 px-3 overflow-y-auto custom-scrollbar">
        <div className="space-y-1">
          {uniqueFolders.map(folder => {
            const Icon = getIcon(folder.icon);
            const unreadCount = getUnreadCount(folder.id);
            const isSelected = selectedFolderId === folder.id;

            return (
              <button
                key={folder.id}
                onClick={() => onFolderSelect(folder.id)}
                className={cn(
                  'folder-item w-full flex items-center gap-2 p-3 text-sm rounded-md hover:bg-muted transition-colors',
                  isSelected && 'bg-muted font-semibold'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="flex-1 text-left truncate">{folder.name}</span>
                {unreadCount > 0 && (
                  <span className="email-badge">{unreadCount}</span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-sidebar-accent transition-colors">
              <Avatar className="w-9 h-9">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user?.user_metadata?.full_name || 'User'}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  {user?.email}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="gap-2 text-destructive">
              <LogOut className="w-4 h-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
