-- ─────────────────────────────────────────────────────────────────────────────
-- Supabase Storage Policies for kyc-documents bucket
-- Run this in your Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- Allow anyone (anon + authenticated) to upload files
create policy "Allow uploads"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'kyc-documents');

-- Allow anyone to read/view files
create policy "Allow reads"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'kyc-documents');

-- Allow file owners to update
create policy "Allow updates"
on storage.objects for update
to anon, authenticated
using (bucket_id = 'kyc-documents');

-- Allow file owners to delete
create policy "Allow deletes"
on storage.objects for delete
to anon, authenticated
using (bucket_id = 'kyc-documents');
