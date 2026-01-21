import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Clock,
  Rss,
  Settings,
  LogOut,
  Menu,
  Facebook,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth, useSignOut, useIsAdmin } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/moderation', icon: Clock, label: 'Moderasi' },
  { href: '/admin/articles', icon: FileText, label: 'Artikel' },
  { href: '/admin/facebook', icon: Facebook, label: 'Facebook' },
  { href: '/admin/sources', icon: Rss, label: 'Sumber' },
  { href: '/admin/settings', icon: Settings, label: 'Tetapan' },
];

function NavLink({ href, icon: Icon, label, onClick }: { href: string; icon: any; label: string; onClick?: () => void }) {
  const location = useLocation();
  const isActive = location.pathname === href;

  return (
    <Link
      to={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  );
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { role } = useIsAdmin();
  const signOut = useSignOut();

  const handleSignOut = () => {
    signOut.mutate(undefined, {
      onSuccess: () => navigate('/admin/login'),
    });
  };

  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-4">
        <Link to="/admin" className="flex items-center gap-2" onClick={onNavigate}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <span className="font-display text-lg font-bold text-primary-foreground">B</span>
          </div>
          <div className="flex flex-col">
            <span className="font-display text-base font-bold leading-none">Berita</span>
            <span className="text-xs font-medium leading-none text-primary">Admin</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} onClick={onNavigate} />
          ))}
        </nav>
      </ScrollArea>

      {/* User Info & Logout */}
      <div className="border-t p-4">
        <div className="mb-3 rounded-lg bg-muted p-3">
          <p className="text-xs text-muted-foreground">Log masuk sebagai</p>
          <p className="truncate text-sm font-medium">{user?.email}</p>
          <p className="text-xs text-primary capitalize">{role || 'User'}</p>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleSignOut}
          disabled={signOut.isPending}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log Keluar
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 border-r bg-card lg:block">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Mobile Header */}
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 lg:hidden">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <span className="font-display text-lg font-bold text-primary-foreground">B</span>
            </div>
            <span className="font-display text-base font-bold">Admin</span>
          </Link>

          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetTitle className="sr-only">Menu Navigasi Admin</SheetTitle>
              <SidebarContent onNavigate={() => setSidebarOpen(false)} />
            </SheetContent>
          </Sheet>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="container max-w-7xl py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
