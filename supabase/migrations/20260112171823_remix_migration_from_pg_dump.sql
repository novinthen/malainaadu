CREATE EXTENSION IF NOT EXISTS "pg_cron";
CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_net";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'moderator'
);


--
-- Name: article_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.article_status AS ENUM (
    'draft',
    'pending',
    'published',
    'rejected'
);


--
-- Name: cleanup_old_article_views(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cleanup_old_article_views() RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.article_views
  WHERE viewed_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;


--
-- Name: generate_article_slug(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_article_slug(title text) RETURNS text
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  -- Convert to lowercase and replace spaces/special chars with hyphens
  base_slug := lower(title);
  -- Remove special characters, keep alphanumeric and spaces
  base_slug := regexp_replace(base_slug, '[^a-z0-9\s-]', '', 'g');
  -- Replace multiple spaces with single space
  base_slug := regexp_replace(base_slug, '\s+', ' ', 'g');
  -- Replace spaces with hyphens
  base_slug := regexp_replace(base_slug, '\s', '-', 'g');
  -- Remove multiple consecutive hyphens
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  -- Trim hyphens from start and end
  base_slug := trim(both '-' from base_slug);
  -- Limit length to 80 characters
  base_slug := substring(base_slug from 1 for 80);
  
  -- Check for uniqueness and add suffix if needed
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM articles WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: is_admin(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_admin(_user_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'moderator')
  )
$$;


--
-- Name: set_article_slug(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_article_slug() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_article_slug(NEW.title);
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: trigger_rss_fetch(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trigger_rss_fetch() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Call the edge function using pg_net
  PERFORM net.http_post(
    url := 'https://mnzzhsaaxdwbklmqvjrb.supabase.co/functions/v1/fetch-rss',
    headers := jsonb_build_object(
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: article_views; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.article_views (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    article_id uuid NOT NULL,
    viewed_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: articles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.articles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    original_title text,
    content text NOT NULL,
    original_content text,
    excerpt text,
    image_url text,
    source_id uuid,
    original_url text,
    category_id uuid,
    status public.article_status DEFAULT 'pending'::public.article_status NOT NULL,
    view_count integer DEFAULT 0 NOT NULL,
    publish_date timestamp with time zone,
    scheduled_at timestamp with time zone,
    is_featured boolean DEFAULT false NOT NULL,
    is_breaking boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    slug text
);


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: email_alerts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_alerts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    new_articles boolean DEFAULT true NOT NULL,
    processing_errors boolean DEFAULT true NOT NULL,
    email text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: fetch_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fetch_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone,
    articles_processed integer DEFAULT 0,
    articles_skipped integer DEFAULT 0,
    status text DEFAULT 'running'::text NOT NULL,
    error_message text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: sources; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sources (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    rss_url text NOT NULL,
    logo_url text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: article_views article_views_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.article_views
    ADD CONSTRAINT article_views_pkey PRIMARY KEY (id);


--
-- Name: articles articles_original_url_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_original_url_key UNIQUE (original_url);


--
-- Name: articles articles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: categories categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);


--
-- Name: email_alerts email_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_alerts
    ADD CONSTRAINT email_alerts_pkey PRIMARY KEY (id);


--
-- Name: fetch_logs fetch_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fetch_logs
    ADD CONSTRAINT fetch_logs_pkey PRIMARY KEY (id);


--
-- Name: sources sources_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sources
    ADD CONSTRAINT sources_pkey PRIMARY KEY (id);


--
-- Name: sources sources_rss_url_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sources
    ADD CONSTRAINT sources_rss_url_key UNIQUE (rss_url);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: articles_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX articles_slug_idx ON public.articles USING btree (slug);


--
-- Name: articles_slug_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX articles_slug_unique ON public.articles USING btree (slug) WHERE (slug IS NOT NULL);


--
-- Name: idx_article_views_article; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_article_views_article ON public.article_views USING btree (article_id);


--
-- Name: idx_article_views_viewed_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_article_views_viewed_at ON public.article_views USING btree (viewed_at);


--
-- Name: idx_articles_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_articles_category ON public.articles USING btree (category_id);


--
-- Name: idx_articles_publish_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_articles_publish_date ON public.articles USING btree (publish_date DESC);


--
-- Name: idx_articles_source; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_articles_source ON public.articles USING btree (source_id);


--
-- Name: idx_articles_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_articles_status ON public.articles USING btree (status);


--
-- Name: idx_articles_view_count; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_articles_view_count ON public.articles USING btree (view_count DESC);


--
-- Name: articles article_slug_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER article_slug_trigger BEFORE INSERT ON public.articles FOR EACH ROW EXECUTE FUNCTION public.set_article_slug();


--
-- Name: articles update_articles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: email_alerts update_email_alerts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_email_alerts_updated_at BEFORE UPDATE ON public.email_alerts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: sources update_sources_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_sources_updated_at BEFORE UPDATE ON public.sources FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: article_views article_views_article_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.article_views
    ADD CONSTRAINT article_views_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.articles(id) ON DELETE CASCADE;


--
-- Name: articles articles_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: articles articles_source_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_source_id_fkey FOREIGN KEY (source_id) REFERENCES public.sources(id) ON DELETE SET NULL;


--
-- Name: email_alerts email_alerts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_alerts
    ADD CONSTRAINT email_alerts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: articles Admins can manage articles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage articles" ON public.articles TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));


--
-- Name: categories Admins can manage categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage categories" ON public.categories TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));


--
-- Name: sources Admins can manage sources; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage sources" ON public.sources TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));


--
-- Name: user_roles Admins can manage user roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage user roles" ON public.user_roles TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can view all user roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all user roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: article_views Admins can view article analytics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view article analytics" ON public.article_views FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));


--
-- Name: fetch_logs Admins can view fetch logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view fetch logs" ON public.fetch_logs FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));


--
-- Name: article_views Anyone can record article views; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can record article views" ON public.article_views FOR INSERT WITH CHECK (true);


--
-- Name: categories Categories are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);


--
-- Name: articles Published articles are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Published articles are viewable by everyone" ON public.articles FOR SELECT USING (((status = 'published'::public.article_status) OR public.is_admin(auth.uid())));


--
-- Name: sources Sources are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Sources are viewable by everyone" ON public.sources FOR SELECT USING (true);


--
-- Name: email_alerts Users can manage their own email alerts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own email alerts" ON public.email_alerts TO authenticated USING (((auth.uid() IS NOT NULL) AND (auth.uid() = user_id))) WITH CHECK (((auth.uid() IS NOT NULL) AND (auth.uid() = user_id)));


--
-- Name: email_alerts Users can view their own email alerts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own email alerts" ON public.email_alerts FOR SELECT TO authenticated USING (((auth.uid() IS NOT NULL) AND (auth.uid() = user_id)));


--
-- Name: article_views; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.article_views ENABLE ROW LEVEL SECURITY;

--
-- Name: articles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

--
-- Name: categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

--
-- Name: email_alerts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.email_alerts ENABLE ROW LEVEL SECURITY;

--
-- Name: fetch_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.fetch_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: sources; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;