import { useState, useEffect } from 'react';
import { X, Minus, Maximize2, Send, Paperclip, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useSendEmail, useSaveDraft, useFolders, useContacts } from '@/hooks/useEmails';
import { Email } from '@/types/email';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { z } from 'zod';

// Email validation schema
const emailSchema = z.string().email();

const isValidEmail = (email: string): boolean => {
  const result = emailSchema.safeParse(email);
  return result.success;
};
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  replyTo?: Email | null;
}

export function ComposeModal({ isOpen, onClose, replyTo }: ComposeModalProps) {
  const [to, setTo] = useState<string[]>([]);
  const [toInput, setToInput] = useState('');
  const [cc, setCc] = useState<string[]>([]);
  const [bcc, setBcc] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [contactsOpen, setContactsOpen] = useState(false);

  const { data: folders = [] } = useFolders();
  const { data: contacts = [] } = useContacts();
  const sendEmail = useSendEmail();
  const saveDraft = useSaveDraft();

  const sentFolder = folders.find(f => f.name === 'Sent');
  const draftsFolder = folders.find(f => f.name === 'Drafts');

  useEffect(() => {
    if (replyTo) {
      setTo([replyTo.from_email]);
      setSubject(`Re: ${replyTo.subject}`);
      setBody(`\n\n---\nOn ${new Date(replyTo.sent_at || replyTo.created_at).toLocaleDateString()}, ${replyTo.from_name || replyTo.from_email} wrote:\n\n${replyTo.body}`);
    }
  }, [replyTo]);

  const handleClose = () => {
    // Save draft if there's content
    if ((to.length > 0 || subject || body) && draftsFolder) {
      saveDraft.mutate({
        to,
        cc,
        bcc,
        subject,
        body,
        folderId: draftsFolder.id,
      });
    }
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTo([]);
    setToInput('');
    setCc([]);
    setBcc([]);
    setSubject('');
    setBody('');
    setShowCc(false);
    setShowBcc(false);
  };

  const handleSend = () => {
    if (!sentFolder || to.length === 0) return;

    sendEmail.mutate({
      to,
      cc,
      bcc,
      subject,
      body,
      folderId: sentFolder.id,
    }, {
      onSuccess: () => {
        resetForm();
        onClose();
      },
    });
  };

  const addRecipient = (email: string, type: 'to' | 'cc' | 'bcc') => {
    const trimmed = email.trim();
    if (!trimmed) return;
    
    // Validate email format before adding
    if (!isValidEmail(trimmed)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    switch (type) {
      case 'to':
        if (!to.includes(trimmed)) {
          setTo([...to, trimmed]);
        } else {
          toast.info('Email already added');
        }
        setToInput('');
        break;
      case 'cc':
        if (!cc.includes(trimmed)) {
          setCc([...cc, trimmed]);
        } else {
          toast.info('Email already added');
        }
        break;
      case 'bcc':
        if (!bcc.includes(trimmed)) {
          setBcc([...bcc, trimmed]);
        } else {
          toast.info('Email already added');
        }
        break;
    }
    setContactsOpen(false);
  };

  const removeRecipient = (email: string, type: 'to' | 'cc' | 'bcc') => {
    switch (type) {
      case 'to':
        setTo(to.filter(e => e !== email));
        break;
      case 'cc':
        setCc(cc.filter(e => e !== email));
        break;
      case 'bcc':
        setBcc(bcc.filter(e => e !== email));
        break;
    }
  };

  const handleToKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addRecipient(toInput, 'to');
    }
  };

  const filteredContacts = contacts.filter(c => 
    c.email.toLowerCase().includes(toInput.toLowerCase()) ||
    c.full_name?.toLowerCase().includes(toInput.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div 
      className={cn(
        'fixed z-50 bg-card rounded-t-xl shadow-compose border border-border overflow-hidden transition-all duration-300',
        isMinimized 
          ? 'bottom-0 right-4 w-80 h-12' 
          : 'bottom-0 right-4 w-[600px] h-[500px]'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-sidebar text-sidebar-foreground cursor-move">
        <span className="font-medium text-sm">
          {subject || 'New Message'}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 rounded hover:bg-sidebar-accent transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={handleClose}
            className="p-1 rounded hover:bg-sidebar-accent transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="flex flex-col h-[calc(100%-48px)]">
          {/* Recipients */}
          <div className="border-b">
            {/* To */}
            <div className="flex items-center px-4 py-2 gap-2">
              <span className="text-sm text-muted-foreground w-12">To</span>
              <div className="flex-1 flex flex-wrap items-center gap-1">
                {to.map(email => (
                  <span
                    key={email}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary rounded-full text-sm"
                  >
                    {email}
                    <button
                      onClick={() => removeRecipient(email, 'to')}
                      className="hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <Popover open={contactsOpen} onOpenChange={setContactsOpen}>
                  <PopoverTrigger asChild>
                    <input
                      type="text"
                      value={toInput}
                      onChange={(e) => {
                        setToInput(e.target.value);
                        setContactsOpen(true);
                      }}
                      onKeyDown={handleToKeyDown}
                      onBlur={() => setTimeout(() => setContactsOpen(false), 200)}
                      placeholder={to.length === 0 ? "Recipients" : ""}
                      className="flex-1 min-w-[100px] bg-transparent border-none outline-none text-sm"
                    />
                  </PopoverTrigger>
                  {filteredContacts.length > 0 && (
                    <PopoverContent className="w-64 p-0" align="start">
                      <Command>
                        <CommandList>
                          <CommandGroup>
                            {filteredContacts.map(contact => (
                              <CommandItem
                                key={contact.id}
                                onSelect={() => addRecipient(contact.email, 'to')}
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">{contact.full_name || contact.email}</span>
                                  {contact.full_name && (
                                    <span className="text-xs text-muted-foreground">{contact.email}</span>
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  )}
                </Popover>
              </div>
              <div className="flex gap-2 text-sm text-muted-foreground">
                {!showCc && (
                  <button onClick={() => setShowCc(true)} className="hover:text-foreground">
                    Cc
                  </button>
                )}
                {!showBcc && (
                  <button onClick={() => setShowBcc(true)} className="hover:text-foreground">
                    Bcc
                  </button>
                )}
              </div>
            </div>

            {/* Cc */}
            {showCc && (
              <div className="flex items-center px-4 py-2 gap-2 border-t">
                <span className="text-sm text-muted-foreground w-12">Cc</span>
                <div className="flex-1 flex flex-wrap items-center gap-1">
                  {cc.map(email => (
                    <span
                      key={email}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary rounded-full text-sm"
                    >
                      {email}
                      <button
                        onClick={() => removeRecipient(email, 'cc')}
                        className="hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder=""
                    className="flex-1 min-w-[100px] bg-transparent border-none outline-none text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        addRecipient((e.target as HTMLInputElement).value, 'cc');
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {/* Bcc */}
            {showBcc && (
              <div className="flex items-center px-4 py-2 gap-2 border-t">
                <span className="text-sm text-muted-foreground w-12">Bcc</span>
                <div className="flex-1 flex flex-wrap items-center gap-1">
                  {bcc.map(email => (
                    <span
                      key={email}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary rounded-full text-sm"
                    >
                      {email}
                      <button
                        onClick={() => removeRecipient(email, 'bcc')}
                        className="hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder=""
                    className="flex-1 min-w-[100px] bg-transparent border-none outline-none text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        addRecipient((e.target as HTMLInputElement).value, 'bcc');
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {/* Subject */}
            <div className="flex items-center px-4 py-2 gap-2 border-t">
              <span className="text-sm text-muted-foreground w-12">Subject</span>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm"
              />
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 p-4">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message..."
              className="w-full h-full resize-none border-none focus-visible:ring-0 text-sm"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSend}
                disabled={to.length === 0 || sendEmail.isPending}
                className="compose-btn"
              >
                <Send className="w-4 h-4 mr-2" />
                Send
              </Button>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon">
                <Paperclip className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Image className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
