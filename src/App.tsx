import { lazy, Suspense } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ArticlePageSkeleton } from "@/components/ui/loading-states";

// Public pages - eagerly loaded
import Index from "./pages/Index";
import ArticlePage from "./pages/ArticlePage";
import CategoryPage from "./pages/CategoryPage";
import CategoriesPage from "./pages/CategoriesPage";
import TrendingPage from "./pages/TrendingPage";
import LatestPage from "./pages/LatestPage";
import SearchPage from "./pages/SearchPage";
import AboutPage from "./pages/AboutPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import NotFound from "./pages/NotFound";

// Admin pages - lazy loaded for code splitting
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const ModerationPage = lazy(() => import("./pages/admin/ModerationPage"));
const ArticlesPage = lazy(() => import("./pages/admin/ArticlesPage"));
const FacebookPage = lazy(() => import("./pages/admin/FacebookPage"));
const SourcesPage = lazy(() => import("./pages/admin/SourcesPage"));
const SettingsPage = lazy(() => import("./pages/admin/SettingsPage"));

import { ProtectedRoute } from "./components/admin/ProtectedRoute";

// Optimized QueryClient with caching configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Admin loading fallback
function AdminLoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

// Redirect from old /article/ paths to /berita/
function ArticleRedirect() {
  const { slug } = useParams();
  return <Navigate to={`/berita/${slug}`} replace />;
}

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorBoundary>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/berita/:slug" element={<ArticlePage />} />
              <Route path="/kategori" element={<CategoriesPage />} />
              <Route path="/kategori/:slug" element={<CategoryPage />} />
              <Route path="/trending" element={<TrendingPage />} />
              <Route path="/terkini" element={<LatestPage />} />
              <Route path="/cari" element={<SearchPage />} />
              <Route path="/tentang" element={<AboutPage />} />
              <Route path="/privasi" element={<PrivacyPage />} />
              <Route path="/terma" element={<TermsPage />} />
              
              {/* Legacy redirect: /article/:slug -> /berita/:slug */}
              <Route path="/article/:slug" element={<ArticleRedirect />} />

              {/* Admin Routes - Lazy loaded */}
              <Route
                path="/admin/login"
                element={
                  <Suspense fallback={<AdminLoadingFallback />}>
                    <AdminLogin />
                  </Suspense>
                }
              />
              <Route
                path="/admin"
                element={
                  <Suspense fallback={<AdminLoadingFallback />}>
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  </Suspense>
                }
              />
              <Route
                path="/admin/moderation"
                element={
                  <Suspense fallback={<AdminLoadingFallback />}>
                    <ProtectedRoute>
                      <ModerationPage />
                    </ProtectedRoute>
                  </Suspense>
                }
              />
              <Route
                path="/admin/articles"
                element={
                  <Suspense fallback={<AdminLoadingFallback />}>
                    <ProtectedRoute>
                      <ArticlesPage />
                    </ProtectedRoute>
                  </Suspense>
                }
              />
              <Route
                path="/admin/facebook"
                element={
                  <Suspense fallback={<AdminLoadingFallback />}>
                    <ProtectedRoute>
                      <FacebookPage />
                    </ProtectedRoute>
                  </Suspense>
                }
              />
              <Route
                path="/admin/sources"
                element={
                  <Suspense fallback={<AdminLoadingFallback />}>
                    <ProtectedRoute>
                      <SourcesPage />
                    </ProtectedRoute>
                  </Suspense>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <Suspense fallback={<AdminLoadingFallback />}>
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  </Suspense>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
