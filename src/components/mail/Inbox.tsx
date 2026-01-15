import { useState, useEffect } from 'react';
import { Folder } from '@/types/email';
import { cn } from '@/lib/utils';
import { useFolders } from '@/hooks/useEmails';
import { Inbox as InboxIcon, Send, FileText, Trash2 } from 'lucide-react';

interface InboxProps {
  selectedFolderId: string | null;
  onSelectFolder: (folder: Folder) => void;
}

export function Inbox({ selectedFolderId, onSelectFolder }: InboxProps) {
  const { data: folders = [], isLoading } = useFolders();
  const [uniqueFolders, setUniqueFolders] = useState<Folder[]>([]);

  // Remove duplicates if any
  useEffect(() => {
    const map = new Map<string, Folder>();
    folders.forEach(f => {
      if (!map.has(f.name)) {
        map.set(f.name, f);
      }
    });
    setUniqueFolders(Array.from(map.values()));
  }, [folders]);

  if (isLoading) {
    return <p className="p-4 text-muted-foreground">Loading folders...</p>;
  }

  const getIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'inbox': return <InboxIcon className="w-4 h-4" />;
      case 'sent': return <Send className="w-4 h-4" />;
      case 'drafts': return <FileText className="w-4 h-4" />;
      case 'trash': return <Trash2 className="w-4 h-4" />;
      default: return <InboxIcon className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex flex-col border-r border-muted-foreground w-48">
      {uniqueFolders.map(folder => (
        <button
          key={folder.id}
          onClick={() => onSelectFolder(folder)}
          className={cn(
            'flex items-center gap-2 p-3 hover:bg-muted rounded-md text-sm text-left',
            selectedFolderId === folder.id && 'bg-muted font-semibold'
          )}
        >
          {getIcon(folder.name)}
          {folder.name}
        </button>
      ))}
    </div>
  );
}
