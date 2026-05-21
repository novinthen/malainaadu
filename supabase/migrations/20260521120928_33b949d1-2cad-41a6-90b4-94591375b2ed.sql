insert into storage.buckets (id, name, public) values ('article-images', 'article-images', true) on conflict (id) do nothing;

create policy "Public can read article images"
  on storage.objects for select
  using (bucket_id = 'article-images');

create policy "Admins can upload article images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'article-images' and public.is_admin(auth.uid()));

create policy "Admins can update article images"
  on storage.objects for update to authenticated
  using (bucket_id = 'article-images' and public.is_admin(auth.uid()));

create policy "Admins can delete article images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'article-images' and public.is_admin(auth.uid()));