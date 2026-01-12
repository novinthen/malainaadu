export type ArticleStatus = 'draft' | 'pending' | 'published' | 'rejected';
export type AppRole = 'admin' | 'moderator';

export interface Source {
  id: string;
  name: string;
  rss_url: string;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Article {
  id: string;
  title: string;
  original_title: string | null;
  content: string;
  original_content: string | null;
  excerpt: string | null;
  image_url: string | null;
  source_id: string | null;
  original_url: string | null;
  category_id: string | null;
  status: ArticleStatus;
  view_count: number;
  publish_date: string | null;
  scheduled_at: string | null;
  is_featured: boolean;
  is_breaking: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  source?: Source;
  category?: Category;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface EmailAlert {
  id: string;
  user_id: string;
  new_articles: boolean;
  processing_errors: boolean;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface ArticleView {
  id: string;
  article_id: string;
  viewed_at: string;
  user_agent: string | null;
  ip_hash: string | null;
}
