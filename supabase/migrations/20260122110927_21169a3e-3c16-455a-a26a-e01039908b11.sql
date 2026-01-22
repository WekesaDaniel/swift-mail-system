-- Create a security definer function to deliver emails to recipients
-- This bypasses RLS to allow cross-user email delivery
CREATE OR REPLACE FUNCTION public.deliver_email_to_recipient(
  p_recipient_email TEXT,
  p_from_email TEXT,
  p_from_name TEXT,
  p_to_emails TEXT[],
  p_cc_emails TEXT[],
  p_bcc_emails TEXT[],
  p_subject TEXT,
  p_body TEXT,
  p_sent_at TIMESTAMPTZ
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_recipient_user_id UUID;
  v_inbox_folder_id UUID;
BEGIN
  -- Find recipient's profile by email
  SELECT user_id INTO v_recipient_user_id
  FROM public.profiles
  WHERE email = p_recipient_email
  LIMIT 1;

  -- If recipient not found, return false (external email)
  IF v_recipient_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Find recipient's Inbox folder
  SELECT id INTO v_inbox_folder_id
  FROM public.folders
  WHERE user_id = v_recipient_user_id AND name = 'Inbox'
  LIMIT 1;

  -- If inbox not found, return false
  IF v_inbox_folder_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Insert email into recipient's inbox
  INSERT INTO public.emails (
    user_id,
    folder_id,
    from_email,
    from_name,
    to_emails,
    cc_emails,
    bcc_emails,
    subject,
    body,
    status,
    received_at,
    is_read
  ) VALUES (
    v_recipient_user_id,
    v_inbox_folder_id,
    p_from_email,
    p_from_name,
    p_to_emails,
    p_cc_emails,
    p_bcc_emails,
    p_subject,
    p_body,
    'received',
    p_sent_at,
    FALSE
  );

  RETURN TRUE;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.deliver_email_to_recipient TO authenticated;