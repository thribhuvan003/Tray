-- Create menu-images public bucket for item photos uploaded by canteen admins.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'menu-images',
  'menu-images',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Admins can upload images scoped to their own tenant folder: {tenant_id}/{filename}
CREATE POLICY "admin_upload_menu_images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'menu-images'
  AND EXISTS (
    SELECT 1 FROM public.tenant_memberships tm
    WHERE tm.user_id = auth.uid()
      AND tm.role IN ('canteen_admin', 'super_admin')
      AND tm.is_active = true
      AND (storage.foldername(name))[1] = tm.tenant_id::text
  )
);

CREATE POLICY "admin_delete_menu_images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'menu-images'
  AND EXISTS (
    SELECT 1 FROM public.tenant_memberships tm
    WHERE tm.user_id = auth.uid()
      AND tm.role IN ('canteen_admin', 'super_admin')
      AND tm.is_active = true
      AND (storage.foldername(name))[1] = tm.tenant_id::text
  )
);

CREATE POLICY "public_read_menu_images"
ON storage.objects FOR SELECT
USING (bucket_id = 'menu-images');
