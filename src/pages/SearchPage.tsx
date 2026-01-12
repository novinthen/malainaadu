import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ArticleGrid } from '@/components/news/ArticleGrid';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Article } from '@/types/database';
import { SEOHead } from '@/components/seo/SEOHead';

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
      <SEOHead
        title="செய்தி தேடல்"
        description="மலேசியா செய்திகளை தேடுங்கள். அரசியல், விளையாட்டு, பொழுதுபோக்கு, பொருளாதாரம் மற்றும் பல வகை செய்திகளை கண்டறியுங்கள்."
        canonicalUrl="/search"
      />
      <section className="py-6 md:py-8">
        <div className="container">
          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold md:text-3xl">
              செய்தி தேடல்
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              சொற்களைப் பயன்படுத்தி செய்திகளைத் தேடுங்கள்
            </p>
          </div>

          <form onSubmit={handleSearch} className="mb-6 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="செய்தி தேடு..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">தேடு</Button>
          </form>

          {searchTerm && (
            <p className="mb-4 text-sm text-muted-foreground">
              "<span className="font-medium text-foreground">{searchTerm}</span>" க்கான தேடல் முடிவுகள்
              {articles && ` (${articles.length} முடிவுகள்)`}
            </p>
          )}

          {searchTerm ? (
            <ArticleGrid
              articles={articles}
              isLoading={isLoading}
              emptyMessage={`"${searchTerm}" க்கான செய்திகள் கிடைக்கவில்லை.`}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                செய்திகளைத் தேட சொற்களை உள்ளிடுங்கள்.
              </p>
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
}
