"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Calculator, Target, Flame, BarChart2, FileText } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

const features = [
  {
    icon: <Wallet className="h-8 w-8 text-primary" />,
    title: 'Comprehensive Net Worth',
    description: 'Track all your assets and liabilities in one place, from real estate to crypto.',
  },
  {
    icon: <Calculator className="h-8 w-8 text-primary" />,
    title: 'Detailed Cashflow Planning',
    description: 'Analyze your income and expenses to identify savings opportunities.',
  },
  {
    icon: <Target className="h-8 w-8 text-primary" />,
    title: 'Goal-Oriented Savings',
    description: 'Set financial goals and calculate the SIP required to achieve them.',
  },
  {
    icon: <Flame className="h-8 w-8 text-primary" />,
    title: 'FIRE & Retirement',
    description: 'Plan for Financial Independence and a comfortable retirement with powerful calculators.',
  },
  {
    icon: <BarChart2 className="h-8 w-8 text-primary" />,
    title: 'Investment Tracking',
    description: 'Monitor your equity, mutual funds, and other investments with detailed breakdowns.',
  },
  {
    icon: <FileText className="h-8 w-8 text-primary" />,
    title: 'Data Export & AI',
    description: 'Export all your data for backup and use our AI assistant for financial insights.',
  },
];

const Landing: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex items-center">
            <Wallet className="h-6 w-6 mr-2" />
            <span className="font-bold">Financial Planner</span>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <ThemeToggle />
            <Button asChild>
              <Link to="/dashboard">Get Started</Link>
            </Button>
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

        {/* Features Section */}
        <section className="container pb-16">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="text-3xl font-bold leading-[1.1] md:text-4xl">Features</h2>
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