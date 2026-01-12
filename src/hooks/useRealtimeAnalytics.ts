import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RecentView {
  id: string;
  articleId: string;
  articleTitle: string;
  viewedAt: Date;
}

interface RealtimeAnalyticsData {
  todayViews: number;
  recentViews: RecentView[];
  isLive: boolean;
  lastUpdate: Date | null;
  newViewPulse: boolean;
}

export function useRealtimeAnalytics(initialTodayViews: number = 0) {
  const [data, setData] = useState<RealtimeAnalyticsData>({
    todayViews: initialTodayViews,
    recentViews: [],
    isLive: false,
    lastUpdate: null,
    newViewPulse: false,
  });

  // Sync initial data when it changes
  useEffect(() => {
    setData(prev => ({
      ...prev,
      todayViews: Math.max(prev.todayViews, initialTodayViews),
    }));
  }, [initialTodayViews]);

  const triggerPulse = useCallback(() => {
    setData(prev => ({ ...prev, newViewPulse: true }));
    setTimeout(() => {
      setData(prev => ({ ...prev, newViewPulse: false }));
    }, 1000);
  }, []);

  useEffect(() => {
    // Subscribe to new article views
    const channel = supabase
      .channel('article_views_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'article_views',
        },
        async (payload) => {
          const newView = payload.new as { id: string; article_id: string; viewed_at: string };
          
          // Fetch article title for the view
          const { data: article } = await supabase
            .from('articles')
            .select('title')
            .eq('id', newView.article_id)
            .single();

          const viewedAt = new Date(newView.viewed_at);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          setData(prev => {
            const isViewToday = viewedAt >= today;
            
            return {
              ...prev,
              todayViews: isViewToday ? prev.todayViews + 1 : prev.todayViews,
              recentViews: [
                {
                  id: newView.id,
                  articleId: newView.article_id,
                  articleTitle: article?.title || 'Artikel tidak diketahui',
                  viewedAt,
                },
                ...prev.recentViews,
              ].slice(0, 10), // Keep only last 10
              lastUpdate: new Date(),
            };
          });

          triggerPulse();
        }
      )
      .subscribe((status) => {
        setData(prev => ({
          ...prev,
          isLive: status === 'SUBSCRIBED',
        }));
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [triggerPulse]);

  return data;
}
