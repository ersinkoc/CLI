import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import {
  DocsPage,
  InstallationPage,
  QuickStartPage,
  CLIStructurePage,
  CommandsPage,
  ArgumentsPage,
  OptionsPage,
  SubcommandsPage,
  MiddlewarePage,
  FluentAPIPage,
  ConfigAPIPage,
  DecoratorAPIPage,
  PluginsPage,
  CorePluginsPage,
  OptionalPluginsPage,
  CreatingPluginsPage,
  ErrorHandlingPage,
  TypeSafetyPage,
  TestingPage,
  PerformancePage,
} from './pages/Docs';
import { APIPage } from './pages/API';
import { ExamplesPage } from './pages/Examples';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />

        {/* Docs Routes */}
        <Route path="docs" element={<DocsPage />} />
        <Route path="docs/installation" element={<InstallationPage />} />
        <Route path="docs/quick-start" element={<QuickStartPage />} />
        <Route path="docs/cli-structure" element={<CLIStructurePage />} />
        <Route path="docs/commands" element={<CommandsPage />} />
        <Route path="docs/arguments" element={<ArgumentsPage />} />
        <Route path="docs/options" element={<OptionsPage />} />
        <Route path="docs/subcommands" element={<SubcommandsPage />} />
        <Route path="docs/middleware" element={<MiddlewarePage />} />
        <Route path="docs/fluent-api" element={<FluentAPIPage />} />
        <Route path="docs/config-api" element={<ConfigAPIPage />} />
        <Route path="docs/decorator-api" element={<DecoratorAPIPage />} />
        <Route path="docs/plugins" element={<PluginsPage />} />
        <Route path="docs/core-plugins" element={<CorePluginsPage />} />
        <Route path="docs/optional-plugins" element={<OptionalPluginsPage />} />
        <Route path="docs/creating-plugins" element={<CreatingPluginsPage />} />
        <Route path="docs/error-handling" element={<ErrorHandlingPage />} />
        <Route path="docs/type-safety" element={<TypeSafetyPage />} />
        <Route path="docs/testing" element={<TestingPage />} />
        <Route path="docs/performance" element={<PerformancePage />} />
        <Route path="docs/*" element={<Navigate to="/docs" replace />} />

        {/* API Routes */}
        <Route path="api" element={<APIPage />} />
        <Route path="api/:slug" element={<APIPage />} />
        <Route path="api/*" element={<Navigate to="/api" replace />} />

        {/* Examples Routes */}
        <Route path="examples" element={<ExamplesPage />} />
        <Route path="examples/:slug" element={<ExamplesPage />} />
        <Route path="examples/*" element={<Navigate to="/examples" replace />} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export { App };
