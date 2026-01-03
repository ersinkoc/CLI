import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Menu, Github, BookOpen, Code2, Lightbulb, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from './ThemeProvider';

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const navItems = [
    { href: '/docs', label: 'Docs', icon: BookOpen },
    { href: '/api', label: 'API', icon: Code2 },
    { href: '/examples', label: 'Examples', icon: Lightbulb },
  ];

  const getSection = () => {
    if (location.pathname.startsWith('/docs')) return 'docs';
    if (location.pathname.startsWith('/api')) return 'api';
    if (location.pathname.startsWith('/examples')) return 'examples';
    return 'home';
  };

  const currentSection = getSection();

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 lg:px-8">
        {/* Left side - Logo and Mobile Menu */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 -ml-2 rounded-md hover:bg-accent"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link to="/" className="flex items-center gap-2">
            <Terminal className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">@oxog/cli</span>
          </Link>
        </div>

        {/* Center - Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.href.slice(1);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/ersinkoc/cli"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Github className="h-4 w-4" />
            <span>GitHub</span>
          </a>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-accent transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
