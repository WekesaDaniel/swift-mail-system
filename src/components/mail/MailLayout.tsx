import { useState, useMemo } from 'react';
import { Sidebar } from './Sidebar';
import { EmailList } from './EmailList';
import { EmailDetail } from './EmailDetail';
import { ComposeModal } from './ComposeModal';
import { SearchBar } from './SearchBar';
import { useEmails, useFolders } from '@/hooks/useEmails';
import { Email } from '@/types/email';
import { Menu, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

export function MailLayout() {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [replyToEmail, setReplyToEmail] = useState<Email | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { data: folders = [] } = useFolders();
  const { data: emails = [], isLoading, refetch, isRefetching } = useEmails(selectedFolderId);
  const queryClient = useQueryClient();

  // Set initial folder to Inbox
  useState(() => {
    if (folders.length > 0 && !selectedFolderId) {
      const inbox = folders.find(f => f.name === 'Inbox');
      if (inbox) setSelectedFolderId(inbox.id);
    }
  });

  // Auto-select inbox when folders load
  useMemo(() => {
    if (folders.length > 0 && !selectedFolderId) {
      const inbox = folders.find(f => f.name === 'Inbox');
      if (inbox) setSelectedFolderId(inbox.id);
    }
  }, [folders, selectedFolderId]);

  const currentFolder = folders.find(f => f.id === selectedFolderId);

  const filteredEmails = useMemo(() => {
    if (!searchQuery) return emails;
    const query = searchQuery.toLowerCase();
    return emails.filter(email => 
      email.subject.toLowerCase().includes(query) ||
      email.from_email.toLowerCase().includes(query) ||
      email.from_name?.toLowerCase().includes(query) ||
      email.body?.toLowerCase().includes(query)
    );
  }, [emails, searchQuery]);

  const handleCompose = () => {
    setReplyToEmail(null);
    setIsComposeOpen(true);
  };

  const handleReply = () => {
    setReplyToEmail(selectedEmail);
    setIsComposeOpen(true);
  };

  const handleEmailSelect = (email: Email) => {
    setSelectedEmail(email);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['emails'] });
    queryClient.invalidateQueries({ queryKey: ['folders'] });
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={cn(
        'transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
      )}>
        <Sidebar
          selectedFolderId={selectedFolderId}
          onFolderSelect={(id) => {
            setSelectedFolderId(id);
            setSelectedEmail(null);
          }}
          onCompose={handleCompose}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center gap-4 px-6 py-4 border-b bg-card">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="shrink-0"
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div className="flex-1 max-w-xl">
            <SearchBar onSearch={setSearchQuery} />
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefetching}
            className="shrink-0"
          >
            <RefreshCw className={cn('w-5 h-5', isRefetching && 'animate-spin')} />
          </Button>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex min-h-0">
          {/* Email List */}
          <div className={cn(
            'flex flex-col border-r bg-card transition-all duration-300',
            selectedEmail ? 'w-96 hidden lg:flex' : 'flex-1'
          )}>
            {/* Folder Title */}
            <div className="flex items-center justify-between px-6 py-3 border-b">
              <h2 className="font-display font-semibold text-lg">
                {currentFolder?.name || 'All Emails'}
              </h2>
              <span className="text-sm text-muted-foreground">
                {filteredEmails.length} {filteredEmails.length === 1 ? 'email' : 'emails'}
              </span>
            </div>

            <EmailList
              emails={filteredEmails}
              selectedEmailId={selectedEmail?.id || null}
              onEmailSelect={handleEmailSelect}
              isLoading={isLoading}
            />
          </div>

          {/* Email Detail */}
          {selectedEmail && (
            <EmailDetail
              email={selectedEmail}
              folders={folders}
              onBack={() => setSelectedEmail(null)}
              onReply={handleReply}
            />
          )}

          {/* Empty State for Desktop */}
          {!selectedEmail && (
            <div className="hidden lg:flex flex-1 items-center justify-center bg-background">
              <div className="text-center text-muted-foreground">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-lg font-medium">Select an email to read</p>
                <p className="text-sm">Choose from your inbox on the left</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      <ComposeModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        replyTo={replyToEmail}
      />
    </div>
  );
}
