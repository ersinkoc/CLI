import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getCurrentSection = (): 'docs' | 'api' | 'examples' => {
    if (location.pathname.startsWith('/docs')) return 'docs';
    if (location.pathname.startsWith('/api')) return 'api';
    if (location.pathname.startsWith('/examples')) return 'examples';
    return 'docs';
  };

  const currentSection = getCurrentSection();
  // Show sidebar on docs, api, examples pages (hide on home)
  const showSidebar = location.pathname !== '/';

  return (
    <div className="min-h-screen bg-background">
      <Header onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex">
        {showSidebar && (
          <Sidebar
            currentSection={currentSection}
          />
        )}

        {/* Main content */}
        <main
          className={cn(
            'flex-1 min-h-[calc(100vh-4rem)]',
            showSidebar ? 'lg:ml-72' : ''
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
