import { Link } from 'react-router-dom';
import { ArrowRight, Download, Github, Zap, Shield, Puzzle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CodeBlock } from '@/components/CodeBlock';
import { codeExamples } from '@/lib/constants';

export function Home() {
  const features = [
    {
      icon: Zap,
      title: '@oxog Ecosystem',
      description: 'Built on the @oxog ecosystem with optional peer dependencies. Use @oxog/emitter, @oxog/pigment, @oxog/plugin for enhanced functionality.',
    },
    {
      icon: Shield,
      title: 'Type-Safe',
      description: 'Full TypeScript support with end-to-end type inference. Catch errors at compile time, not runtime.',
    },
    {
      icon: Puzzle,
      title: 'Plugin System',
      description: 'Micro-kernel architecture with a powerful plugin system. Extend functionality with ease.',
    },
  ];

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-muted/50 to-background">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="container relative px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center rounded-full border bg-primary/10 px-4 py-1.5 text-sm">
              <span className="font-semibold text-primary">v2.0.1</span>
              <span className="mx-2 text-muted-foreground">·</span>
              <span className="text-muted-foreground">@oxog Ecosystem</span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Type-Safe{' '}
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                CLI Framework
              </span>
            </h1>

            <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl">
              Type-safe commands, beautiful output, and plugin architecture.
              The only CLI library you'll ever need for building professional command-line tools.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/docs">
                <Button size="lg" className="group">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" asChild>
                <a
                  href="https://github.com/ersinkoc/cli"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
                </a>
              </Button>
            </div>

            <div className="mt-8">
              <code className="text-sm text-muted-foreground">
                npm install @oxog/cli
              </code>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="border-b bg-muted/30">
        <div className="container px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold tracking-tight">Quick Start</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Create your first CLI in seconds with our fluent builder API.
            </p>

            <div className="mt-8">
              <CodeBlock
                code={codeExamples.quickStart}
                language="typescript"
                title="cli.ts"
                showLineNumbers={true}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b">
        <div className="container px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold tracking-tight text-center">
              Why @oxog/cli?
            </h2>
            <p className="mt-4 text-center text-lg text-muted-foreground">
              Built for developers who value simplicity, type safety, and performance.
            </p>

            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="relative overflow-hidden rounded-lg border bg-background p-6 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold">{feature.title}</h3>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* API Styles */}
      <section className="border-b bg-muted/30">
        <div className="container px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold tracking-tight text-center">
              Three API Styles
            </h2>
            <p className="mt-4 text-center text-lg text-muted-foreground">
              Choose the style that fits your coding preference.
            </p>

            <div className="mt-16 grid gap-8 md:grid-cols-3">
              <div className="rounded-lg border bg-background p-6">
                <h3 className="font-semibold">Fluent Builder</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Chain methods for a clean, readable API.
                </p>
                <Link
                  to="/docs/fluent-api"
                  className="mt-4 inline-flex items-center text-sm text-primary hover:underline"
                >
                  Learn more <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </div>

              <div className="rounded-lg border bg-background p-6">
                <h3 className="font-semibold">Object Config</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Define everything in a configuration object.
                </p>
                <Link
                  to="/docs/config-api"
                  className="mt-4 inline-flex items-center text-sm text-primary hover:underline"
                >
                  Learn more <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </div>

              <div className="rounded-lg border bg-background p-6">
                <h3 className="font-semibold">Decorators</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Use TypeScript decorators for class-based CLIs.
                </p>
                <Link
                  to="/docs/decorator-api"
                  className="mt-4 inline-flex items-center text-sm text-primary hover:underline"
                >
                  Learn more <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="container px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Ready to build your CLI?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Get started with our comprehensive documentation and examples.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/docs">
                <Button size="lg" className="group">
                  Read the Docs
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/examples">
                <Button size="lg" variant="outline">
                  View Examples
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              @oxog/cli · MIT License · Built with TypeScript
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/ersinkoc/cli"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                GitHub
              </a>
              <a
                href="https://www.npmjs.com/package/@oxog/cli"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                npm
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
