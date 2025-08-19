"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Wallet, Menu } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Landing: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex items-center">
            <Link to="/" className="flex items-center">
              <Wallet className="h-6 w-6 mr-2" />
              <span className="font-bold">Financial Planner</span>
            </Link>
          </div>
          <nav className="hidden md:flex flex-1 items-center justify-end space-x-4">
            <Link to="/features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              Features
            </Link>
            <a href="https://tax-compute.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              Tax Planning
            </a>
            <ThemeToggle />
            <Button asChild>
              <Link to="/dashboard">Get Started</Link>
            </Button>
          </nav>
          <div className="md:hidden flex flex-1 items-center justify-end">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col gap-4 p-4">
                  <Link to="/features" className="text-lg font-medium">Features</Link>
                  <a href="https://tax-compute.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-lg font-medium">Tax Planning</a>
                  <hr/>
                  <div className="flex justify-between items-center">
                    <span>Switch Theme</span>
                    <ThemeToggle />
                  </div>
                  <Button asChild className="w-full">
                    <Link to="/dashboard">Get Started</Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container flex flex-col items-center justify-center py-12 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
            Take Control of Your Financial Future
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            An all-in-one, open-source financial planner to track your net worth, manage cashflow, set goals, and plan for retirement. All your data stays on your device.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 md:px-8 md:py-0">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Designed by{' '}
            <a
              href="https://github.com/bravetux"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Bravetux
            </a>
            . The Website Source Code is Published in{' '}
            <a
              href="https://github.com/bravetux/Finance.AI"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Github
            </a>
            .
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;