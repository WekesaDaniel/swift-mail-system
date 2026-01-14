import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Email, Folder, Contact } from '@/types/email';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useFolders() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['folders', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', user.id)
        .order('is_system', { ascending: false })
        .order('name');
      
      if (error) throw error;
      return data as Folder[];
    },
    enabled: !!user,
  });
}

export function useEmails(folderId?: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['emails', user?.id, folderId],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('emails')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (folderId) {
        query = query.eq('folder_id', folderId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Email[];
    },
    enabled: !!user,
  });
}

export function useContacts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['contacts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('full_name');
      
      if (error) throw error;
      return data as Contact[];
    },
    enabled: !!user,
  });
}

export function useSendEmail() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (email: {
      to: string[];
      cc?: string[];
      bcc?: string[];
      subject: string;
      body: string;
      folderId: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('emails')
        .insert({
          user_id: user.id,
          folder_id: email.folderId,
          from_email: user.email!,
          from_name: user.user_metadata?.full_name || user.email,
          to_emails: email.to,
          cc_emails: email.cc || [],
          bcc_emails: email.bcc || [],
          subject: email.subject,
          body: email.body,
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      toast.success('Email sent successfully!');
    },
    onError: (error) => {
      toast.error('Failed to send email: ' + error.message);
    },
  });
}

export function useSaveDraft() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (email: {
      id?: string;
      to: string[];
      cc?: string[];
      bcc?: string[];
      subject: string;
      body: string;
      folderId: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const emailData = {
        user_id: user.id,
        folder_id: email.folderId,
        from_email: user.email!,
        from_name: user.user_metadata?.full_name || user.email,
        to_emails: email.to,
        cc_emails: email.cc || [],
        bcc_emails: email.bcc || [],
        subject: email.subject,
        body: email.body,
        status: 'draft' as const,
      };

      if (email.id) {
        const { data, error } = await supabase
          .from('emails')
          .update(emailData)
          .eq('id', email.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('emails')
          .insert(emailData)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      toast.success('Draft saved');
    },
    onError: (error) => {
      toast.error('Failed to save draft: ' + error.message);
    },
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ emailId, isRead }: { emailId: string; isRead: boolean }) => {
      const { error } = await supabase
        .from('emails')
        .update({ is_read: isRead })
        .eq('id', emailId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    },
  });
}

export function useToggleStar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ emailId, isStarred }: { emailId: string; isStarred: boolean }) => {
      const { error } = await supabase
        .from('emails')
        .update({ is_starred: isStarred })
        .eq('id', emailId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    },
  });
}

export function useMoveToTrash() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ emailId, trashFolderId }: { emailId: string; trashFolderId: string }) => {
      const { error } = await supabase
        .from('emails')
        .update({ folder_id: trashFolderId })
        .eq('id', emailId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      toast.success('Email moved to trash');
    },
  });
}

export function useDeleteEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (emailId: string) => {
      const { error } = await supabase
        .from('emails')
        .delete()
        .eq('id', emailId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      toast.success('Email deleted permanently');
    },
  });
}

export function useAddContact() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (contact: { email: string; fullName?: string }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('contacts')
        .insert({
          user_id: user.id,
          email: contact.email,
          full_name: contact.fullName || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Contact added');
    },
    onError: (error) => {
      toast.error('Failed to add contact: ' + error.message);
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contactId: string) => {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Contact deleted');
    },
  });
}
