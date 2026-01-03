import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, X, ChevronRight, ChevronDown, Menu, Book, Code, Lightbulb, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { docsNavigation, apiNavigation, examplesNavigation } from '@/lib/constants';

interface NavItem {
  title: string;
  items: { title: string; href: string; id: string }[];
}

interface SidebarProps {
  currentSection: 'docs' | 'api' | 'examples';
}

export function Sidebar({ currentSection }: SidebarProps) {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['all']));

  const navigation: NavItem[] =
    currentSection === 'docs'
      ? docsNavigation
      : currentSection === 'api'
        ? apiNavigation
        : examplesNavigation;

  const filteredNav = navigation.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  }));

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  };

  const isExpanded = (title: string) => expandedSections.has(title) || expandedSections.has('all');

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
      >
        {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen w-72 transform border-r bg-background transition-transform duration-200 ease-in-out lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <Link
            to="/"
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center gap-2 border-b p-6 hover:bg-accent/50 transition-colors"
          >
            <Terminal className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">@oxog/cli</span>
          </Link>

          {/* Search */}
          <div className="border-b p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-6">
              {filteredNav.map((section) => {
                const hasVisibleItems = section.items.length > 0;
                if (!hasVisibleItems) return null;

                return (
                  <div key={section.title}>
                    <button
                      onClick={() => toggleSection(section.title)}
                      className="flex w-full items-center justify-between text-sm font-semibold text-foreground hover:text-primary"
                    >
                      {section.title}
                      {isExpanded(section.title) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>

                    {isExpanded(section.title) && (
                      <ul className="mt-2 space-y-1">
                        {section.items.map((item) => (
                          <li key={item.href}>
                            <Link
                              to={item.href}
                              onClick={() => setIsMobileOpen(false)}
                              className={cn(
                                'block rounded-md px-3 py-2 text-sm transition-colors',
                                location.pathname === item.href
                                  ? 'bg-primary/10 text-primary font-medium'
                                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                              )}
                            >
                              {item.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </nav>

          {/* Section Links */}
          <div className="border-t p-4">
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/docs"
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                  currentSection === 'docs'
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent'
                )}
              >
                <Book className="h-4 w-4" />
                <span>Docs</span>
              </Link>
              <Link
                to="/api"
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                  currentSection === 'api'
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent'
                )}
              >
                <Code className="h-4 w-4" />
                <span>API</span>
              </Link>
              <Link
                to="/examples"
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                  currentSection === 'examples'
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent'
                )}
              >
                <Lightbulb className="h-4 w-4" />
                <span>Examples</span>
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
