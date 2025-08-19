"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Calculator, Flame, Bot, ShieldCheck, Landmark, Menu } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const features = [
  {
    icon: <Wallet className="h-8 w-8 text-primary" />,
    title: 'Holistic Net Worth Tracking',
    description: 'Track everything from real estate and stocks to precious metals and crypto.',
  },
  {
    icon: <Calculator className="h-8 w-8 text-primary" />,
    title: 'In-Depth Cashflow Analysis',
    description: 'Plan your budget, project future savings, and find areas to cut costs.',
  },
  {
    icon: <Landmark className="h-8 w-8 text-primary" />,
    title: 'Full Retirement Suite',
    description: 'From FIRE calculations to post-retirement withdrawal strategies, plan every step.',
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-primary" />,
    title: 'Essential Life Planning',
    description: 'Manage insurance, track loans, and secure your family’s future with our FIDOK module.',
  },
  {
    icon: <Calculator className="h-8 w-8 text-primary" />,
    title: 'Powerful Financial Calculators',
    description: 'A complete set of tools for SIP, SWP, PPF, EPF, Goals, and car affordability.',
  },
  {
    icon: <Bot className="h-8 w-8 text-primary" />,
    title: 'AI Insights & Data Control',
    description: 'Chat with an AI about your finances and maintain full privacy with local data export/import.',
  },
];

const Features: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex items-center">
            <Link to="/" className="flex items-center">
              <Wallet className="h-6 w-6 mr-2" />
              <span className="font-bold">Financial Planner</span>
            </Link>
          </div>
          <nav className="hidden md:flex flex-1 items-center justify-end space-x-4">
            <Link to="/features" className="text-sm font-medium text-primary">
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
                  <Link to="/features" className="text-lg font-medium text-primary">Features</Link>
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

      <main className="flex-1">
        <section className="container py-12">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h1 className="text-4xl font-bold leading-[1.1] md:text-5xl">Features</h1>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Everything you need to manage your personal finances, all in one place.
            </p>
          </div>
          <div className="mx-auto mt-12 grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    {feature.icon}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <CardTitle>{feature.title}</CardTitle>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

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

export default Features;