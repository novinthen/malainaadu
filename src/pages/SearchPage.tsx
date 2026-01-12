import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ArticleGrid } from '@/components/news/ArticleGrid';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Article } from '@/types/database';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: articles, isLoading } = useQuery({
    queryKey: ['search', searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];

      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          source:sources(*),
          category:categories(*)
        `)
        .eq('status', 'published')
        .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
        .order('publish_date', { ascending: false })
        .limit(30);

      if (error) throw error;
      return data as Article[];
    },
    enabled: !!searchTerm.trim(),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(query);
  };

  return (
    <MainLayout>
      <section className="py-6 md:py-8">
        <div className="container">
          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold md:text-3xl">
              Cari Berita
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Cari berita berdasarkan kata kunci
            </p>
          </div>

          <form onSubmit={handleSearch} className="mb-6 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari berita..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Cari</Button>
          </form>

          {searchTerm && (
            <p className="mb-4 text-sm text-muted-foreground">
              Hasil carian untuk "<span className="font-medium text-foreground">{searchTerm}</span>"
              {articles && ` (${articles.length} hasil)`}
            </p>
          )}

          {searchTerm ? (
            <ArticleGrid
              articles={articles}
              isLoading={isLoading}
              emptyMessage={`Tiada berita ditemui untuk "${searchTerm}".`}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                Masukkan kata kunci untuk mencari berita.
              </p>
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
}
