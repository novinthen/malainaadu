import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ArticlePage from "./pages/ArticlePage";
import CategoryPage from "./pages/CategoryPage";
import CategoriesPage from "./pages/CategoriesPage";
import TrendingPage from "./pages/TrendingPage";
import LatestPage from "./pages/LatestPage";
import SearchPage from "./pages/SearchPage";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ModerationPage from "./pages/admin/ModerationPage";
import ArticlesPage from "./pages/admin/ArticlesPage";
import SourcesPage from "./pages/admin/SourcesPage";
import SettingsPage from "./pages/admin/SettingsPage";
import { ProtectedRoute } from "./components/admin/ProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/berita/:id" element={<ArticlePage />} />
          <Route path="/kategori" element={<CategoriesPage />} />
          <Route path="/kategori/:slug" element={<CategoryPage />} />
          <Route path="/trending" element={<TrendingPage />} />
          <Route path="/terkini" element={<LatestPage />} />
          <Route path="/cari" element={<SearchPage />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/moderation"
            element={
              <ProtectedRoute>
                <ModerationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/articles"
            element={
              <ProtectedRoute>
                <ArticlesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/sources"
            element={
              <ProtectedRoute>
                <SourcesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
